import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FontSizeService {

  // Rango: 0.85 a 1.3 (escala multiplicadora)
  private _escala = signal<number>(1);
  escala = this._escala.asReadonly();

  constructor() {
    const guardada = localStorage.getItem('font_escala');
    if (guardada) {
      this.aplicar(parseFloat(guardada));
    }
  }

  aplicar(escala: number) {
    this._escala.set(escala);
    document.documentElement.style.setProperty('--font-scale', escala.toString());
    localStorage.setItem('font_escala', escala.toString());
  }

  get escalaPorcentaje(): number {
    return Math.round(this._escala() * 100);
  }
}