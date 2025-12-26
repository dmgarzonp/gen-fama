import { Injectable, inject, signal, computed } from '@angular/core';
import { PosService } from '@features/pos/services/pos.service';
import { ProductosService } from '@features/products/services/productos.service';
import { ComprasService } from '@features/compras/services/compras.service';
import { ControladosService } from '@features/controlados/services/controlados.service';
import { Ticket } from '@shared/models/pos.model';

export interface KPIFinanciero {
    totalVentas: number;
    totalCostos: number;
    utilidadBruta: number;
    margenPromedio: number;
    ticketPromedio: number;
}

export interface VentasPorPeriodo {
    fecha: string;
    total: number;
}

export interface ProductoAbc {
    nombre: string;
    cantidadVendida: number;
    ingresosGenerados: number;
    participacionAcumulada: number;
    categoria: 'A' | 'B' | 'C';
}

@Injectable({
    providedIn: 'root'
})
export class ReportesService {
    private posService = inject(PosService);
    private productosService = inject(ProductosService);
    private comprasService = inject(ComprasService);
    private controladosService = inject(ControladosService); // Useful for regulatory reports

    // Note: Since we don't have a persistent historial of tickets in PosService currently exposed as a signal (it handles current ticket),
    // we might need to assume there's a standard way to get historical sales. 
    // Checking PosService... usually in these demos it only keeps session state or we added a history array?
    // Let's check if PosService has 'ventas' or 'historial'.
    // If not, I'll need to mockup data generation or access where tickets are saved.
    // Assuming for this MVP/Demo we might simulate historical data or use what's available.

    // MOCK DATA GENERATOR for demo purposes if real historical data is missing
    // In a real app, this would fetch from backend/database

    private readonly _ventasHistoricas = signal<Ticket[]>(this.generarVentasMock());

    // --- FINANCIAL REPORTS ---

    getKpisFinancieros(fechaInicio: Date, fechaFin: Date): KPIFinanciero {
        const ventas = this.filtrarVentasPorFecha(fechaInicio, fechaFin);

        const totalVentas = ventas.reduce((acc, v) => acc + v.total_neto, 0);
        // Costos simulation (assuming 30% margin avg for demo if cost not in ticket)
        // Ideally ticket lines have cost at moment of sale.
        const totalCostos = totalVentas * 0.7;
        const utilidadBruta = totalVentas - totalCostos;
        const margenPromedio = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0;
        const ticketPromedio = ventas.length > 0 ? totalVentas / ventas.length : 0;

        return {
            totalVentas,
            totalCostos,
            utilidadBruta,
            margenPromedio,
            ticketPromedio
        };
    }

    getVentasPorDia(fechaInicio: Date, fechaFin: Date): VentasPorPeriodo[] {
        const ventas = this.filtrarVentasPorFecha(fechaInicio, fechaFin);
        const map = new Map<string, number>();

        ventas.forEach(v => {
            const fechaStr = new Date(v.fecha).toISOString().split('T')[0];
            const current = map.get(fechaStr) || 0;
            map.set(fechaStr, current + v.total_neto);
        });

        return Array.from(map.entries())
            .map(([fecha, total]) => ({ fecha, total }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    getVentasPorMetodoPago(fechaInicio: Date, fechaFin: Date) {
        const ventas = this.filtrarVentasPorFecha(fechaInicio, fechaFin);
        const grupos: { [key: string]: number } = {};

        ventas.forEach(v => {
            const mp = v.metodo_pago || 'otros';
            grupos[mp] = (grupos[mp] || 0) + v.total_neto;
        });

        return grupos;
    }

    // --- OPERATIONAL REPORTS ---

    getAnalisisABC(): ProductoAbc[] {
        // Aggregate sales by product
        const productosVendidos = new Map<string, number>();
        const ventas = this._ventasHistoricas();
        let granTotal = 0;

        ventas.forEach(v => {
            v.lineas.forEach((l: { nombre: string; subtotal: number }) => {
                const current = productosVendidos.get(l.nombre) || 0;
                const monto = l.subtotal;
                productosVendidos.set(l.nombre, current + monto);
                granTotal += monto;
            });
        });

        // Convert to array and sort desc
        const sorted = Array.from(productosVendidos.entries())
            .map(([nombre, monto]) => ({ nombre, monto }))
            .sort((a, b) => b.monto - a.monto);

        // Calculate ABC
        let acumulado = 0;
        return sorted.map(item => {
            acumulado += item.monto;
            const participacion = (acumulado / granTotal) * 100;
            let categoria: 'A' | 'B' | 'C' = 'C';

            if (participacion <= 80) categoria = 'A';
            else if (participacion <= 95) categoria = 'B';

            return {
                nombre: item.nombre,
                cantidadVendida: 0, // Need to sum quantity too if needed
                ingresosGenerados: item.monto,
                participacionAcumulada: participacion,
                categoria
            };
        });
    }

    getProductosBajoStock() {
        return this.productosService.productos().filter(p => (p.stock_actual || 0) <= (p.stock_minimo || 0));
    }

    // --- HELPERS ---

    private filtrarVentasPorFecha(inicio: Date, fin: Date): Ticket[] {
        return this._ventasHistoricas().filter(v => {
            const f = new Date(v.fecha);
            return f >= inicio && f <= fin;
        });
    }

    private generarVentasMock(): Ticket[] {
        // Generate some dummy data for the last 30 days
        const mockVentas: Ticket[] = [];
        const hoy = new Date();
        const metodos = ['efectivo', 'tarjeta', 'transferencia', 'yape'];

        for (let i = 0; i < 50; i++) {
            const diasAtras = Math.floor(Math.random() * 30);
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - diasAtras);

            const total = Math.random() * 200 + 10;

            mockVentas.push({
                id: i,
                fecha: fecha.toISOString(),
                descuento_tipo: null,
                descuento_valor: 0,
                total_bruto: total, // For simplicity using total as brutto
                total_descuento: 0,
                total_neto: total,
                subtotal: total / 1.18,
                impuestos: total - (total / 1.18),
                lineas: [
                    { producto_id: 1, nombre: 'Paracetamol 500mg', cantidad: 2, precio_unitario: 5, subtotal: 10, requiere_receta: false, es_controlado: false },
                    { producto_id: 2, nombre: 'Amoxicilina 500mg', cantidad: 1, precio_unitario: 15, subtotal: 15, requiere_receta: true, es_controlado: false }
                ],
                metodo_pago: metodos[Math.floor(Math.random() * metodos.length)] as any,
                usuario_id: 1,
                cliente_id: 0,
                requiere_receta: false,
                total: total,
                recibido: total,
                cambio: 0
            });
        }
        return mockVentas;
    }
}
