import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementsService, Challenge } from './achievements.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nsw-headings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './headings.component.html',
  styleUrls: ['./headings.component.css']
})
export class HeadingsComponent implements OnDestroy {
  grouped: { heading: string; challenges: Challenge[]; selectedPoints: number; maxPoints: number }[] = [];
  private sub?: Subscription;

  constructor(private service: AchievementsService) {
    const chs = this.service.getAllChallenges();
    const headingsOrder: string[] = [];
    chs.forEach((c) => {
      if (!headingsOrder.includes(c.heading)) headingsOrder.push(c.heading);
    });
    this.grouped = headingsOrder.map((h) => {
      const items = chs.filter((c) => c.heading === h);
      // For Trust, only the highest option should count toward the group's max
      const maxPoints = h === 'Trust' ? (items.length ? Math.max(...items.map((c) => c.points)) : 0) : items.reduce((acc, c) => acc + c.points, 0);
      return {
        heading: h,
        challenges: items,
        selectedPoints: items.reduce((acc, c) => acc + (this.service.getSelected(c.id) ? c.points : 0), 0),
        maxPoints,
      };
    });

    this.sub = this.service.points$.subscribe(() => this.updateGroupPoints());
  }

  toggle(ch: Challenge) {
    this.service.toggleChallenge(ch.id);
  }

  getStatus(ch: Challenge) {
    return this.service.getSelected(ch.id);
  }

  saveUpload(ch: Challenge, val: string) {
    this.service.setUploadLink(ch.id, val);
  }

  getUpload(ch: Challenge) {
    return this.service.getUploadLink(ch.id);
  }

  private updateGroupPoints() {
    this.grouped.forEach((g) => {
      g.selectedPoints = g.challenges.reduce((acc, c) => acc + (this.service.getSelected(c.id) ? c.points : 0), 0);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
