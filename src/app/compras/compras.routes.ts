import { Routes } from '@angular/router';

export const comprasRoutes: Routes = [
    {
        path: '',
        redirectTo: 'ordenes',
        pathMatch: 'full'
    },
    {
        path: 'ordenes',
        loadComponent: () => import('./pages/ordenes-list/ordenes-list.component').then(m => m.OrdenesListComponent)
    },
    {
        path: 'ordenes/nueva',
        loadComponent: () => import('./pages/orden-form/orden-form.component').then(m => m.OrdenFormComponent)
    },
    {
        path: 'ordenes/:id',
        loadComponent: () => import('./pages/orden-detalle/orden-detalle.component').then(m => m.OrdenDetalleComponent)
    },
    {
        path: 'ordenes/:id/editar',
        loadComponent: () => import('./pages/orden-form/orden-form.component').then(m => m.OrdenFormComponent)
    },
    {
        path: 'ordenes/:id/recepcionar',
        loadComponent: () => import('./pages/recepcion-form/recepcion-form.component').then(m => m.RecepcionFormComponent)
    },
    {
        path: 'proveedores',
        loadComponent: () => import('./pages/proveedores-list/proveedores-list.component').then(m => m.ProveedoresListComponent)
    },
    {
        path: 'proveedores/nuevo',
        loadComponent: () => import('./pages/proveedor-form/proveedor-form.component').then(m => m.ProveedorFormComponent)
    },
    {
        path: 'historial',
        loadComponent: () => import('./pages/historial-compras/historial-compras.component').then(m => m.HistorialComprasComponent)
    },
    {
        path: 'analisis-precios',
        loadComponent: () => import('./pages/analisis-precios/analisis-precios.component').then(m => m.AnalisisPreciosComponent)
    },
];
