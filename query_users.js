const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), '.config', 'Electron', 'pharmacy.db');
const db = new sqlite3.Database(dbPath);

console.log('Listado de Usuarios:');
console.log('-------------------');

db.all('SELECT id, username, nombre, role, activo FROM usuarios', [], (err, rows) => {
    if (err) {
        console.error('Error al consultar la base de datos:', err.message);
        process.exit(1);
    }

    if (rows.length === 0) {
        console.log('No se encontraron usuarios.');
    } else {
        console.table(rows);
    }
    db.close();
});
