const os = require('os');
const path = require('path');
const sqlite3 = require('sqlite3');
const fs = require('fs');

const dbPath = path.join(os.homedir(), '.config', 'Electron', 'pharmacy.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Base de datos no encontrada en:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('🔍 Consultando base de datos...\n');

// Contar total de clientes
db.all('SELECT COUNT(*) as total FROM clientes', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  
  const total = rows[0].total;
  console.log(`📊 Total de clientes en la tabla: ${total}\n`);
  
  if (total === 0) {
    console.log('⚠️  No hay clientes registrados en la base de datos.');
    db.close();
    return;
  }
  
  // Mostrar todos los clientes
  db.all('SELECT id, nombre_completo, identificacion, telefono, email, tipo, estado, saldo_pendiente, puntos FROM clientes ORDER BY id', [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      db.close();
      return;
    }
    
    console.log('📋 Lista de clientes:\n');
    console.log('ID | Nombre | Identificación | Teléfono | Email | Tipo | Estado | Saldo | Puntos');
    console.log('-'.repeat(100));
    
    rows.forEach(c => {
      console.log(`${c.id} | ${c.nombre_completo || 'N/A'} | ${c.identificacion || 'N/A'} | ${c.telefono || 'N/A'} | ${c.email || 'N/A'} | ${c.tipo || 'N/A'} | ${c.estado || 'N/A'} | ${c.saldo_pendiente || 0} | ${c.puntos || 0}`);
    });
    
    console.log(`\n✅ Total: ${rows.length} cliente(s)`);
    db.close();
  });
});

