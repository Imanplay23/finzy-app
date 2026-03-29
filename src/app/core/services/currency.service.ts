import { Injectable, signal, computed } from '@angular/core';

export interface Divisa {
  codigo: string;
  nombre: string;
  simbolo: string;
  bandera: string;
}

export const DIVISAS: Divisa[] = [
  { codigo: 'DOP', nombre: 'Peso Dominicano', simbolo: 'RD$', bandera: '🇩🇴' },
  { codigo: 'USD', nombre: 'Dólar Americano', simbolo: '$',   bandera: '🇺🇸' },
  { codigo: 'EUR', nombre: 'Euro',            simbolo: '€',   bandera: '🇪🇺' },
  { codigo: 'GBP', nombre: 'Libra Esterlina', simbolo: '£',   bandera: '🇬🇧' },
  { codigo: 'MXN', nombre: 'Peso Mexicano',   simbolo: 'MX$', bandera: '🇲🇽' },
  { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: 'COP', bandera: '🇨🇴' },
];

const API_KEY = '918c1d07ff0a1216d3b7827f';
const BASE_CURRENCY = 'DOP'; // moneda base de la app

@Injectable({ providedIn: 'root' })
export class CurrencyService {

  private _divisaActual = signal<Divisa>(DIVISAS[0]);
  private _tasas = signal<Record<string, number>>({});
  private _cargando = signal<boolean>(false);

  divisaActual = this._divisaActual.asReadonly();
  cargando     = this._cargando.asReadonly();

  constructor() {
    const guardada = localStorage.getItem('divisa_actual');
    if (guardada) {
      const divisa = DIVISAS.find(d => d.codigo === guardada);
      if (divisa) this._divisaActual.set(divisa);
    }
    this.cargarTasas();
  }

  async cargarTasas() {
    try {
      this._cargando.set(true);
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`
      );
      const data = await res.json();
      if (data.result === 'success') {
        this._tasas.set(data.conversion_rates);
        localStorage.setItem('tasas_cache', JSON.stringify({
          tasas: data.conversion_rates,
          fecha: Date.now()
        }));
      }
    } catch {
      // Fallback al cache si hay error de red
      const cache = localStorage.getItem('tasas_cache');
      if (cache) {
        const { tasas } = JSON.parse(cache);
        this._tasas.set(tasas);
      }
    } finally {
      this._cargando.set(false);
    }
  }

  cambiarDivisa(divisa: Divisa) {
    this._divisaActual.set(divisa);
    localStorage.setItem('divisa_actual', divisa.codigo);
  }

  convertir(monto: number): number {
    const tasas = this._tasas();
    const codigo = this._divisaActual().codigo;
    if (!tasas || !tasas[codigo]) return monto;
    return monto * tasas[codigo];
  }

  formatear(monto: number): string {
    const convertido = this.convertir(monto);
    const divisa = this._divisaActual();
    return `${divisa.simbolo}${convertido.toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}