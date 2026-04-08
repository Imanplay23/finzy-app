import { Injectable, signal, computed, inject } from '@angular/core';
import { Billetera, BILLETERA_DEFAULT } from '../models/billetera.model';

const KEY_BILLETERAS = 'billeteras';
const KEY_ACTIVA     = 'billetera_activa_id';
const MAX_BILLETERAS = 5;

@Injectable({ providedIn: 'root' })
export class BilleteraService {

  private _billeteras      = signal<Billetera[]>([]);
  private _billeteraActiva = signal<Billetera>(BILLETERA_DEFAULT);

  // Callback para notificar al PeriodoService (evita circular dependency)
  private onCambioCallback?: () => void;

  billeteras       = this._billeteras.asReadonly();
  billeteraActiva  = this._billeteraActiva.asReadonly();
  puedeAgregar     = computed(() => this._billeteras().length < MAX_BILLETERAS);

  constructor() {
    this.cargar();
  }

  // PeriodoService se registra aquí
  registrarOnCambio(callback: () => void) {
    this.onCambioCallback = callback;
  }

  private cargar() {
    const raw = localStorage.getItem(KEY_BILLETERAS);
    let billeteras: Billetera[] = raw ? JSON.parse(raw) : [];

    if (billeteras.length === 0) {
      billeteras = [BILLETERA_DEFAULT];
      this.guardarEnStorage(billeteras);
    }

    this._billeteras.set(billeteras);

    const activaId = localStorage.getItem(KEY_ACTIVA);
    const activa   = billeteras.find(b => b.id === activaId) ?? billeteras[0];
    this._billeteraActiva.set(activa);
  }

  private guardarEnStorage(billeteras: Billetera[]) {
    localStorage.setItem(KEY_BILLETERAS, JSON.stringify(billeteras));
  }

  seleccionar(billetera: Billetera) {
    this._billeteraActiva.set(billetera);
    localStorage.setItem(KEY_ACTIVA, billetera.id);
    // Notificar al PeriodoService para que recargue
    this.onCambioCallback?.();
  }

  agregar(billetera: Omit<Billetera, 'id' | 'creadoEn'>): boolean {
    if (!this.puedeAgregar()) return false;
    const nueva: Billetera = {
      ...billetera,
      id:       crypto.randomUUID(),
      creadoEn: Date.now(),
    };
    const actualizadas = [...this._billeteras(), nueva];
    this._billeteras.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    return true;
  }

  editar(billetera: Billetera) {
    const actualizadas = this._billeteras().map(b =>
      b.id === billetera.id ? billetera : b
    );
    this._billeteras.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    if (this._billeteraActiva().id === billetera.id) {
      this._billeteraActiva.set(billetera);
    }
  }

  eliminar(id: string): boolean {
    if (this._billeteras().length <= 1) return false;
    if (id === BILLETERA_DEFAULT.id) return false;
    const actualizadas = this._billeteras().filter(b => b.id !== id);
    this._billeteras.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    if (this._billeteraActiva().id === id) {
      this.seleccionar(actualizadas[0]);
    }
    return true;
  }
}