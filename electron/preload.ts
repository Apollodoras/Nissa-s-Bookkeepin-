import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel: string, data: any) => ipcRenderer.send(channel, data),
        on: (channel: string, func: (...args: any[]) => void) =>
            ipcRenderer.on(channel, (event, ...args) => func(...args)),

        // Database API
        getTransactions: (filters?: { month?: number, year?: number }) => ipcRenderer.invoke('db:getTransactions', filters),
        addTransaction: (transaction: any) => ipcRenderer.invoke('db:addTransaction', transaction),
        deleteTransaction: (id: string) => ipcRenderer.invoke('db:deleteTransaction', id),
        updateTransaction: (transaction: any) => ipcRenderer.invoke('db:updateTransaction', transaction),
        getCategories: () => ipcRenderer.invoke('db:getCategories'),
        addCategory: (category: any) => ipcRenderer.invoke('db:addCategory', category),
        getSummary: (filters?: { month?: number, year?: number }) => ipcRenderer.invoke('db:getSummary', filters),
        exportCSV: (data: string, filename: string) => ipcRenderer.invoke('app:exportCSV', { data, filename }),
    },
});
