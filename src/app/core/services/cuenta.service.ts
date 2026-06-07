import { Injectable, signal, computed } from '@angular/core';
import { Cuenta, CUENTA_DEFAULT } from '../models/cuenta.model';

const KEY_CUENTAS = 'cuentas';
const KEY_ACTIVA  = 'cuenta_activa_id';
const MAX_CUENTAS = 5;

@Injectable({ providedIn: 'root' })
export class CuentaService {

  private _cuentas      = signal<Cuenta[]>([]);
  private _cuentaActiva = signal<Cuenta>(CUENTA_DEFAULT);

  // Callback para notificar al PeriodoService (evita circular dependency)
  private onCambioCallback?: () => void;

  cuentas      = this._cuentas.asReadonly();
  cuentaActiva = this._cuentaActiva.asReadonly();
  puedeAgregar = computed(() => this._cuentas().length < MAX_CUENTAS);

  constructor() {
    this.cargar();
  }

  // PeriodoService se registra aquí
  registrarOnCambio(callback: () => void) {
    this.onCambioCallback = callback;
  }

  private cargar() {
    // Migrar datos legacy de "billeteras" a "cuentas"
    const rawLegacy = localStorage.getItem('billeteras');
    if (rawLegacy && !localStorage.getItem(KEY_CUENTAS)) {
      localStorage.setItem(KEY_CUENTAS, rawLegacy);
      const activaLegacy = localStorage.getItem('billetera_activa_id');
      if (activaLegacy) localStorage.setItem(KEY_ACTIVA, activaLegacy);
    }

    const raw = localStorage.getItem(KEY_CUENTAS);
    let cuentas: Cuenta[] = raw ? JSON.parse(raw) : [];

    if (cuentas.length === 0) {
      cuentas = [CUENTA_DEFAULT];
      this.guardarEnStorage(cuentas);
    }

    this._cuentas.set(cuentas);

    const activaId = localStorage.getItem(KEY_ACTIVA);
    const activa   = cuentas.find(c => c.id === activaId) ?? cuentas[0];
    this._cuentaActiva.set(activa);
  }

  private guardarEnStorage(cuentas: Cuenta[]) {
    localStorage.setItem(KEY_CUENTAS, JSON.stringify(cuentas));
  }

  seleccionar(cuenta: Cuenta) {
    this._cuentaActiva.set(cuenta);
    localStorage.setItem(KEY_ACTIVA, cuenta.id);
    this.onCambioCallback?.();
  }

  agregar(cuenta: Omit<Cuenta, 'id' | 'creadoEn'>): boolean {
    if (!this.puedeAgregar()) return false;
    const nueva: Cuenta = {
      ...cuenta,
      id:       crypto.randomUUID(),
      creadoEn: Date.now(),
    };
    const actualizadas = [...this._cuentas(), nueva];
    this._cuentas.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    return true;
  }

  editar(cuenta: Cuenta) {
    const actualizadas = this._cuentas().map(c =>
      c.id === cuenta.id ? cuenta : c
    );
    this._cuentas.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    if (this._cuentaActiva().id === cuenta.id) {
      this._cuentaActiva.set(cuenta);
    }
  }

  eliminar(id: string): boolean {
    if (this._cuentas().length <= 1) return false;
    if (id === CUENTA_DEFAULT.id) return false;
    const actualizadas = this._cuentas().filter(c => c.id !== id);
    this._cuentas.set(actualizadas);
    this.guardarEnStorage(actualizadas);
    if (this._cuentaActiva().id === id) {
      this.seleccionar(actualizadas[0]);
    }
    return true;
  }
}
