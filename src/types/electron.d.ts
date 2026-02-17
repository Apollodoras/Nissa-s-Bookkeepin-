export interface IElectronAPI {
    ipcRenderer: {
        send: (channel: string, data: any) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        getTransactions: (filters?: { month?: number, year?: number }) => Promise<any[]>;
        addTransaction: (transaction: any) => Promise<any>;
        deleteTransaction: (id: string) => Promise<any>;
        updateTransaction: (transaction: any) => Promise<any>;
        getCategories: () => Promise<any[]>;
        addCategory: (category: { name: string; type: string; isDefaultDeductible: boolean; isBusiness: boolean }) => Promise<any>;
        updateCategory: (category: { id: string; name: string; type: string; is_default_tax_deductible: number; is_business: number }) => Promise<any>;
        deleteCategory: (id: string) => Promise<any>;
        getSummary: (filters?: { month?: number, year?: number }) => Promise<{ totalIncome: number, totalExpenses: number, totalDeductible: number, balance: number }>;
        getCategorySummary: (filters?: { month?: number, year?: number }) => Promise<any[]>;
        getYearlyTrend: (filters: { year: number }) => Promise<any[]>;
        exportCSV: (data: string, filename: string) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}
