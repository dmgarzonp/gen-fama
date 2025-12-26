import { Routes } from '@angular/router';
import { CajaComponent } from './caja/caja.component';
import { authGuard } from './users/guards/auth.guard';

export const routes: Routes = [
  // Ruta de login (sin guard)
  {
    path: 'login',
    loadComponent: () =>
      import('./users/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  // Rutas protegidas (requieren autenticación)
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./admin-dashboar/admin-dashboard.routes').then(
        (m) => m.ADMIN_DASHBOARD_ROUTES,
      ),
    canActivate: [authGuard],
  },
  // Redirigir raíz a dashboard
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'pos',
    loadChildren: () =>
      import('./pos/pos.routes').then(
        (m) => m.POS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.routes').then(
        (m) => m.productsRoutes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'caja',
    component: CajaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./clientes/clientes.routes').then(
        (m) => m.CLIENTES_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'compras',
    loadChildren: () =>
      import('./compras/compras.routes').then(
        (m) => m.comprasRoutes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./reportes/reportes.routes').then(
        (m) => m.REPORTES_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'controlados',
    loadChildren: () =>
      import('./controlados/controlados.routes').then(
        (m) => m.CONTROLADOS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.routes').then(
        (m) => m.USERS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.routes').then(
        (m) => m.SETTINGS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  // Ruta catch-all: redirigir a login si no existe
  { path: '**', redirectTo: 'login' },
];
