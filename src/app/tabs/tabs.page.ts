import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, listOutline, walletOutline, barChartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="inicio" href="/tabs/inicio">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="gastos" href="/tabs/gastos">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>Gastos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="presupuesto" href="/tabs/presupuesto">
          <ion-icon name="wallet-outline"></ion-icon>
          <ion-label>Presupuesto</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="estadisticas" href="/tabs/estadisticas">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <ion-label>Estadísticas</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: var(--ion-toolbar-background);
      --border: 1px solid var(--ion-border-color);
      padding-bottom: env(safe-area-inset-bottom);
      height: 64px;
    }

    ion-tab-button {
      --color:          var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
      font-size:        11px;
      font-weight:      600;
    }
  `]
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, listOutline, walletOutline, barChartOutline });
  }
}