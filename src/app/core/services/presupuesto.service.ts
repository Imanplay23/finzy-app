import { Injectable, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { Presupuesto } from '../models/presupuesto.model';

const KEY = 'presupuesto_actual';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

  private _presupuesto = signal<Presupuesto | null>(null);
  presupuesto = this._presupuesto.asReadonly();

  constructor(private db: DatabaseService) {
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