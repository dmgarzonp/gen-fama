import { Injectable, signal, computed, inject } from '@angular/core';
import { MovimientoControlado, BalanceControlado, TipoMovimientoControlado } from '@shared/models/controlados.model';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class ControladosService {
    private db = inject(DatabaseService);

    private readonly _movimientos = signal<MovimientoControlado[]>([]);
    movimientos = this._movimientos.asReadonly();

    constructor() {
        this.cargarMovimientos();
    }

    async cargarMovimientos() {
        try {
            const results = await this.db.query<any>('SELECT * FROM movimientos_controlados ORDER BY fecha ASC');
            const mapped = results.map(row => ({
                ...row,
                receta_data: row.receta_data ? JSON.parse(row.receta_data) : undefined
            }));
            this._movimientos.set(mapped);
        } catch (error) {
            console.error('Error al cargar movimientos controlados:', error);
        }
    }

    // Balances caculados en tiempo real
    balances = computed(() => {
        const movs = this._movimientos();
        const map = new Map<number, BalanceControlado>();

        movs.forEach(m => {
            if (!map.has(m.producto_id)) {
                map.set(m.producto_id, {
                    producto_id: m.producto_id,
                    nombre_producto: m.nombre_producto,
                    saldo_actual: 0,
                    ultimo_movimiento: undefined
                });
            }

            const balance = map.get(m.producto_id)!;
            balance.saldo_actual = m.saldo_actual;
            balance.ultimo_movimiento = m.fecha;
        });

        return Array.from(map.values());
    });

    getBalanceProducto(producto_id: number): number {
        const balance = this.balances().find(b => b.producto_id === producto_id);
        return balance ? balance.saldo_actual : 0;
    }

    async registrarMovimiento(
        nuevoMovimiento: Omit<MovimientoControlado, 'id' | 'saldo_anterior' | 'saldo_actual' | 'firma_digital_hash'>
    ): Promise<MovimientoControlado> {

        const saldo_anterior = this.getBalanceProducto(nuevoMovimiento.producto_id);
        let saldo_actual = saldo_anterior;

        if (nuevoMovimiento.tipo_movimiento === 'ENTRADA') {
            saldo_actual += nuevoMovimiento.cantidad;
        } else {
            saldo_actual -= nuevoMovimiento.cantidad;
        }

        if (saldo_actual < 0) {
            throw new Error(`Saldo insuficiente para medicamentos controlados. Saldo actual: ${saldo_anterior}, Intento de retiro: ${nuevoMovimiento.cantidad}`);
        }

        // Generación de Hash simple (Simulación de Firma Digital)
        const dataString = `${nuevoMovimiento.fecha}|${nuevoMovimiento.producto_id}|${nuevoMovimiento.tipo_movimiento}|${nuevoMovimiento.cantidad}|${saldo_actual}|${nuevoMovimiento.responsable_id}`;
        const firma_digital_hash = this.generarHash(dataString);

        const sql = `
            INSERT INTO movimientos_controlados (
                fecha, producto_id, nombre_producto, tipo_movimiento,
                cantidad, saldo_anterior, saldo_actual, documento_referencia,
                lote, fecha_vencimiento, nro_autorizacion, proveedor_id,
                proveedor_nombre, receta_data, responsable_id, responsable_nombre,
                firma_digital_hash, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            nuevoMovimiento.fecha, nuevoMovimiento.producto_id,
            nuevoMovimiento.nombre_producto, nuevoMovimiento.tipo_movimiento,
            nuevoMovimiento.cantidad, saldo_anterior, saldo_actual,
            nuevoMovimiento.documento_referencia, nuevoMovimiento.lote,
            nuevoMovimiento.fecha_vencimiento, nuevoMovimiento.nro_autorizacion,
            nuevoMovimiento.proveedor_id, nuevoMovimiento.proveedor_nombre,
            nuevoMovimiento.receta_data ? JSON.stringify(nuevoMovimiento.receta_data) : null,
            nuevoMovimiento.responsable_id, nuevoMovimiento.responsable_nombre,
            firma_digital_hash, nuevoMovimiento.observaciones
        ];

        await this.db.execute(sql, params);
        await this.cargarMovimientos();

        const lastResults = await this._movimientos();
        return lastResults[lastResults.length - 1];
    }

    private generarHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'SIG-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    }

    async registrarEntrada(
        producto_id: number,
        nombre_producto: string,
        cantidad: number,
        lote: string,
        vencimiento: string,
        doc_referencia: string,
        proveedor_id: number,
        proveedor_nombre: string,
        nro_autorizacion: string,
        responsable: string
    ) {
        return this.registrarMovimiento({
            fecha: new Date().toISOString(),
            producto_id,
            nombre_producto,
            tipo_movimiento: 'ENTRADA',
            cantidad,
            documento_referencia: doc_referencia,
            lote,
            fecha_vencimiento: vencimiento,
            proveedor_id,
            proveedor_nombre,
            nro_autorizacion,
            responsable_id: responsable,
            responsable_nombre: responsable
        });
    }

    async registrarSalida(
        producto_id: number,
        nombre_producto: string,
        cantidad: number,
        lote: string,
        doc_referencia: string,
        receta: any,
        responsable: string
    ) {
        return this.registrarMovimiento({
            fecha: new Date().toISOString(),
            producto_id,
            nombre_producto,
            tipo_movimiento: 'SALIDA',
            cantidad,
            documento_referencia: doc_referencia,
            lote,
            receta_data: receta,
            responsable_id: responsable,
            responsable_nombre: responsable
        });
    }
}
