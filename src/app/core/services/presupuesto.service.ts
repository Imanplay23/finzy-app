import { Injectable, signal, inject } from '@angular/core';
import { PeriodoService } from './periodo.service';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

  private periodoService = inject(PeriodoService);

  // Delega al periodo activo
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
      // Actualizar presupuesto del periodo activo
      const actualizado = { ...activo, presupuesto: monto };
      localStorage.setItem('periodo_activo', JSON.stringify(actualizado));
      // Recargar
      this.periodoService['cargar']?.();
      // Forzar recarga
      window.location.reload();
    } else {
      // Iniciar primer periodo
      this.periodoService.iniciarPeriodo(monto);
    }
  }
}