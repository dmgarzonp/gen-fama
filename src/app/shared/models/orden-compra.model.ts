export type EstadoOrden = 'borrador' | 'enviada' | 'confirmada' | 'recibida' | 'cancelada';

export interface OrdenCompra {
    id?: number;
    numero_orden: string; // OC-2024-001

    // Proveedor
    proveedor_id: number;
    proveedor_nombre: string;

    // Fechas
    fecha_creacion: string;
    fecha_envio?: string;
    fecha_estimada_entrega?: string;
    fecha_recepcion?: string;

    // Detalles
    items: DetalleOrdenCompra[];

    // Montos
    subtotal: number;
    descuento_tipo: 'percentage' | 'fixed' | null;
    descuento_valor: number;
    descuento_monto: number;
    impuestos: number;
    total: number;

    // Estado y seguimiento
    estado: EstadoOrden;
    observaciones?: string;
    motivo_cancelacion?: string;
    activo?: boolean | number;

    // Usuario
    creado_por: string;
    aprobado_por?: string;

    // Recepción
    recepcion_id?: number;
    recepcion_completa: boolean | number;
}

export interface DetalleOrdenCompra {
    id?: number;
    orden_id?: number;
    producto_id: number;
    codigo_producto: string;
    nombre_producto: string;

    cantidad_solicitada: number;
    cantidad_recibida: number;

    precio_unitario: number;
    descuento: number;
    subtotal: number;

    // Para verificación
    pendiente_recibir: number;
}
