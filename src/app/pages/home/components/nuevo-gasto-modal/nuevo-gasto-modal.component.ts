import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonDatetime, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { GastosService } from '../../../../core/services/gastos.service';
import { CATEGORIAS_DEFAULT } from '../../../../core/models/categoria.model';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-nuevo-gasto-modal',
  standalone: true,
  imports: [
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonDatetime, IonGrid, IonRow, IonCol
  ],
  templateUrl: './nuevo-gasto-modal.component.html',
})
export class NuevoGastoModalComponent {
  private modalCtrl = inject(ModalController);
  private gastosService = inject(GastosService);
  private toastCtrl = inject(ToastController);

  categorias = CATEGORIAS_DEFAULT;

  descripcion = '';
  monto: number | null = null;
  categoriaId = 'otros';
  fecha = new Date().toISOString();

  cancelar() {
    this.modalCtrl.dismiss();
  }

async guardar() {
  if (!this.descripcion.trim()) {
    return this.mostrarError('Ingresa una descripción');
  }
  if (!this.monto || this.monto <= 0) {
    return this.mostrarError('Ingresa un monto válido');
  }

  const fechaObj = new Date(this.fecha);
  this.gastosService.agregar({
    descripcion: this.descripcion.trim(),
    monto: this.monto,
    categoriaId: this.categoriaId,
    fecha: fechaObj.toISOString().split('T')[0],
    hora: fechaObj.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
  });

  this.modalCtrl.dismiss();
}

private async mostrarError(msg: string) {
  const toast = await this.toastCtrl.create({
    message: msg,
    duration: 2000,
    color: 'danger',
    position: 'top',
  });
  await toast.present();
}

}