import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline, trendingUpOutline, cashOutline,
  checkmarkCircleOutline, alertCircleOutline
} from 'ionicons/icons';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { GastosService } from '../../core/services/gastos.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { ToastController } from '@ionic/angular/standalone';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe, AppCurrencyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons, TitleCasePipe
  ],
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss']
})
export class PresupuestoPage {
  presupuestoService = inject(PresupuestoService);
  gastosService      = inject(GastosService);
  private toastCtrl  = inject(ToastController);

  nuevoMonto: number | null = null;

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

  get mesActual(): string {
    return new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
  }

  constructor() {
    addIcons({
      walletOutline, trendingUpOutline, cashOutline,
      checkmarkCircleOutline, alertCircleOutline
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
}