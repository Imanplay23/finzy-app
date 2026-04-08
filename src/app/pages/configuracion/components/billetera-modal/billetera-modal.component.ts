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
import { Billetera, ICONOS_BILLETERA, COLORES_BILLETERA } from '../../../../core/models/billetera.model';

@Component({
  selector: 'app-billetera-modal',
  standalone: true,
  imports: [
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonLabel, IonInput, IonIcon, IonFooter
  ],
  templateUrl: './billetera-modal.component.html',
  styleUrls:   ['./billetera-modal.component.scss']
})
export class BilleteraModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  @Input() billetera: Billetera | null = null;

  nombre     = '';
  iconoSel   = 'wallet-outline';
  colorSel   = '#4F6EF7';

  iconos  = ICONOS_BILLETERA;
  colores = COLORES_BILLETERA;

  get esEdicion(): boolean { return !!this.billetera; }

  constructor() {
    addIcons({
      walletOutline, cardOutline, cashOutline, phonePortraitOutline,
      briefcaseOutline, homeOutline, carOutline, checkmarkOutline,
      closeOutline
    });
  }

  ngOnInit() {
    if (this.billetera) {
      this.nombre   = this.billetera.nombre;
      this.iconoSel = this.billetera.icono;
      this.colorSel = this.billetera.color;
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