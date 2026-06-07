import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonLabel, IonInput, IonIcon, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline, cardOutline, cashOutline, phonePortraitOutline,
  briefcaseOutline, homeOutline, carOutline, checkmarkOutline,
  closeOutline
} from 'ionicons/icons';
import { Cuenta, ICONOS_CUENTA, COLORES_CUENTA } from '../../../../core/models/cuenta.model';

@Component({
  selector: 'app-cuenta-modal',
  standalone: true,
  imports: [
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonLabel, IonInput, IonIcon, IonFooter
  ],
  templateUrl: './cuenta-modal.component.html',
  styleUrls:   ['./cuenta-modal.component.scss']
})
export class CuentaModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  @Input() cuenta: Cuenta | null = null;

  nombre   = '';
  iconoSel = 'wallet-outline';
  colorSel = '#4F6EF7';

  iconos  = ICONOS_CUENTA;
  colores = COLORES_CUENTA;

  get esEdicion(): boolean { return !!this.cuenta; }

  constructor() {
    addIcons({
      walletOutline, cardOutline, cashOutline, phonePortraitOutline,
      briefcaseOutline, homeOutline, carOutline, checkmarkOutline,
      closeOutline
    });
  }

  ngOnInit() {
    if (this.cuenta) {
      this.nombre   = this.cuenta.nombre;
      this.iconoSel = this.cuenta.icono;
      this.colorSel = this.cuenta.color;
    }
  }

  cancelar() { this.modalCtrl.dismiss(); }

  guardar() {
    if (!this.nombre.trim()) return;
    this.modalCtrl.dismiss({
      nombre: this.nombre.trim(),
      icono:  this.iconoSel,
      color:  this.colorSel,
    });
  }
}
