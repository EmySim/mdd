import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MDD - Monde de Dév';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  showNavbar(): boolean {
    const currentUrl = this.router.url;
    // Cacher la navbar seulement sur la landing page
    return currentUrl !== '/landing' && currentUrl !== '/';
  }

  isSimpleNavbar(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/auth/') || currentUrl === '/landing';
  }
}