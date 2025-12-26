import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ComprasService } from '@features/compras/services/compras.service';
import { RecepcionService } from '@features/compras/services/recepcion.service';
import { OrdenCompra } from '@shared/models/orden-compra.model';
import { RecepcionMercancia, ItemRecepcion, LoteRecibido, DiferenciaRecepcion } from '@shared/models/recepcion.model';

@Component({
    selector: 'app-recepcion-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IconsModule],
    templateUrl: './recepcion-form.component.html',
})
export class RecepcionFormComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private comprasService = inject(ComprasService);
    private recepcionService = inject(RecepcionService);

    orden = signal<OrdenCompra | null>(null);
    recibido_por = signal<string>('Usuario Actual');
    observaciones = signal<string>('');
    fechaActual = new Date();

    // Items recibidos
    itemsRecepcion = signal<ItemRecepcion[]>([]);

    // Diferencias detectadas
    diferencias = computed(() => {
        const orden = this.orden();
        const items = this.itemsRecepcion();
        if (!orden) return [];

        return this.recepcionService.verificarDiferencias(orden, items);
    });

    tieneDiferencias = computed(() => this.diferencias().length > 0);

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            await this.cargarOrden(Number(id));
        }
    }

    async cargarOrden(id: number) {
        const orden = await this.comprasService.getById(id);
        if (!orden) {
            alert('Orden no encontrada');
            this.router.navigate(['/compras/ordenes']);
            return;
        }

        if (orden.estado !== 'enviada' && orden.estado !== 'confirmada') {
            alert('Solo se pueden recepcionar órdenes enviadas o confirmadas');
            this.router.navigate(['/compras/ordenes', id]);
            return;
        }

        this.orden.set(orden);

        // Inicializar items de recepción
        const items: ItemRecepcion[] = (orden.items || []).map(item => ({
            producto_id: item.producto_id,
            nombre_producto: item.nombre_producto,
            cantidad_esperada: item.cantidad_solicitada,
            cantidad_recibida: item.cantidad_solicitada, // Por defecto, asumir que se recibe todo
            estado_producto: 'bueno',
            lotes: []
        }));

        this.itemsRecepcion.set(items);
    }

    actualizarCantidadRecibida(index: number, cantidad: number) {
        const items = this.itemsRecepcion();
        const nuevosItems = items.map((item, i) => {
            if (i === index) {
                return { ...item, cantidad_recibida: Math.max(0, cantidad), lotes: [] };
            }
            return item;
        });
        this.itemsRecepcion.set(nuevosItems);
    }

    actualizarEstado(index: number, estado: 'bueno' | 'dañado' | 'vencido') {
        const items = this.itemsRecepcion();
        const nuevosItems = items.map((item, i) => {
            if (i === index) {
                return { ...item, estado_producto: estado };
            }
            return item;
        });
        this.itemsRecepcion.set(nuevosItems);
    }

    agregarLote(itemIndex: number) {
        const items = this.itemsRecepcion();
        const item = items[itemIndex];

        const nuevoLote: LoteRecibido = {
            numero_lote: '',
            fecha_vencimiento: new Date().toISOString().split('T')[0],
            cantidad: 0,
            ubicacion_almacen: ''
        };

        const nuevosItems = items.map((it, i) => {
            if (i === itemIndex) {
                return { ...it, lotes: [...it.lotes, nuevoLote] };
            }
            return it;
        });

        this.itemsRecepcion.set(nuevosItems);
    }

    actualizarLote(itemIndex: number, loteIndex: number, campo: keyof LoteRecibido, valor: any) {
        const items = this.itemsRecepcion();
        const nuevosItems = items.map((item, i) => {
            if (i === itemIndex) {
                const nuevosLotes = item.lotes.map((lote, j) => {
                    if (j === loteIndex) {
                        return { ...lote, [campo]: valor };
                    }
                    return lote;
                });
                return { ...item, lotes: nuevosLotes };
            }
            return item;
        });
        this.itemsRecepcion.set(nuevosItems);
    }

    eliminarLote(itemIndex: number, loteIndex: number) {
        const items = this.itemsRecepcion();
        const nuevosItems = items.map((item, i) => {
            if (i === itemIndex) {
                const nuevosLotes = item.lotes.filter((_, j) => j !== loteIndex);
                return { ...item, lotes: nuevosLotes };
            }
            return item;
        });
        this.itemsRecepcion.set(nuevosItems);
    }

    getTotalLotes(item: ItemRecepcion): number {
        return item.lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
    }

    validarLotes(item: ItemRecepcion): boolean {
        if (item.cantidad_recibida === 0) return true;
        if (item.lotes.length === 0) return false;

        const totalLotes = this.getTotalLotes(item);
        return totalLotes === item.cantidad_recibida;
    }

    async registrarRecepcion() {
        const orden = this.orden();
        if (!orden) return;

        // Validar que todos los productos con cantidad > 0 tengan lotes
        const items = this.itemsRecepcion();
        for (const item of items) {
            if (item.cantidad_recibida > 0 && item.estado_producto === 'bueno') {
                if (!this.validarLotes(item)) {
                    alert(`El producto "${item.nombre_producto}" necesita lotes que sumen ${item.cantidad_recibida} unidades`);
                    return;
                }

                // Validar que todos los lotes tengan datos completos
                for (const lote of item.lotes) {
                    if (!lote.numero_lote || !lote.fecha_vencimiento || lote.cantidad <= 0 || !lote.ubicacion_almacen) {
                        alert(`Complete todos los datos del lote para "${item.nombre_producto}"`);
                        return;
                    }
                }
            }
        }

        const recepcion: RecepcionMercancia = {
            orden_compra_id: orden.id!,
            numero_recepcion: '', // Se genera automáticamente
            fecha_recepcion: new Date().toISOString(),
            recibido_por: this.recibido_por(),
            items: this.itemsRecepcion(),
            diferencias: this.diferencias(),
            tiene_diferencias: this.tieneDiferencias(),
            verificado: true,
            inventario_actualizado: false, // Se actualiza en el servicio
            observaciones: this.observaciones()
        };

        await this.recepcionService.registrarRecepcion(recepcion);

        alert('Recepción registrada exitosamente. El inventario ha sido actualizado.');
        this.router.navigate(['/compras/ordenes', orden.id]);
    }

    cancelar() {
        if (confirm('¿Descartar recepción?')) {
            const orden = this.orden();
            if (orden) {
                this.router.navigate(['/compras/ordenes', orden.id]);
            } else {
                this.router.navigate(['/compras/ordenes']);
            }
        }
    }
}
