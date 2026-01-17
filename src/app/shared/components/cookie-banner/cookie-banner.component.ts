import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieConsentService, CookieConsent } from '../../../core/services/cookie-consent.service';

@Component({
    selector: 'app-cookie-banner',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cookie-banner.component.html',
    styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent implements OnInit {
    isVisible = false;
    showConfig = false;

    tempConsent: CookieConsent = {
        essential: true,
        analytics: false,
        marketing: false
    };

    constructor(private cookieService: CookieConsentService) { }

    ngOnInit(): void {
        // Subscribe to settings trigger
        this.cookieService.showSettings$.subscribe(show => {
            if (show) {
                this.openConfig();
            }
        });

        // Check if user has already interacted
        if (!this.cookieService.hasUserInteracted()) {
            // Delay slightly for better UX
            setTimeout(() => {
                this.isVisible = true;
            }, 1000);
        }
    }

    acceptAll(): void {
        this.cookieService.acceptAll();
        this.isVisible = false;
    }

    rejectAll(): void {
        this.cookieService.rejectNonEssential();
        this.isVisible = false;
    }

    openConfig(): void {
        this.tempConsent = { ...this.cookieService.getCurrentConsent() };
        this.showConfig = true;
    }

    saveConfig(): void {
        this.cookieService.saveConsent(this.tempConsent);
        this.showConfig = false;
        this.isVisible = false;
    }

    closeConfig(): void {
        this.showConfig = false;
    }
}
