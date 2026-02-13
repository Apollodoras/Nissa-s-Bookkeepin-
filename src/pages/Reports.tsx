import React, { useEffect, useState } from 'react';
import { Download, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

export const Reports: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [catSummary, setCatSummary] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number | 'all'>(new Date().getMonth() + 1);

    const loadData = async () => {
        const filters = month === 'all' ? { year } : { month, year };
        const sum = await window.electron.ipcRenderer.getSummary(filters);
        const catSum = await window.electron.ipcRenderer.getCategorySummary(filters);
        const txs = await window.electron.ipcRenderer.getTransactions(filters);

        setSummary(sum);
        setCatSummary(catSum);
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
        const monthStr = month === 'all' ? 'FULL_YEAR' : month.toString().padStart(2, '0');
        const filename = `bookkeeping_export_${year}_${monthStr}.csv`;

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

    const maxCatTotal = Math.max(...catSummary.map(c => c.total), 1);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient">Financial Reports</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{month === 'all' ? `Cumulative Year ${year}` : `${months[month as number - 1]} ${year}`}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        className="input-field"
                        value={month}
                        onChange={e => setMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    >
                        <option value="all">Full Year View</option>
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
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '5px' }}><TrendingUp size={32} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gross Income</h3>
                    <p style={{ fontSize: '2rem', margin: '5px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
                    <div style={{ color: '#ff4d4d', marginBottom: '5px' }}><TrendingDown size={32} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2rem', margin: '5px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-secondary)', marginBottom: '5px' }}><PieChart size={32} /></div>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tax Deductible</h3>
                    <p style={{ fontSize: '2rem', margin: '5px 0', fontWeight: 'bold' }}>{formatCurrency(summary.totalDeductible)}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2 className="text-gradient" style={{ marginTop: 0, fontSize: '1.25rem' }}>Expense Breakdown</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                        {catSummary.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No expenses in this period</p>
                        ) : catSummary.map((cat, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 500 }}>
                                        {cat.category_name || 'Uncategorized'}
                                        <span style={{ fontSize: '0.7rem', marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', background: cat.is_business ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.05)', color: cat.is_business ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                                            {cat.is_business ? 'Business' : 'Personal'}
                                        </span>
                                    </span>
                                    <span style={{ fontWeight: 'bold' }}>{formatCurrency(cat.total)}</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(cat.total / maxCatTotal) * 100}%`,
                                        background: cat.is_business ? 'var(--color-primary)' : '#94a3b8',
                                        transition: 'width 0.5s ease-out'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {month === 'all' && (
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h2 className="text-gradient" style={{ marginTop: 0, fontSize: '1.25rem' }}>Yearly Performance</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
                                <span>Total Revenue</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{formatCurrency(summary.totalIncome)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
                                <span>Total Expenses</span>
                                <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>-{formatCurrency(summary.totalExpenses)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                <span>Estimated Profit</span>
                                <span className="text-gradient">{formatCurrency(summary.balance)}</span>
                            </div>
                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                                    Tip: Use the category breakdown on the left to see which areas of your business are most expensive this year.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
