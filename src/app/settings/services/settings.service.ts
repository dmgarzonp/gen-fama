import { Injectable, signal, computed, inject } from '@angular/core';
import { GlobalConfig } from '@shared/models/configuracion.model';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private db = inject(DatabaseService);

    // Configuración por defecto
    private defaultConfig: GlobalConfig = { ...this.fallbackConfig };

    private _config = signal<GlobalConfig>(this.fallbackConfig);

    // Exponer la configuración de forma reactiva
    config = this._config.asReadonly();

    constructor() {
        this.loadConfigFromDb();
    }

    private get fallbackConfig(): GlobalConfig {
        return {
            farmacia: {
                nombre: 'Farmacia Gen-farma',
                nit: '900.123.456-7',
                direccion: 'Calle Principal #123',
                telefono: '300 123 4567',
                email: 'contacto@genfarma.com',
                ciudad: 'Bogotá, Colombia',
                resolucionFacturacion: 'Resolución DIAN No. 123456789 de 2025'
            },
            ventas: {
                impuestoIva: 19,
                descuentoMaximoVendedor: 10,
                prefijoFactura: 'FE',
                numeroFacturaInicial: 1001,
                permitirVentaSinStock: false
            },
            inventario: {
                umbralStockBajo: 10,
                mesesAlertaVencimiento: 4,
                actualizarCostosAutomaticamente: true
            },
            lastUpdated: new Date()
        };
    }

    // Selectores computados para acceso rápido
    farmacia = computed(() => this._config().farmacia);
    ventas = computed(() => this._config().ventas);
    inventario = computed(() => this._config().inventario);

    private async loadConfigFromDb() {
        try {
            const results = await this.db.query<{ clave: string, valor: string }>('SELECT * FROM configuracion');
            if (results.length > 0) {
                // Mapear resultados de la BD al objeto GlobalConfig
                // Por ahora usamos un mapeo simplificado o guardamos el JSON en una clave
                const configJson = results.find((r: any) => r.clave === 'global_config')?.valor;
                if (configJson) {
                    this._config.set(JSON.parse(configJson));
                }
            }
        } catch (error) {
            console.error('Error al cargar configuración desde BD:', error);
        }
    }

    async updateConfig(newConfig: GlobalConfig) {
        newConfig.lastUpdated = new Date();
        this._config.set(newConfig);
        await this.db.execute(
            'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)',
            ['global_config', JSON.stringify(newConfig)]
        );
    }

    resetToDefaults() {
        this.updateConfig(this.defaultConfig);
    }
}
