import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'home', loadComponent: () => import('./home.component').then(m => m.HomeComponent), canActivate: [AuthGuard] },
  { path: 'info', loadComponent: () => import('./info.component').then(m => m.InfoComponent), canActivate: [AuthGuard] },
  { path: 'achievements', loadComponent: () => import('./achievements.component').then(m => m.AchievementsComponent), canActivate: [AuthGuard] },
  { path: 'leaderboard', loadComponent: () => import('./leaderboard.component').then(m => m.LeaderboardComponent), canActivate: [AuthGuard] },
];
