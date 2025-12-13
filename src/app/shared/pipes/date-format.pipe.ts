import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat',
    standalone: true
})
export class DateFormatPipe implements PipeTransform {

    transform(value: string | Date | null | undefined, format: 'short' | 'long' | 'date' | 'time' = 'short'): string {
        if (!value) {
            return '';
        }

        const date = typeof value === 'string' ? new Date(value) : value;

        if (isNaN(date.getTime())) {
            return '';
        }

        const options: Intl.DateTimeFormatOptions = {};
        const locale = 'es-ES';

        switch (format) {
            case 'short':
                options.year = 'numeric';
                options.month = '2-digit';
                options.day = '2-digit';
                options.hour = '2-digit';
                options.minute = '2-digit';
                break;
            case 'long':
                options.year = 'numeric';
                options.month = 'long';
                options.day = 'numeric';
                options.hour = '2-digit';
                options.minute = '2-digit';
                break;
            case 'date':
                options.year = 'numeric';
                options.month = '2-digit';
                options.day = '2-digit';
                break;
            case 'time':
                options.hour = '2-digit';
                options.minute = '2-digit';
                break;
        }

        return date.toLocaleString(locale, options);
    }
}
