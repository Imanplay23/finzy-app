export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export const CATEGORIAS_DEFAULT: Categoria[] = [
  { id: 'alimentacion', nombre: 'Alimentación', icono: 'restaurant',    color: '#FF6384' },
  { id: 'transporte',   nombre: 'Transporte',   icono: 'car',           color: '#36A2EB' },
  { id: 'vivienda',     nombre: 'Vivienda',     icono: 'home',          color: '#CC65FE' },
  { id: 'ocio',         nombre: 'Ocio',         icono: 'game-controller',color: '#FF9F40' },
  { id: 'salud',        nombre: 'Salud',        icono: 'medkit',        color: '#4BC0C0' },
  { id: 'educacion',    nombre: 'Educación',    icono: 'school',        color: '#FFCE56' },
  { id: 'otros',        nombre: 'Otros',        icono: 'ellipsis-horizontal', color: '#9966FF' },
];