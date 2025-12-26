import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ProveedoresService } from '@features/compras/services/proveedores.service';
import { Proveedor } from '@shared/models/proveedor.model';

@Component({
    selector: 'app-proveedores-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IconsModule],
    templateUrl: './proveedores-list.component.html',
})
export class ProveedoresListComponent {
    private proveedoresService = inject(ProveedoresService);

    proveedores = this.proveedoresService.proveedores;

    // Filtros
    terminoBusqueda = signal('');
    soloActivos = signal(true);

    // Proveedores filtrados
    proveedoresFiltrados = computed(() => {
        let resultado = this.proveedores();

        // Filtrar por activos
        if (this.soloActivos()) {
            resultado = resultado.filter(p => p.activo);
        }

        // Filtrar por búsqueda
        const termino = this.terminoBusqueda().toLowerCase();
        if (termino) {
            resultado = resultado.filter(p =>
                p.nombre.toLowerCase().includes(termino) ||
                (p.razon_social && p.razon_social.toLowerCase().includes(termino)) ||
                p.ruc.includes(termino) ||
                p.email.toLowerCase().includes(termino)
            );
        }

        // Ordenar por nombre
        return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    // Estadísticas
    estadisticas = computed(() => {
        const provs = this.proveedores();
        return {
            total: provs.length,
            activos: provs.filter(p => p.activo).length,
            inactivos: provs.filter(p => !p.activo).length,
            totalCompras: provs.reduce((sum, p) => sum + p.total_compras, 0)
        };
    });

    async eliminarProveedor(proveedor: any) {
        if (confirm(`¿Está seguro de eliminar el proveedor "${proveedor.nombre}"?`)) {
            await this.proveedoresService.delete(proveedor.id);
        }
    }

    async toggleActivo(proveedor: Proveedor) {
        await this.proveedoresService.upsert({
            ...proveedor,
            activo: !proveedor.activo
        });
    }
}
