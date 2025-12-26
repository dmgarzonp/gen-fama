import { Injectable, signal, inject } from '@angular/core';
import { OrdenCompra, DetalleOrdenCompra } from '@shared/models/orden-compra.model';
import { ProductosService } from '@features/products/services/productos.service';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class ComprasService {
    private db = inject(DatabaseService);
    private productosService = inject(ProductosService);

    private readonly _ordenes = signal<OrdenCompra[]>([]);
    ordenes = this._ordenes.asReadonly();

    constructor() {
        this.cargarOrdenes();
    }

    async cargarOrdenes() {
        try {
            const sql = 'SELECT * FROM ordenes_compra WHERE activo = 1 ORDER BY fecha_creacion DESC';
            const results = await this.db.query<any>(sql);

            const fullOrdenes: OrdenCompra[] = [];
            for (const row of results) {
                const items = await this.db.query<DetalleOrdenCompra>(
                    'SELECT * FROM detalles_orden_compra WHERE orden_id = ?',
                    [row.id]
                );

                fullOrdenes.push({
                    ...row,
                    recepcion_completa: row.recepcion_completa === 1,
                    items
                });
            }
            this._ordenes.set(fullOrdenes);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        }
    }

    async getById(id: number): Promise<OrdenCompra | undefined> {
        const sql = 'SELECT * FROM ordenes_compra WHERE id = ?';
        const results = await this.db.query<any>(sql, [id]);
        if (results.length === 0) return undefined;

        const row = results[0];
        const items = await this.db.query<DetalleOrdenCompra>(
            'SELECT * FROM detalles_orden_compra WHERE orden_id = ?',
            [row.id]
        );

        return {
            ...row,
            recepcion_completa: row.recepcion_completa === 1,
            items
        };
    }

    async crear(orden: OrdenCompra) {
        const numero_orden = orden.numero_orden || await this.generarNumeroOrden();

        const sql = `
            INSERT INTO ordenes_compra (
                numero_orden, proveedor_id, fecha_creacion, fecha_envio, 
                fecha_estimada_entrega, subtotal, descuento_tipo, 
                descuento_valor, descuento_monto, impuestos, total, 
                estado, observaciones, creado_por, recepcion_completa,
                activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            numero_orden, orden.proveedor_id,
            orden.fecha_creacion || new Date().toISOString(),
            orden.fecha_envio, orden.fecha_estimada_entrega,
            orden.subtotal, orden.descuento_tipo, orden.descuento_valor,
            orden.descuento_monto, orden.impuestos, orden.total,
            orden.estado, orden.observaciones, orden.creado_por,
            orden.recepcion_completa ? 1 : 0,
            1 // activo por defecto
        ];

        await this.db.execute(sql, params);

        // Obtener el ID insertado (SQLite last_insert_rowid)
        const lastId = await this.db.query<{ id: number }>('SELECT last_insert_rowid() as id');
        const ordenId = lastId[0].id;

        // Insertar ítems
        for (const item of orden.items) {
            await this.db.execute(`
                INSERT INTO detalles_orden_compra (
                    orden_id, producto_id, cantidad_solicitada, 
                    cantidad_recibida, precio_unitario, descuento, 
                    subtotal, pendiente_recibir
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                ordenId, item.producto_id, item.cantidad_solicitada,
                item.cantidad_recibida, item.precio_unitario, item.descuento,
                item.subtotal, item.pendiente_recibir
            ]);
        }

        await this.cargarOrdenes();
    }

    async actualizar(id: number, orden: OrdenCompra) {
        const sql = `
            UPDATE ordenes_compra SET 
                proveedor_id = ?, fecha_envio = ?, 
                fecha_estimada_entrega = ?, subtotal = ?, 
                descuento_tipo = ?, descuento_valor = ?, 
                descuento_monto = ?, impuestos = ?, total = ?, 
                estado = ?, observaciones = ?, recepcion_completa = ?
            WHERE id = ?
        `;
        const params = [
            orden.proveedor_id, orden.fecha_envio,
            orden.fecha_estimada_entrega, orden.subtotal,
            orden.descuento_tipo, orden.descuento_valor,
            orden.descuento_monto, orden.impuestos, orden.total,
            orden.estado, orden.observaciones,
            orden.recepcion_completa ? 1 : 0,
            id
        ];
        await this.db.execute(sql, params);

        // Actualizar ítems: Borrar y re-insertar (más simple para una orden)
        await this.db.execute('DELETE FROM detalles_orden_compra WHERE orden_id = ?', [id]);
        for (const item of orden.items) {
            await this.db.execute(`
                INSERT INTO detalles_orden_compra (
                    orden_id, producto_id, cantidad_solicitada, 
                    cantidad_recibida, precio_unitario, descuento, 
                    subtotal, pendiente_recibir
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, item.producto_id, item.cantidad_solicitada,
                item.cantidad_recibida, item.precio_unitario, item.descuento,
                item.subtotal, item.pendiente_recibir
            ]);
        }

        await this.cargarOrdenes();
    }

    async enviarOrden(id: number) {
        await this.db.execute(
            "UPDATE ordenes_compra SET estado = 'enviada', fecha_envio = ? WHERE id = ?",
            [new Date().toISOString(), id]
        );
        await this.cargarOrdenes();
    }

    async confirmarOrden(id: number) {
        await this.db.execute(
            "UPDATE ordenes_compra SET estado = 'confirmada' WHERE id = ?",
            [id]
        );
        await this.cargarOrdenes();
    }

    async cancelarOrden(id: number, motivo: string) {
        await this.db.execute(
            "UPDATE ordenes_compra SET estado = 'cancelada', motivo_cancelacion = ? WHERE id = ?",
            [motivo, id]
        );
        await this.cargarOrdenes();
    }

    async eliminar(id: number) {
        await this.db.execute(
            "UPDATE ordenes_compra SET activo = 0 WHERE id = ?",
            [id]
        );
        await this.cargarOrdenes();
    }

    async marcarComoRecibida(id: number, recepcionId: number) {
        await this.db.execute(
            "UPDATE ordenes_compra SET estado = 'recibida', recepcion_id = ?, recepcion_completa = 1 WHERE id = ?",
            [recepcionId, id]
        );
        await this.cargarOrdenes();
    }

    async generarNumeroOrden(): Promise<string> {
        const results = await this.db.query<{ count: number }>('SELECT count(*) as count FROM ordenes_compra');
        const count = results[0].count + 1;
        const year = new Date().getFullYear();
        return `OC-${year}-${count.toString().padStart(3, '0')}`;
    }

    getProductosBajoStock() {
        return this.productosService.productos().filter(p =>
            (p.stock_actual as number) <= (p.stock_minimo as number)
        );
    }

    getTotalPorEstado() {
        const stats = {
            borrador: 0,
            enviada: 0,
            confirmada: 0,
            recibida: 0,
            cancelada: 0
        };
        this._ordenes().forEach(o => {
            if (o.estado in stats) {
                stats[o.estado as keyof typeof stats]++;
            }
        });
        return stats;
    }
}
