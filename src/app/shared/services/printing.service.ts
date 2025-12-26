import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class PrintingService {

    constructor() { }

    /**
     * Genera un ticket de venta en PDF optimizado para impresora térmica
     * @param data Datos de la venta (productos, total, etc.)
     * @param paperWidth Ancho del papel (58 o 80)
     */
    async generateSaleTicket(data: any, paperWidth: 58 | 80 = 80) {
        const doc = new jsPDF({
            unit: 'mm',
            format: [paperWidth, 200] // Altura ajustable
        });

        const margin = 5;
        const width = paperWidth - (margin * 2);
        let y = 10;

        // Header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('GEN-FARMA', paperWidth / 2, y, { align: 'center' });

        y += 5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('NIT: 900.123.456-1', paperWidth / 2, y, { align: 'center' });

        y += 4;
        doc.text('Dirección: Calle Falsa 123', paperWidth / 2, y, { align: 'center' });

        y += 4;
        doc.text('Tel: 6012345678', paperWidth / 2, y, { align: 'center' });

        y += 6;
        doc.line(margin, y, paperWidth - margin, y);

        y += 5;
        doc.text(`Ticket: # ${data.id?.toString().padStart(6, '0')}`, margin, y);
        y += 4;
        doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, y);
        y += 4;
        doc.text(`Vendedor: ${data.vendedor || 'Sistema'}`, margin, y);

        y += 4;
        doc.line(margin, y, paperWidth - margin, y);

        // Productos
        y += 2;
        // @ts-ignore
        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            body: data.productos.map((p: any) => [
                p.nombre,
                p.cantidad,
                `$${p.precio_venta.toLocaleString()}`,
                `$${(p.cantidad * p.precio_venta).toLocaleString()}`
            ]),
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 0.5 },
            columnStyles: {
                0: { cellWidth: width * 0.4 },
                1: { cellWidth: width * 0.1, halign: 'center' },
                2: { cellWidth: width * 0.25, halign: 'right' },
                3: { cellWidth: width * 0.25, halign: 'right' }
            }
        });

        // @ts-ignore
        y = (doc as any).lastAutoTable.finalY + 5;

        // Totales
        doc.line(margin, y, paperWidth - margin, y);
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', margin, y);
        doc.text(`$${data.total.toLocaleString()}`, paperWidth - margin, y, { align: 'right' });

        y += 8;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('¡Gracias por su compra!', paperWidth / 2, y, { align: 'center' });

        // Guardar o Previsualizar
        doc.save(`ticket_${data.id}.pdf`);
    }

    /**
     * Genera etiquetas con códigos de barras
     */
    async generateBarcodeLabels(productos: any[]) {
        // Lógica similar usando jsPDF y una librería de códigos de barras si es necesario
        console.log('Generando etiquetas para:', productos.length, 'productos');
    }
}
