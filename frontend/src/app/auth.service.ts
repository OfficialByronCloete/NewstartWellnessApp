import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser: boolean;
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getStorage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }

  isLoggedIn(): boolean {
    const storage = this.getStorage();
    return storage ? storage.getItem('nsw_loggedin') === 'true' : false;
  }

  login(): void {
    const storage = this.getStorage();
    if (storage) storage.setItem('nsw_loggedin', 'true');
  }

  logout(): void {
    const storage = this.getStorage();
    if (storage) storage.removeItem('nsw_loggedin');
  }

  hasLoggedInBefore(): boolean {
    const storage = this.getStorage();
    return storage ? storage.getItem('nsw_has_logged_in_before') === 'true' : false;
  }

  setHasLoggedInBefore(): void {
    const storage = this.getStorage();
    if (storage) storage.setItem('nsw_has_logged_in_before', 'true');
  }
}
