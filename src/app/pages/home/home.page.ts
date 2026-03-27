import { Component, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonNote,
  IonFab, IonFabButton, IonIcon, IonItemSliding,
  IonItemOptions, IonItemOption, IonBadge, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, walletOutline } from 'ionicons/icons';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CATEGORIAS_DEFAULT } from '../../core/models/categoria.model';
import { NuevoGastoModalComponent } from './components/nuevo-gasto-modal/nuevo-gasto-modal.component';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgFor, NgIf, CurrencyPipe, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonNote,
    IonFab, IonFabButton, IonIcon, IonItemSliding,
    IonItemOptions, IonItemOption, IonBadge, IonText
  ],
  templateUrl: './home.page.html',
})
export class HomePage {
  gastosService = inject(GastosService);
  presupuestoService = inject(PresupuestoService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  categorias = CATEGORIAS_DEFAULT;

  constructor() {
    addIcons({walletOutline,trashOutline,addOutline});
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

  async abrirNuevoGasto() {
    const modal = await this.modalCtrl.create({
      component: NuevoGastoModalComponent,
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });
    await modal.present();
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

}

