import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  isHomePage = false;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Detectar la ruta actual
    this.checkCurrentRoute();
    
    // Verificar scroll inicial
    setTimeout(() => {
      if (this.isHomePage) {
        this.checkScroll();
      }
    }, 0);
    
    // Suscribirse a los cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkCurrentRoute();
        // Verificar scroll después de cambio de ruta
        setTimeout(() => {
          if (this.isHomePage) {
            this.checkScroll();
          }
        }, 0);
      });
  }
  
  private checkCurrentRoute() {
    // El header será transparente al hacer scroll en home y waitlist
    const currentUrl = this.router.url;
    this.isHomePage = currentUrl === '/' || 
                      currentUrl === '/home' || 
                      currentUrl === '/waitlist' ||
                      currentUrl.startsWith('/waitlist');
    
    if (this.isHomePage) {
      this.checkScroll();
    } else {
      this.isScrolled = false;
    }
  }
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isHomePage) {
      this.checkScroll();
    }
  }
  
  private checkScroll() {
    this.isScrolled = window.scrollY > 10;
  }
}
