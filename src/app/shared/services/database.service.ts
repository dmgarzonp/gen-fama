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
            // Verificar si window.api está disponible (solo en Electron)
            if (typeof window !== 'undefined' && (window as any).api) {
                return await (window as any).api.dbQuery(sql, params) as T[];
            } else {
                console.warn('window.api no disponible - modo desarrollo sin Electron');
                return [];
            }
        } catch (error) {
            console.error('Error en DatabaseService.query:', error);
            throw error;
        }
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        try {
            // Verificar si window.api está disponible (solo en Electron)
            if (typeof window !== 'undefined' && (window as any).api) {
                await (window as any).api.dbExecute(sql, params);
            } else {
                console.warn('window.api no disponible - modo desarrollo sin Electron');
            }
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
