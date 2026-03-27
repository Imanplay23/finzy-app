import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class DatabaseService {

  private isNative = Capacitor.isNativePlatform();

  // ── localStorage fallback (web) ──────────────────────────────
  private lsGet<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  private lsSet(key: string, data: any[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── API pública ──────────────────────────────────────────────
  getAll<T>(tabla: string): T[] {
    // Por ahora localStorage para ambas plataformas
    // Aquí luego conectarás SQLite para nativo
    return this.lsGet<T>(tabla);
  }

  save<T extends { id: string }>(tabla: string, item: T): void {
    const datos = this.lsGet<T>(tabla);
    const idx = datos.findIndex((d: T) => d.id === item.id);
    if (idx >= 0) {
      datos[idx] = item;
    } else {
      datos.push(item);
    }
    this.lsSet(tabla, datos);
  }

  delete(tabla: string, id: string): void {
    const datos = this.lsGet<any>(tabla);
    this.lsSet(tabla, datos.filter((d: any) => d.id !== id));
  }

  getOne<T>(tabla: string, key: string): T | null {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  saveOne(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}