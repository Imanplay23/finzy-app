import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonIcon, IonFooter, IonDatetimeButton,
  IonModal, IonDatetime
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { GastosService } from '../../../../core/services/gastos.service';
import { CATEGORIAS_DEFAULT } from '../../../../core/models/categoria.model';
import { Gasto } from '../../../../core/models/gastos.model';

@Component({
  selector: 'app-nuevo-gasto-modal',
  standalone: true,
  imports: [
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonIcon, IonFooter, IonDatetimeButton,
    IonModal, IonDatetime
  ],
  templateUrl: './nuevo-gasto-modal.component.html',
  styleUrls: ['./nuevo-gasto-modal.component.scss']
})
export class NuevoGastoModalComponent implements OnInit {
  private modalCtrl     = inject(ModalController);
  private toastCtrl     = inject(ToastController);
  private gastosService = inject(GastosService);

  // Si se pasa un gasto, estamos editando
  @Input() gasto: Gasto | null = null;

  categorias = CATEGORIAS_DEFAULT;
  hoy = new Date().toISOString();

  descripcion = '';
  monto: number | null = null;
  categoriaId = '';
  fechaInput  = new Date().toISOString();
  horaInput   = new Date().toISOString();

  get esEdicion(): boolean {
    return !!this.gasto;
  }

  constructor() {
    addIcons({ saveOutline, closeOutline });
  }

  ngOnInit() {
    if (this.gasto) {
      this.descripcion = this.gasto.descripcion;
      this.monto       = this.gasto.monto;
      this.categoriaId = this.gasto.categoriaId;
      // Reconstruir ISO desde fecha guardada
      this.fechaInput  = new Date(this.gasto.fecha).toISOString();
      this.horaInput   = new Date().toISOString(); // hora actual como fallback
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  async guardar() {
    if (!this.descripcion.trim()) return this.mostrarError('Ingresa una descripción');
    if (!this.monto || this.monto <= 0) return this.mostrarError('Ingresa un monto válido mayor a 0');
    if (!this.categoriaId) return this.mostrarError('Selecciona una categoría');

    const fecha = new Date(this.fechaInput);
    const hora  = new Date(this.horaInput);

    const fechaStr = fecha.toISOString().split('T')[0];
    const h    = hora.getHours();
    const m    = hora.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    const horaStr = `${h12}:${m} ${ampm}`;

    if (this.esEdicion && this.gasto) {
      this.gastosService.editar({
        ...this.gasto,
        descripcion: this.descripcion.trim(),
        monto:       this.monto,
        categoriaId: this.categoriaId,
        fecha:       fechaStr,
        hora:        horaStr,
      });
    } else {
      this.gastosService.agregar({
        descripcion: this.descripcion.trim(),
        monto:       this.monto,
        categoriaId: this.categoriaId,
        fecha:       fechaStr,
        hora:        horaStr,
      });
    }

    this.modalCtrl.dismiss();
  }

  private async mostrarError(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2500, color: 'danger', position: 'top',
    });
    await toast.present();
  }
}