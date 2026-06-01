import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  importFile: () => ipcRenderer.invoke('file:import'),
  saveFile: (data: { name: string; content: string }) => ipcRenderer.invoke('file:save', data),
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
  copyText: (text: string) => ipcRenderer.invoke('clipboard:copyText', text),
});
