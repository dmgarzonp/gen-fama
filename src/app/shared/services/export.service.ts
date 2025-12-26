import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() { }

    /**
     * Exporta datos a un archivo Excel (.xlsx)
     * @param data Array de objetos con los datos a exportar
     * @param fileName Nombre del archivo sin extensión
     * @param sheetName Nombre de la hoja de cálculo
     */
    exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos'): void {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    /**
     * Exporta datos a un archivo PDF con tabla
     * @param headers Array de strings con los encabezados de columna
     * @param data Array de arrays con los datos de las filas (debe coincidir el orden con headers)
     * @param fileName Nombre del archivo sin extensión
     * @param title Título del reporte en el PDF
     */
    exportToPdf(headers: string[], data: any[], fileName: string, title: string): void {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

        const tableOptions: UserOptions = {
            head: [headers],
            body: data,
            startY: 35,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [16, 185, 129] } // Emerald-500 match
        };

        autoTable(doc, tableOptions);

        doc.save(`${fileName}.pdf`);
    }
}
