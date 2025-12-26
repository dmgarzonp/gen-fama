import { Injectable, signal } from '@angular/core';
import { Proveedor } from '@shared/models/proveedor.model';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable({ providedIn: 'root' })
export class ProveedoresService extends BaseRepository<Proveedor> {
    protected override tableName = 'proveedores';

    private readonly _proveedores = signal<Proveedor[]>([]);
    proveedores = this._proveedores.asReadonly();

    constructor() {
        super();
        this.cargarProveedores();
    }

    async cargarProveedores() {
        try {
            const results = await this.getAll("activo = 1");
            // Map results if needed (e.g. products_ofrecidos is JSON)
            const mapped = results.map(p => ({
                ...p,
                activo: p.activo === 1 || p.activo === true,
                productos_ofrecidos: typeof p.productos_ofrecidos === 'string' ? JSON.parse(p.productos_ofrecidos) : (p.productos_ofrecidos || [])
            }));
            this._proveedores.set(mapped);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
        }
    }

    async upsert(proveedor: Proveedor) {
        const productosJson = JSON.stringify(proveedor.productos_ofrecidos || []);

        if (proveedor.id) {
            const sql = `
                UPDATE proveedores SET 
                    nombre = ?, razon_social = ?, ruc = ?, contacto = ?, 
                    telefono = ?, email = ?, direccion = ?, ciudad = ?, pais = ?,
                    dias_credito = ?, descuento_habitual = ?, monto_minimo_compra = ?,
                    total_compras = ?, ultima_compra = ?, calificacion = ?,
                    productos_ofrecidos = ?, activo = ?, notas = ?
                WHERE id = ?
            `;
            const params = [
                proveedor.nombre, proveedor.razon_social, proveedor.ruc, proveedor.contacto,
                proveedor.telefono, proveedor.email, proveedor.direccion, proveedor.ciudad, proveedor.pais,
                proveedor.dias_credito, proveedor.descuento_habitual, proveedor.monto_minimo_compra,
                proveedor.total_compras, proveedor.ultima_compra, proveedor.calificacion,
                productosJson, proveedor.activo ? 1 : 0, proveedor.notas,
                proveedor.id
            ];
            await this.db.execute(sql, params);
        } else {
            const sql = `
                INSERT INTO proveedores (
                    nombre, razon_social, ruc, contacto, telefono, email, 
                    direccion, ciudad, pais, dias_credito, descuento_habitual, 
                    monto_minimo_compra, total_compras, ultima_compra, 
                    calificacion, productos_ofrecidos, activo, fecha_registro, notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                proveedor.nombre, proveedor.razon_social, proveedor.ruc, proveedor.contacto,
                proveedor.telefono, proveedor.email, proveedor.direccion, proveedor.ciudad, proveedor.pais,
                proveedor.dias_credito, proveedor.descuento_habitual, proveedor.monto_minimo_compra,
                proveedor.total_compras, proveedor.ultima_compra, proveedor.calificacion,
                productosJson, proveedor.activo ? 1 : 0,
                new Date().toISOString(), proveedor.notas
            ];
            await this.db.execute(sql, params);
        }
        await this.cargarProveedores();
    }

    override async delete(id: number) {
        await super.delete(id);
        await this.cargarProveedores();
    }

    async getEstadisticas(proveedorId: number) {
        const proveedor = await this.getById(proveedorId);
        if (!proveedor) return null;

        const productosOfrecidos = typeof proveedor.productos_ofrecidos === 'string'
            ? JSON.parse(proveedor.productos_ofrecidos)
            : (proveedor.productos_ofrecidos || []);

        return {
            totalCompras: proveedor.total_compras,
            promedioCompra: proveedor.total_compras / 12, // Estimado mensual
            ultimaCompra: proveedor.ultima_compra,
            productosOfrecidos: productosOfrecidos.length,
            calificacion: proveedor.calificacion
        };
    }

    async actualizarMetricas(proveedorId: number, montoCompra: number) {
        const sql = `
            UPDATE proveedores SET 
                total_compras = total_compras + ?, 
                ultima_compra = ? 
            WHERE id = ?
        `;
        await this.db.execute(sql, [montoCompra, new Date().toISOString(), proveedorId]);
        await this.cargarProveedores();
    }
}
