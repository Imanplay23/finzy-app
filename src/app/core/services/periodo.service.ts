import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import {
  PeriodoActivo, PeriodoCerrado, TipoPeriodo,
  calcularFechaFin, calcularProximoInicio
} from '../models/periodo.model';
import { Gasto } from '../models/gastos.model';

const KEY_ACTIVO    = 'periodo_activo';
const KEY_HISTORIAL = 'periodos_historial';
const KEY_TIPO      = 'periodo_tipo';

@Injectable({ providedIn: 'root' })
export class PeriodoService {

  private db = inject(DatabaseService);

  private _periodoActivo  = signal<PeriodoActivo | null>(null);
  private _historial      = signal<PeriodoCerrado[]>([]);
  private _tipo           = signal<TipoPeriodo>('mensual');

  periodoActivo  = this._periodoActivo.asReadonly();
  historial      = this._historial.asReadonly();
  tipo           = this._tipo.asReadonly();

  // Fechas del periodo actual para filtrar gastos
  fechaInicio = computed(() => this._periodoActivo()?.fechaInicio ?? null);
  fechaFin    = computed(() => this._periodoActivo()?.fechaFin    ?? null);

  constructor() {
    this.cargar();
  }

  private cargar() {
    // Tipo de periodo
    const tipo = localStorage.getItem(KEY_TIPO) as TipoPeriodo;
    if (tipo) this._tipo.set(tipo);

    // Periodo activo
    const activo = this.db.getOne<PeriodoActivo>(KEY_ACTIVO, KEY_ACTIVO);
    if (activo) {
      this._periodoActivo.set(activo);
    }

    // Historial
    const historial = this.db.getAll<PeriodoCerrado>(KEY_HISTORIAL);
    this._historial.set(historial.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  // Iniciar primer periodo o nuevo periodo
  iniciarPeriodo(presupuesto: number, fechaInicio?: string): void {
    const inicio = fechaInicio ?? new Date().toISOString().split('T')[0];
    const tipo   = this._tipo();

    const nuevo: PeriodoActivo = {
      id:          crypto.randomUUID(),
      tipo,
      fechaInicio: inicio,
      fechaFin:    calcularFechaFin(inicio, tipo),
      presupuesto,
    };

    this.db.saveOne(KEY_ACTIVO, nuevo);
    this._periodoActivo.set(nuevo);
  }

  // Cerrar periodo actual y archivar gastos
  cerrarPeriodo(gastos: Gasto[]): void {
    const activo = this._periodoActivo();
    if (!activo) return;

    const totalGastado = gastos.reduce((acc, g) => acc + g.monto, 0);

    const cerrado: PeriodoCerrado = {
      id:           activo.id,
      tipo:         activo.tipo,
      fechaInicio:  activo.fechaInicio,
      fechaFin:     activo.fechaFin,
      presupuesto:  activo.presupuesto,
      totalGastado,
      gastos:       [...gastos],
      creadoEn:     Date.now(),
    };

    // Guardar en historial
    this.db.save(KEY_HISTORIAL, cerrado);

    // Limpiar periodo activo
    localStorage.removeItem(KEY_ACTIVO);
    this._periodoActivo.set(null);

    // Actualizar historial en memoria
    this._historial.update(h => [cerrado, ...h]);
  }

  cambiarTipo(tipo: TipoPeriodo): void {
    this._tipo.set(tipo);
    localStorage.setItem(KEY_TIPO, tipo);
  }

  // Verificar si una fecha cae en el periodo activo
  estaEnPeriodoActivo(fecha: string): boolean {
    const activo = this._periodoActivo();
    if (!activo) return false;
    return fecha >= activo.fechaInicio && fecha <= activo.fechaFin;
  }

  get proximoInicio(): string {
    const activo = this._periodoActivo();
    if (!activo) return new Date().toISOString().split('T')[0];
    return calcularProximoInicio(activo.fechaFin);
  }
}