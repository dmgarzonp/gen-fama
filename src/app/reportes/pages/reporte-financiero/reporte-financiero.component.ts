import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';
import { ReportesService } from '@features/reportes/services/reportes.service';
import { ExportService } from '@shared/services/export.service';

@Component({
    selector: 'app-reporte-financiero',
    standalone: true,
    imports: [CommonModule, FormsModule, IconsModule],
    template: `
    <div class="space-y-6">
       <!-- Filtros -->
       <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input type="date" [ngModel]="fechaInicio | date:'yyyy-MM-dd'" (ngModelChange)="onFechaChange($event, 'inicio')" class="px-3 py-2 border rounded-lg text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input type="date" [ngModel]="fechaFin | date:'yyyy-MM-dd'" (ngModelChange)="onFechaChange($event, 'fin')" class="px-3 py-2 border rounded-lg text-sm">
            </div>
            <div class="ml-auto flex gap-2">
                <button (click)="exportarExcel()" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                    <lucide-icon name="download" [size]="16"></lucide-icon> Excel
                </button>
                <button (click)="exportarPDF()" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
                    <lucide-icon name="printer" [size]="16"></lucide-icon> PDF
                </button>
            </div>
       </div>

       <!-- KPIs -->
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div class="flex justify-between items-start">
                   <div>
                       <p class="text-sm font-medium text-gray-500">Ventas Totales</p>
                       <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ kpis()?.totalVentas | currency }}</h3>
                   </div>
                   <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                       <lucide-icon name="trending-up" [size]="24"></lucide-icon>
                   </div>
               </div>
               <div class="mt-4 flex items-center text-sm text-green-600">
                    <lucide-icon name="arrow-up" [size]="14"></lucide-icon>
                    <span>12% vs periodo anterior</span>
               </div>
           </div>

           <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div class="flex justify-between items-start">
                   <div>
                       <p class="text-sm font-medium text-gray-500">Utilidad Bruta</p>
                       <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ kpis()?.utilidadBruta | currency }}</h3>
                   </div>
                   <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
                       <lucide-icon name="wallet" [size]="24"></lucide-icon>
                   </div>
               </div>
               <div class="mt-4 flex items-center text-sm text-gray-500">
                    <span>Margen Promedio: {{ kpis()?.margenPromedio | number:'1.1-2' }}%</span>
               </div>
           </div>

           <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div class="flex justify-between items-start">
                   <div>
                       <p class="text-sm font-medium text-gray-500">Ticket Promedio</p>
                       <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ kpis()?.ticketPromedio | currency }}</h3>
                   </div>
                   <div class="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                       <lucide-icon name="shopping-cart" [size]="24"></lucide-icon>
                   </div>
               </div>
           </div>
           
           <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div>
                   <p class="text-sm font-medium text-gray-500 mb-3">Métodos de Pago</p>
                   <div class="space-y-2">
                        <div *ngFor="let item of metodosPago() | keyvalue" class="flex justify-between text-sm">
                            <span class="capitalize text-gray-600">{{ item.key }}</span>
                            <span class="font-medium">{{ item.value | currency }}</span>
                        </div>
                   </div>
               </div>
           </div>
       </div>

       <!-- Gráficos Placeholder (Mock) -->
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 class="text-lg font-bold text-gray-800 mb-4">Tendencia de Ventas (Diaria)</h3>
               <!-- Aquí iría el Chart.js canvas -->
               <div class="h-64 flex items-end justify-between gap-1 px-4 border-b border-l border-gray-200">
                    <div *ngFor="let v of ventasPorDia() | slice:0:15" 
                         [style.height.%]="(v.total / maxVentaDia) * 100" 
                         class="bg-emerald-500 w-full hover:bg-emerald-600 rounded-t relative group transition-all"
                         [title]="v.fecha + ': ' + (v.total | currency)">
                    </div>
               </div>
               <div class="flex justify-between text-xs text-gray-400 mt-2">
                 <span>{{ fechaInicio | date:'dd MMM' }}</span>
                 <span>{{ fechaFin | date:'dd MMM' }}</span>
               </div>
           </div>

           <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 class="text-lg font-bold text-gray-800 mb-4">Top Cajeros</h3>
               <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">JD</div>
                        <div class="flex-1">
                            <div class="flex justify-between mb-1">
                                <span class="font-medium text-gray-900">Juan Doe</span>
                                <span class="text-sm font-bold">$12,450</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">MA</div>
                        <div class="flex-1">
                            <div class="flex justify-between mb-1">
                                <span class="font-medium text-gray-900">Maria Admin</span>
                                <span class="text-sm font-bold">$8,230</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2">
                                <div class="bg-purple-500 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>
                    </div>
               </div>
           </div>
       </div>
    </div>
  `
})
export class ReporteFinancieroComponent {
    private reportesService = inject(ReportesService);
    private exportService = inject(ExportService);

    fechaInicio = new Date(); // Default: today - 30 days usually
    fechaFin = new Date();

    kpis = signal<any>(null);
    ventasPorDia = signal<any[]>([]);
    metodosPago = signal<{ [key: string]: number }>({});
    maxVentaDia = 1;

    constructor() {
        // Set default range: last 30 days
        const start = new Date();
        start.setDate(start.getDate() - 30);
        this.fechaInicio = start;

        this.actualizarDatos();
    }

    onFechaChange(val: string, tipo: 'inicio' | 'fin') {
        if (!val) return;
        if (tipo === 'inicio') this.fechaInicio = new Date(val);
        else this.fechaFin = new Date(val);
        this.actualizarDatos();
    }

    actualizarDatos() {
        this.kpis.set(this.reportesService.getKpisFinancieros(this.fechaInicio, this.fechaFin));

        const ventasDia = this.reportesService.getVentasPorDia(this.fechaInicio, this.fechaFin);
        this.ventasPorDia.set(ventasDia);
        this.maxVentaDia = Math.max(...ventasDia.map(v => v.total), 1);

        this.metodosPago.set(this.reportesService.getVentasPorMetodoPago(this.fechaInicio, this.fechaFin));
    }

    exportarExcel() {
        const data = this.ventasPorDia().map(v => ({
            Fecha: v.fecha,
            VentaTotal: v.total
        }));
        this.exportService.exportToExcel(data, 'Reporte_Ventas');
    }

    exportarPDF() {
        const headers = ['Fecha', 'Venta Total'];
        const data = this.ventasPorDia().map(v => [v.fecha, `$${v.total.toFixed(2)}`]);
        this.exportService.exportToPdf(headers, data, 'Reporte_Ventas', 'Reporte de Ventas por Período');
    }
}
