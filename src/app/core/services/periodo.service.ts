import { Injectable, signal, computed, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { BilleteraService } from './billetera.service';
import {
  PeriodoActivo,
  PeriodoCerrado,
  TipoPeriodo,
  calcularFechaFin,
  calcularProximoInicio,
} from '../models/periodo.model';
import { Gasto } from '../models/gastos.model';

const KEY_HISTORIAL = 'periodos_historial';
const KEY_TIPO = 'periodo_tipo';

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private db = inject(DatabaseService);
  private billeteraService = inject(BilleteraService);

  private _periodoActivo = signal<PeriodoActivo | null>(null);
  private _historial = signal<PeriodoCerrado[]>([]);
  private _tipo = signal<TipoPeriodo>('mensual');

  periodoActivo = this._periodoActivo.asReadonly();
  historial = this._historial.asReadonly();
  tipo = this._tipo.asReadonly();

  fechaInicio = computed(() => this._periodoActivo()?.fechaInicio ?? null);
  fechaFin = computed(() => this._periodoActivo()?.fechaFin ?? null);

  constructor() {
    this.cargar();
    // Registrar callback para cuando cambie la billetera
    this.billeteraService.registrarOnCambio(() => this.cargar());
  }

  // Key única por billetera
  private keyActivo(): string {
    return `periodo_activo_${this.billeteraService.billeteraActiva().id}`;
  }

  cargar() {
    const tipo = localStorage.getItem(KEY_TIPO) as TipoPeriodo;
    if (tipo) this._tipo.set(tipo);

    const activo = this.db.getOne<PeriodoActivo>(
      this.keyActivo(),
      this.keyActivo()
    );
    this._periodoActivo.set(activo);

    const historial = this.db.getAll<PeriodoCerrado>(KEY_HISTORIAL);
    this._historial.set(historial.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  // Llamar cuando cambia la billetera activa
  actualizarPeriodoActivo(periodo?: PeriodoActivo) {
    if (periodo) {
      this._periodoActivo.set(periodo);
    } else {
      this.cargar();
    }
  }

  iniciarPeriodo(presupuesto: number, fechaInicio?: string): void {
    const inicio = fechaInicio ?? new Date().toISOString().split('T')[0];
    const tipo = this._tipo();

    const nuevo: PeriodoActivo = {
      id: crypto.randomUUID(),
      tipo,
      fechaInicio: inicio,
      fechaFin: calcularFechaFin(inicio, tipo),
      presupuesto,
      billeteraId: this.billeteraService.billeteraActiva().id,
    };

    this.db.saveOne(this.keyActivo(), nuevo);
    this._periodoActivo.set(nuevo);
  }

  cerrarPeriodo(gastos: Gasto[]): void {
    const activo = this._periodoActivo();
    if (!activo) return;

    const totalGastado = gastos.reduce((acc, g) => acc + g.monto, 0);

    const cerrado: PeriodoCerrado = {
      id: activo.id,
      tipo: activo.tipo,
      fechaInicio: activo.fechaInicio,
      fechaFin: activo.fechaFin,
      presupuesto: activo.presupuesto,
      billeteraId: activo.billeteraId,
      totalGastado,
      gastos: [...gastos],
      creadoEn: Date.now(),
    };

    this.db.save(KEY_HISTORIAL, cerrado);
    localStorage.removeItem(this.keyActivo());
    this._periodoActivo.set(null);
    this._historial.update((h) => [cerrado, ...h]);
  }

  cambiarTipo(tipo: TipoPeriodo): void {
    this._tipo.set(tipo);
    localStorage.setItem(KEY_TIPO, tipo);

    // Recalcular fechaFin del periodo activo si existe
    const activo = this._periodoActivo();
    if (activo) {
      const actualizado: PeriodoActivo = {
        ...activo,
        tipo,
        fechaFin: calcularFechaFin(activo.fechaInicio, tipo),
      };
      this.db.saveOne(this.keyActivo(), actualizado);
      this._periodoActivo.set(actualizado);
    }
  }

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

  // Historial filtrado por billetera activa
  historialBilleteraActiva = computed(() => {
    const billeteraId = this.billeteraService.billeteraActiva().id;
    return this._historial().filter((p) => p.billeteraId === billeteraId);
  });
}
