import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonItem, IonLabel, IonNote, IonList, IonIcon } from '@ionic/angular/standalone';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CATEGORIAS_DEFAULT } from '../../core/models/categoria.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [IonIcon, 
    CurrencyPipe, NgFor, NgIf, DecimalPipe,
    NgApexchartsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonItem, IonLabel, IonNote, IonList
  ],
  templateUrl: './estadisticas.page.html',
})
export class EstadisticasPage {
  gastosService     = inject(GastosService);
  presupuestoService = inject(PresupuestoService);
  categorias        = CATEGORIAS_DEFAULT;

  saldoDisponible = computed(() => {
    const p = this.presupuestoService.presupuesto();
    if (!p) return 0;
    return p.monto - this.gastosService.totalMes();
  });

  get chartSeries(): number[] {
    const porCat = this.gastosService.gastosPorCategoria();
    if (!porCat || Object.keys(porCat).length === 0) return [];
    return Object.values(porCat);
  }

  get chartLabels(): string[] {
    const porCat = this.gastosService.gastosPorCategoria();
    if (!porCat || Object.keys(porCat).length === 0) return [];
    return Object.keys(porCat).map(id =>
      this.categorias.find(c => c.id === id)?.nombre ?? id
    );
  }

  get chartColors(): string[] {
    const porCat = this.gastosService.gastosPorCategoria();
    if (!porCat || Object.keys(porCat).length === 0) return [];
    return Object.keys(porCat).map(id =>
      this.categorias.find(c => c.id === id)?.color ?? '#999'
    );
  }

  get chartOptions() {
    return {
      series: this.chartSeries,
      chart: {
        type: 'donut' as const,
        height: 300,
        background: 'transparent',
        animations: { enabled: false },
      },
      labels: this.chartLabels,
      colors: this.chartColors,
      legend: {
        position: 'bottom' as const,
        labels: { colors: '#999999' }
      },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: { size: '60%' }
        }
      },
      stroke: { show: false },
      theme: { mode: 'dark' as const },
    };
  }

  get mayoresGastos() {
    const porCat = this.gastosService.gastosPorCategoria();
    const total  = this.gastosService.totalMes();
    return Object.entries(porCat)
      .map(([id, monto]) => ({
        id,
        nombre:     this.categorias.find(c => c.id === id)?.nombre ?? id,
        color:      this.categorias.find(c => c.id === id)?.color  ?? '#999',
        monto,
        porcentaje: total > 0 ? (monto / total) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }
}