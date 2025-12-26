export interface HistorialPrecio {
    id: number;
    productoId: number;
    proveedorId: number;

    precioCompra: number;
    cantidad: number;
    descuento: number;
    precioFinal: number;

    fecha: Date;
    ordenCompraId: number;

    // Para análisis
    precioUnitarioNeto: number; // precio final / cantidad
}

export interface AnalisisPrecio {
    productoId: number;
    nombreProducto: string;

    precioActual: number;
    precioPromedio: number;
    precioMinimo: number;
    precioMaximo: number;

    mejorProveedor: {
        id: number;
        nombre: string;
        precio: number;
        fecha: Date;
    };

    tendencia: 'subiendo' | 'bajando' | 'estable';
    variacionPorcentaje: number;

    historial: HistorialPrecio[];
}
