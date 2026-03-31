import { Gasto } from './gastos.model';

export type TipoPeriodo = 'mensual' | 'semanal';

export interface PeriodoActivo {
  id:           string;
  tipo:         TipoPeriodo;
  fechaInicio:  string; // ISO date: yyyy-MM-dd
  fechaFin:     string;
  presupuesto:  number;
}

export interface PeriodoCerrado {
  id:           string;
  tipo:         TipoPeriodo;
  fechaInicio:  string;
  fechaFin:     string;
  presupuesto:  number;
  totalGastado: number;
  gastos:       Gasto[];
  creadoEn:     number;
}

// Helpers para calcular fechas
export function calcularFechaFin(inicio: string, tipo: TipoPeriodo): string {
  const fecha = new Date(inicio);
  if (tipo === 'mensual') {
    fecha.setMonth(fecha.getMonth() + 1);
    fecha.setDate(fecha.getDate() - 1);
  } else {
    fecha.setDate(fecha.getDate() + 6);
  }
  return fecha.toISOString().split('T')[0];
}

export function calcularProximoInicio(fin: string): string {
  const fecha = new Date(fin);
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().split('T')[0];
}

export function labelPeriodo(tipo: TipoPeriodo): string {
  return tipo === 'mensual' ? 'mes' : 'semana';
}

export function labelPeriodoCapital(tipo: TipoPeriodo): string {
  return tipo === 'mensual' ? 'Mes' : 'Semana';
}