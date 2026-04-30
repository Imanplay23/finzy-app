import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { PeriodoService } from './periodo.service';
import { BilleteraService } from './billetera.service';
import { Gasto } from '../models/gastos.model';

const TABLA = 'gastos';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private db = inject(DatabaseService);
  private periodoService = inject(PeriodoService);
  private billeteraService = inject(BilleteraService);
  private readonly KEY_ELIMINADOS = 'gastos_eliminados';
  private readonly MAX_ELIMINADOS = 20;

  private _gastosEliminados = signal<Gasto[]>([]);
  gastosEliminados = this._gastosEliminados.asReadonly();

  private _gastos = signal<Gasto[]>([]);
  gastos = this._gastos.asReadonly();

  // Gastos de la billetera activa
  gastosBilleteraActiva = computed(() => {
    const billeteraId = this.billeteraService.billeteraActiva().id;
    return this._gastos().filter((g) => g.billeteraId === billeteraId);
  });

  // Gastos del periodo activo de la billetera activa
  gastosPeriodoActual = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return [];
    return this.gastosBilleteraActiva().filter(
      (g) => g.fecha >= inicio && g.fecha <= fin
    );
  });

  gastosMesActual = this.gastosPeriodoActual;

  totalPeriodo = computed(() =>
    this.gastosPeriodoActual().reduce((acc, g) => acc + g.monto, 0)
  );

  totalMes = this.totalPeriodo;

  gastosPorCategoria = computed(() => {
    const mapa: Record<string, number> = {};
    for (const g of this.gastosPeriodoActual()) {
      mapa[g.categoriaId] = (mapa[g.categoriaId] ?? 0) + g.monto;
    }
    return mapa;
  });

  // Total de todas las billeteras (para el resumen en Home)
  totalTodasBilleteras = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return 0;
    return this._gastos()
      .filter((g) => g.fecha >= inicio && g.fecha <= fin)
      .reduce((acc, g) => acc + g.monto, 0);
  });

  totalPorBilletera = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return {} as Record<string, number>;
    const mapa: Record<string, number> = {};
    this._gastos()
      .filter((g) => g.fecha >= inicio && g.fecha <= fin)
      .forEach((g) => {
        mapa[g.billeteraId] = (mapa[g.billeteraId] ?? 0) + g.monto;
      });
    return mapa;
  });

  constructor() {
    this.cargar();
    this.migrarGastosLegacy();
    this.cargar();
    this.cargarEliminados();
  }

  private cargarEliminados() {
    const datos = this.db.getAll<Gasto>(this.KEY_ELIMINADOS);
    this._gastosEliminados.set(datos);
  }
  private migrarGastosLegacy() {
    const raw = localStorage.getItem('gastos');
    if (!raw) return;

    const gastos = JSON.parse(raw);
    let migrado = false;

    const actualizados = gastos.map((g: any) => {
      if (!g.billeteraId) {
        migrado = true;
        return { ...g, billeteraId: 'principal' };
      }
      return g;
    });

    if (migrado) {
      localStorage.setItem('gastos', JSON.stringify(actualizados));
      console.log(
        `✅ Migrados ${
          actualizados.filter((g: any) => g.billeteraId === 'principal').length
        } gastos a billetera principal`
      );
    }
  }

  private cargar() {
    const datos = this.db.getAll<Gasto>(TABLA);
    this._gastos.set(datos.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  agregar(gasto: Omit<Gasto, 'id' | 'creadoEn' | 'billeteraId'>): void {
    const nuevo: Gasto = {
      ...gasto,
      billeteraId: this.billeteraService.billeteraActiva().id,
      id: crypto.randomUUID(),
      creadoEn: Date.now(),
    };
    this.db.save(TABLA, nuevo);
    this.cargar();
  }

  editar(gasto: Gasto): void {
    this.db.save(TABLA, gasto);
    this.cargar();
  }

  eliminar(id: string): void {
    const gasto = this._gastos().find((g) => g.id === id);

    if (gasto) {
      // Agregar al historial de eliminados
      const eliminados = this.db.getAll<Gasto>(this.KEY_ELIMINADOS);
      const actualizados = [gasto, ...eliminados].slice(0, this.MAX_ELIMINADOS);
      localStorage.setItem(this.KEY_ELIMINADOS, JSON.stringify(actualizados));
      this._gastosEliminados.set(actualizados);
    }

    this.db.delete(TABLA, id);
    this.cargar();
  }

  restaurar(id: string): void {
    const eliminados = this._gastosEliminados();
    const gasto = eliminados.find((g) => g.id === id);
    if (!gasto) return;

    // Devolver a la lista activa
    this.db.save(TABLA, gasto);

    // Quitar del historial
    const actualizados = eliminados.filter((g) => g.id !== id);
    localStorage.setItem(this.KEY_ELIMINADOS, JSON.stringify(actualizados));
    this._gastosEliminados.set(actualizados);

    this.cargar();
  }

  limpiarEliminados(): void {
    localStorage.removeItem(this.KEY_ELIMINADOS);
    this._gastosEliminados.set([]);
  }

  eliminarGastosDePeriodo(gastos: Gasto[]): void {
    const ids = new Set(gastos.map((g) => g.id));
    const todos = this.db.getAll<Gasto>(TABLA);
    const restantes = todos.filter((g) => !ids.has(g.id));
    localStorage.setItem('gastos', JSON.stringify(restantes));
    this.cargar();
  }
}
