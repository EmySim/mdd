import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'front';

  constructor(private router: Router) {}

  // Une seule méthode simple
  showNavbar(): boolean {
    return this.router.url !== '/home' && this.router.url !== '/';
  }
}