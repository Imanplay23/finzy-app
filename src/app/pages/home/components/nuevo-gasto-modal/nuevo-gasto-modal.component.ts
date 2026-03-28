import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import {
  ModalController,
  ToastController,
  IonCard,
} from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
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
    IonCard,
    FormsModule,
    NgFor,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon,
  ],
  templateUrl: './nuevo-gasto-modal.component.html',
  styleUrls: ['./nuevo-gasto-modal.component.scss'],
})
export class NuevoGastoModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private gastosService = inject(GastosService);

  // Si se pasa un gasto, estamos editando
  @Input() gasto: Gasto | null = null;

  categorias = CATEGORIAS_DEFAULT;
  hoy = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

  fechaInput: string = new Date().toISOString().split('T')[0];
  horaInput: string = `${new Date()
    .getHours()
    .toString()
    .padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;

  descripcion = '';
  monto: number | null = null;
  categoriaId = '';

  get esEdicion(): boolean {
    return !!this.gasto;
  }

  constructor() {
    addIcons({ saveOutline, closeOutline });
  }

  ngOnInit() {
    if (this.gasto) {
      this.descripcion = this.gasto.descripcion;
      this.monto = this.gasto.monto;
      this.categoriaId = this.gasto.categoriaId;
      // Reconstruir ISO desde fecha guardada
      this.fechaInput = new Date(this.gasto.fecha).toISOString();
      this.horaInput = new Date().toISOString(); // hora actual como fallback
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  async guardar() {
    if (!this.descripcion.trim())
      return this.mostrarError('Ingresa una descripción');
    if (!this.monto || this.monto <= 0)
      return this.mostrarError('Ingresa un monto válido mayor a 0');
    if (!this.categoriaId) return this.mostrarError('Selecciona una categoría');

    const [hh, mm] = this.horaInput.split(':');
    const h = parseInt(hh);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const horaStr = `${h12}:${mm} ${ampm}`;

    this.gastosService.agregar({
      descripcion: this.descripcion.trim(),
      monto: this.monto,
      categoriaId: this.categoriaId,
      fecha: this.fechaInput,
      hora: horaStr,
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
