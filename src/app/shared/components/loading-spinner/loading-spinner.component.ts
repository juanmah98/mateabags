import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="spinner-container" *ngIf="show">
      <div class="spinner-overlay" *ngIf="overlay"></div>
      <div class="spinner" [ngClass]="'spinner-' + size">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ loadingText }}</span>
        </div>
        <p *ngIf="message" class="loading-message mt-2">{{ message }}</p>
      </div>
    </div>
  `,
    styles: [`
    .spinner-container {
      position: relative;
    }

    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      text-align: center;
    }

    .spinner-sm .spinner-border {
      width: 1.5rem;
      height: 1.5rem;
    }

    .spinner-md .spinner-border {
      width: 3rem;
      height: 3rem;
    }

    .spinner-lg .spinner-border {
      width: 4.5rem;
      height: 4.5rem;
    }

    .loading-message {
      color: white;
      font-size: 1rem;
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() show: boolean = false;
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() message?: string;
    @Input() overlay: boolean = true;
    @Input() loadingText: string = 'Cargando...';
}
