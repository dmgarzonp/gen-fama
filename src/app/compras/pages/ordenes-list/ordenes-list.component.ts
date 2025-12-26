import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ComprasService } from '@features/compras/services/compras.service';
import { ProveedoresService } from '@features/compras/services/proveedores.service';
import { OrdenCompra, EstadoOrden } from '@shared/models/orden-compra.model';

@Component({
    selector: 'app-ordenes-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IconsModule],
    templateUrl: './ordenes-list.component.html',
})
export class OrdenesListComponent {
    private comprasService = inject(ComprasService);
    private proveedoresService = inject(ProveedoresService);

    ordenes = this.comprasService.ordenes;
    proveedores = this.proveedoresService.proveedores;

    // Filtros
    estadoFiltro = signal<EstadoOrden | 'todas'>('todas');
    proveedorFiltro = signal<number | null>(null);
    terminoBusqueda = signal('');

    // Estadísticas
    estadisticas = computed(() => {
        const stats = this.comprasService.getTotalPorEstado();
        const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
        return { ...stats, total };
    });

    // Órdenes filtradas
    ordenesFiltradas = computed(() => {
        let resultado = this.ordenes();

        // Filtrar por estado
        if (this.estadoFiltro() !== 'todas') {
            resultado = resultado.filter(o => o.estado === this.estadoFiltro());
        }

        // Filtrar por proveedor
        if (this.proveedorFiltro()) {
            resultado = resultado.filter(o => o.proveedor_id === this.proveedorFiltro());
        }

        // Filtrar por búsqueda
        const termino = this.terminoBusqueda().toLowerCase();
        if (termino) {
            resultado = resultado.filter(o =>
                (o.numero_orden || '').toLowerCase().includes(termino) ||
                (o.proveedor_nombre || '').toLowerCase().includes(termino)
            );
        }

        // Ordenar por fecha (más recientes primero)
        return resultado.sort((a, b) =>
            new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
    });

    getEstadoClass(estado: EstadoOrden): string {
        const classes: Record<EstadoOrden, string> = {
            borrador: 'bg-gray-100 text-gray-800 border-gray-200',
            enviada: 'bg-blue-100 text-blue-800 border-blue-200',
            confirmada: 'bg-purple-100 text-purple-800 border-purple-200',
            recibida: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelada: 'bg-red-100 text-red-800 border-red-200',
        };
        return classes[estado];
    }

    getEstadoIcon(estado: EstadoOrden): string {
        const icons: Record<EstadoOrden, string> = {
            borrador: 'file-text',
            enviada: 'send',
            confirmada: 'check-circle',
            recibida: 'package-check',
            cancelada: 'x-circle',
        };
        return icons[estado];
    }

    async cancelarOrden(orden: OrdenCompra) {
        if (confirm(`¿Está seguro de cancelar la orden ${orden.numero_orden}?`)) {
            const motivo = prompt('Motivo de cancelación:');
            if (motivo) {
                await this.comprasService.cancelarOrden(orden.id!, motivo);
            }
        }
    }

    async eliminarOrden(orden: OrdenCompra) {
        if (orden.estado !== 'borrador') {
            alert('Solo se pueden eliminar órdenes en estado borrador');
            return;
        }

        if (confirm(`¿Está seguro de eliminar la orden ${orden.numero_orden}?`)) {
            await this.comprasService.eliminar(orden.id!);
        }
    }
}
