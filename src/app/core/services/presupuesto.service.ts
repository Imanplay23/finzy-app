import { Injectable, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { Presupuesto } from '../models/presupuesto.model';
import { GastosService } from './gastos.service';

const KEY = 'presupuesto_actual';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

  private _presupuesto = signal<Presupuesto | null>(null);

  presupuesto = this._presupuesto.asReadonly();

  saldoDisponible = computed(() => {
    const p = this._presupuesto();
    if (!p) return 0;
    return p.monto - this.gastosService.totalMes();
  });

  constructor(
    private db: DatabaseService,
    private gastosService: GastosService
  ) {
    this.cargar();
  }

  private cargar() {
    const datos = this.db.getOne<Presupuesto>(KEY, KEY);
    this._presupuesto.set(datos);
  }

  guardar(monto: number): void {
    const ahora = new Date();
    const presupuesto: Presupuesto = {
      monto,
      mes: ahora.getMonth() + 1,
      anio: ahora.getFullYear(),
    };
    this.db.saveOne(KEY, presupuesto);
    this._presupuesto.set(presupuesto);
  }
}