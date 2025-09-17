// navbar.component.ts - Navbar avec icône dynamique selon la page
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
  @Input() isSimple: boolean = false; // Navbar simplifiée (landing par ex.)
  
  currentUser: User | null = null;   // Utilisateur connecté
  showMobileMenu = false;            // État du menu mobile
  isProfilePage = false;             // Indique si on est sur la page profil
  
  private destroy$ = new Subject<void>(); // Gestion du cycle de vie (unsubscribe)

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Abonnement aux changements d'utilisateur
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // Abonnement aux changements de route pour détecter si on est sur le profil
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(event => {
      this.updateProfilePageStatus(event.url);
    });

    // Vérifie l'URL initiale au chargement du composant
    this.updateProfilePageStatus(this.router.url);
  }

  ngOnDestroy(): void {
    // Nettoyage des abonnements
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Met à jour l'état indiquant si l'utilisateur est sur la page profil
   */
  private updateProfilePageStatus(url: string): void {
    this.isProfilePage = url === '/profile' || url.startsWith('/profile/');
  }

  /**
   * Retourne le chemin de l'icône en fonction de la page active
   */
  getUserIconPath(): string {
    return this.isProfilePage 
      ? 'assets/icone_profile.svg' 
      : 'assets/icon_user.svg';
  }

  // =============================================================================
  // NAVIGATION
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
