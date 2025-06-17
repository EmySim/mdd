// src/app/components/navbar/navbar.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  /**
   * Reçoit l'état depuis AppComponent
   * true = navbar simple (logo seulement)
   * false = navbar complète (navigation + déconnexion)
   */
  @Input() isSimple: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Méthodes de navigation (navbar complète seulement)
   */
  goToArticles(): void {
    this.router.navigate(['/articles']);
  }

  goToThemes(): void {
    this.router.navigate(['/themes']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }
}