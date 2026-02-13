export interface IElectronAPI {
    ipcRenderer: {
        send: (channel: string, data: any) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        getTransactions: (filters?: { month?: number, year?: number }) => Promise<any[]>;
        addTransaction: (transaction: any) => Promise<any>;
        deleteTransaction: (id: string) => Promise<any>;
        updateTransaction: (transaction: any) => Promise<any>;
        getCategories: () => Promise<any[]>;
        addCategory: (category: { name: string; type: string; isDefaultDeductible: boolean }) => Promise<any>;
        getSummary: (filters?: { month?: number, year?: number }) => Promise<{ totalIncome: number, totalExpenses: number, totalDeductible: number, balance: number }>;
        exportCSV: (data: string, filename: string) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}
