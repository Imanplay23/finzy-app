import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonSpinner],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private authService = inject(AuthService);
  private router      = inject(Router);

  cargando = false;
  error    = '';

  constructor() {
    addIcons({ logoGoogle });
  }

  async loginGoogle() {
    this.cargando = true;
    this.error    = '';
    try {
      await this.authService.loginConGoogle();
      this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        this.error = 'No se pudo iniciar sesión. Intenta de nuevo.';
      }
    } finally {
      this.cargando = false;
    }
  }
}
