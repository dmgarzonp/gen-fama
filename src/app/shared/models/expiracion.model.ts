export type EstadoVencimiento = 'vencido' | 'critico' | 'advertencia' | 'normal';

export interface ProductoVencimiento {
    id: number;
    nombre: string;
    presentacion: string;
    lote: string;
    fechaVencimiento: Date | string;
    diasRestantes: number;
    cantidad: number;
    valorTotal: number;
    proveedor: string;
    estado: EstadoVencimiento;
    producto_id?: number;
}





