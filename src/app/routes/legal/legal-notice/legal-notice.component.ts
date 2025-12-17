import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-legal-notice',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container py-5">
      <h1>Aviso Legal</h1>
      <p>Contenido pendiente...</p>
    </div>
  `
})
export class LegalNoticeComponent { }
