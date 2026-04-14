import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'nsw-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    // Placeholder local login (no backend)
    this.auth.login();
    const hasLoggedBefore = this.auth.hasLoggedInBefore();
    if (!hasLoggedBefore) {
      this.auth.setHasLoggedInBefore();
      this.router.navigate(['/info']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}

