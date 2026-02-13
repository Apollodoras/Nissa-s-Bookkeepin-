import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from 'lucide-react';
import styles from './TransactionList.module.css';

interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    category_name: string;
    type: 'income' | 'expense';
    is_tax_deductible: boolean;
    is_business: boolean;
}

interface Props {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit: (t: Transaction) => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit }) => {
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    if (transactions.length === 0) {
        return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No transactions found.</div>;
    }

    return (
        <div className={styles.container}>
            {transactions.map(t => (
                <div key={t.id} className={`glass-panel ${styles.item}`}>
                    <div className={`${styles.icon} ${t.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                        <div className={styles.description}>{t.description || "No Description"}</div>
                        <div className={styles.date}>{formatDate(t.date)}</div>
                    </div>
                    <div>
                        <span className={styles.category}>{t.category_name || "Uncategorized"}</span>
                        {!t.is_business && <span className={styles.category} style={{ marginLeft: '5px', background: '#e2e8f0' }}>Personal</span>}
                        {t.is_tax_deductible && <span className={styles.category} style={{ marginLeft: '5px', color: 'var(--color-secondary)' }}>Tax Ded.</span>}
                    </div>
                    <div className={`${styles.amount} ${t.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => onEdit(t)}><Edit2 size={16} /></button>
                        <button className={styles.actionBtn} onClick={() => onDelete(t.id)}><Trash2 size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
    );
};
