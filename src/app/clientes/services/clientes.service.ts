import { Injectable, signal } from '@angular/core';
import { Cliente } from '@shared/models/cliente.model';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseRepository<Cliente> {
  protected override tableName = 'clientes';
  private readonly _clientes = signal<Cliente[]>([]);
  clientes = this._clientes.asReadonly();

  constructor() {
    super();
    this.cargarClientes();
  }

  async cargarClientes() {
    try {
      const results = await this.getAll("estado = 'activo'");
      const mapped = results.map(c => ({
        ...c,
        productos_frecuentes: typeof c.productos_frecuentes === 'string'
          ? JSON.parse(c.productos_frecuentes)
          : c.productos_frecuentes
      }));
      this._clientes.set(mapped);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  override async getById(id: number): Promise<Cliente | undefined> {
    const cliente = await super.getById(id);
    if (cliente && typeof cliente.productos_frecuentes === 'string') {
      cliente.productos_frecuentes = JSON.parse(cliente.productos_frecuentes);
    }
    return cliente;
  }

  async upsert(cliente: Cliente) {
    const sql = cliente.id
      ? `UPDATE clientes SET 
                nombre_completo = ?, identificacion = ?, telefono = ?, 
                email = ?, direccion = ?, fecha_nacimiento = ?, 
                alergias = ?, enfermedades_cronicas = ?, tipo = ?, 
                limite_credito = ?, saldo_pendiente = ?, puntos = ?, 
                compras = ?, recetas = ?, productos_frecuentes = ?, 
                fecha_registro = ?, estado = ? 
               WHERE id = ?`
      : `INSERT INTO clientes (
                nombre_completo, identificacion, telefono, email, 
                direccion, fecha_nacimiento, alergias, enfermedades_cronicas, 
                tipo, limite_credito, saldo_pendiente, puntos, compras, 
                recetas, productos_frecuentes, fecha_registro, estado
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      cliente.nombre_completo, cliente.identificacion, cliente.telefono,
      cliente.email, cliente.direccion, cliente.fecha_nacimiento,
      cliente.alergias, cliente.enfermedades_cronicas, cliente.tipo,
      cliente.limite_credito, cliente.saldo_pendiente, cliente.puntos,
      cliente.compras, cliente.recetas,
      JSON.stringify(cliente.productos_frecuentes || []),
      cliente.fecha_registro || new Date().toISOString().split('T')[0],
      cliente.estado || 'activo'
    ];

    if (cliente.id) params.push(cliente.id);

    await this.db.execute(sql, params);
    await this.cargarClientes();
  }

  override async delete(id: number) {
    await this.db.execute("UPDATE clientes SET estado = 'inactivo' WHERE id = ?", [id]);
    await this.cargarClientes();
  }
}
