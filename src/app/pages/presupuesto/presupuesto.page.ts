import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, NgIf } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonItem, IonLabel, IonInput, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote
} from '@ionic/angular/standalone';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { GastosService } from '../../core/services/gastos.service';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe, NgIf,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonItem, IonLabel, IonInput, IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote
  ],
  templateUrl: './presupuesto.page.html',
})
export class PresupuestoPage {
  presupuestoService = inject(PresupuestoService);
  gastosService = inject(GastosService);

  nuevoMonto: number | null = null;

  guardar() {
    if (!this.nuevoMonto || this.nuevoMonto <= 0) return;
    this.presupuestoService.guardar(this.nuevoMonto);
    this.nuevoMonto = null;
  }

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
}