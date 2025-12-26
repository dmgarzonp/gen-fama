import { Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { roleGuard } from './guards/role.guard';

export const USERS_ROUTES: Routes = [
    {
        path: '',
        component: UsersListComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
    },
    {
        path: 'nuevo',
        loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
    },
    {
        path: 'editar/:id',
        loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
    }
];
