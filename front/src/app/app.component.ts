
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'MDD - Monde de Dév';
  showNavbar = true;
  isSimplePage = false;

  // Pages SANS navbar du tout
  private noNavbarPages = ['/landing'];

  // Pages avec navbar SIMPLE (desktop) / MASQUÉE (mobile)
  private simpleNavbarPages = ['/auth/login', '/auth/register'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ CORRECTIF : charger automatiquement l'utilisateur courant depuis le cookie JWT
    this.authService.loadUserFromServer();

    // Gestion de la navbar selon la page
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarStatus(event.url);
      });

    // Vérification initiale sur l'URL actuelle
    this.updateNavbarStatus(this.router.url);
  }

  /**
   * 🎯 LOGIQUE SIMPLE - Laisse le CSS gérer le responsive
   */
  private updateNavbarStatus(url: string): void {
    console.log('🔍 URL courante:', url);

    // Cas spécial pour la racine
    if (url === '/' || url === '') {
      this.showNavbar = false;
      this.isSimplePage = false;
      return;
    }

    // Pages SANS navbar (landing)
    if (this.noNavbarPages.some(page => url === page || url.startsWith(page))) {
      console.log('❌ Navbar masquée (landing)');
      this.showNavbar = false;
      this.isSimplePage = false;
      return;
    }

    // Pages AUTH - Navbar simple (CSS gère le responsive)
    if (this.simpleNavbarPages.some(page => url === page || url.startsWith(page))) {
      console.log('✅ Navbar simple (CSS responsive)');
      this.showNavbar = true;
      this.isSimplePage = true;
      return;
    }

    // Pages APP - Navbar complète (CSS gère le responsive)
    console.log('✅ Navbar complète (CSS responsive)');
    this.showNavbar = true;
    this.isSimplePage = false;
  }

  getShowNavbar(): boolean {
    return this.showNavbar;
  }

  getIsSimpleNavbar(): boolean {
    return this.isSimplePage;
  }
}
