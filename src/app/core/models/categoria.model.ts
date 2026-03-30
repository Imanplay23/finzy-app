export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export const CATEGORIAS_DEFAULT: Categoria[] = [
  { id: 'alimentacion', nombre: 'Alimentación',  icono: 'fast-food-outline',          color: '#FF6384' },
  { id: 'transporte',   nombre: 'Transporte',    icono: 'airplane-outline',                 color: '#36A2EB' },
  { id: 'vivienda',     nombre: 'Vivienda',      icono: 'home-outline',                color: '#CC65FE' },
  { id: 'ocio',         nombre: 'Ocio',          icono: 'game-controller-outline',     color: '#FF9F40' },
  { id: 'salud',        nombre: 'Salud',         icono: 'medkit-outline',              color: '#4BC0C0' },
  { id: 'educacion',    nombre: 'Educación',     icono: 'school-outline',              color: '#FFCE56' },
  { id: 'otros',        nombre: 'Otros',         icono: 'ellipsis-horizontal-outline', color: '#9966FF' },
];