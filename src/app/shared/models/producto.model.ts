export interface Producto {
  id?: number;
  codigo_barras?: string;
  codigo_interno?: string;
  nombre_comercial: string;
  principio_activo?: string;
  presentacion?: string;
  categoria_id?: number;
  categoria?: string;
  laboratorio?: string;
  lote?: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
  stock_actual?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  precio_compra: number;
  precio_venta: number;
  margen_ganancia?: number;
  requiere_receta?: boolean | number;
  es_controlado?: boolean | number;
  estado?: string;
}
