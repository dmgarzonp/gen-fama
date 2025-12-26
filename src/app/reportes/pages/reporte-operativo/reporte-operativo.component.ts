import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../../shared/icons.module';
import { ReportesService } from '@features/reportes/services/reportes.service';

@Component({
    selector: 'app-reporte-operativo',
    standalone: true,
    imports: [CommonModule, IconsModule],
    template: `
    <div class="space-y-6">
        
        <!-- Análisis ABC -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Análisis ABC de Inventario</h2>
                    <p class="text-sm text-gray-500">Clasificación de productos por volumen de ingresos (Pareto 80/20).</p>
                </div>
                <div class="flex gap-2">
                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">A: 80% Ingresos</span>
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">B: 15% Ingresos</span>
                    <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">C: 5% Ingresos</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-700 font-medium border-b">
                        <tr>
                            <th class="px-4 py-3">Producto</th>
                            <th class="px-4 py-3 text-right">Ingresos Generados</th>
                            <th class="px-4 py-3 text-right">% Acumulado</th>
                            <th class="px-4 py-3 text-center">Categoría</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr *ngFor="let item of analisisAbc() | slice:0:10" class="hover:bg-gray-50">
                            <td class="px-4 py-2 font-medium text-gray-900">{{ item.nombre }}</td>
                            <td class="px-4 py-2 text-right">{{ item.ingresosGenerados | currency }}</td>
                            <td class="px-4 py-2 text-right">{{ item.participacionAcumulada | number:'1.1-1' }}%</td>
                            <td class="px-4 py-2 text-center">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold text-white"
                                      [class.bg-green-500]="item.categoria === 'A'"
                                      [class.bg-yellow-500]="item.categoria === 'B'"
                                      [class.bg-red-400]="item.categoria === 'C'">
                                    {{ item.categoria }}
                                </span>
                            </td>
                        </tr>
                        <tr *ngIf="analisisAbc().length === 0">
                            <td colspan="4" class="px-4 py-8 text-center text-gray-500">No hay datos suficientes para el análisis.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="p-4 text-center border-t text-sm text-gray-500" *ngIf="analisisAbc().length > 10">
                    Mostrando top 10 de {{ analisisAbc().length }} productos.
                </div>
            </div>
        </div>

        <!-- Stock Bajo -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <lucide-icon name="alert-triangle" class="text-orange-500"></lucide-icon>
                Alertas de Stock Crítico
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let p of stockBajo()" class="p-4 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center">
                    <div>
                        <div class="font-medium text-gray-900">{{ p.nombre_comercial }}</div>
                        <div class="text-xs text-orange-700">Stock Mínimo: {{ p.stock_minimo }}</div>
                    </div>
                    <div class="text-2xl font-bold text-orange-600">
                        {{ p.stock_actual }}
                    </div>
                </div>
                <div *ngIf="stockBajo().length === 0" class="col-span-3 p-8 text-center text-green-600 bg-green-50 rounded-lg border border-green-100">
                    <lucide-icon name="check-circle" class="mx-auto mb-2"></lucide-icon>
                    Todos los niveles de stock están saludables.
                </div>
            </div>
        </div>
    </div>
  `
})
export class ReporteOperativoComponent {
    private reportesService = inject(ReportesService);

    analisisAbc = signal(this.reportesService.getAnalisisABC());
    stockBajo = signal(this.reportesService.getProductosBajoStock());
}
