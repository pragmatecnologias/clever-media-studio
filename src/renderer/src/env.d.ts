/// <reference types="vite/client" />

interface ElectronAPI {
  importFile: () => Promise<{ name: string; content: string; path: string } | null>;
  saveFile: (data: { name: string; content: string }) => Promise<boolean>;
  openPath: (path: string) => Promise<string>;
  copyText: (text: string) => Promise<boolean>;
}

interface Window {
  electronAPI: ElectronAPI;
}
