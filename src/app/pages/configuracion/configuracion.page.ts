import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonList, IonItem,
  IonLabel, IonToggle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonList, IonItem,
    IonLabel, IonToggle
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Configuración</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>Versión</ion-label>
          <ion-label slot="end" color="medium">1.0.0</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class ConfiguracionPage {}