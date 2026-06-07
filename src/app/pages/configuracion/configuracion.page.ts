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
  IonCard,
  AlertController,
  IonButton, IonCardHeader, IonItemOptions, IonItemOption, IonItemSliding } from '@ionic/angular/standalone';
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
  calendarOutline,
  trashOutline,
  addCircleOutline, createOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService, DIVISAS } from '../../core/services/currency.service';
import { FontSizeService } from '../../core/services/font-size.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ToastController } from '@ionic/angular/standalone';
import { PeriodoService } from '../../core/services/periodo.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { Cuenta } from '../../core/models/cuenta.model';
import { ModalController } from '@ionic/angular/standalone';
import { CuentaModalComponent } from './components/cuenta-modal/cuenta-modal.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [IonItemSliding, IonItemOption, IonItemOptions, IonCardHeader,
    IonButton,
    IonCard,
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
  periodoService = inject(PeriodoService);
  private notificationService = inject(NotificationService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  cuentaService = inject(CuentaService);
  private modalCtrl = inject(ModalController);
  authService = inject(AuthService);
  divisas = DIVISAS;

  constructor() {
    addIcons({calendarOutline,cashOutline,refreshOutline,informationCircleOutline,notificationsOutline,chevronForwardOutline,createOutline,trashOutline,addCircleOutline,textOutline,moonOutline,sunnyOutline,logOutOutline,personCircleOutline,});
  }

  async abrirCuentaModal(cuenta?: Cuenta) {
    const modal = await this.modalCtrl.create({
      component: CuentaModalComponent,
      componentProps: { cuenta: cuenta ?? null },
      breakpoints: [0, 0.85, 1],
      initialBreakpoint: 0.85,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) return;

    if (cuenta) {
      this.cuentaService.editar({
        ...cuenta,
        nombre: data.nombre,
        icono: data.icono,
        color: data.color,
      });
    } else {
      const ok = this.cuentaService.agregar(data);
      if (!ok) {
        const toast = await this.toastCtrl.create({
          message: 'Máximo 5 cuentas permitidas',
          duration: 2000,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
      }
    }
  }

  async eliminarCuenta(id: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar cuenta?',
      message: 'Se eliminarán todos los gastos asociados.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-danger',
          handler: () => this.cuentaService.eliminar(id),
        },
      ],
    });
    await alert.present();
  }

  onDivisaChange(event: any) {
    const divisa = this.divisas.find((d) => d.codigo === event.detail.value);
    if (divisa) this.currencyService.cambiarDivisa(divisa);
  }

  onTipoPeriodo(event: any) {
    this.periodoService.cambiarTipo(event.detail.value);
  }

  onFontSizeChange(event: any) {
    this.fontSizeService.aplicar(event.detail.value);
  }

  actualizarTasas() {
    this.currencyService.cargarTasas();
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', cssClass: 'alert-danger', handler: () => this.authService.logout() },
      ],
    });
    await alert.present();
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
