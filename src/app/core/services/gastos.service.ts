import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { Gasto } from '../models/gastos.model';
import { ToastController } from '@ionic/angular/standalone';
import { PresupuestoService } from './presupuesto.service';

const TABLA = 'gastos';

@Injectable({ providedIn: 'root' })
export class GastosService {

  private _gastos = signal<Gasto[]>([]);
  private toastCtrl = inject(ToastController);
  private presupuestoService = inject(PresupuestoService); // ← ojo: importar después

  // Signal público (solo lectura)
  gastos = this._gastos.asReadonly();

  // Gastos del mes actual
  gastosMesActual = computed(() => {
    const ahora = new Date();
    return this._gastos().filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === ahora.getMonth() &&
             fecha.getFullYear() === ahora.getFullYear();
    });
  });

  // Total gastado este mes
  totalMes = computed(() =>
    this.gastosMesActual().reduce((acc, g) => acc + g.monto, 0)
  );

  constructor(private db: DatabaseService) {
    this.cargar();
  }

  private cargar() {
    const datos = this.db.getAll<Gasto>(TABLA);
    this._gastos.set(datos.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  agregar(gasto: Omit<Gasto, 'id' | 'creadoEn'>): void {
  const nuevo: Gasto = {
    ...gasto,
    id: crypto.randomUUID(),
    creadoEn: Date.now(),
  };
  this.db.save(TABLA, nuevo);
  this.cargar();
  this.verificarPresupuesto();
}

private async verificarPresupuesto() {
  const p = this.presupuestoService.presupuesto();
  if (!p) return;

  const total = this.totalMes();
  const porcentaje = (total / p.monto) * 100;

  let mensaje = '';
  let color = '';

  if (porcentaje >= 100) {
    mensaje = '⚠️ ¡Superaste tu presupuesto mensual!';
    color = 'danger';
  } else if (porcentaje >= 80) {
    mensaje = `⚠️ Llevas el ${porcentaje.toFixed(0)}% de tu presupuesto`;
    color = 'warning';
  }

  if (mensaje) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}

  eliminar(id: string): void {
    this.db.delete(TABLA, id);
    this.cargar();
  }

  // Gastos agrupados por categoría (para estadísticas)
  gastosPorCategoria = computed(() => {
    const mapa: Record<string, number> = {};
    for (const g of this.gastosMesActual()) {
      mapa[g.categoriaId] = (mapa[g.categoriaId] ?? 0) + g.monto;
    }
    return mapa;
  });
}