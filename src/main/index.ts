import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Clever Campaign Studio',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// IPC: Import text file
ipcMain.handle('file:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['txt', 'md', 'docx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, 'utf-8');
  const name = filePath.split('/').pop() || filePath;
  return { name, content, path: filePath };
});

// IPC: Save file
ipcMain.handle('file:save', async (_event, { name, content }: { name: string; content: string }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: name,
    filters: [{ name: 'Text', extensions: ['txt'] }],
  });
  if (result.canceled || !result.filePath) return false;
  await fs.writeFile(result.filePath, content, 'utf-8');
  return true;
});

// IPC: Open export folder
ipcMain.handle('shell:openPath', async (_event, dirPath: string) => {
  return shell.openPath(dirPath);
});
