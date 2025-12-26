import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  dbQuery: (query: string, params: unknown[]) => ipcRenderer.invoke('db:query', query, params),
  dbExecute: (query: string, params: unknown[]) => ipcRenderer.invoke('db:execute', query, params),
  dbExport: () => ipcRenderer.invoke('db:export'),
  dbImport: () => ipcRenderer.invoke('db:import'),
  dbHash: (text: string) => ipcRenderer.invoke('db:hash', text),
  print: (options: Electron.WebContentsPrintOptions) => ipcRenderer.invoke('print', options),
});

export type PreloadApi = {
  api: {
    dbQuery: (query: string, params: unknown[]) => Promise<unknown[]>;
    dbExecute: (query: string, params: unknown[]) => Promise<void>;
    dbExport: () => Promise<boolean>;
    dbImport: () => Promise<boolean>;
    dbHash: (text: string) => Promise<string>;
    print: (options: Electron.WebContentsPrintOptions) => Promise<void>;
  };
};
