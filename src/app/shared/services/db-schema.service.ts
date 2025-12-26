import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class DbSchemaService {

  constructor(private db: DatabaseService) { }

  async initSchema() {
    console.log('Inicializando esquema de base de datos...');

    // Tabla de Usuarios
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        ultima_sesion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Categorías
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        descripcion TEXT,
        activo INTEGER DEFAULT 1
      )
    `);

    // Tabla de Productos
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_barras TEXT UNIQUE,
        codigo_interno TEXT,
        nombre_comercial TEXT NOT NULL,
        principio_activo TEXT,
        presentacion TEXT,
        categoria_id INTEGER,
        laboratorio TEXT,
        lote TEXT,
        fecha_vencimiento TEXT,
        ubicacion TEXT,
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 5,
        stock_maximo INTEGER DEFAULT 100,
        precio_compra REAL NOT NULL,
        precio_venta REAL NOT NULL,
        margen_ganancia REAL,
        requiere_receta INTEGER DEFAULT 0,
        es_controlado INTEGER DEFAULT 0,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      )
    `);

    // Tabla de Proveedores
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        razon_social TEXT,
        ruc TEXT,
        contacto TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        ciudad TEXT,
        pais TEXT,
        dias_credito INTEGER DEFAULT 0,
        descuento_habitual REAL DEFAULT 0,
        monto_minimo_compra REAL DEFAULT 0,
        total_compras REAL DEFAULT 0,
        ultima_compra TEXT,
        calificacion REAL DEFAULT 0,
        productos_ofrecidos TEXT,
        activo INTEGER DEFAULT 1,
        fecha_registro TEXT,
        notas TEXT
      )
    `);

    // Tabla de Ventas
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        metodo_pago TEXT,
        impuesto REAL,
        descuento REAL DEFAULT 0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Detalle de Ventas
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS detalles_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Logs de Auditoría
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        tabla TEXT,
        registro_id INTEGER,
        detalles TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla de Ordenes de Compra
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ordenes_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_orden TEXT UNIQUE NOT NULL,
        proveedor_id INTEGER,
        fecha_creacion TEXT NOT NULL,
        fecha_envio TEXT,
        fecha_estimada_entrega TEXT,
        fecha_recepcion TEXT,
        subtotal REAL NOT NULL,
        descuento_tipo TEXT,
        descuento_valor REAL,
        descuento_monto REAL,
        impuestos REAL,
        total REAL NOT NULL,
        estado TEXT NOT NULL,
        observaciones TEXT,
        creado_por TEXT,
        aprobado_por TEXT,
        recepcion_id INTEGER,
        recepcion_completa INTEGER DEFAULT 0,
        motivo_cancelacion TEXT,
        activo INTEGER DEFAULT 1,
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
      )
    `);

    // Detalle de Ordenes de Compra
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS detalles_orden_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orden_id INTEGER,
        producto_id INTEGER,
        cantidad_solicitada INTEGER NOT NULL,
        cantidad_recibida INTEGER DEFAULT 0,
        precio_unitario REAL NOT NULL,
        descuento REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        pendiente_recibir INTEGER,
        FOREIGN KEY (orden_id) REFERENCES ordenes_compra(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Tabla de Recepciones
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS recepciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orden_compra_id INTEGER,
        numero_recepcion TEXT UNIQUE NOT NULL,
        fecha_recepcion TEXT NOT NULL,
        recibido_por TEXT,
        tiene_diferencias INTEGER DEFAULT 0,
        verificado INTEGER DEFAULT 1,
        inventario_actualizado INTEGER DEFAULT 0,
        observaciones TEXT,
        nro_autorizacion TEXT,
        FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id)
      )
    `);

    // ítems de Recepción
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS items_recepcion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recepcion_id INTEGER,
        producto_id INTEGER,
        cantidad_esperada INTEGER,
        cantidad_recibida INTEGER,
        estado_producto TEXT,
        FOREIGN KEY (recepcion_id) REFERENCES recepciones(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Lotes Recibidos
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS lotes_recepcion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_recepcion_id INTEGER,
        numero_lote TEXT NOT NULL,
        fecha_vencimiento TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        ubicacion_almacen TEXT,
        FOREIGN KEY (item_recepcion_id) REFERENCES items_recepcion(id)
      )
    `);

    // Movimientos de Medicamentos Controlados (Psicotrópicos/Estupefacientes)
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS movimientos_controlados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        producto_id INTEGER,
        nombre_producto TEXT,
        tipo_movimiento TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        saldo_anterior INTEGER NOT NULL,
        saldo_actual INTEGER NOT NULL,
        documento_referencia TEXT,
        lote TEXT,
        fecha_vencimiento TEXT,
        nro_autorizacion TEXT,
        proveedor_id INTEGER,
        proveedor_nombre TEXT,
        receta_data TEXT, -- JSON string
        responsable_id TEXT,
        responsable_nombre TEXT,
        firma_digital_hash TEXT,
        observaciones TEXT,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Tabla de Clientes
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_completo TEXT NOT NULL,
        identificacion TEXT UNIQUE NOT NULL,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        fecha_nacimiento TEXT,
        alergias TEXT,
        enfermedades_cronicas TEXT,
        tipo TEXT,
        limite_credito REAL DEFAULT 0,
        saldo_pendiente REAL DEFAULT 0,
        puntos INTEGER DEFAULT 0,
        compras INTEGER DEFAULT 0,
        recetas INTEGER DEFAULT 0,
        productos_frecuentes TEXT, -- JSON string
        fecha_registro TEXT,
        estado TEXT DEFAULT 'activo'
      )
    `);

    // Tabla de Ventas
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        cliente_id INTEGER,
        usuario_id TEXT,
        subtotal REAL NOT NULL,
        impuestos REAL NOT NULL,
        descuento_tipo TEXT,
        descuento_valor REAL DEFAULT 0,
        total_descuento REAL DEFAULT 0,
        total_bruto REAL NOT NULL,
        total_neto REAL NOT NULL,
        metodo_pago TEXT NOT NULL,
        recibido REAL DEFAULT 0,
        cambio REAL DEFAULT 0,
        requiere_receta INTEGER DEFAULT 0,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // ítems de Venta
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS detalles_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Configuración
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      )
    `);

    console.log('Esquema de base de datos inicializado con éxito.');
  }
}
