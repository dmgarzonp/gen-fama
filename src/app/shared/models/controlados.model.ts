export type TipoMovimientoControlado = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface MovimientoControlado {
    id: number;
    fecha: string;
    producto_id: number;
    nombre_producto: string; // Para display rápido

    tipo_movimiento: TipoMovimientoControlado;

    cantidad: number;
    saldo_anterior: number;
    saldo_actual: number;

    // Datos del Documento Fuente
    documento_referencia: string; // Nro Factura (Entrada) o Nro Boleta (Salida)
    lote: string;
    fecha_vencimiento?: string;

    // Datos Específicos de Entrada
    nro_autorizacion?: string; // Guía especial de psicotrópicos a la Droguería
    proveedor_id?: number;
    proveedor_nombre?: string;

    // Datos Específicos de Salida (Receta)
    receta_data?: {
        medico_nombre: string;
        medico_colegiatura: string;
        paciente_nombre: string;
        paciente_dni: string;
        nro_receta: string;
        tipo_receta: 'retenida' | 'especial'; // Receta común retenida o Receta Especial para Estupefacientes
    };

    // Auditoría y Seguridad
    responsable_id: string; // ID del Q.F.
    responsable_nombre: string;
    firma_digital_hash: string; // Hash SHA-256 de la transacción para integridad

    observaciones?: string;
}

export interface BalanceControlado {
    producto_id: number;
    nombre_producto: string;
    saldo_actual: number;
    ultimo_movimiento?: string;
}
