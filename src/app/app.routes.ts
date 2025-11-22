import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent)
  },
  {
    path: 'waitlist',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent)
  },
 /*  {
    path: 'home',
    loadComponent: () => import('./routes/home/home.component').then(m => m.HomeComponent)
  }, */
  {
    path: '**',
    redirectTo: ''
  }
];
