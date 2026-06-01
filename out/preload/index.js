"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  importFile: () => electron.ipcRenderer.invoke("file:import"),
  saveFile: (data) => electron.ipcRenderer.invoke("file:save", data),
  openPath: (path) => electron.ipcRenderer.invoke("shell:openPath", path),
  copyText: (text) => electron.ipcRenderer.invoke("clipboard:copyText", text)
});
