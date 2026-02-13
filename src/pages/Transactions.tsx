import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';

export const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const loadData = async () => {
        try {
            const data = await window.electron.ipcRenderer.getTransactions({ month, year });
            setTransactions(data);
        } catch (error) {
            console.error("Failed to load transactions", error);
        }
    };

    useEffect(() => {
        loadData();
    }, [month, year]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await window.electron.ipcRenderer.deleteTransaction(id);
            loadData();
        }
    };

    const handleEdit = (t: any) => {
        setEditingTransaction(t);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleSave = async (transaction: any) => {
        try {
            if (transaction.id) {
                await window.electron.ipcRenderer.updateTransaction(transaction);
            } else {
                await window.electron.ipcRenderer.addTransaction(transaction);
            }
            loadData();
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('Failed to save transaction');
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient">Transactions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your incomes and expenses</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        className="input-field"
                        value={month}
                        onChange={e => setMonth(parseInt(e.target.value))}
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        className="input-field"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value))}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button className="btn-primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            <TransactionList
                transactions={transactions}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            {isModalOpen && (
                <TransactionForm
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingTransaction}
                />
            )}
        </div>
    );
};
