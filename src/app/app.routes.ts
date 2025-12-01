import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent)
  },
  {
    path: 'waitlist',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./routes/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'home/login',
    loadComponent: () => import('./routes/home/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
