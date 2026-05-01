import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonIcon, IonList,
  IonItem, IonLabel, IonNote, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline, trendingUpOutline, cashOutline,
  pieChartOutline, calendarOutline, listOutline } from 'ionicons/icons';
import { PeriodoService } from '../core/services/periodo.service';
import { CurrencyService } from '../core/services/currency.service';
import { CATEGORIAS_DEFAULT } from '../core/models/categoria.model';
import { PeriodoCerrado } from '../core/models/periodo.model';
import { AppCurrencyPipe } from '../core/pipes/app-currency.pipe';

@Component({
  selector: 'app-periodo-detalle',
  standalone: true,
  imports: [
    DecimalPipe, AppCurrencyPipe, NgApexchartsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonIcon, IonList,
    IonItem, IonLabel, IonNote, IonBadge
  ],
  templateUrl: './periodo-detalle.page.html',
  styleUrls: ['./periodo-detalle.page.scss']
})
export class PeriodoDetallePage implements OnInit {
  private route          = inject(ActivatedRoute);
  private periodoService = inject(PeriodoService);
  private currencyService = inject(CurrencyService);

  categorias = CATEGORIAS_DEFAULT;
  periodo: PeriodoCerrado | null = null;

  constructor() {
    addIcons({calendarOutline,walletOutline,trendingUpOutline,cashOutline,pieChartOutline,listOutline});
  }

  ngOnInit() {
    const id = this.route.snapshot.queryParams['id'];
    this.periodo = this.periodoService.historial().find(p => p.id === id) ?? null;
  }

  get saldoFinal(): number {
    if (!this.periodo) return 0;
    return this.periodo.presupuesto - this.periodo.totalGastado;
  }

  get porcentajeUsado(): number {
    if (!this.periodo || this.periodo.presupuesto === 0) return 0;
    return Math.min((this.periodo.totalGastado / this.periodo.presupuesto) * 100, 100);
  }

  get colorBarra(): string {
    if (this.porcentajeUsado >= 90) return '#eb445a';
    if (this.porcentajeUsado >= 70) return '#ffc409';
    return '#2dd36f';
  }

  get periodoRango(): string {
    if (!this.periodo) return '';
    const inicio = new Date(this.periodo.fechaInicio + 'T00:00:00')
      .toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
    const fin = new Date(this.periodo.fechaFin + 'T00:00:00')
      .toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${inicio} — ${fin}`;
  }

  // Gastos por categoría para el donut
  get gastosPorCategoria(): Record<string, number> {
    const mapa: Record<string, number> = {};
    if (!this.periodo) return mapa;
    for (const g of this.periodo.gastos) {
      mapa[g.categoriaId] = (mapa[g.categoriaId] ?? 0) + g.monto;
    }
    return mapa;
  }

  get chartOptions() {
    const porCat = this.gastosPorCategoria;
    const labels  = Object.keys(porCat).map(id => this.categorias.find(c => c.id === id)?.nombre ?? id);
    const series  = Object.values(porCat);
    const colors  = Object.keys(porCat).map(id => this.categorias.find(c => c.id === id)?.color ?? '#999');

    return {
      series,
      chart:  { type: 'donut' as const, height: 260, background: 'transparent', animations: { enabled: false } },
      labels,
      colors,
      legend: { position: 'bottom' as const, labels: { colors: 'var(--ion-color-medium)' } },
      dataLabels:  { enabled: false },
      plotOptions: { pie: { donut: { size: '60%' } } },
      stroke:      { show: false },
      theme:       { mode: 'dark' as const },
    };
  }

  get mayoresGastos() {
    const porCat = this.gastosPorCategoria;
    const total  = this.periodo?.totalGastado ?? 0;
    return Object.entries(porCat)
      .map(([id, monto]) => ({
        id,
        nombre:     this.categorias.find(c => c.id === id)?.nombre    ?? id,
        icono:      this.categorias.find(c => c.id === id)?.icono     ?? 'ellipsis-horizontal-outline',
        color:      this.categorias.find(c => c.id === id)?.color     ?? '#999',
        monto,
        porcentaje: total > 0 ? (monto / total) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }

  getCategoriaColor(id: string)  { return this.categorias.find(c => c.id === id)?.color  ?? '#999'; }
  getCategoriaIcono(id: string)  { return this.categorias.find(c => c.id === id)?.icono  ?? 'ellipsis-horizontal-outline'; }
  getCategoriaNombre(id: string) { return this.categorias.find(c => c.id === id)?.nombre ?? 'Otros'; }
}