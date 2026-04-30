import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  GestureController,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  listOutline,
  walletOutline,
  barChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs #tabs>
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
  styles: [
    `
      ion-tab-bar {
        --background: var(--ion-toolbar-background);
        --border: 1px solid var(--ion-border-color);
        padding-bottom: env(safe-area-inset-bottom);
        height: 68px;
      }
      ion-tab-button {
        --color: var(--ion-color-medium);
        --color-selected: var(--ion-color-primary);
        font-size: 11px;
        font-weight: 600;
      }
      ion-tab-button ion-icon {
        font-size: 26px;
        margin-bottom: 2px;
      }
    `,
  ],
})
export class TabsPage implements AfterViewInit {
  @ViewChild('tabs', { read: ElementRef }) tabsRef!: ElementRef;

  private gestureCtrl = inject(GestureController);
  private router = inject(Router);

  private tabs = ['inicio', 'gastos', 'presupuesto', 'estadisticas'];

  constructor() {
    addIcons({ homeOutline, listOutline, walletOutline, barChartOutline });
  }

  get tabActual(): number {
    const url = this.router.url;
    return this.tabs.findIndex((t) => url.includes(t));
  }

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create(
      {
        el: this.tabsRef.nativeElement,
        threshold: 15,
        gestureName: 'swipe-tabs',
        onStart: (ev) => {
          // Verificar si el swipe empezó sobre un ion-item-sliding
          const target = ev.event.target as HTMLElement;
          const isSliding =
            target.closest('ion-item-sliding') ||
            target.closest('ion-item-options') ||
            target.closest('.scroll-row') || // sliders de billetera modal
            target.closest('ion-range') || // slider font size
            target.closest('.billetera-chips'); // chips de billetera en home
          return !isSliding; // si está en sliding, no activar el gesture
        },
        onEnd: (ev) => {
          const idx = this.tabActual;

          if (ev.deltaX < -60 && idx < this.tabs.length - 1) {
            this.router.navigate([`/tabs/${this.tabs[idx + 1]}`]);
          }

          if (ev.deltaX > 60 && idx > 0) {
            this.router.navigate([`/tabs/${this.tabs[idx - 1]}`]);
          }
        },
      },
      true
    );

    gesture.enable(true);
  }
}
