import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../core/services/cookie-consent.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(private cookieService: CookieConsentService) { }

  openCookieSettings(event: Event): void {
    event.preventDefault();
    this.cookieService.showSettingsModal();
  }
}
