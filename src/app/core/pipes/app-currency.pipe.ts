import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false  // se recalcula cuando cambia la divisa
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(monto: number): string {
    return this.currencyService.formatear(monto);
  }
}