import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {
  themes: any[] = []; // Remplace 'any' par le bon type si besoin

  ngOnInit() {
    // Charge les thèmes ici si besoin
    // this.themes = ...
  }

  toggleSubscription(theme: any) {
    // Ajoute la logique pour s'abonner/désabonner à un thème
    // Exemple :
    // theme.subscribed = !theme.subscribed;
  }
}