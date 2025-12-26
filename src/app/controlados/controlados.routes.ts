import { Routes } from '@angular/router';
import { LibroControladosComponent } from './pages/libro-controlados/libro-controlados.component';

export const CONTROLADOS_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'libro',
        pathMatch: 'full'
    },
    {
        path: 'libro',
        component: LibroControladosComponent
    }
];
