import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isSimple: boolean = false;
  
  currentUser: User | null = null;
  showMobileMenu = false;
  isProfilePage = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // NAVIGATION
  // =============================================================================

  goToHomePage(): void {
    // Si on est en mode simple (pages auth), rediriger vers landing
    if (this.isSimple) {
      this.router.navigate(['/landing']);
      return;
    }
    
    // Sinon, logique normale pour les utilisateurs connectés
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/articles']); // ou '/home' selon votre logique
    } else {
      this.router.navigate(['/landing']);
    }
  }

  goToArticles(): void {
    this.router.navigate(['/articles']);
  }

  goToThemes(): void {
    this.router.navigate(['/themes']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // =============================================================================
  // AUTHENTIFICATION
  // =============================================================================

  logout(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // =============================================================================
  // MOBILE MENU
  // =============================================================================

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  // =============================================================================
  // HELPERS
  // =============================================================================

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}