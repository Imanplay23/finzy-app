import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonListHeader,
  IonNote,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  sunnyOutline,
  informationCircleOutline,
  cashOutline,
  textOutline,
  refreshOutline,
  notificationsOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService, DIVISAS } from '../../core/services/currency.service';
import { FontSizeService } from '../../core/services/font-size.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ToastController } from '@ionic/angular/standalone';
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonListHeader,
    IonNote,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonBackButton,
  ],
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage {
  themeService = inject(ThemeService);
  currencyService = inject(CurrencyService);
  fontSizeService = inject(FontSizeService);
  private notificationService = inject(NotificationService);
  private toastCtrl = inject(ToastController);
  divisas = DIVISAS;

  constructor() {
    addIcons({
      textOutline,
      cashOutline,
      refreshOutline,
      informationCircleOutline,
      notificationsOutline,
      chevronForwardOutline,
      moonOutline,
      sunnyOutline,
    });
  }

  onDivisaChange(event: any) {
    const divisa = this.divisas.find((d) => d.codigo === event.detail.value);
    if (divisa) this.currencyService.cambiarDivisa(divisa);
  }

  onFontSizeChange(event: any) {
    this.fontSizeService.aplicar(event.detail.value);
  }

  actualizarTasas() {
    this.currencyService.cargarTasas();
  }

  async reprogramarNotificaciones() {
    await this.notificationService.init();
    const toast = await this.toastCtrl.create({
      message: '✅ Notificaciones programadas',
      duration: 2000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }
}
