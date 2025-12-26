import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';
import { ControladosService } from '@features/controlados/services/controlados.service';

@Component({
  selector: 'app-libro-controlados',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <lucide-icon name="book-lock" [size]="28" class="text-indigo-600"></lucide-icon>
            Libro de Psicotrópicos y Estupefacientes
          </h1>
          <p class="text-gray-600">Registro oficial de movimientos y balance perpetuo</p>
        </div>
        
        <div class="flex gap-3">
             <button class="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-2 font-medium">
                <lucide-icon name="download" [size]="18"></lucide-icon>
                Exportar Reporte
            </button>
             <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium">
                <lucide-icon name="file-check" [size]="18"></lucide-icon>
                Cerrar Periodo Mensual
            </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4 items-end">
         <div class="flex-1">
             <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
             <div class="relative">
                <input [(ngModel)]="filtroProducto" type="text" placeholder="Nombre..." class="w-full pl-10 pr-4 py-2 border rounded-lg">
                <lucide-icon name="search" class="absolute left-3 top-2.5 text-gray-400 w-5 h-5"></lucide-icon>
             </div>
         </div>
         <div class="w-48">
             <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
             <input type="month" class="w-full px-4 py-2 border rounded-lg">
         </div>
      </div>

      <!-- Tabla Kardex -->
      <div class="bg-white rounded-lg shadowoverflow-hidden border border-gray-200">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-700 font-medium border-b">
              <tr>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Doc. Fuente</th>
                <th class="px-4 py-3">Lote</th>
                <th class="px-4 py-3 text-right">Entrada</th>
                <th class="px-4 py-3 text-right">Salida</th>
                <th class="px-4 py-3 text-right bg-gray-100">Saldo</th>
                <th class="px-4 py-3">Responsable (QF)</th>
                <th class="px-4 py-3 text-center">Firma Digital</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let mov of movimientosFiltrados()" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap">{{ mov.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ mov.nombre_producto }}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs font-semibold"
                        [class.bg-green-100]="mov.tipo_movimiento === 'ENTRADA'"
                        [class.text-green-700]="mov.tipo_movimiento === 'ENTRADA'"
                        [class.bg-red-100]="mov.tipo_movimiento === 'SALIDA'"
                        [class.text-red-700]="mov.tipo_movimiento === 'SALIDA'"
                    >
                        {{ mov.tipo_movimiento }}
                    </span>
                </td>
                <td class="px-4 py-3 text-gray-600">
                    <div>{{ mov.documento_referencia }}</div>
                    <div *ngIf="mov.nro_autorizacion" class="text-xs text-indigo-600">Aut: {{ mov.nro_autorizacion }}</div>
                    <div *ngIf="mov.receta_data" class="text-xs text-orange-600">Rec: {{ mov.receta_data.nro_receta }}</div>
                </td>
                <td class="px-4 py-3 font-mono text-xs">{{ mov.lote }}</td>
                
                <td class="px-4 py-3 text-right font-medium text-green-600">
                    {{ mov.tipo_movimiento === 'ENTRADA' ? mov.cantidad : '-' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-red-600">
                    {{ mov.tipo_movimiento === 'SALIDA' ? mov.cantidad : '-' }}
                </td>
                <td class="px-4 py-3 text-right font-bold bg-gray-50">
                    {{ mov.saldo_actual }}
                </td>
                
                <td class="px-4 py-3 text-gray-600 truncate max-w-[150px]" [title]="mov.responsable_nombre">
                    {{ mov.responsable_nombre }}
                </td>
                <td class="px-4 py-3 text-center">
                    <div class="group relative inline-block">
                        <lucide-icon name="fingerprint" class="text-gray-400 hover:text-indigo-600 cursor-help w-5 h-5 mx-auto"></lucide-icon>
                        <div class="hidden group-hover:block absolute right-full top-0 mr-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 w-48 break-all">
                            Hash: {{ mov.firma_digital_hash }}
                        </div>
                    </div>
                </td>
              </tr>
              <tr *ngIf="movimientos().length === 0">
                 <td colspan="10" class="px-4 py-8 text-center text-gray-500">
                    No hay movimientos registrados en el libro oficial.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Footer Info -->
      <div class="mt-4 text-xs text-gray-500 text-center">
        ESTE REGISTRO ES UNA REPRESENTACIÓN DIGITAL DEL LIBRO OFICIAL DE CONTROLADOS. <br>
        LA INTEGRIDAD DE LOS DATOS ESTÁ GARANTIZADA POR HASH CRIPTOGRÁFICO.
      </div>
    </div>
  `
})
export class LibroControladosComponent {
  private controladosService = inject(ControladosService);

  movimientos = this.controladosService.movimientos;
  filtroProducto = '';

  movimientosFiltrados = computed(() => {
    const termino = this.filtroProducto.toLowerCase();
    // Orden inverso cronológico para ver lo último arriba? NO, el kárdex suele ser cronológico descendente visualmente o ascendente.
    // Vamos a mostrar descendente (lo más nuevo arriba) para facilidad de lectura en pantalla.
    return this.movimientos().filter(m =>
      (m.nombre_producto || '').toLowerCase().includes(termino) ||
      (m.documento_referencia || '').toLowerCase().includes(termino)
    ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  });
}
