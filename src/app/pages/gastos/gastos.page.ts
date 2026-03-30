import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonNote, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
  IonSelect, IonSelectOption, IonButtons, IonButton,
  AlertController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, createOutline, funnelOutline
} from 'ionicons/icons';
import { GastosService } from '../../core/services/gastos.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CATEGORIAS_DEFAULT } from '../../core/models/categoria.model';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { NuevoGastoModalComponent } from '../home/components/nuevo-gasto-modal/nuevo-gasto-modal.component';
import { Gasto } from '../../core/models/gastos.model';
import { ToastController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [
    FormsModule, AppCurrencyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonList, IonItem, IonLabel, IonNote, IonItemSliding,
    IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
    IonSelect, IonSelectOption, IonButtons, IonButton, DatePipe
  ],
  templateUrl: './gastos.page.html',
  styleUrls: ['./gastos.page.scss']
})
export class GastosPage {
  private gastosService      = inject(GastosService);
  private presupuestoService = inject(PresupuestoService);
  private alertCtrl          = inject(AlertController);
  private modalCtrl          = inject(ModalController);
  private toastCtrl          = inject(ToastController);

  categorias   = CATEGORIAS_DEFAULT;
  busqueda     = signal('');
  filtroCategoria = signal('todas');
  filtroOrden  = signal('fecha');

  gastosFiltrados = computed(() => {
    let lista = this.gastosService.gastos();

    // Filtro búsqueda
    const q = this.busqueda().toLowerCase().trim();
    if (q) {
      lista = lista.filter(g =>
        g.descripcion.toLowerCase().includes(q) ||
        this.getCategoriaNombre(g.categoriaId).toLowerCase().includes(q)
      );
    }

    // Filtro categoría
    const cat = this.filtroCategoria();
    if (cat !== 'todas') {
      lista = lista.filter(g => g.categoriaId === cat);
    }

    // Orden
    const orden = this.filtroOrden();
    if (orden === 'monto-desc') lista = [...lista].sort((a, b) => b.monto - a.monto);
    if (orden === 'monto-asc')  lista = [...lista].sort((a, b) => a.monto - b.monto);
    if (orden === 'fecha')      lista = [...lista].sort((a, b) => b.creadoEn - a.creadoEn);

    return lista;
  });

  constructor() {
    addIcons({ addOutline, trashOutline, createOutline, funnelOutline });
  }

  getCategoriaColor(id: string)  { return this.categorias.find(c => c.id === id)?.color  ?? '#999'; }
  getCategoriaNombre(id: string) { return this.categorias.find(c => c.id === id)?.nombre ?? 'Otros'; }

  onBusqueda(event: any)      { this.busqueda.set(event.detail.value ?? ''); }
  onCategoria(event: any)     { this.filtroCategoria.set(event.detail.value); }
  onOrden(event: any)         { this.filtroOrden.set(event.detail.value); }

  async abrirNuevoGasto() {
    if (!this.presupuestoService.presupuesto()) {
      const toast = await this.toastCtrl.create({
        message: '⚠️ Debes establecer un presupuesto primero',
        duration: 3000, color: 'warning', position: 'top'
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

  async eliminarGasto(id: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar gasto?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.gastosService.eliminar(id) }
      ]
    });
    await alert.present();
  }
}