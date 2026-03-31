import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonItem,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CurrencyService } from '../../core/services/currency.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonItem,
    IonCard,
    AppCurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  private router = inject(Router);
  gastosService = inject(GastosService);
  presupuestoService = inject(PresupuestoService);
  currencyService = inject(CurrencyService);

  saldoDisponible = computed<number | null>(() => {
    const p = this.presupuestoService.presupuesto();
    if (!p) return null;
    return p.monto - this.gastosService.totalMes();
  });

  get porcentajeUsado(): number {
    const p = this.presupuestoService.presupuesto();
    if (!p || p.monto === 0) return 0;
    return Math.min((this.gastosService.totalMes() / p.monto) * 100, 100);
  }

  get colorBarra(): string {
    const p = this.porcentajeUsado;
    if (p >= 90) return '#eb445a';
    if (p >= 70) return '#ffc409';
    return '#2dd36f';
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

    irAPresupuesto() {
    this.router.navigate(['/tabs/presupuesto'])
  }


  constructor() {
    addIcons({ settingsOutline });
  }
}
