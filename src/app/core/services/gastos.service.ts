import { Injectable, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { Gasto } from '../models/gastos.model';

const TABLA = 'gastos';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private _gastos = signal<Gasto[]>([]);
  gastos = this._gastos.asReadonly();

  gastosMesActual = computed(() => {
    const ahora = new Date();
    return this._gastos().filter((g) => {
      const fecha = new Date(g.fecha);
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    });
  });

  totalMes = computed(() =>
    this.gastosMesActual().reduce((acc, g) => acc + g.monto, 0)
  );

  gastosPorCategoria = computed(() => {
    const mapa: Record<string, number> = {};
    for (const g of this.gastosMesActual()) {
      mapa[g.categoriaId] = (mapa[g.categoriaId] ?? 0) + g.monto;
    }
    return mapa;
  });

  constructor(private db: DatabaseService) {
    this.cargar();
  }

  private cargar() {
    const datos = this.db.getAll<Gasto>(TABLA);
    this._gastos.set(datos.sort((a, b) => b.creadoEn - a.creadoEn));
  }

  agregar(gasto: Omit<Gasto, 'id' | 'creadoEn'>): void {
    const nuevo: Gasto = {
      ...gasto,
      id: crypto.randomUUID(),
      creadoEn: Date.now(),
    };
    this.db.save(TABLA, nuevo);
    this.cargar();
  }

  eliminar(id: string): void {
    this.db.delete(TABLA, id);
    this.cargar();
  }

  editar(gasto: Gasto): void {
    console.log('editando:', gasto.id); // ← debug temporal
    this.db.save(TABLA, gasto);
    this.cargar();
  }
}
