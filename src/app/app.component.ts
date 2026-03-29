import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList,
  IonListHeader, IonMenuToggle, IonItem, IonIcon,
  IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, walletOutline, barChartOutline, settingsOutline
} from 'ionicons/icons';
import { ThemeService } from './core/services/theme.service';
import { FontSizeService } from './core/services/font-size.service';
import { CurrencyService } from './core/services/currency.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive,
    NgFor,                          // ← esto faltaba
    IonApp, IonSplitPane, IonMenu, IonContent, IonList,
    IonListHeader, IonMenuToggle, IonItem, IonIcon,
    IonLabel, IonRouterOutlet
  ],
  template: `
    <ion-app>
      <ion-split-pane contentId="main-content">

        <ion-menu contentId="main-content" type="overlay">
          <ion-content>
            <ion-list lines="none">
              <ion-list-header>Menú</ion-list-header>

              <ion-menu-toggle [autoHide]="false" *ngFor="let p of pages">
                <ion-item
                  [routerLink]="p.url"
                  routerLinkActive="selected"
                  detail="false">
                  <ion-icon slot="start" [name]="p.icon"></ion-icon>
                  <ion-label>{{ p.title }}</ion-label>
                </ion-item>
              </ion-menu-toggle>

            </ion-list>
          </ion-content>
        </ion-menu>

        <ion-router-outlet id="main-content"></ion-router-outlet>

      </ion-split-pane>
    </ion-app>
  `,
})
export class AppComponent {
  private themeService = inject(ThemeService);
  private fontSizeService = inject(FontSizeService);
  private currencyService = inject(CurrencyService);
  pages = [
    { title: 'Inicio',        url: '/home',         icon: 'home-outline'      },
    { title: 'Presupuesto',   url: '/presupuesto',  icon: 'wallet-outline'    },
    { title: 'Estadísticas',  url: '/estadisticas', icon: 'bar-chart-outline' },
    { title: 'Configuración', url: '/configuracion',icon: 'settings-outline'  },
  ];

  constructor() {
    addIcons({ homeOutline, walletOutline, barChartOutline, settingsOutline });
  }
}