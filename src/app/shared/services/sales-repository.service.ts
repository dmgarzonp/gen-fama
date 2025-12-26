import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { Ticket } from '@shared/models/pos.model';
import { AuthService } from '@features/users/services/auth.service';
import { AuditService } from './audit.service';

@Injectable({
    providedIn: 'root'
})
export class SalesRepository {
    private db = inject(DatabaseService);
    private auth = inject(AuthService);
    private audit = inject(AuditService);

    async saveSale(ticket: Ticket): Promise<number | null> {
        try {
            const usuario = this.auth.currentUser();
            const usuarioId = usuario ? usuario.id : null;

            // 1. Insertar en la tabla 'ventas'
            const sqlVenta = `
                INSERT INTO ventas (
                    fecha, cliente_id, usuario_id, subtotal, impuestos,
                    descuento_tipo, descuento_valor, total_descuento,
                    total_bruto, total_neto, metodo_pago, recibido, cambio,
                    requiere_receta
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const paramsVenta = [
                ticket.fecha || new Date().toISOString(),
                ticket.cliente_id || null,
                usuarioId,
                ticket.subtotal,
                ticket.impuestos,
                ticket.descuento_tipo,
                ticket.descuento_valor,
                ticket.total_descuento,
                ticket.total_bruto,
                ticket.total_neto,
                ticket.metodo_pago,
                ticket.recibido,
                ticket.cambio,
                ticket.requiere_receta ? 1 : 0
            ];

            await this.db.execute(sqlVenta, paramsVenta);

            // Obtener el ID de la venta recién insertada
            const results = await this.db.query<{ id: number }>('SELECT last_insert_rowid() as id');
            const ventaId = results[0].id;

            // 2. Insertar detalles y actualizar stock
            for (const linea of ticket.lineas) {
                // Insertar detalle
                await this.db.execute(`
                    INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [ventaId, linea.producto_id, linea.cantidad, linea.precio_unitario, linea.subtotal]);

                // Descontar stock
                await this.db.execute(`
                    UPDATE productos 
                    SET stock_actual = MAX(0, stock_actual - ?) 
                    WHERE id = ?
                `, [linea.cantidad, linea.producto_id]);
            }

            // 3. Registrar en auditoría
            await this.audit.log('CREATE', 'ventas', ventaId, `Venta #${ventaId} realizada por total de ${ticket.total_neto}`);

            return ventaId;
        } catch (error) {
            console.error('Error al guardar la venta:', error);
            throw error;
        }
    }
}
