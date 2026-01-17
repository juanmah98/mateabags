import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  currentUserEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.notifications.info('Sesión cerrada');
      this.router.navigate(['/admin/login']);
    });
  }
}
