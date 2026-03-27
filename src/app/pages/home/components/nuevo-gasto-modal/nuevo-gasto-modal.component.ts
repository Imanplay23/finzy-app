import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ModalController, ToastController, IonModal, IonDatetime } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonIcon, IonFooter, IonDatetimeButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { GastosService } from '../../../../core/services/gastos.service';
import { CATEGORIAS_DEFAULT } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-nuevo-gasto-modal',
  standalone: true,
  imports: [IonDatetime, IonModal, 
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonIcon, IonFooter, IonDatetimeButton
  ],
  templateUrl: './nuevo-gasto-modal.component.html',
  styleUrls: ['./nuevo-gasto-modal.component.scss']
})
export class NuevoGastoModalComponent {
  private modalCtrl  = inject(ModalController);
  private toastCtrl  = inject(ToastController);
  private gastosService = inject(GastosService);

  categorias = CATEGORIAS_DEFAULT;

  descripcion  = '';
  monto: number | null = null;
  categoriaId  = '';

  // Fecha y hora separadas
  fechaInput: string = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  horaInput:  string = new Date().toTimeString().slice(0, 5);  // HH:mm

  constructor() {
    addIcons({ saveOutline, closeOutline });
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  async guardar() {
    if (!this.descripcion.trim()) {
      return this.mostrarError('Ingresa una descripción');
    }
    if (!this.monto || this.monto <= 0) {
      return this.mostrarError('Ingresa un monto válido mayor a 0');
    }
    if (!this.categoriaId) {
      return this.mostrarError('Selecciona una categoría');
    }
    if (!this.fechaInput) {
      return this.mostrarError('Selecciona una fecha');
    }
    if (!this.horaInput) {
      return this.mostrarError('Ingresa una hora');
    }

    // Formatear hora a 12h
    const [hh, mm] = this.horaInput.split(':');
    const h = parseInt(hh);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const horaFormateada = `${h12}:${mm} ${ampm}`;

    // Formatear fecha a dd/MM/yyyy
    const [yyyy, mo, dd] = this.fechaInput.split('-');
    const fechaFormateada = `${dd}/${mo}/${yyyy}`;

    this.gastosService.agregar({
      descripcion: this.descripcion.trim(),
      monto: this.monto,
      categoriaId: this.categoriaId,
      fecha: this.fechaInput,
      hora: horaFormateada,
    });

    this.modalCtrl.dismiss();
  }

  private async mostrarError(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}