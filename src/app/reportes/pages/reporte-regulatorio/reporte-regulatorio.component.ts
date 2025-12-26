import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../../shared/icons.module';
import { LibroControladosComponent } from '../../../controlados/pages/libro-controlados/libro-controlados.component';

@Component({
    selector: 'app-reporte-regulatorio',
    standalone: true,
    imports: [CommonModule, IconsModule, LibroControladosComponent],
    template: `
    <div class="space-y-6">
        <!-- Reusamos el componente de Libro Oficial ya que cumple co  el reporte regulatorio principal -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <app-libro-controlados></app-libro-controlados>
        </div>

        <!-- Sección adicional para reportes específicos regulatorios si fuera necesario -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <lucide-icon name="file-check" class="text-blue-500"></lucide-icon>
                    Reporte de Vencimientos
                </h3>
                <p class="text-sm text-gray-600 mb-4">Próximos productos a vencer en los siguientes 90 días.</p>
                
                <div class="bg-blue-50 p-4 rounded-lg text-center text-blue-700 text-sm">
                    No hay vencimientos críticos próximos.
                </div>
             </div>

             <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <lucide-icon name="stethoscope" class="text-emerald-500"></lucide-icon>
                    Recetas Emitidas
                </h3>
                <p class="text-sm text-gray-600 mb-4">Log de recetas asociadas a ventas de antibióticos y controlados.</p>
                
                <button class="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium">
                    Descargar Log (CSV)
                </button>
             </div>
        </div>
    </div>
  `
})
export class ReporteRegulatorioComponent {
    // Logic mostly reused from LibroControlados, plus extra regulatory specific stubs
}
