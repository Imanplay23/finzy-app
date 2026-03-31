import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonList, IonNote, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline, trendingUpOutline, cashOutline,
  checkmarkCircleOutline, lockClosedOutline,
  timeOutline, chevronDownOutline
} from 'ionicons/icons';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { GastosService } from '../../core/services/gastos.service';
import { PeriodoService } from '../../core/services/periodo.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { ToastController } from '@ionic/angular/standalone';
import { labelPeriodo, labelPeriodoCapital } from '../../core/models/periodo.model';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe, DatePipe, AppCurrencyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonList, IonNote
  ],
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss']
})
export class PresupuestoPage {
  presupuestoService = inject(PresupuestoService);
  gastosService      = inject(GastosService);
  periodoService     = inject(PeriodoService);
  private toastCtrl  = inject(ToastController);
  private alertCtrl  = inject(AlertController);

  nuevoMonto: number | null = null;
  mostrarHistorial = false;

  saldoDisponible = computed(() => {
    const p = this.presupuestoService.presupuesto();
    if (!p) return 0;
    return p.monto - this.gastosService.totalMes();
  });

  get porcentajeUsado(): number {
    const p = this.presupuestoService.presupuesto();
    if (!p || p.monto === 0) return 0;
    return Math.min((this.gastosService.totalMes() / p.monto) * 100, 100);
  }

  get colorBarra(): string {
    if (this.porcentajeUsado >= 90) return '#eb445a';
    if (this.porcentajeUsado >= 70) return '#ffc409';
    return '#2dd36f';
  }

  get estadoTexto(): string {
    if (this.porcentajeUsado >= 100) return '¡Presupuesto agotado!';
    if (this.porcentajeUsado >= 90)  return 'Casi sin presupuesto';
    if (this.porcentajeUsado >= 70)  return 'Cuidado con los gastos';
    return 'Vas bien 👍';
  }

  get labelPeriodo(): string {
    return labelPeriodo(this.periodoService.tipo());
  }

  get labelPeriodoCapital(): string {
    return labelPeriodoCapital(this.periodoService.tipo());
  }

  get periodoLabel(): string {
    const activo = this.periodoService.periodoActivo();
    if (!activo) return '';
    const inicio = new Date(activo.fechaInicio).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
    const fin    = new Date(activo.fechaFin).toLocaleDateString('es-DO',    { day: '2-digit', month: 'short', year: 'numeric' });
    return `${inicio} — ${fin}`;
  }

  constructor() {
    addIcons({
      walletOutline, trendingUpOutline, cashOutline,
      checkmarkCircleOutline, lockClosedOutline,
      timeOutline, chevronDownOutline
    });
  }

  async guardar() {
    if (!this.nuevoMonto || this.nuevoMonto <= 0) {
      const toast = await this.toastCtrl.create({
        message: 'Ingresa un monto válido mayor a 0',
        duration: 2000, color: 'danger', position: 'top'
      });
      await toast.present();
      return;
    }
    this.presupuestoService.guardar(this.nuevoMonto);
    this.nuevoMonto = null;
    const toast = await this.toastCtrl.create({
      message: '✅ Presupuesto guardado',
      duration: 2000, color: 'success', position: 'top'
    });
    await toast.present();
  }

  async cerrarPeriodo() {
    const gastos = this.gastosService.gastosPeriodoActual();
    const total  = this.gastosService.totalMes();
    const p      = this.presupuestoService.presupuesto();

    const alert = await this.alertCtrl.create({
      header:  `Cerrar ${this.labelPeriodo}`,
      message: `Has gastado ${total.toFixed(2)} de ${p?.monto.toFixed(2) ?? 0}. Los gastos se archivarán y podrás iniciar un nuevo ${this.labelPeriodo}.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text:    'Cerrar periodo',
          handler: async () => {
            this.periodoService.cerrarPeriodo(gastos);
            this.gastosService.eliminarGastosDePeriodo(gastos);

            // Sugerir el mismo presupuesto
            this.nuevoMonto = p?.monto ?? null;

            const toast = await this.toastCtrl.create({
              message: `✅ ${this.labelPeriodoCapital} cerrado. Configura el nuevo presupuesto.`,
              duration: 3000, color: 'success', position: 'top'
            });
            await toast.present();
          }
        }
      ]
    });
    await alert.present();
  }
}