import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { GastosService } from './gastos.service';
import { PresupuestoService } from './presupuesto.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private gastosService = inject(GastosService);
  private presupuestoService = inject(PresupuestoService);
  private yaNotificado80 = false;
  private yaNotificado100 = false;

  async init() {
    // Pedir permisos
    const permisos = await LocalNotifications.requestPermissions();
    if (permisos.display !== 'granted') return;

    // Cancelar todas las anteriores para reprogramar
    await this.cancelarTodas();

    // Programar notificaciones
    await this.programarRecordatorioDiario();
    await this.programarResumenSemanal();
  }

  // ── Verifica presupuesto al agregar gasto ─────────────────
  async verificarPresupuesto() {
    const p = this.presupuestoService.presupuesto();
    if (!p) return;

    const total = this.gastosService.totalPeriodo();
    const porcentaje = (total / p.monto) * 100;

    if (porcentaje >= 100 && !this.yaNotificado100) {
      this.yaNotificado100 = true;
    }
    if (porcentaje >= 100) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: '🚨 Presupuesto agotado',
            body: `Has gastado el 100% de tu presupuesto mensual`,
            sound: 'default',
            extra: { tipo: 'presupuesto' },
          },
        ],
      });
    } else if (porcentaje >= 80) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 2,
            title: '⚠️ Casi sin presupuesto',
            body: `Llevas el ${porcentaje.toFixed(
              0
            )}% de tu presupuesto mensual`,
            sound: 'default',
            extra: { tipo: 'presupuesto' },
          },
        ],
      });
    }
  }

  // ── Recordatorio diario ───────────────────────────────────
  async programarRecordatorioDiario() {
    const ahora = new Date();
    const trigger = new Date();
    trigger.setHours(20, 0, 0, 0); // 8:00 PM

    // Si ya pasó la hora de hoy, programar para mañana
    if (trigger <= ahora) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 10,
          title: '📝 ¿Registraste tus gastos hoy?',
          body: 'Mantén tu presupuesto al día registrando tus gastos diarios.',
          schedule: {
            at: trigger,
            repeats: true,
            every: 'day',
          },
          sound: 'default',
          extra: { tipo: 'recordatorio' },
        },
      ],
    });
  }

  // ── Resumen semanal ───────────────────────────────────────
  async programarResumenSemanal() {
    const ahora = new Date();
    const trigger = new Date();

    // Próximo domingo a las 10:00 AM
    const diasParaDomingo = (7 - ahora.getDay()) % 7 || 7;
    trigger.setDate(ahora.getDate() + diasParaDomingo);
    trigger.setHours(10, 0, 0, 0);

    const total = this.gastosService.totalMes();
    const p = this.presupuestoService.presupuesto();
    const disponible = p ? p.monto - total : 0;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 20,
          title: '📊 Resumen semanal — Finzy',
          body: p
            ? `Esta semana gastaste ${total.toFixed(
                2
              )}. Te quedan ${disponible.toFixed(2)} disponibles.`
            : 'Revisa tus gastos de esta semana en Finzy.',
          schedule: {
            at: trigger,
            repeats: true,
            every: 'week',
          },
          sound: 'default',
          extra: { tipo: 'resumen' },
        },
      ],
    });
  }

  // ── Cancelar todas ────────────────────────────────────────
  async cancelarTodas() {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications,
      });
    }
  }
}
