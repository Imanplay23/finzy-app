import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ThemeService } from './core/services/theme.service';
import { FontSizeService } from './core/services/font-size.service';
import { CurrencyService } from './core/services/currency.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  private themeService    = inject(ThemeService);
  private fontSizeService = inject(FontSizeService);
  private currencyService = inject(CurrencyService);
  private notificationService = inject(NotificationService);
}