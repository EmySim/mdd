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

  // Pages SANS navbar du tout - CORRIGÉ
  private noNavbarPages = ['/landing'];

  // Pages avec navbar SIMPLE (juste logo)
  private simpleNavbarPages = ['/auth/login', '/auth/register'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event: Event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarStatus(event.url);
      });

    this.updateNavbarStatus(this.router.url);
  }

  private updateNavbarStatus(url: string): void {
    console.log('🔍 URL courante:', url);
    
    // Cas spécial pour la racine
    if (url === '/' || url === '') {
      console.log('❌ Navbar masquée (racine)');
      this.showNavbar = false;
      this.isSimplePage = false;
      return;
    }

    // Vérifier si on doit masquer complètement la navbar
    if (this.noNavbarPages.some((page) => url === page || url.startsWith(page))) {
      console.log('❌ Navbar masquée (page sans navbar)');
      this.showNavbar = false;
      this.isSimplePage = false;
      return;
    }

    // Vérifier si c'est une page avec navbar simple
    if (this.simpleNavbarPages.some((page) => url === page || url.startsWith(page))) {
      console.log('✅ Navbar simple');
      this.showNavbar = true;
      this.isSimplePage = true;
      return;
    }

    // Sinon, navbar complète
    console.log('✅ Navbar complète');
    this.showNavbar = true;
    this.isSimplePage = false;
  }

  // ============================================================================
  // MÉTHODES MANQUANTES - AJOUTER CECI
  // ============================================================================
  
  getShowNavbar(): boolean {
    return this.showNavbar;
  }

  getIsSimpleNavbar(): boolean {
    return this.isSimplePage;
  }
}