import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const { Database } = sqlite3;

let win: BrowserWindow | null = null;
let db: InstanceType<typeof Database>;

// Equivalente de __dirname para módulos ES
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false, // Desactivar sandbox para facilitar carga en dev
      contextIsolation: true
    },
  });

  const startUrl =
    process.env['ELECTRON_START_URL'] ||
    `file://${path.join(__dirname, '../dist/Gen-farma/browser/index.html')}`;

  win.loadURL(startUrl);
}

function initDb() {
  const dbPath = path.join(app.getPath('userData'), 'pharmacy.db');
  console.log('--- DATABASE PATH ---');
  console.log(dbPath);
  console.log('---------------------');
  db = new Database(dbPath);

  // Realizar backup automático diario
  runAutoBackup(dbPath);
}

function runAutoBackup(dbPath: string) {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const today = new Date().toISOString().split('T')[0];
  const backupPath = path.join(backupDir, `pharmacy_backup_${today}.db`);

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log('Backup automático realizado:', backupPath);
  }
}

// Deshabilitar aceleración de hardware de video (VAAPI) para evitar errores en Linux
// Esto es seguro para aplicaciones que no requieren reproducción de video
// y no afecta el rendimiento general de la aplicación
app.commandLine.appendSwitch('disable-accelerated-video-decode');

app.whenReady().then(() => {
  initDb();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('db:query', (event, query: string, params: unknown[]) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('db:execute', (event, query: string, params: unknown[]) => {
  return new Promise<void>((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle('db:export', async () => {
  const dbPath = path.join(app.getPath('userData'), 'pharmacy.db');
  const { filePath } = await dialog.showSaveDialog({
    title: 'Exportar Base de Datos',
    defaultPath: path.join(app.getPath('desktop'), 'gen-farma-backup.db'),
    filters: [{ name: 'SQLite Database', extensions: ['db'] }]
  });

  if (filePath) {
    fs.copyFileSync(dbPath, filePath);
    return true;
  }
  return false;
});

ipcMain.handle('db:import', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Importar Base de Datos',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile']
  });

  if (filePaths && filePaths.length > 0) {
    const dbPath = path.join(app.getPath('userData'), 'pharmacy.db');
    // Cerrar la base de datos actual antes de reemplazarla
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.copyFileSync(filePaths[0], dbPath);
        initDb(); // Re-inicializar
        resolve(true);
      });
    });
  }
  return false;
});

ipcMain.handle('db:hash', (event, text: string) => {
  return crypto.createHash('sha256').update(text).digest('hex');
});
