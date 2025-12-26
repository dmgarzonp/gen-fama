import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ComprasService } from '@features/compras/services/compras.service';
import { ProveedoresService } from '@features/compras/services/proveedores.service';
import { RecepcionService } from '@features/compras/services/recepcion.service';
import { OrdenCompra } from '@shared/models/orden-compra.model';
import { Proveedor } from '@shared/models/proveedor.model';

@Component({
    selector: 'app-orden-detalle',
    standalone: true,
    imports: [CommonModule, RouterLink, IconsModule],
    templateUrl: './orden-detalle.component.html',
})
export class OrdenDetalleComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private comprasService = inject(ComprasService);
    private proveedoresService = inject(ProveedoresService);
    private recepcionService = inject(RecepcionService);

    orden = signal<OrdenCompra | null>(null);
    proveedor = signal<Proveedor | null>(null);


    recepcion = computed(() => {
        const orden = this.orden();
        return orden ? this.recepcionService.recepciones().find(r => r.orden_compra_id === orden.id) : null;
    });

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            await this.cargarOrden(Number(id));
        }
    }

    async cargarOrden(id: number) {
        const orden = await this.comprasService.getById(id);
        if (orden) {
            this.orden.set(orden);
            if (orden.proveedor_id) {
                const prov = await this.proveedoresService.getById(orden.proveedor_id);
                this.proveedor.set(prov || null);
            }
        } else {
            alert('Orden no encontrada');
            this.router.navigate(['/compras/ordenes']);
        }
    }

    getEstadoClass(estado: string): string {
        const classes: Record<string, string> = {
            borrador: 'bg-gray-100 text-gray-800 border-gray-200',
            enviada: 'bg-blue-100 text-blue-800 border-blue-200',
            confirmada: 'bg-purple-100 text-purple-800 border-purple-200',
            recibida: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelada: 'bg-red-100 text-red-800 border-red-200',
        };
        return classes[estado] || '';
    }

    getEstadoIcon(estado: string): string {
        const icons: Record<string, string> = {
            borrador: 'file-text',
            enviada: 'send',
            confirmada: 'check-circle',
            recibida: 'package-check',
            cancelada: 'x-circle',
        };
        return icons[estado] || 'file-text';
    }

    async cancelarOrden() {
        const orden = this.orden();
        if (!orden) return;

        if (confirm(`¿Está seguro de cancelar la orden ${orden.numero_orden}?`)) {
            const motivo = prompt('Motivo de cancelación:');
            if (motivo) {
                await this.comprasService.cancelarOrden(orden.id!, motivo);
                await this.cargarOrden(orden.id!);
            }
        }
    }

    async eliminarOrden() {
        const orden = this.orden();
        if (!orden) return;

        if (orden.estado !== 'borrador') {
            alert('Solo se pueden eliminar órdenes en estado borrador');
            return;
        }

        if (confirm(`¿Está seguro de eliminar la orden ${orden.numero_orden}?`)) {
            await this.comprasService.eliminar(orden.id!);
            this.router.navigate(['/compras/ordenes']);
        }
    }

    imprimirOrden() {
        window.print();
    }
}
