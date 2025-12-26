import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
    providedIn: 'root'
})
export class DbSeederService {

    constructor(private db: DatabaseService) { }

    async seedData() {
        // Verificar si ya hay datos
        const users = await this.db.query('SELECT count(*) as count FROM usuarios');
        if ((users[0] as any).count > 0) {
            console.log('La base de datos ya contiene datos. Omitiendo sembrado.');
            return;
        }

        console.log('Sembrando datos iniciales...');

        // 1. Usuarios
        await this.db.execute(`
      INSERT INTO usuarios (username, nombre, password, role, activo) VALUES 
      ('admin', 'Administrador Principal', 'admin', 'admin', 1),
      ('farma', 'Juan Farmacéutico', 'farma', 'farmaceutico', 1),
      ('auxiliar', 'Maria Auxiliar', 'user', 'auxiliar', 1),
      ('cajero', 'Carlos Cajero', 'user', 'cajero', 1)
    `);

        // 2. Categorías
        await this.db.execute(`
      INSERT INTO categorias (nombre, descripcion) VALUES 
      ('Analgésicos', 'Medicamentos para el dolor'),
      ('Antibióticos', 'Medicamentos para infecciones bacterianas'),
      ('Antiinflamatorios', 'Reducen la inflamación'),
      ('Vitaminas', 'Suplementos vitamínicos'),
      ('Cuidado Heroico', 'Productos de primeros auxilios'),
      ('Dermatológicos', 'Cuidado de la piel')
    `);

        // 3. Proveedores
        await this.db.execute(`
      INSERT INTO proveedores (
        nombre, razon_social, ruc, contacto, telefono, email, direccion, ciudad, pais,
        dias_credito, descuento_habitual, monto_minimo_compra, total_compras, calificacion,
        activo, fecha_registro
      ) VALUES 
      ('LabFarma', 'Laboratorios Farmacéuticos S.A.', '20123456789', 'Juan Pérez', '+51 999 888 777', 'ventas@labfarma.com', 'Av. Industrial 123', 'Lima', 'Perú', 30, 5, 1000, 45000, 4.5, 1, '2024-01-15'),
      ('MediCorp', 'MediCorp Distribuidora S.A.C.', '20987654321', 'María García', '+51 988 777 666', 'contacto@medicorp.com', 'Jr. Comercio 456', 'Lima', 'Perú', 45, 7, 1500, 32000, 4.2, 1, '2024-02-20'),
      ('BioLab', 'BioLab Importaciones E.I.R.L.', '20456789123', 'Carlos Rodríguez', '+51 977 666 555', 'ventas@biolab.pe', 'Av. Universitaria 789', 'Lima', 'Perú', 15, 3, 800, 28000, 4.0, 1, '2024-03-10')
    `);

        // 4. Productos (50+)
        const productos = [
            ['7701234567890', 'INT-001', 'Acetaminofén 500mg', 'Acetaminofén', 'Caja x 100 tabletas', 1, 'Genfar', 'L12345', '2026-12-31', 'Estante A1', 50, 10, 200, 15000, 25000, 66.6, 0, 0, 'activo'],
            ['7701234567891', 'INT-002', 'Ibuprofeno 400mg', 'Ibuprofeno', 'Caja x 50 cápsulas', 1, 'MK', 'L67890', '2025-10-15', 'Estante A2', 30, 5, 100, 10000, 18000, 80, 0, 0, 'activo'],
            ['7701234567892', 'INT-003', 'Amoxicilina 500mg', 'Amoxicilina', 'Caja x 30 tabletas', 2, 'La Santé', 'L11223', '2025-05-20', 'Estante B1', 20, 5, 50, 25000, 45000, 80, 1, 0, 'activo'],
            ['7701234567893', 'INT-004', 'Diclofenaco Gel', 'Diclofenaco', 'Tubo 50g', 3, 'Voltaren', 'L44556', '2026-08-10', 'Estante C1', 15, 3, 40, 8000, 15000, 87.5, 0, 0, 'activo'],
            ['7701234567894', 'INT-005', 'Vitamina C 1g', 'Ácido Ascórbico', 'Tubo efervescente x 10', 4, 'Bayer', 'L77889', '2027-01-01', 'Estante D1', 100, 10, 300, 5000, 12000, 140, 0, 0, 'activo'],
            ['7701234567895', 'INT-006', 'Gasa Estéril', 'N/A', 'Paquete x 5', 5, 'Hospitalario', 'L00112', '2028-12-31', 'Estante E1', 200, 20, 500, 1200, 3000, 150, 0, 0, 'activo'],
            ['7701234567896', 'INT-007', 'Alcohol Antiséptico', 'Alcohol 70%', 'Frasco 500ml', 5, 'JGB', 'L33445', '2029-06-15', 'Estante E2', 40, 5, 100, 4500, 8500, 88.8, 0, 0, 'activo'],
            ['7701234567897', 'INT-008', 'Betametasona Crema', 'Betametasona', 'Tubo 20g', 6, 'Schering', 'L55667', '2026-03-24', 'Estante F1', 12, 3, 30, 12000, 22000, 83.3, 0, 0, 'activo'],
            ['7701234567898', 'INT-009', 'Loratadina 10mg', 'Loratadina', 'Caja x 10 tabletas', 1, 'Genfar', 'L88990', '2026-11-30', 'Estante A1', 60, 10, 150, 3000, 7500, 150, 0, 0, 'activo'],
            ['7701234567899', 'INT-010', 'Omeprazol 20mg', 'Omeprazol', 'Caja x 28 cápsulas', 1, 'MK', 'L10101', '2025-12-31', 'Estante A3', 25, 5, 80, 18000, 32000, 77.7, 0, 0, 'activo']
        ];

        // Generar más productos para llegar a 50+
        for (let i = 10; i < 55; i++) {
            productos.push([
                `770998877${i.toString().padStart(4, '0')}`,
                `INT-${i.toString().padStart(3, '0')}`,
                `Producto Genérico ${i}`,
                `Principio ${i}`,
                `Presentación ${i}`,
                (i % 6) + 1,
                `Lab ${i}`,
                `LOTE-${i}`,
                '2026-01-01',
                'Bodega',
                20 + (i % 50),
                5,
                100,
                5000 + (i * 200),
                10000 + (i * 400),
                100,
                0,
                0,
                'activo'
            ]);
        }

        for (const p of productos) {
            await this.db.execute(`
            INSERT INTO productos (
                codigo_barras, codigo_interno, nombre_comercial, principio_activo, 
                presentacion, categoria_id, laboratorio, lote, fecha_vencimiento, 
                ubicacion, stock_actual, stock_minimo, stock_maximo, precio_compra, 
                precio_venta, margen_ganancia, requiere_receta, es_controlado, estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, p);
        }

        // 5. Configuración Inicial
        await this.db.execute(`INSERT INTO configuracion (clave, valor) VALUES ('impuesto_iva', '19')`);
        await this.db.execute(`INSERT INTO configuracion (clave, valor) VALUES ('moneda', 'COP')`);
        await this.db.execute(`INSERT INTO configuracion (clave, valor) VALUES ('nombre_farmacia', 'Gen-farma Central')`);

        console.log('Sembrado de datos completado.');
    }
}
