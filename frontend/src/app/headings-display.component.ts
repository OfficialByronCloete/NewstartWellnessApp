import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementsService, Challenge } from './achievements.service';

@Component({
  selector: 'nsw-headings-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './headings-display.component.html',
  styleUrls: ['./headings-display.component.css']
})
export class HeadingsDisplayComponent {
  grouped: { heading: string; challenges: Challenge[]; selectedPoints: number; maxPoints: number }[] = [];
  openStates: boolean[] = [];

  constructor(private service: AchievementsService) {
    const chs = this.service.getAllChallenges();
    const headingsOrder: string[] = [];
    chs.forEach((c) => {
      if (!headingsOrder.includes(c.heading)) headingsOrder.push(c.heading);
    });

    this.grouped = headingsOrder.map((h) => {
      const items = chs.filter((c) => c.heading === h);
      const maxPoints = h === 'Trust' ? (items.length ? Math.max(...items.map((c) => c.points)) : 0) : items.reduce((acc, c) => acc + c.points, 0);
      return {
        heading: h,
        challenges: items,
        selectedPoints: items.reduce((acc, c) => acc + (this.service.getAttempts(c.id) * c.points), 0),
        maxPoints,
      };
    });

    // Allow multiple groups open simultaneously; default collapsed
    this.openStates = new Array(this.grouped.length).fill(false);
  }

  isOpen(index: number) {
    return !!this.openStates[index];
  }

  toggleGroup(index: number) {
    this.openStates[index] = !this.openStates[index];
  }
}
