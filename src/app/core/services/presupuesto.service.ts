import { Injectable, inject } from '@angular/core';
import { PeriodoService } from './periodo.service';
import { DatabaseService } from './database.service';

const KEY_ACTIVO = 'periodo_activo';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  private periodoService = inject(PeriodoService);
  private db = inject(DatabaseService);

  presupuesto = () => {
    const activo = this.periodoService.periodoActivo();
    if (!activo) return null;
    return {
      monto: activo.presupuesto,
      mes: new Date(activo.fechaInicio).getMonth() + 1,
      anio: new Date(activo.fechaInicio).getFullYear(),
    };
  };

  guardar(monto: number): void {
    const activo = this.periodoService.periodoActivo();
    if (activo) {
      const actualizado = { ...activo, presupuesto: monto };
      // Key dinámica por billetera
      const key = `periodo_activo_${actualizado.billeteraId}`;
      this.db.saveOne(key, actualizado);
      this.periodoService.actualizarPeriodoActivo(actualizado);
    } else {
      this.periodoService.iniciarPeriodo(monto);
    }
  }

  sumar(monto: number): void {
  const activo = this.periodoService.periodoActivo();
  if (!activo) return;

  const actualizado = { ...activo, presupuesto: activo.presupuesto + monto };
  const key = `periodo_activo_${actualizado.billeteraId}`;
  this.db.saveOne(key, actualizado);
  this.periodoService.actualizarPeriodoActivo(actualizado);
}
}
