import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface CookieConsent {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CookieConsentService {
    private readonly STORAGE_KEY = 'cookie-consent';
    // Default consent: essential is strictly required/true by default
    private readonly DEFAULT_CONSENT: CookieConsent = {
        essential: true,
        analytics: false,
        marketing: false
    };

    private consentSubject = new BehaviorSubject<CookieConsent>(this.DEFAULT_CONSENT);
    public consent$ = this.consentSubject.asObservable();

    private showSettingsSubject = new BehaviorSubject<boolean>(false);
    public showSettings$ = this.showSettingsSubject.asObservable();

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.loadConsent();
    }

    private loadConsent(): void {
        if (!this.isBrowser) return;

        const storedConsent = localStorage.getItem(this.STORAGE_KEY);
        if (storedConsent) {
            try {
                const parsed = JSON.parse(storedConsent);
                // Ensure essential is always true regardless of storage
                this.consentSubject.next({ ...parsed, essential: true });
            } catch (e) {
                console.error('Error parsing cookie consent', e);
                this.resetConsent();
            }
        }
    }

    public saveConsent(consent: CookieConsent): void {
        if (!this.isBrowser) return;

        // Force essential to be true
        const finalConsent = { ...consent, essential: true };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalConsent));
        this.consentSubject.next(finalConsent);

        // Trigger callbacks/signals for third-party scripts here if needed
        // e.g., if (finalConsent.analytics) { initAnalytics(); }
    }

    public acceptAll(): void {
        this.saveConsent({
            essential: true,
            analytics: true,
            marketing: true
        });
    }

    public rejectNonEssential(): void {
        this.saveConsent({
            essential: true,
            analytics: false,
            marketing: false
        });
    }

    public getCurrentConsent(): CookieConsent {
        return this.consentSubject.value;
    }

    private resetConsent(): void {
        this.saveConsent(this.DEFAULT_CONSENT);
    }

    public hasUserInteracted(): boolean {
        if (!this.isBrowser) return false;
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    public showSettingsModal(): void {
        this.showSettingsSubject.next(true);
    }
}
