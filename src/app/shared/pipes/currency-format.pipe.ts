import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyFormat',
    standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

    transform(value: number | null | undefined, currency: string = 'EUR', showSymbol: boolean = true): string {
        if (value === null || value === undefined) {
            return showSymbol ? '0,00 €' : '0,00';
        }

        // Formatear el número con 2 decimales y separador de miles
        const formatted = value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        if (!showSymbol) {
            return formatted;
        }

        // Añadir símbolo de moneda
        switch (currency.toUpperCase()) {
            case 'EUR':
                return `${formatted} €`;
            case 'USD':
                return `$ ${formatted}`;
            default:
                return `${formatted} ${currency}`;
        }
    }
}
