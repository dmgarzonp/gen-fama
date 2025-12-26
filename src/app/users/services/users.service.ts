import { Injectable, signal, inject } from '@angular/core';
import { Usuario, Role } from '@shared/models/usuario.model';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private db = inject(DatabaseService);
    private _users = signal<Usuario[]>([]);

    constructor() {
        this.cargarUsuarios();
    }

    async cargarUsuarios() {
        try {
            const results = await this.db.query<any>('SELECT * FROM usuarios');
            // Mapear SQLite (0/1) a Boolean
            const mapped = results.map(u => ({
                ...u,
                activo: u.activo === 1
            }));
            this._users.set(mapped);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    getUsers() {
        return this._users.asReadonly();
    }

    async getUserById(id: number): Promise<Usuario | undefined> {
        const results = await this.db.query<any>('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (results.length > 0) {
            return {
                ...results[0],
                activo: results[0].activo === 1
            } as Usuario;
        }
        return undefined;
    }

    async saveUser(user: Partial<Usuario>) {
        if (user.id) {
            // Edit
            const sql = 'UPDATE usuarios SET username = ?, nombre = ?, role = ?, password = ? WHERE id = ?';
            await this.db.execute(sql, [user.username, user.nombre, user.role, user.password, user.id]);
        } else {
            // New
            const sql = 'INSERT INTO usuarios (username, nombre, role, password, activo) VALUES (?, ?, ?, ?, 1)';
            await this.db.execute(sql, [user.username, user.nombre, user.role, user.password || '1234']);
        }
        await this.cargarUsuarios();
    }

    async toggleStatus(id: number) {
        const user = await this.getUserById(id);
        if (user) {
            const newStatus = user.activo ? 0 : 1;
            await this.db.execute('UPDATE usuarios SET activo = ? WHERE id = ?', [newStatus, id]);
            await this.cargarUsuarios();
        }
    }
}
