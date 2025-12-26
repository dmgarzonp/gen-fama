import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { GlobalConfig } from '@shared/models/configuracion.model';
import { IconsModule } from '@shared/icons.module';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
          <p class="text-gray-500">Administra los parámetros globales de tu farmacia.</p>
        </div>
        <button (click)="saveChanges()" 
                class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all font-bold">
          <lucide-icon name="check-circle" size="20"></lucide-icon>
          <span>Guardar Cambios</span>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button *ngFor="let tab of tabs" 
                (click)="activeTab.set(tab.id)"
                class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
                [class.bg-white]="activeTab() === tab.id"
                [class.text-emerald-700]="activeTab() === tab.id"
                [class.shadow-sm]="activeTab() === tab.id"
                [class.text-gray-500]="activeTab() !== tab.id"
                [class.hover:text-gray-700]="activeTab() !== tab.id">
          {{ tab.label }}
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form class="p-8">
          
          <!-- TAB: GENERAL -->
          <div *ngIf="activeTab() === 'general'" class="space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <lucide-icon name="pill" class="text-emerald-600"></lucide-icon>
              Identidad de la Farmacia
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                <input type="text" [(ngModel)]="localConfig.farmacia.nombre" name="nombre" 
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">NIT / RUT</label>
                <input type="text" [(ngModel)]="localConfig.farmacia.nit" name="nit"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" [(ngModel)]="localConfig.farmacia.telefono" name="telefono"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
                <input type="email" [(ngModel)]="localConfig.farmacia.email" name="email"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input type="text" [(ngModel)]="localConfig.farmacia.ciudad" name="ciudad"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Resolución de Facturación</label>
                <textarea [(ngModel)]="localConfig.farmacia.resolucionFacturacion" name="resolucion" rows="2"
                          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
              </div>
            </div>
          </div>

          <!-- TAB: VENTAS -->
          <div *ngIf="activeTab() === 'ventas'" class="space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <lucide-icon name="wallet" class="text-emerald-600"></lucide-icon>
              Parámetros de Ventas
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
                <input type="number" [(ngModel)]="localConfig.ventas.impuestoIva" name="iva"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <p class="text-xs text-gray-500 mt-1">Impuesto aplicado a productos gravados.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descuento Máximo (%)</label>
                <input type="number" [(ngModel)]="localConfig.ventas.descuentoMaximoVendedor" name="descMax"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <p class="text-xs text-gray-500 mt-1">Límite para vendedores sin autorización adm.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prefijo de Factura</label>
                <input type="text" [(ngModel)]="localConfig.ventas.prefijoFactura" name="prefijo"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número Inicial</label>
                <input type="number" [(ngModel)]="localConfig.ventas.numeroFacturaInicial" name="numIni"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div class="col-span-2">
                <label class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                  <input type="checkbox" [(ngModel)]="localConfig.ventas.permitirVentaSinStock" name="sinStock"
                         class="w-5 h-5 text-emerald-600 rounded">
                  <div>
                    <span class="text-sm font-bold text-gray-800">Permitir venta sin stock</span>
                    <p class="text-xs text-gray-500">Permite realizar ventas incluso si el inventario está en cero.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- TAB: INVENTARIO -->
          <div *ngIf="activeTab() === 'inventario'" class="space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <lucide-icon name="package" class="text-emerald-600"></lucide-icon>
              Control de Inventario
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Umbral Stock Bajo</label>
                <input type="number" [(ngModel)]="localConfig.inventario.umbralStockBajo" name="stockBajo"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <p class="text-xs text-gray-500 mt-1">El dashboard avisará cuando queden menos unidades que este valor.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alertar Vencimiento (Meses)</label>
                <input type="number" [(ngModel)]="localConfig.inventario.mesesAlertaVencimiento" name="mesesVen"
                       class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <p class="text-xs text-gray-500 mt-1">Antelación para avisar sobre productos próximos a vencer.</p>
              </div>
              <div class="col-span-2">
                <label class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-200">
                  <input type="checkbox" [(ngModel)]="localConfig.inventario.actualizarCostosAutomaticamente" name="autoCost"
                         class="w-5 h-5 text-emerald-600 rounded">
                  <div>
                    <span class="text-sm font-bold text-gray-800">Actualizar costos automáticamente</span>
                    <p class="text-xs text-gray-500">Actualiza el costo promedio del producto al recibir nuevas compras.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer Info -->
      <div class="mt-6 flex justify-between items-center text-xs text-gray-400">
          <p>Derniera actualización: {{ lastUpdated() | date:'medium' }}</p>
          <button (click)="resetDefaults()" class="text-gray-400 hover:text-red-500 font-medium underline flex items-center gap-1">
             <lucide-icon name="rotate-ccw" size="12"></lucide-icon>
             Restaurar valores de fábrica
          </button>
      </div>
    </div>
  `
})
export class SettingsLayoutComponent {
  private settingsService = inject(SettingsService);

  activeTab = signal('general');
  lastUpdated = computed(() => this.settingsService.config().lastUpdated);

  // Clone the config to avoid direct structural mutations before saving
  localConfig: GlobalConfig = JSON.parse(JSON.stringify(this.settingsService.config()));

  tabs = [
    { id: 'general', label: 'General' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'inventario', label: 'Inventario' }
  ];

  saveChanges() {
    this.settingsService.updateConfig(this.localConfig);
    // In a real app we would show a Toast here
    alert('Configuración guardada exitosamente');
  }

  resetDefaults() {
    if (confirm('¿Estás seguro de restaurar todos los valores por defecto?')) {
      this.settingsService.resetToDefaults();
      this.localConfig = JSON.parse(JSON.stringify(this.settingsService.config()));
    }
  }
}
