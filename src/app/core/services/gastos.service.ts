import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { PeriodoService } from './periodo.service';
import { CuentaService } from './cuenta.service';
import { Gasto } from '../models/gastos.model';

const TABLA = 'gastos';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private db = inject(DatabaseService);
  private periodoService = inject(PeriodoService);
  private cuentaService = inject(CuentaService);
  private readonly KEY_ELIMINADOS = 'gastos_eliminados';
  private readonly MAX_ELIMINADOS = 20;

  private _gastosEliminados = signal<Gasto[]>([]);
  gastosEliminados = this._gastosEliminados.asReadonly();

  private _gastos = signal<Gasto[]>([]);
  gastos = this._gastos.asReadonly();

  // Gastos de la cuenta activa
  gastosCuentaActiva = computed(() => {
    const cuentaId = this.cuentaService.cuentaActiva().id;
    return this._gastos().filter((g) => g.cuentaId === cuentaId);
  });

  // Gastos del periodo activo de la cuenta activa
  gastosPeriodoActual = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return [];
    return this.gastosCuentaActiva().filter(
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

  // Total de todas las cuentas (para el resumen en Home)
  totalTodasCuentas = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return 0;
    return this._gastos()
      .filter((g) => g.fecha >= inicio && g.fecha <= fin)
      .reduce((acc, g) => acc + g.monto, 0);
  });

  totalPorCuenta = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin = this.periodoService.fechaFin();
    if (!inicio || !fin) return {} as Record<string, number>;
    const mapa: Record<string, number> = {};
    this._gastos()
      .filter((g) => g.fecha >= inicio && g.fecha <= fin)
      .forEach((g) => {
        mapa[g.cuentaId] = (mapa[g.cuentaId] ?? 0) + g.monto;
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
      if (g.billeteraId && !g.cuentaId) {
        migrado = true;
        const { billeteraId, ...rest } = g;
        return { ...rest, cuentaId: billeteraId };
      }
      if (!g.cuentaId) {
        migrado = true;
        return { ...g, cuentaId: 'principal' };
      }
      return g;
    });

    if (migrado) {
      localStorage.setItem('gastos', JSON.stringify(actualizados));
    }
  }

  private cargar() {
    const datos = this.db.getAll<Gasto>(TABLA);
    this._gastos.set(datos.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  agregar(gasto: Omit<Gasto, 'id' | 'creadoEn' | 'cuentaId'>): void {
    const nuevo: Gasto = {
      ...gasto,
      cuentaId: this.cuentaService.cuentaActiva().id,
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

    this.db.save(TABLA, gasto);

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
