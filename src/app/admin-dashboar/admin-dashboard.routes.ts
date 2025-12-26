import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';

// Rutas lazy del módulo de admin dashboard
export const ADMIN_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
