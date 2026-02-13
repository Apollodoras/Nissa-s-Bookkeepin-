import React, { useEffect, useState } from 'react';

interface SummaryData {
    totalIncome: number;
    totalExpenses: number;
    totalDeductible: number;
    balance: number;
}

export const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<SummaryData>({
        totalIncome: 0,
        totalExpenses: 0,
        totalDeductible: 0,
        balance: 0
    });

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const loadData = async () => {
        try {
            const data = await window.electron.ipcRenderer.getSummary({ month, year });
            setSummary(data);
        } catch (error) {
            console.error("Failed to load summary", error);
        }
    };

    useEffect(() => {
        loadData();
    }, [month, year]);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
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
                    <h1 className="text-gradient">Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of your finances</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
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
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Balance</h3>
                    <p style={{ fontSize: '2rem', margin: '10px 0', fontWeight: 'bold' }}>{formatCurrency(summary.balance)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Income</h3>
                    <p style={{ fontSize: '2rem', margin: '10px 0', color: 'var(--color-primary)' }}>{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2rem', margin: '10px 0', color: '#ff4d4d' }}>{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tax Deductible</h3>
                    <p style={{ fontSize: '2rem', margin: '10px 0', color: 'var(--color-secondary)' }}>{formatCurrency(summary.totalDeductible)}</p>
                </div>
            </div>
        </div>
    );
};
