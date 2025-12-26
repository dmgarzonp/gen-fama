import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IconsModule } from '../shared/icons.module';

@Component({
  selector: 'app-reportes-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="bg-white border-b px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <lucide-icon name="bar-chart" [size]="28" class="text-emerald-600"></lucide-icon>
            Reportes Avanzados
        </h1>
        <p class="text-gray-500 mt-1">Análisis financiero, operativo y regulatorio.</p>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar local de reportes -->
        <aside class="w-64 bg-gray-50 border-r overflow-y-auto">
          <nav class="p-4 space-y-1">
            <a routerLink="financiero" routerLinkActive="bg-emerald-100 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <lucide-icon name="trending-up" [size]="20"></lucide-icon>
              <div class="font-medium">Dashboard Financiero</div>
            </a>
            
            <a routerLink="operativo" routerLinkActive="bg-emerald-100 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <lucide-icon name="package-check" [size]="20"></lucide-icon>
              <div class="font-medium">Dashboard Operativo</div>
            </a>

            <a routerLink="regulatorio" routerLinkActive="bg-emerald-100 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <lucide-icon name="book-lock" [size]="20"></lucide-icon>
              <div class="font-medium">Regulatorio</div>
            </a>
          </nav>

          <div class="p-4 mt-auto">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div class="flex items-start gap-3">
                    <lucide-icon name="info" class="text-blue-600 mt-0.5" [size]="18"></lucide-icon>
                    <p class="text-xs text-blue-800">
                        Los datos se actualizan en tiempo real con cada transacción del POS y Módulo de Compras.
                    </p>
                </div>
            </div>
          </div>
        </aside>

        <!-- Contenido -->
        <main class="flex-1 overflow-auto bg-gray-100 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class ReportesLayoutComponent { }
