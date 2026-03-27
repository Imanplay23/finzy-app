import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonItem, IonLabel, IonNote, IonIcon, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUpOutline, pieChartOutline } from 'ionicons/icons';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CATEGORIAS_DEFAULT } from '../../core/models/categoria.model';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CurrencyPipe, NgFor, NgIf, DecimalPipe,
    BaseChartDirective,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonItem, IonLabel, IonNote, IonIcon, IonList
  ],
  templateUrl: './estadisticas.page.html',
})
export class EstadisticasPage {
  gastosService = inject(GastosService);
  presupuestoService = inject(PresupuestoService);
  categorias = CATEGORIAS_DEFAULT;

  constructor() {
    addIcons({ trendingUpOutline, pieChartOutline });
  }

  // Datos para el donut
  get chartData(): ChartData<'doughnut'> {
    const porCat = this.gastosService.gastosPorCategoria();
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    for (const [id, monto] of Object.entries(porCat)) {
      const cat = this.categorias.find(c => c.id === id);
      labels.push(cat?.nombre ?? id);
      data.push(monto);
      colors.push(cat?.color ?? '#999');
    }

    return {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2 }]
    };
  }

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#fff' } },
    }
  };

  // Ranking mayores gastos por categoría
  get mayoresGastos() {
    const porCat = this.gastosService.gastosPorCategoria();
    const total = this.gastosService.totalMes();

    return Object.entries(porCat)
      .map(([id, monto]) => ({
        id,
        nombre: this.categorias.find(c => c.id === id)?.nombre ?? id,
        icono: this.categorias.find(c => c.id === id)?.icono ?? 'ellipsis-horizontal',
        color: this.categorias.find(c => c.id === id)?.color ?? '#999',
        monto,
        porcentaje: total > 0 ? (monto / total) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }
}