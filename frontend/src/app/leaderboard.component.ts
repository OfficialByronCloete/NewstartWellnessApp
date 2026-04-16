import { Component } from '@angular/core';
import { NavComponent } from './nav.component';

@Component({
  selector: 'nsw-leaderboard',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {}
