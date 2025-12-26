export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';

export interface LineaTicket {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  requiere_receta?: boolean;
  es_controlado?: boolean;
}

export interface DetallesTarjeta {
  tipo?: 'debito' | 'credito';
  ultimos_digitos?: string;
  numero_autorizacion?: string;
  cuotas?: number;
}

export interface DetallesTransferencia {
  numero_referencia?: string;
  banco_origen?: string;
  fecha_transferencia?: string;
}

export interface DetallesCredito {
  fecha_vencimiento?: string;
  cuotas?: number;
}

export interface Ticket {
  id?: number;
  fecha: string;
  cliente_id?: number;
  usuario_id?: number;
  lineas: LineaTicket[];
  descuento_tipo?: 'percentage' | 'fixed' | null;
  descuento_valor?: number;
  subtotal: number;
  impuestos: number;
  total_bruto: number;
  total_descuento: number;
  total_neto: number;
  total: number;
  requiere_receta: boolean;
  metodo_pago: MetodoPago;
  recibido: number;
  cambio: number;
  detalles_tarjeta?: DetallesTarjeta;
  detalles_transferencia?: DetallesTransferencia;
  detalles_credito?: DetallesCredito;
}
