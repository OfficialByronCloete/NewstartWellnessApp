import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidHouse } from '@ng-icons/font-awesome/solid';
import { faSolidBook } from '@ng-icons/font-awesome/solid';
import { faSolidPencil } from '@ng-icons/font-awesome/solid';
import { faSolidStar } from '@ng-icons/font-awesome/solid';
import { faSolidArrowUpFromBracket } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'nsw-nav',
  standalone: true,
  imports: [RouterLink, NgIcon],
  providers: [provideIcons({faSolidHouse, faSolidBook, faSolidPencil, faSolidStar, faSolidArrowUpFromBracket})],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
    constructor(private auth: AuthService, private router: Router) {}

    isLoggedIn(): boolean {
      return this.auth.isLoggedIn();
    }

    logout(): void {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
}