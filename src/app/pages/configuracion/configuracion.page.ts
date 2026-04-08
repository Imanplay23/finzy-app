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
  addCircleOutline, createOutline } from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService, DIVISAS } from '../../core/services/currency.service';
import { FontSizeService } from '../../core/services/font-size.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ToastController } from '@ionic/angular/standalone';
import { PeriodoService } from '../../core/services/periodo.service';
import { BilleteraService } from '../../core/services/billetera.service';
import {
  ICONOS_BILLETERA,
  COLORES_BILLETERA,
  Billetera,
} from '../../core/models/billetera.model';
import { ModalController } from '@ionic/angular/standalone';
import { BilleteraModalComponent } from './components/billetera-modal/billetera-modal.component';

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
  billeteraService = inject(BilleteraService);
  private modalCtrl = inject(ModalController);
  divisas = DIVISAS;

  constructor() {
    addIcons({calendarOutline,cashOutline,refreshOutline,informationCircleOutline,notificationsOutline,chevronForwardOutline,createOutline,trashOutline,addCircleOutline,textOutline,moonOutline,sunnyOutline,});
  }

  async abrirBilleteraModal(billetera?: Billetera) {
    const modal = await this.modalCtrl.create({
      component: BilleteraModalComponent,
      componentProps: { billetera: billetera ?? null },
      breakpoints: [0, 0.85, 1],
      initialBreakpoint: 0.85,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) return;

    if (billetera) {
      // Editar
      this.billeteraService.editar({
        ...billetera,
        nombre: data.nombre,
        icono: data.icono,
        color: data.color,
      });
    } else {
      // Crear
      const ok = this.billeteraService.agregar(data);
      if (!ok) {
        const toast = await this.toastCtrl.create({
          message: 'Máximo 5 billeteras permitidas',
          duration: 2000,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
      }
    }
  }

  async eliminarBilletera(id: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar billetera?',
      message: 'Se eliminarán todos los gastos asociados.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-danger',
          handler: () => this.billeteraService.eliminar(id),
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
