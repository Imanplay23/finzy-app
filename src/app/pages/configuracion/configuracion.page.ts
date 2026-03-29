import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonToggle,
  IonListHeader, IonNote, IonIcon, IonSelect, IonSelectOption,
  IonRange
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moonOutline, sunnyOutline, informationCircleOutline,
  cashOutline, textOutline, refreshOutline
} from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService, DIVISAS } from '../../core/services/currency.service';
import { FontSizeService } from '../../core/services/font-size.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    FormsModule, NgFor,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonToggle,
    IonListHeader, IonNote, IonIcon, IonSelect, IonSelectOption,
    IonRange
  ],
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss']
})
export class ConfiguracionPage {
  themeService    = inject(ThemeService);
  currencyService = inject(CurrencyService);
  fontSizeService = inject(FontSizeService);

  divisas = DIVISAS;

  constructor() {
    addIcons({
      moonOutline, sunnyOutline, informationCircleOutline,
      cashOutline, textOutline, refreshOutline
    });
  }

  onDivisaChange(event: any) {
    const divisa = this.divisas.find(d => d.codigo === event.detail.value);
    if (divisa) this.currencyService.cambiarDivisa(divisa);
  }

  onFontSizeChange(event: any) {
    this.fontSizeService.aplicar(event.detail.value);
  }

  actualizarTasas() {
    this.currencyService.cargarTasas();
  }
}