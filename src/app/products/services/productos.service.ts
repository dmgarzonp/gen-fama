import { Injectable, signal, inject } from '@angular/core';
import { Producto } from '@shared/models/producto.model';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private db = inject(DatabaseService);
  private _productos = signal<Producto[]>([]);
  productos = this._productos.asReadonly();

  constructor() {
    this.cargarProductos();
  }

  async cargarProductos() {
    try {
      const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.estado = 'activo'
      `;
      const results = await this.db.query<Producto>(sql);
      this._productos.set(results);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  async getById(id: number): Promise<Producto | undefined> {
    const sql = 'SELECT * FROM productos WHERE id = ?';
    const results = await this.db.query<Producto>(sql, [id]);
    return results[0];
  }

  async upsert(producto: Producto) {
    if (producto.id) {
      // Update
      const sql = `
        UPDATE productos SET 
          codigo_barras = ?, codigo_interno = ?, nombre_comercial = ?, 
          principio_activo = ?, presentacion = ?, categoria_id = ?, 
          laboratorio = ?, lote = ?, fecha_vencimiento = ?, ubicacion = ?, 
          stock_actual = ?, stock_minimo = ?, stock_maximo = ?, 
          precio_compra = ?, precio_venta = ?, margen_ganancia = ?, 
          requiere_receta = ?, es_controlado = ?, estado = ?
        WHERE id = ?
      `;
      const params = [
        producto.codigo_barras, producto.codigo_interno, producto.nombre_comercial,
        producto.principio_activo, producto.presentacion, producto.categoria_id,
        producto.laboratorio, producto.lote, producto.fecha_vencimiento, producto.ubicacion,
        producto.stock_actual, producto.stock_minimo, producto.stock_maximo,
        producto.precio_compra, producto.precio_venta, producto.margen_ganancia,
        producto.requiere_receta ? 1 : 0, producto.es_controlado ? 1 : 0, producto.estado,
        producto.id
      ];
      await this.db.execute(sql, params);
    } else {
      // Insert
      const sql = `
        INSERT INTO productos (
          codigo_barras, codigo_interno, nombre_comercial, principio_activo, 
          presentacion, categoria_id, laboratorio, lote, fecha_vencimiento, 
          ubicacion, stock_actual, stock_minimo, stock_maximo, precio_compra, 
          precio_venta, margen_ganancia, requiere_receta, es_controlado, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        producto.codigo_barras, producto.codigo_interno, producto.nombre_comercial,
        producto.principio_activo, producto.presentacion, producto.categoria_id,
        producto.laboratorio, producto.lote, producto.fecha_vencimiento, producto.ubicacion,
        producto.stock_actual, producto.stock_minimo, producto.stock_maximo,
        producto.precio_compra, producto.precio_venta, producto.margen_ganancia,
        producto.requiere_receta ? 1 : 0, producto.es_controlado ? 1 : 0, producto.estado || 'activo'
      ];
      await this.db.execute(sql, params);
    }
    await this.cargarProductos(); // Recargar lista
  }

  async delete(id: number) {
    await this.db.execute("UPDATE productos SET estado = 'inactivo' WHERE id = ?", [id]);
    await this.cargarProductos();
  }

  async actualizarStock(productoId: number, cantidad: number, operacion: 'suma' | 'resta') {
    const sign = operacion === 'suma' ? '+' : '-';
    const sql = `UPDATE productos SET stock_actual = MAX(0, stock_actual ${sign} ?) WHERE id = ?`;
    await this.db.execute(sql, [cantidad, productoId]);
    await this.cargarProductos();
  }
}


