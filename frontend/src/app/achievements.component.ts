import { Component, OnInit } from '@angular/core';
import { AchievementsService, Challenge } from './achievements.service';
import { NavComponent } from './nav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nsw-achievements',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements OnInit {
  challenges: Challenge[] = [];
  grouped: { heading: string; challenges: Challenge[] }[] = [];
  userId = 'USER_ID_PLACEHOLDER';

  constructor(private service: AchievementsService) {
    this.challenges = this.service.getAllChallenges();
    const headingsOrder: string[] = [];
    this.challenges.forEach((c) => {
      if (!headingsOrder.includes(c.heading)) headingsOrder.push(c.heading);
    });
    this.grouped = headingsOrder.map((h) => ({ heading: h, challenges: this.challenges.filter((c) => c.heading === h) }));
  }

  ngOnInit(): void {
    // Load persisted state from API (placeholder)
    void this.service.fetchFromApi(this.userId);
  }

  isSpecial(ch: Challenge) {
    return ['Sunlight', 'Think Well', 'Air'].includes(ch.heading);
  }

  addAttempt(ch: Challenge) {
    this.service.incrementAttempt(ch.id);
  }

  resetAttempts(ch: Challenge) {
    this.service.setSelection(ch.id, 0);
  }

  getAttempts(ch: Challenge) {
    return this.service.getAttempts(ch.id);
  }

  async save() {
    // Save to API (placeholder). Call service and ignore result for now.
    await this.service.saveToApi(this.userId);
    // After save, also persist locally (service.save() already called by state mutators)
  }

  saveUpload(ch: Challenge, val: string) {
    this.service.setUploadLink(ch.id, val);
  }

  getUpload(ch: Challenge) {
    return this.service.getUploadLink(ch.id);
  }
}

