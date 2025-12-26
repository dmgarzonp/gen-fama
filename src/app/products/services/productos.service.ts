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

  async cargarProductos(estado?: string) {
    try {
      let sql = `
        SELECT p.*, c.nombre as categoria 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
      `;
      const params: any[] = [];
      
      if (estado) {
        sql += ` WHERE p.estado = ?`;
        params.push(estado);
      } else {
        // Por defecto, cargar todos (activos e inactivos)
        sql += ` WHERE 1=1`;
      }
      
      const results = await this.db.query<any>(sql, params);
      // Mapear categoria_nombre a categoria y convertir booleanos
      const productos: Producto[] = results.map((r: any) => ({
        ...r,
        categoria: r.categoria || null,
        requiere_receta: r.requiere_receta === 1 || r.requiere_receta === true,
        es_controlado: r.es_controlado === 1 || r.es_controlado === true,
      }));
      this._productos.set(productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  async getById(id: number): Promise<Producto | undefined> {
    const sql = 'SELECT * FROM productos WHERE id = ?';
    const results = await this.db.query<Producto>(sql, [id]);
    return results[0];
  }

  async upsert(producto: Producto): Promise<void> {
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

  async delete(id: number): Promise<void> {
    await this.db.execute("UPDATE productos SET estado = 'inactivo' WHERE id = ?", [id]);
    await this.cargarProductos();
  }

  async actualizarStock(productoId: number, cantidad: number, operacion: 'suma' | 'resta'): Promise<void> {
    const sign = operacion === 'suma' ? '+' : '-';
    const sql = `UPDATE productos SET stock_actual = MAX(0, stock_actual ${sign} ?) WHERE id = ?`;
    await this.db.execute(sql, [cantidad, productoId]);
    await this.cargarProductos();
  }
}


