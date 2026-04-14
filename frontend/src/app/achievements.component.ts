import { Component } from '@angular/core';
import { AchievementsService, Challenge } from './achievements.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nsw-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent {
  challenges: Challenge[] = [];
  grouped: { heading: string; challenges: Challenge[] }[] = [];

  constructor(private service: AchievementsService) {
    this.challenges = this.service.getAllChallenges();
    const headingsOrder: string[] = [];
    this.challenges.forEach((c) => {
      if (!headingsOrder.includes(c.heading)) headingsOrder.push(c.heading);
    });
    this.grouped = headingsOrder.map((h) => ({ heading: h, challenges: this.challenges.filter((c) => c.heading === h) }));
  }

  isSpecial(ch: Challenge) {
    return ['Sunlight', 'Think Well', 'Air'].includes(ch.heading);
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
}

