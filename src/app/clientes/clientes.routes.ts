import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/clientes-list.component').then(
        (m) => m.ClientesListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/cliente-ficha.component').then(
        (m) => m.ClienteFichaComponent,
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./components/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
];
