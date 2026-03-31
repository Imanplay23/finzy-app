import { Injectable, inject } from '@angular/core';
import { PeriodoService } from './periodo.service';
import { DatabaseService } from './database.service';

const KEY_ACTIVO = 'periodo_activo';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

  private periodoService = inject(PeriodoService);
  private db             = inject(DatabaseService);

  presupuesto = () => {
    const activo = this.periodoService.periodoActivo();
    if (!activo) return null;
    return {
      monto: activo.presupuesto,
      mes:   new Date(activo.fechaInicio).getMonth() + 1,
      anio:  new Date(activo.fechaInicio).getFullYear(),
    };
  };

  guardar(monto: number): void {
    const activo = this.periodoService.periodoActivo();

    if (activo) {
      // Actualizar presupuesto del periodo activo reactivamente
      const actualizado = { ...activo, presupuesto: monto };
      this.db.saveOne(KEY_ACTIVO, actualizado);
      // Forzar actualización del signal sin reload
      this.periodoService.actualizarPeriodoActivo(actualizado);
    } else {
      // Iniciar primer periodo
      this.periodoService.iniciarPeriodo(monto);
    }
  }
}