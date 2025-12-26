import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ComprasService } from '@features/compras/services/compras.service';
import { ProveedoresService } from '@features/compras/services/proveedores.service';
import { ProductosService } from '@features/products/services/productos.service';
import { OrdenCompra, DetalleOrdenCompra } from '@shared/models/orden-compra.model';
import { Proveedor } from '@shared/models/proveedor.model';
import { Producto } from '@shared/models/producto.model';

@Component({
    selector: 'app-orden-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IconsModule],
    templateUrl: './orden-form.component.html',
})
export class OrdenFormComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private comprasService = inject(ComprasService);
    private proveedoresService = inject(ProveedoresService);
    private productosService = inject(ProductosService);

    // Datos
    proveedores = this.proveedoresService.proveedores;
    productos = this.productosService.productos;

    // Modo edición
    ordenId = signal<number | null>(null);
    modoEdicion = computed(() => this.ordenId() !== null);

    // Formulario
    proveedorId = signal<number | null>(null);
    fechaEstimadaEntrega = signal<string>('');
    observaciones = signal<string>('');
    items = signal<DetalleOrdenCompra[]>([]);
    descuentoTipo = signal<'percentage' | 'fixed' | null>(null);
    descuentoValor = signal<number>(0);

    // Producto seleccionado para agregar
    productoSeleccionadoId = signal<number | null>(null);
    cantidadAgregar = signal<number>(1);
    precioUnitario = signal<number>(0);

    // Proveedor seleccionado
    proveedorSeleccionado = signal<Proveedor | null>(null);

    // Productos con stock bajo
    productosBajoStock = computed(() => this.comprasService.getProductosBajoStock());
    mostrarSugerencias = signal(false);

    // Cálculos
    subtotal = computed(() => {
        return this.items().reduce((sum, item) => sum + item.subtotal, 0);
    });

    descuentoMonto = computed(() => {
        const tipo = this.descuentoTipo();
        const valor = this.descuentoValor();
        const sub = this.subtotal();

        if (!tipo || valor <= 0) return 0;

        if (tipo === 'percentage') {
            return (sub * valor) / 100;
        }
        return Math.min(sub, valor);
    });

    total = computed(() => {
        return this.subtotal() - this.descuentoMonto();
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarOrden(Number(id));
        }
    }

    async cargarOrden(id: number) {
        const orden = await this.comprasService.getById(id);
        if (orden) {
            this.ordenId.set(id);
            this.proveedorId.set(orden.proveedor_id);
            await this.onProveedorChange(orden.proveedor_id);
            this.fechaEstimadaEntrega.set(
                orden.fecha_estimada_entrega
                    ? orden.fecha_estimada_entrega.split('T')[0]
                    : ''
            );
            this.observaciones.set(orden.observaciones || '');
            this.items.set([...orden.items]);
            this.descuentoTipo.set(orden.descuento_tipo);
            this.descuentoValor.set(orden.descuento_valor);
        }
    }

    async onProveedorChange(proveedorId: number) {
        this.proveedorId.set(proveedorId);
        const proveedor = await this.proveedoresService.getById(proveedorId);
        if (proveedor) {
            this.proveedorSeleccionado.set(proveedor);
            if (proveedor.descuento_habitual > 0) {
                this.descuentoTipo.set('percentage');
                this.descuentoValor.set(proveedor.descuento_habitual);
            }
        }
    }

    async onProductoChange(productoId: number) {
        this.productoSeleccionadoId.set(productoId);
        const producto = await this.productosService.getById(productoId);
        if (producto) {
            this.precioUnitario.set(producto.precio_compra);
        }
    }

    async agregarProducto() {
        const productoId = this.productoSeleccionadoId();
        const cantidad = this.cantidadAgregar();
        const precio = this.precioUnitario();

        if (!productoId || cantidad <= 0 || precio <= 0) {
            alert('Por favor completa todos los campos del producto');
            return;
        }

        const producto = await this.productosService.getById(productoId);
        if (!producto) return;

        // Verificar si ya existe
        const itemsActuales = this.items();
        const existente = itemsActuales.find(i => i.producto_id === productoId);

        if (existente) {
            // Actualizar cantidad
            const nuevosItems = itemsActuales.map(item => {
                if (item.producto_id === productoId) {
                    const nuevaCantidad = item.cantidad_solicitada + cantidad;
                    return {
                        ...item,
                        cantidad_solicitada: nuevaCantidad,
                        subtotal: nuevaCantidad * item.precio_unitario,
                        pendiente_recibir: nuevaCantidad
                    };
                }
                return item;
            });
            this.items.set(nuevosItems);
        } else {
            // Agregar nuevo
            const nuevoItem: DetalleOrdenCompra = {
                producto_id: producto.id!,
                codigo_producto: producto.codigo_interno || '',
                nombre_producto: producto.nombre_comercial,
                cantidad_solicitada: cantidad,
                cantidad_recibida: 0,
                precio_unitario: precio,
                descuento: 0,
                subtotal: cantidad * precio,
                pendiente_recibir: cantidad
            };
            this.items.set([...itemsActuales, nuevoItem]);
        }

        // Limpiar formulario de producto
        this.productoSeleccionadoId.set(null);
        this.cantidadAgregar.set(1);
        this.precioUnitario.set(0);
    }

    agregarProductoSugerido(producto: Producto) {
        this.productoSeleccionadoId.set(producto.id!);
        this.precioUnitario.set(producto.precio_compra);
        const faltante = (producto.stock_minimo as number) - (producto.stock_actual as number);
        this.cantidadAgregar.set(Math.max(faltante, producto.stock_minimo as number));
        this.mostrarSugerencias.set(false);
    }

    eliminarItem(index: number) {
        const nuevosItems = this.items().filter((_, i) => i !== index);
        this.items.set(nuevosItems);
    }

    actualizarCantidad(index: number, cantidad: number) {
        if (cantidad <= 0) return;

        const nuevosItems = this.items().map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    cantidad_solicitada: cantidad,
                    subtotal: cantidad * item.precio_unitario,
                    pendiente_recibir: cantidad
                };
            }
            return item;
        });
        this.items.set(nuevosItems);
    }

    actualizarPrecio(index: number, precio: number) {
        if (precio <= 0) return;

        const nuevosItems = this.items().map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    precio_unitario: precio,
                    subtotal: item.cantidad_solicitada * precio
                };
            }
            return item;
        });
        this.items.set(nuevosItems);
    }

    async guardarBorrador() {
        if (!this.validarFormulario()) return;

        const orden = this.construirOrden('borrador');

        if (this.modoEdicion()) {
            await this.comprasService.actualizar(this.ordenId()!, orden);
        } else {
            await this.comprasService.crear(orden);
        }

        this.router.navigate(['/compras/ordenes']);
    }

    async enviarOrden() {
        if (!this.validarFormulario()) return;

        const orden = this.construirOrden('enviada');

        if (this.modoEdicion()) {
            await this.comprasService.actualizar(this.ordenId()!, orden);
            await this.comprasService.enviarOrden(this.ordenId()!);
        } else {
            await this.comprasService.crear(orden);
            // La orden ya se crea con estado 'enviada'
        }

        this.router.navigate(['/compras/ordenes']);
    }

    private validarFormulario(): boolean {
        if (!this.proveedorId()) {
            alert('Por favor selecciona un proveedor');
            return false;
        }

        if (this.items().length === 0) {
            alert('Por favor agrega al menos un producto');
            return false;
        }

        return true;
    }

    private construirOrden(estado: 'borrador' | 'enviada'): OrdenCompra {
        const proveedor = this.proveedorSeleccionado()!;
        const fechaEntrega = this.fechaEstimadaEntrega();

        return {
            id: this.ordenId() || undefined,
            numero_orden: '', // Se genera automáticamente en el servicio
            proveedor_id: proveedor.id!,
            proveedor_nombre: proveedor.nombre,
            fecha_creacion: new Date().toISOString(),
            fecha_estimada_entrega: fechaEntrega || undefined,
            items: this.items(),
            subtotal: this.subtotal(),
            descuento_tipo: this.descuentoTipo(),
            descuento_valor: this.descuentoValor(),
            descuento_monto: this.descuentoMonto(),
            impuestos: 0,
            total: this.total(),
            estado,
            observaciones: this.observaciones(),
            creado_por: 'Usuario Actual', // TODO: Obtener del sistema de auth
            recepcion_completa: false
        };
    }

    cancelar() {
        if (confirm('¿Descartar cambios?')) {
            this.router.navigate(['/compras/ordenes']);
        }
    }
}
