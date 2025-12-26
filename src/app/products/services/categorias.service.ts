import { Injectable, signal } from '@angular/core';
import { BaseRepository } from '@shared/repositories/base.repository';
import { Categoria } from '@shared/models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService extends BaseRepository<Categoria> {
    protected override tableName = 'categorias';
    private readonly _categorias = signal<Categoria[]>([]);
    categorias = this._categorias.asReadonly();

    constructor() {
        super();
        this.cargarCategorias();
    }

    async cargarCategorias() {
        try {
            const results = await this.getAll();
            const mapped = results.map(c => ({
                ...c,
                activo: c.activo === 1
            }));
            this._categorias.set(mapped);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    async upsert(categoria: Categoria) {
        if (categoria.id) {
            const sql = 'UPDATE categorias SET nombre = ?, descripcion = ?, activo = ? WHERE id = ?';
            await this.db.execute(sql, [
                categoria.nombre,
                categoria.descripcion,
                categoria.activo ? 1 : 0,
                categoria.id
            ]);
        } else {
            const sql = 'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, ?)';
            await this.db.execute(sql, [
                categoria.nombre,
                categoria.descripcion,
                categoria.activo ? 1 : 0
            ]);
        }
        await this.cargarCategorias();
    }

    // El delete es lógico por defecto en la base?
    // Según db-schema tiene campo activo.
    override async delete(id: number) {
        await this.db.execute('UPDATE categorias SET activo = 0 WHERE id = ?', [id]);
        await this.cargarCategorias();
    }
}
