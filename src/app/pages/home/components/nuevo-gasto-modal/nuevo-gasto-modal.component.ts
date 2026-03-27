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

  categorias = CATEGORIAS_DEFAULT;

  descripcion = '';
  monto: number | null = null;
  categoriaId = 'otros';
  fecha = new Date().toISOString();

  cancelar() {
    this.modalCtrl.dismiss();
  }

  guardar() {
    if (!this.descripcion || !this.monto) return;

    const fechaObj = new Date(this.fecha);
    this.gastosService.agregar({
      descripcion: this.descripcion,
      monto: this.monto,
      categoriaId: this.categoriaId,
      fecha: fechaObj.toISOString().split('T')[0],
      hora: fechaObj.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
    });

    this.modalCtrl.dismiss();
  }
}