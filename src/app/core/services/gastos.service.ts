import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { PeriodoService } from './periodo.service';
import { Gasto } from '../models/gastos.model';

const TABLA = 'gastos';

@Injectable({ providedIn: 'root' })
export class GastosService {

  private db            = inject(DatabaseService);
  private periodoService = inject(PeriodoService);

  private _gastos = signal<Gasto[]>([]);
  gastos          = this._gastos.asReadonly();

  // Gastos del periodo activo
  gastosPeriodoActual = computed(() => {
    const inicio = this.periodoService.fechaInicio();
    const fin    = this.periodoService.fechaFin();
    if (!inicio || !fin) return [];
    return this._gastos().filter(g => g.fecha >= inicio && g.fecha <= fin);
  });

  // Alias para compatibilidad con código existente
  gastosMesActual = this.gastosPeriodoActual;

  totalPeriodo = computed(() =>
    this.gastosPeriodoActual().reduce((acc, g) => acc + g.monto, 0)
  );

  // Alias
  totalMes = this.totalPeriodo;

  gastosPorCategoria = computed(() => {
    const mapa: Record<string, number> = {};
    for (const g of this.gastosPeriodoActual()) {
      mapa[g.categoriaId] = (mapa[g.categoriaId] ?? 0) + g.monto;
    }
    return mapa;
  });

  constructor(private db2: DatabaseService) {
    this.cargar();
  }

  private cargar() {
    const datos = this.db.getAll<Gasto>(TABLA);
    this._gastos.set(datos.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  agregar(gasto: Omit<Gasto, 'id' | 'creadoEn'>): void {
    const nuevo: Gasto = {
      ...gasto,
      id:       crypto.randomUUID(),
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
    this.db.delete(TABLA, id);
    this.cargar();
  }

  // Eliminar gastos del periodo (al cerrar)
  eliminarGastosDePeriodo(gastos: Gasto[]): void {
    const ids = new Set(gastos.map(g => g.id));
    const todos = this.db.getAll<Gasto>(TABLA);
    const restantes = todos.filter(g => !ids.has(g.id));
    localStorage.setItem('gastos', JSON.stringify(restantes));
    this.cargar();
  }
}