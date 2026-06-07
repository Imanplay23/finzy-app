import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth   = inject(Auth);
  private router = inject(Router);
  private zone   = inject(NgZone);

  private _user    = signal<User | null | undefined>(undefined); // undefined = cargando
  user             = this._user.asReadonly();
  estaAutenticado  = computed(() => !!this._user());
  cargando         = computed(() => this._user() === undefined);

  constructor() {
    // Escuchar cambios de sesión
    onAuthStateChanged(this.auth, (user) => {
      this.zone.run(() => {
        this._user.set(user);
        if (!user) {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      });
    });

    // En web: recuperar resultado de redirect (por si usamos signInWithRedirect)
    if (!Capacitor.isNativePlatform()) {
      getRedirectResult(this.auth).catch(() => {/* ignorar si no hay redirect pendiente */});
    }
  }

  async loginConGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (Capacitor.isNativePlatform()) {
      // En Android/iOS usamos redirect (no hay popup en WebView nativo)
      await signInWithRedirect(this.auth, provider);
    } else {
      // En web/PWA usamos popup
      await signInWithPopup(this.auth, provider);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  get displayName(): string {
    return this._user()?.displayName ?? 'Usuario';
  }

  get photoURL(): string | null {
    return this._user()?.photoURL ?? null;
  }

  get email(): string {
    return this._user()?.email ?? '';
  }

  get uid(): string {
    return this._user()?.uid ?? '';
  }
}
