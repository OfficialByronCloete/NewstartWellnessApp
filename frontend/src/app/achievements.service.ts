import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Challenge {
  id: string;
  heading: string;
  title: string;
  points: number;
}

const CHALLENGES: Challenge[] = [
  { id: 'nutrition-no-sugar', heading: 'Nutrition', title: 'No sugar week for the entire team', points: 20 },
  { id: 'nutrition-meat-free-monday', heading: 'Nutrition', title: 'Meat Free Monday', points: 10 },
  { id: 'exercise-8500-steps', heading: 'Exercise', title: '8500 Steps per day', points: 20 },
  { id: 'exercise-30min-workout', heading: 'Exercise', title: '30 min Workout session', points: 15 },
  { id: 'exercise-race', heading: 'Exercise', title: 'Participate in a race/park run', points: 10 },
  { id: 'water-2l', heading: 'Water', title: 'Drink 2 liters of water', points: 10 },
  { id: 'sunlight-none', heading: 'Sunlight', title: 'Sunlight', points: 0 },
  { id: 'thinkwell-none', heading: 'Think Well', title: 'Think Well', points: 0 },
  { id: 'air-none', heading: 'Air', title: 'Air', points: 0 },
  { id: 'rest-digital-detox', heading: 'Rest & Recharge & Read', title: 'Digital detox day', points: 10 },
  { id: 'rest-read-10-pages', heading: 'Rest & Recharge & Read', title: 'Read 10 pages a day', points: 10 },
  { id: 'trust-all-present', heading: 'Trust', title: 'All team members present', points: 15 },
  { id: 'trust-more-50', heading: 'Trust', title: 'More than 50% present', points: 10 },
];

@Injectable({ providedIn: 'root' })
export class AchievementsService {
  private isBrowser: boolean;
  private storageKey = 'nsw_achievements_status';
  private uploadKeyPrefix = 'nsw_upload_';
  // selections keyed by challenge id
  private selections: Record<string, boolean> = {};

  points$ = new BehaviorSubject<number>(0);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.load();
  }

  private getStorage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }

  private load() {
    const storage = this.getStorage();
    let loaded: any = null;
    if (storage) {
      const raw = storage.getItem(this.storageKey);
      if (raw) {
        try {
          loaded = JSON.parse(raw);
        } catch {
          loaded = null;
        }
      }
    }

    // initialize selections
    CHALLENGES.forEach((c) => (this.selections[c.id] = false));

    if (loaded && typeof loaded === 'object') {
      // detect if legacy format (titles as keys) or new format (ids as keys)
      const keys = Object.keys(loaded);
      const firstKey = keys[0];
      if (firstKey) {
        // if key matches any challenge id, treat as new format
        if (CHALLENGES.some((c) => c.id === firstKey)) {
          keys.forEach((k) => {
            if (typeof loaded[k] === 'boolean') this.selections[k] = !!loaded[k];
          });
        } else {
          // legacy: keys are titles/headings
          keys.forEach((k) => {
            const ch = CHALLENGES.find((c) => c.title === k || c.heading === k);
            if (ch && typeof loaded[k] === 'boolean') this.selections[ch.id] = !!loaded[k];
          });
        }
      }
    }

    this.updatePoints();
    // persist normalized format back to storage
    this.save();
  }

  private save() {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.storageKey, JSON.stringify(this.selections));
    }
  }

  getAllChallenges(): Challenge[] {
    return CHALLENGES.slice();
  }

  getMaxPoints(): number {
    // Trust options are mutually exclusive; count only the highest-tracking trust option
    const trust = CHALLENGES.filter((c) => c.heading === 'Trust');
    const others = CHALLENGES.filter((c) => c.heading !== 'Trust');
    const sumOthers = others.reduce((acc, c) => acc + c.points, 0);
    const maxTrust = trust.length ? Math.max(...trust.map((c) => c.points)) : 0;
    return sumOthers + maxTrust;
  }

  // backward-compatible API
  getAllHeadings(): string[] {
    return Array.from(new Set(CHALLENGES.map((c) => c.heading)));
  }

  getSelected(idOrTitle: string): boolean {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    if (byId) return !!this.selections[byId.id];
    const byTitle = CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    return !!(byTitle && this.selections[byTitle.id]);
  }

  toggleChallenge(idOrTitle: string) {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    const ch = byId || CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    if (!ch) return;

    const newValue = !this.selections[ch.id];

    // Enforce mutual exclusivity for Trust options
    if (ch.id === 'trust-all-present' && newValue) {
      this.selections['trust-more-50'] = false;
    } else if (ch.id === 'trust-more-50' && newValue) {
      this.selections['trust-all-present'] = false;
    }

    this.selections[ch.id] = newValue;
    this.save();
    this.updatePoints();
  }

  setSelection(id: string, value: boolean) {
    if (!(id in this.selections)) return;

    // Enforce mutual exclusivity for Trust options when setting directly
    if (id === 'trust-all-present' && value) {
      this.selections['trust-more-50'] = false;
    } else if (id === 'trust-more-50' && value) {
      this.selections['trust-all-present'] = false;
    }

    this.selections[id] = !!value;
    this.save();
    this.updatePoints();
  }

  private updatePoints() {
    const pts = CHALLENGES.reduce((acc, c) => acc + (this.selections[c.id] ? c.points : 0), 0);
    this.points$.next(pts);
  }

  // Upload link helpers - read both id-key and legacy title-key; when saving, write both for compatibility
  setUploadLink(key: string, url: string) {
    const storage = this.getStorage();
    if (!storage) return;
    const ch = CHALLENGES.find((c) => c.id === key) || CHALLENGES.find((c) => c.title === key || c.heading === key);
    const idKey = ch ? ch.id : key;
    const titleKey = ch ? ch.title : key;
    storage.setItem(this.uploadKeyPrefix + idKey, url || '');
    storage.setItem(this.uploadKeyPrefix + titleKey, url || '');
  }

  getUploadLink(key: string): string {
    const storage = this.getStorage();
    if (!storage) return '';
    const ch = CHALLENGES.find((c) => c.id === key) || CHALLENGES.find((c) => c.title === key || c.heading === key);
    const idKey = ch ? ch.id : key;
    const titleKey = ch ? ch.title : key;
    return storage.getItem(this.uploadKeyPrefix + idKey) || storage.getItem(this.uploadKeyPrefix + titleKey) || '';
  }
}
