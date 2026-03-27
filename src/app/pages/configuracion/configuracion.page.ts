import { Component, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonToggle,
  IonListHeader, IonNote, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline, informationCircleOutline } from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonToggle,
    IonListHeader, IonNote, IonIcon
  ],
  templateUrl: './configuracion.page.html',
})
export class ConfiguracionPage {
  themeService = inject(ThemeService);

  constructor() {
    addIcons({ moonOutline, sunnyOutline, informationCircleOutline });
  }
}