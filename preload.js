const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startAuto: () => ipcRenderer.send('start-auto'),
  exportCSV: () => ipcRenderer.send('export-csv'),
  onLogUpdate: (callback) => ipcRenderer.on('log-update', callback),
});
