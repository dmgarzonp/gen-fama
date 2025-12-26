import { inject } from '@angular/core';
import { DatabaseService } from '../services/database.service';

export abstract class BaseRepository<T> {
    protected db = inject(DatabaseService);
    protected abstract tableName: string;

    async getAll(where: string = '1=1', params: any[] = []): Promise<T[]> {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${where}`;
        return await this.db.query<T>(sql, params);
    }

    async getById(id: number | string): Promise<T | undefined> {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await this.db.query<T>(sql, [id]);
        return results[0];
    }

    async delete(id: number | string): Promise<void> {
        const sql = `UPDATE ${this.tableName} SET activo = 0 WHERE id = ?`;
        await this.db.execute(sql, [id]);
    }

    async hardDelete(id: number | string): Promise<void> {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await this.db.execute(sql, [id]);
    }
}
