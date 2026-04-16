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
  // selections keyed by challenge id. number = attempts count (0 = none)
  private selections: Record<string, number> = {};

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

    // initialize selections to zero attempts
    CHALLENGES.forEach((c) => (this.selections[c.id] = 0));

    if (loaded && typeof loaded === 'object') {
      // Accept both legacy boolean values and numeric attempt counts
      Object.keys(loaded).forEach((k) => {
        if (!(k in this.selections)) return;
        const v = loaded[k];
        if (typeof v === 'number') this.selections[k] = Math.max(0, Math.floor(v));
        else if (typeof v === 'boolean') this.selections[k] = v ? 1 : 0; // migrate old boolean -> count
      });
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
    // With unlimited attempts allowed, max points are the sum of all challenge points (per attempt). Note progress may exceed 100%.
    return CHALLENGES.reduce((acc, c) => acc + c.points, 0);
  }

  // backward-compatible API
  getAllHeadings(): string[] {
    return Array.from(new Set(CHALLENGES.map((c) => c.heading)));
  }

  // Returns true if at least one attempt exists (for compatibility)
  getSelected(idOrTitle: string): boolean {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    const ch = byId || CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    if (!ch) return false;
    return !!(this.selections[ch.id] > 0);
  }

  // Returns the number of attempts for a challenge
  getAttempts(idOrTitle: string): number {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    const ch = byId || CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    if (!ch) return 0;
    return this.selections[ch.id] || 0;
  }

  // Increment attempts for a challenge. Trust options remain mutually exclusive and single-count.
  incrementAttempt(idOrTitle: string) {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    const ch = byId || CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    if (!ch) return;

    // Increment attempt count for the challenge (Trust no longer mutually exclusive)
    this.selections[ch.id] = (this.selections[ch.id] || 0) + 1;

    this.save();
    this.updatePoints();
  }

  // backward-compatible toggle: toggles between 0 and 1 attempts
  toggleChallenge(idOrTitle: string) {
    const byId = CHALLENGES.find((c) => c.id === idOrTitle);
    const ch = byId || CHALLENGES.find((c) => c.title === idOrTitle || c.heading === idOrTitle);
    if (!ch) return;

    const newValue = !(this.selections[ch.id] > 0);

    // No mutual exclusivity for Trust; toggle between 0 and 1 attempts
    this.selections[ch.id] = newValue ? 1 : 0;
    this.save();
    this.updatePoints();
  }

  // Set selection: accepts boolean (legacy) or numeric attempt count
  setSelection(id: string, value: boolean | number) {
    if (!(id in this.selections)) return;

    let attempts = 0;
    if (typeof value === 'number') attempts = Math.max(0, Math.floor(value));
    else attempts = value ? 1 : 0;

    // No mutual exclusivity for Trust; set attempts directly
    this.selections[id] = attempts;

    this.save();
    this.updatePoints();
  }

  private updatePoints() {
    // Sum = sum of (attempts * points) for each challenge
    const pts = CHALLENGES.reduce((acc, c) => acc + ((this.selections[c.id] || 0) * c.points), 0);
    this.points$.next(pts);
  }

  // API persistence helpers
  // Fetch persisted attempts from API for the given userId. Placeholder URL used.
  async fetchFromApi(userId: string): Promise<boolean> {
    if (!userId) return false;
    const url = `API_URL_PLACEHOLDER/users/${userId}/achievements`;
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      // Accept map of challengeId -> number (attempts) or boolean (legacy)
      Object.keys(this.selections).forEach((id) => {
        const v = data[id];
        if (typeof v === 'number') this.selections[id] = Math.max(0, Math.floor(v));
        else if (typeof v === 'boolean') this.selections[id] = v ? 1 : 0;
      });
      this.save();
      this.updatePoints();
      return true;
    } catch {
      return false;
    }
  }

  // Save current attempts to the API for the given userId. Placeholder URL used.
  async saveToApi(userId: string): Promise<boolean> {
    if (!userId) return false;
    const url = `API_URL_PLACEHOLDER/users/${userId}/achievements`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.selections),
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Upload link helpers - use normalized id-key storage only
  setUploadLink(key: string, url: string) {
    const storage = this.getStorage();
    if (!storage) return;
    const ch = CHALLENGES.find((c) => c.id === key);
    const idKey = ch ? ch.id : key;
    storage.setItem(this.uploadKeyPrefix + idKey, url || '');
  }

  getUploadLink(key: string): string {
    const storage = this.getStorage();
    if (!storage) return '';
    const ch = CHALLENGES.find((c) => c.id === key);
    const idKey = ch ? ch.id : key;
    return storage.getItem(this.uploadKeyPrefix + idKey) || '';
  }
}
