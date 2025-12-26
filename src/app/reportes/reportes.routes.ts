import { Routes } from '@angular/router';
import { ReportesLayoutComponent } from './reportes-layout.component';
import { ReporteFinancieroComponent } from './pages/reporte-financiero/reporte-financiero.component';
import { ReporteOperativoComponent } from './pages/reporte-operativo/reporte-operativo.component';
import { ReporteRegulatorioComponent } from './pages/reporte-regulatorio/reporte-regulatorio.component';

export const REPORTES_ROUTES: Routes = [
    {
        path: '',
        component: ReportesLayoutComponent,
        children: [
            { path: '', redirectTo: 'financiero', pathMatch: 'full' },
            { path: 'financiero', component: ReporteFinancieroComponent },
            { path: 'operativo', component: ReporteOperativoComponent },
            { path: 'regulatorio', component: ReporteRegulatorioComponent }
        ]
    }
];
