export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoriaId: string;
  billeteraId: string; 
  fecha: string;   // ISO string: '2026-03-27'
  hora: string;    // '10:00 AM'
  creadoEn: number; // timestamp para ordenar
}