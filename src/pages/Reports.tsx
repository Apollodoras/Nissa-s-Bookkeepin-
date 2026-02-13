import React, { useEffect, useState } from 'react';
import { Download, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

export const Reports: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const loadData = async () => {
        const sum = await window.electron.ipcRenderer.getSummary({ month, year });
        const txs = await window.electron.ipcRenderer.getTransactions({ month, year });
        setSummary(sum);
        setTransactions(txs);
    };

    useEffect(() => {
        loadData();
    }, [month, year]);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
    };

    const handleExport = async () => {
        if (transactions.length === 0) return;

        const headers = ['Date', 'Description', 'Category', 'Type', 'Business', 'Tax Deductible', 'Amount'];
        const rows = transactions.map(t => [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.category_name || 'Uncategorized',
            t.type,
            t.is_business ? 'Yes' : 'No',
            t.is_tax_deductible ? 'Yes' : 'No',
            (t.amount / 100).toFixed(2)
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const filename = `bookkeeping_export_${year}_${month.toString().padStart(2, '0')}.csv`;

        const success = await window.electron.ipcRenderer.exportCSV(csvContent, filename);
        if (success) {
            alert('Export successful!');
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (!summary) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient">Financial Reports</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Analyze your business performance</p>
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
                    <button className="btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><TrendingUp size={48} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Gross Income</h3>
                    <p style={{ fontSize: '2.5rem', margin: '10px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ color: '#ff4d4d', marginBottom: '10px' }}><TrendingDown size={48} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2.5rem', margin: '10px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-secondary)', marginBottom: '10px' }}><PieChart size={48} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Tax Deductible Pool</h3>
                    <p style={{ fontSize: '2.5rem', margin: '10px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalDeductible)}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <h2 className="text-gradient" style={{ marginTop: 0 }}>Profit / Loss Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
                    <span>Revenue</span>
                    <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
                    <span>Direct Business Expenses</span>
                    <span style={{ color: '#ff4d4d' }}>-{formatCurrency(summary.totalExpenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span>Net Profit</span>
                    <span className="text-gradient">{formatCurrency(summary.balance)}</span>
                </div>
            </div>
        </div>
    );
};
