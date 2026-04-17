import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeadingsDisplayComponent } from './headings-display.component';
import { NavComponent } from './nav.component';
import { AchievementsService, Challenge } from './achievements.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nsw-home',
  standalone: true,
  imports: [HeadingsDisplayComponent, CommonModule, NavComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  points$?: any;
  total = 0;
  progress = 0;
  challenges: Challenge[] = [];
  grouped: { heading: string; challenges: Challenge[]; selectedPoints: number; maxPoints: number }[] = [];
  private pointsSub?: Subscription;
  userId = 'USER_ID_PLACEHOLDER';

  constructor(private achievements: AchievementsService) {
    this.points$ = this.achievements.points$;
    this.total = this.achievements.getMaxPoints();

    this.challenges = this.achievements.getAllChallenges();
    const headingsOrder: string[] = [];
    this.challenges.forEach((c) => {
      if (!headingsOrder.includes(c.heading)) headingsOrder.push(c.heading);
    });
    this.grouped = headingsOrder.map((h) => {
      const chs = this.challenges.filter((c) => c.heading === h);
      const maxPoints = h === 'Trust' ? (chs.length ? Math.max(...chs.map((c) => c.points)) : 0) : chs.reduce((acc, c) => acc + c.points, 0);
      return {
        heading: h,
        challenges: chs,
        selectedPoints: chs.reduce((acc, c) => acc + (this.achievements.getAttempts(c.id) * c.points), 0),
        maxPoints,
      };
    });
  }

  ngOnInit(): void {
    // Load persisted state from API when returning to app (placeholder)
    void this.achievements.fetchFromApi(this.userId);
    this.pointsSub = this.points$?.subscribe((pts: number) => {
      this.progress = ((pts || 0) / (this.total || 1)) * 100;
      this.updateGroupPoints();
    });
  }

  private updateGroupPoints() {
    this.grouped.forEach((g) => {
      g.selectedPoints = g.challenges.reduce((acc, c) => acc + (this.achievements.getAttempts(c.id) * c.points), 0);
    });
  }

  ngOnDestroy(): void {
    this.pointsSub?.unsubscribe();
  }
}

