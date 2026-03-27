import { Component, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController, IonButton, IonCard } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonNote,
  IonFab, IonFabButton, IonIcon, IonItemSliding,
  IonItemOptions, IonItemOption, IonBadge, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, walletOutline, createOutline } from 'ionicons/icons';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CATEGORIAS_DEFAULT } from '../../core/models/categoria.model';
import { NuevoGastoModalComponent } from './components/nuevo-gasto-modal/nuevo-gasto-modal.component';
import { AlertController } from '@ionic/angular/standalone';
import { computed } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Gasto } from 'src/app/core/models/gastos.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonButton,
    NgFor, NgIf, CurrencyPipe, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonNote,
    IonFab, IonFabButton, IonIcon, IonItemSliding,
    IonItemOptions, IonItemOption, IonBadge, IonText, IonCard],
  templateUrl: './home.page.html',
})
export class HomePage {
  gastosService = inject(GastosService);
  presupuestoService = inject(PresupuestoService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  categorias = CATEGORIAS_DEFAULT;

  constructor() {
    addIcons({walletOutline,addOutline,createOutline,trashOutline});
  }

  getCategoriaColor(id: string): string {
    return this.categorias.find(c => c.id === id)?.color ?? '#999';
  }

  getCategoriaIcono(id: string): string {
    return this.categorias.find(c => c.id === id)?.icono ?? 'ellipsis-horizontal';
  }

  getCategoriaNombre(id: string): string {
    return this.categorias.find(c => c.id === id)?.nombre ?? 'Otros';
  }

saldoDisponible = computed(() => {
  const p = this.presupuestoService.presupuesto();
  if (!p) return null;
  return p.monto - this.gastosService.totalMes();
});

async abrirNuevoGasto() {
  if (!this.presupuestoService.presupuesto()) {
    const toast = await this.toastCtrl.create({
      message: '⚠️ Debes establecer un presupuesto primero',
      duration: 3000,
      color: 'warning',
      position: 'top',
      buttons: [
        {
          text: 'Ir a Presupuesto',
          handler: () => {
            this.router.navigate(['/presupuesto']);
          }
        }
      ]
    });
    await toast.present();
    return;
  }

  const modal = await this.modalCtrl.create({
    component: NuevoGastoModalComponent,
    breakpoints: [0, 0.75, 1],
    initialBreakpoint: 0.75,
  });
  await modal.present();
  await modal.onDidDismiss();
  this.verificarPresupuesto();
}

private async verificarPresupuesto() {
  const p = this.presupuestoService.presupuesto();
  if (!p) return;

  const porcentaje = (this.gastosService.totalMes() / p.monto) * 100;
  let mensaje = '';
  let color = '';

  if (porcentaje >= 100) {
    mensaje = '⚠️ ¡Superaste tu presupuesto mensual!';
    color = 'danger';
  } else if (porcentaje >= 80) {
    mensaje = `⚠️ Llevas el ${porcentaje.toFixed(0)}% de tu presupuesto`;
    color = 'warning';
  }

  if (mensaje) {
    const toast = await this.toastCtrl.create({
      message: mensaje, duration: 3000, color, position: 'top'
    });
    await toast.present();
  }
}

async eliminarGasto(id: string) {
  const alert = await this.alertCtrl.create({
    header: '¿Eliminar gasto?',
    message: 'Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => this.gastosService.eliminar(id)
      }
    ]
  });
  await alert.present();
}

async editarGasto(gasto: Gasto) {
  const modal = await this.modalCtrl.create({
    component: NuevoGastoModalComponent,
    componentProps: { gasto },
    breakpoints: [0, 0.75, 1],
    initialBreakpoint: 0.75,
  });
  await modal.present();
}

}

