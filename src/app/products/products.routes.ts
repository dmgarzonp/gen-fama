import { Routes } from '@angular/router';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { ExpirationComponent } from './pages/expiration/expiration.component';

export const productsRoutes: Routes = [
  {
    path: 'inventory',
    component: InventoryComponent
  },
  {
    path: 'expiration',
    component: ExpirationComponent
  },
  {
    path: '',
    redirectTo: 'inventory',
    pathMatch: 'full'
  }
];
