import { Injectable, signal, inject } from '@angular/core';
import { RecepcionMercancia, ItemRecepcion, DiferenciaRecepcion, LoteRecibido } from '@shared/models/recepcion.model';
import { ProductosService } from '@features/products/services/productos.service';
import { ComprasService } from './compras.service';
import { OrdenCompra } from '@shared/models/orden-compra.model';
import { ControladosService } from '@features/controlados/services/controlados.service';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class RecepcionService {
    private db = inject(DatabaseService);
    private productosService = inject(ProductosService);
    private comprasService = inject(ComprasService);
    private controladosService = inject(ControladosService);

    private readonly _recepciones = signal<RecepcionMercancia[]>([]);
    recepciones = this._recepciones.asReadonly();

    constructor() {
        this.cargarRecepciones();
    }

    async cargarRecepciones() {
        try {
            const results = await this.db.query<any>('SELECT * FROM recepciones ORDER BY fecha_recepcion DESC');
            const mapped: RecepcionMercancia[] = [];

            for (const row of results) {
                const items = await this.db.query<any>('SELECT * FROM items_recepcion WHERE recepcion_id = ?', [row.id]);
                const mappedItems: ItemRecepcion[] = [];

                for (const item of items) {
                    const lotes = await this.db.query<any>('SELECT * FROM lotes_recepcion WHERE item_recepcion_id = ?', [item.id]);
                    mappedItems.push({
                        ...item,
                        producto_id: item.producto_id,
                        nombre_producto: '', // Se podría cargar con JOIN si es necesario
                        cantidad_esperada: item.cantidad_esperada,
                        cantidad_recibida: item.cantidad_recibida,
                        estado_producto: item.estado_producto,
                        lotes: lotes.map(l => ({
                            ...l,
                            numero_lote: l.numero_lote,
                            fecha_vencimiento: l.fecha_vencimiento,
                            cantidad: l.cantidad,
                            ubicacion_almacen: l.ubicacion_almacen
                        }))
                    });
                }

                mapped.push({
                    ...row,
                    orden_compra_id: row.orden_compra_id,
                    numero_recepcion: row.numero_recepcion,
                    fecha_recepcion: row.fecha_recepcion,
                    recibido_por: row.recibido_por,
                    items: mappedItems,
                    diferencias: [], // Se calculan al vuelo si es necesario
                    tiene_diferencias: row.tiene_diferencias === 1,
                    verificado: row.verificado === 1,
                    inventario_actualizado: row.inventario_actualizado === 1
                });
            }
            this._recepciones.set(mapped);
        } catch (error) {
            console.error('Error al cargar recepciones:', error);
        }
    }

    // Registrar recepción
    async registrarRecepcion(recepcion: RecepcionMercancia): Promise<void> {
        const numeroRecepcion = this.generarNumeroRecepcion();
        const fechaRecepcion = new Date().toISOString();

        try {
            // 1. Insertar Cabecera
            const sqlCabecera = `
                INSERT INTO recepciones (
                    orden_compra_id, numero_recepcion, fecha_recepcion, 
                    recibido_por, tiene_diferencias, verificado, 
                    inventario_actualizado, observaciones, nro_autorizacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const paramsCabecera = [
                recepcion.orden_compra_id, numeroRecepcion, fechaRecepcion,
                recepcion.recibido_por, recepcion.tiene_diferencias ? 1 : 0, 1, 0,
                recepcion.observaciones, recepcion.nro_autorizacion
            ];
            await this.db.execute(sqlCabecera, paramsCabecera);

            const res = await this.db.query<{ id: number }>('SELECT last_insert_rowid() as id');
            const recepcionId = res[0].id;

            // 2. Insertar Items y Lotes
            for (const item of recepcion.items) {
                const sqlItem = `
                    INSERT INTO items_recepcion (recepcion_id, producto_id, cantidad_esperada, cantidad_recibida, estado_producto)
                    VALUES (?, ?, ?, ?, ?)
                `;
                await this.db.execute(sqlItem, [recepcionId, item.producto_id, item.cantidad_esperada, item.cantidad_recibida, item.estado_producto]);

                const resItem = await this.db.query<{ id: number }>('SELECT last_insert_rowid() as id');
                const itemRecepcionId = resItem[0].id;

                for (const lote of item.lotes) {
                    const sqlLote = `
                        INSERT INTO lotes_recepcion (item_recepcion_id, numero_lote, fecha_vencimiento, cantidad, ubicacion_almacen)
                        VALUES (?, ?, ?, ?, ?)
                    `;
                    await this.db.execute(sqlLote, [itemRecepcionId, lote.numero_lote, lote.fecha_vencimiento, lote.cantidad, lote.ubicacion_almacen]);
                }
            }

            // 3. Actualizar Inventario
            await this.actualizarInventario({ ...recepcion, id: recepcionId, numero_recepcion: numeroRecepcion, fecha_recepcion: fechaRecepcion });

            // 4. Marcar orden como recibida
            await this.comprasService.marcarComoRecibida(recepcion.orden_compra_id, recepcionId);

            await this.cargarRecepciones();
        } catch (error) {
            console.error('Error al registrar recepción:', error);
            throw error;
        }
    }

    // Verificar diferencias
    verificarDiferencias(orden: OrdenCompra, itemsRecibidos: ItemRecepcion[]): DiferenciaRecepcion[] {
        const diferencias: DiferenciaRecepcion[] = [];

        orden.items.forEach(itemOrden => {
            const itemRecibido = itemsRecibidos.find(r => r.producto_id === itemOrden.producto_id);

            if (!itemRecibido) {
                diferencias.push({
                    producto_id: itemOrden.producto_id,
                    nombre_producto: itemOrden.nombre_producto,
                    tipo: 'faltante',
                    cantidad_esperada: itemOrden.cantidad_solicitada,
                    cantidad_recibida: 0,
                    diferencia: itemOrden.cantidad_solicitada
                });
            } else if (itemRecibido.cantidad_recibida !== itemOrden.cantidad_solicitada) {
                const tipo = itemRecibido.cantidad_recibida < itemOrden.cantidad_solicitada
                    ? 'faltante'
                    : 'sobrante';

                diferencias.push({
                    producto_id: itemOrden.producto_id,
                    nombre_producto: itemOrden.nombre_producto,
                    tipo,
                    cantidad_esperada: itemOrden.cantidad_solicitada,
                    cantidad_recibida: itemRecibido.cantidad_recibida,
                    diferencia: Math.abs(itemRecibido.cantidad_recibida - itemOrden.cantidad_solicitada)
                });
            }
        });

        return diferencias;
    }

    // Actualizar inventario
    async actualizarInventario(recepcion: RecepcionMercancia): Promise<void> {
        for (const item of recepcion.items) {
            if (item.estado_producto === 'bueno') {
                // Actualizar stock del producto
                await this.productosService.actualizarStock(
                    item.producto_id,
                    item.cantidad_recibida,
                    'suma'
                );

                const productoInfo = await this.productosService.getById(item.producto_id);
                for (const lote of item.lotes) {
                    await this.registrarLote(item.producto_id, lote);

                    if (productoInfo?.es_controlado) {
                        const orden = await this.comprasService.getById(recepcion.orden_compra_id);
                        await this.controladosService.registrarEntrada(
                            item.producto_id,
                            item.nombre_producto,
                            lote.cantidad,
                            lote.numero_lote,
                            lote.fecha_vencimiento,
                            `REC-${recepcion.numero_recepcion}`,
                            orden?.proveedor_id ?? 0,
                            orden?.proveedor_nombre ?? 'Proveedor Desconocido',
                            recepcion.nro_autorizacion ?? 'S/N',
                            recepcion.recibido_por
                        );
                    }
                }
            }
        }

        // Marcar inventario como actualizado en DB
        await this.db.execute('UPDATE recepciones SET inventario_actualizado = 1 WHERE id = ?', [recepcion.id]);
    }

    private async registrarLote(producto_id: number, lote: LoteRecibido): Promise<void> {
        const producto = await this.productosService.getById(producto_id);
        if (producto) {
            await this.productosService.upsert({
                ...producto,
                lote: lote.numero_lote,
                fecha_vencimiento: lote.fecha_vencimiento,
                ubicacion: lote.ubicacion_almacen
            });
        }
    }

    private generarNumeroRecepcion(): string {
        const año = new Date().getFullYear();
        const hoy = new Date().toISOString().split('T')[0];
        const count = this._recepciones().length;
        return `REC-${año}-${(count + 1).toString().padStart(3, '0')}`;
    }
}
