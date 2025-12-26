const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  dbQuery: (query, params) => ipcRenderer.invoke('db:query', query, params),
  dbExecute: (query, params) => ipcRenderer.invoke('db:execute', query, params),
  dbExport: () => ipcRenderer.invoke('db:export'),
  dbImport: () => ipcRenderer.invoke('db:import'),
  dbHash: (text) => ipcRenderer.invoke('db:hash', text),
  print: (options) => ipcRenderer.invoke('print', options),
});
