import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@shared/services/database.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private db = inject(DatabaseService);

    async generateInventoryReport() {
        const doc = new jsPDF();
        const productos = await this.db.query('SELECT p.*, c.nombre as categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id');

        doc.setFontSize(18);
        doc.text('Reporte de Inventario - Gen-farma', 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [['Código', 'Producto', 'Categoría', 'Stock', 'P. Venta']],
            body: productos.map((p: any) => [
                p.codigo_barras || 'N/A',
                p.nombre,
                p.categoria || 'Sin Cat.',
                p.stock,
                `$${p.precio_venta.toLocaleString()}`
            ]),
        });

        doc.save('reporte_inventario.pdf');
    }

    async generateSalesReport(startDate: string, endDate: string) {
        const doc = new jsPDF();
        const ventas = await this.db.query(
            'SELECT v.*, u.username FROM ventas v LEFT JOIN usuarios u ON v.usuario_id = u.id WHERE date(fecha) BETWEEN ? AND ?',
            [startDate, endDate]
        );

        doc.setFontSize(18);
        doc.text('Reporte de Ventas', 14, 22);
        doc.setFontSize(11);
        doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [['ID', 'Fecha', 'Usuario', 'Total']],
            body: ventas.map((v: any) => [
                v.id,
                new Date(v.fecha).toLocaleString(),
                v.username,
                `$${v.total.toLocaleString()}`
            ]),
        });

        doc.save(`reporte_ventas_${startDate}_${endDate}.pdf`);
    }
}
