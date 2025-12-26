import { Injectable } from '@angular/core';
import { PreloadApi } from '../../../../electron/preload';

declare const window: PreloadApi;

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    constructor() { }

    async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        try {
            return await window.api.dbQuery(sql, params) as T[];
        } catch (error) {
            console.error('Error en DatabaseService.query:', error);
            throw error;
        }
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        try {
            await window.api.dbExecute(sql, params);
        } catch (error) {
            console.error('Error en DatabaseService.execute:', error);
            throw error;
        }
    }

    async export(): Promise<boolean> {
        return await window.api.dbExport();
    }

    async import(): Promise<boolean> {
        return await window.api.dbImport();
    }

    async hash(text: string): Promise<string> {
        return await window.api.dbHash(text);
    }
}
