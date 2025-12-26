export interface Proveedor {
    id?: number;
    nombre: string;
    razon_social: string;
    ruc: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    pais: string;

    // Condiciones comerciales
    dias_credito: number;
    descuento_habitual: number;
    monto_minimo_compra: number;

    // Métricas
    total_compras: number;
    ultima_compra?: string;
    calificacion: number; // 1-5 estrellas

    // Productos que suministra (JSON string en SQLite)
    productos_ofrecidos?: string | number[];

    // Estado
    activo: boolean | number;
    fecha_registro: string;
    notas?: string;
}
