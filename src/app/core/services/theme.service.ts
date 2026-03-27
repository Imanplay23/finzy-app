import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private _darkMode = signal<boolean>(false);
  darkMode = this._darkMode.asReadonly();

constructor() {
  const guardado = localStorage.getItem('darkMode');
  if (guardado !== null) {
    this.setDarkMode(JSON.parse(guardado));
  } else {
    const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(prefiereDark);
  }
}

  toggle() {
    this.setDarkMode(!this._darkMode());
  }

  private setDarkMode(value: boolean) {
    this._darkMode.set(value);
    document.documentElement.classList.toggle('ion-palette-dark', value);
    localStorage.setItem('darkMode', JSON.stringify(value));
  }
}