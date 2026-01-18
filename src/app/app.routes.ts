import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { homeDateGuard } from './core/guards/home-date.guard';
import { waitlistGuard } from './core/guards/waitlist.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent),
    canActivate: [waitlistGuard]
  },
  {
    path: 'waitlist',
    loadComponent: () => import('./routes/waitlist/waitlist.component').then(m => m.WaitlistComponent),
    canActivate: [waitlistGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./routes/home/home.component').then(m => m.HomeComponent),
    /* canActivate: [homeDateGuard]  */ // TODO: Descomentar antes de producción
  },
  {
    path: 'home/product-sale',
    loadComponent: () => import('./routes/product-sale/product-sale.component').then(m => m.ProductSaleComponent),
    /* canActivate: [homeDateGuard] */
  },
  // Legal routes
  {
    path: 'privacy-policy',
    loadComponent: () => import('./routes/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms-conditions',
    loadComponent: () => import('./routes/legal/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent)
  },
  {
    path: 'cookie-policy',
    loadComponent: () => import('./routes/legal/cookie-policy/cookie-policy.component').then(m => m.CookiePolicyComponent)
  },
  {
    path: 'legal-notice',
    loadComponent: () => import('./routes/legal/legal-notice/legal-notice.component').then(m => m.LegalNoticeComponent)
  },
  // Admin routes
  {
    path: 'admin/login',
    loadComponent: () => import('./routes/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./routes/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./routes/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./routes/admin/admin-customers/admin-customers.component').then(m => m.AdminCustomersComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./routes/admin/admin-sales/admin-sales.component').then(m => m.AdminSalesComponent)
      },
      {
        path: 'emails',
        loadComponent: () => import('./routes/admin/admin-emails/admin-emails.component').then(m => m.AdminEmailsComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./routes/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent)
      }

    ]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./routes/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
