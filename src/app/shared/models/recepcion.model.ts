export interface RecepcionMercancia {
    id?: number;
    orden_compra_id: number;
    numero_recepcion: string; // REC-2024-001

    fecha_recepcion: string;
    recibido_por: string;

    // Productos recibidos
    items: ItemRecepcion[];

    // Diferencias
    diferencias: DiferenciaRecepcion[];
    tiene_diferencias: boolean | number;

    // Estado
    verificado: boolean | number;
    inventario_actualizado: boolean | number;

    observaciones?: string;

    // Controlados
    nro_autorizacion?: string; // Para medicamentos controlados
}

export interface ItemRecepcion {
    id?: number;
    recepcion_id?: number;
    producto_id: number;
    nombre_producto: string;

    cantidad_esperada: number;
    cantidad_recibida: number;

    // Control de calidad
    estado_producto: 'bueno' | 'dañado' | 'vencido';

    // Lotes
    lotes: LoteRecibido[];
}

export interface LoteRecibido {
    id?: number;
    item_recepcion_id?: number;
    numero_lote: string;
    fecha_vencimiento: string;
    cantidad: number;
    ubicacion_almacen: string;
}

export interface DiferenciaRecepcion {
    producto_id: number;
    nombre_producto: string;
    tipo: 'faltante' | 'sobrante' | 'dañado';
    cantidad_esperada: number;
    cantidad_recibida: number;
    diferencia: number;
    motivo?: string;
    accion_tomada?: string;
}
