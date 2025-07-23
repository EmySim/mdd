// navbar.component.ts - Modification pour icône dynamique
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
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
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Écouter les changements d'utilisateur
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // ✅ Écouter les changements de route pour détecter la page profile
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event) => {
      this.updateProfilePageStatus(event.url);
    });

    // ✅ Vérifier l'URL initiale
    this.updateProfilePageStatus(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Nouvelle méthode pour déterminer si on est sur la page profile
  private updateProfilePageStatus(url: string): void {
    this.isProfilePage = url === '/profile' || url.startsWith('/profile/');
    console.log(`🔍 URL: ${url} - isProfilePage: ${this.isProfilePage}`);
  }

  // ✅ Nouvelle méthode pour obtenir le bon chemin d'icône
  getUserIconPath(): string {
    return this.isProfilePage 
      ? 'assets/icone_profile.svg' 
      : 'assets/icon_user.svg';
  }

  // =============================================================================
  // NAVIGATION (méthodes existantes inchangées)
  // =============================================================================

  goToHomePage(): void {
    if (this.isSimple) {
      this.router.navigate(['/landing']);
      return;
    }
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/articles']);
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
  // AUTHENTIFICATION (méthodes existantes inchangées)
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
  // MOBILE MENU (méthodes existantes inchangées)
  // =============================================================================

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  // =============================================================================
  // HELPERS (méthodes existantes inchangées)
  // =============================================================================

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}