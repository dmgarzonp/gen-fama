import { Routes } from '@angular/router';
import { CajaComponent } from './caja/caja.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: '',
    loadChildren: () =>
      import('./admin-dashboar/admin-dashboard.routes').then(
        (m) => m.ADMIN_DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'pos',
    loadChildren: () =>
      import('./pos/pos.routes').then(
        (m) => m.POS_ROUTES,
      ),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.routes').then(
        (m) => m.productsRoutes,
      ),
  },
  { path: 'caja', component: CajaComponent },
];

