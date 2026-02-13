import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDb, dbOps } from './db';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.setName("Nissa's Bookkeepin'");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Nissa's Bookkeepin'",
        icon: path.join(__dirname, '../../assets/icon.svg'), // Path from dist-electron to assets
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    initDb();

    // Database IPC Handlers
    ipcMain.handle('db:getTransactions', (_, { month, year } = {}) => dbOps.getTransactions(month, year));
    ipcMain.handle('db:addTransaction', (_, t) => dbOps.addTransaction(t));
    ipcMain.handle('db:deleteTransaction', (_, id) => dbOps.deleteTransaction(id));
    ipcMain.handle('db:updateTransaction', (_, t) => dbOps.updateTransaction(t));
    ipcMain.handle('db:getCategories', () => dbOps.getCategories());
    ipcMain.handle('db:addCategory', (_, { name, type, isDefaultDeductible }) => dbOps.addCategory(name, type, isDefaultDeductible));
    ipcMain.handle('db:getSummary', (_, { month, year } = {}) => dbOps.getSummary(month, year));
    ipcMain.handle('db:getCategorySummary', (_, { month, year } = {}) => dbOps.getCategorySummary(month, year));
    ipcMain.handle('db:getYearlyTrend', (_, { year }) => dbOps.getYearlyTrend(year));

    ipcMain.handle('app:exportCSV', async (_, { data, filename }) => {
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: filename,
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        });

        if (filePath) {
            fs.writeFileSync(filePath, data);
            return true;
        }
        return false;
    });

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
