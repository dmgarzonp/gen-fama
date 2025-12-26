export interface FarmaciaConfig {
    nombre: string;
    nit: string;
    direccion: string;
    telefono: string;
    email: string;
    ciudad: string;
    resolucionFacturacion?: string;
    logo?: string;
}

export interface VentasConfig {
    impuestoIva: number;
    descuentoMaximoVendedor: number;
    prefijoFactura: string;
    numeroFacturaInicial: number;
    permitirVentaSinStock: boolean;
}

export interface InventarioConfig {
    umbralStockBajo: number;
    mesesAlertaVencimiento: number;
    actualizarCostosAutomaticamente: boolean;
}

export interface GlobalConfig {
    farmacia: FarmaciaConfig;
    ventas: VentasConfig;
    inventario: InventarioConfig;
    lastUpdated: Date;
}
