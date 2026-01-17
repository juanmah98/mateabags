import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11000">
      <div 
        class="toast show align-items-center border-0"
        [ngClass]="'toast-' + type"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <strong *ngIf="title">{{ title }}</strong>
            <p class="mb-0" [class.mt-1]="title">{{ message }}</p>
          </div>
          <button 
            type="button" 
            class="btn-close btn-close-white me-2 m-auto" 
            (click)="onClose()"
            aria-label="Close">
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .toast-success {
      background-color: #198754;
      color: white;
    }

    .toast-error {
      background-color: #dc3545;
      color: white;
    }

    .toast-warning {
      background-color: #ffc107;
      color: #000;
    }

    .toast-info {
      background-color: #0dcaf0;
      color: #000;
    }

    .toast-body {
      padding: 0.75rem;
    }

    .toast-body strong {
      font-size: 1rem;
    }

    .toast-body p {
      font-size: 0.875rem;
    }
  `]
})
export class ToastComponent {
    @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
    @Input() title?: string;
    @Input() message: string = '';
    @Output() close = new EventEmitter<void>();

    onClose(): void {
        this.close.emit();
    }
}
