const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('budgetAPI', {
  loadTransactions:  ()     => ipcRenderer.invoke('load-transactions'),
  saveTransactions:  (data) => ipcRenderer.invoke('save-transactions', data),
});
