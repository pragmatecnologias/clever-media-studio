/// <reference types="vite/client" />

interface ElectronAPI {
  importFile: () => Promise<{ name: string; content: string; path: string } | null>;
  saveFile: (data: { name: string; content: string }) => Promise<boolean>;
  openPath: (path: string) => Promise<string>;
}

interface Window {
  electronAPI: ElectronAPI;
}
