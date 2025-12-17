import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container py-5">
      <h1>Política de Privacidad</h1>
      <p>Contenido pendiente...</p>
    </div>
  `
})
export class PrivacyPolicyComponent { }
