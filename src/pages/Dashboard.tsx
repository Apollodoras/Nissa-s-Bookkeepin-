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
    const [yearlySummary, setYearlySummary] = useState<SummaryData>({
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
            const yearlyData = await window.electron.ipcRenderer.getSummary({ year });
            setSummary(data);
            setYearlySummary(yearlyData);
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly Balance</h3>
                    <p style={{ fontSize: '1.8rem', margin: '10px 0', fontWeight: 'bold' }}>{formatCurrency(summary.balance)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly Income</h3>
                    <p style={{ fontSize: '1.8rem', margin: '10px 0', color: 'var(--color-primary)' }}>{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly Expenses</h3>
                    <p style={{ fontSize: '1.8rem', margin: '10px 0', color: '#ff4d4d' }}>{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly Deductible</h3>
                    <p style={{ fontSize: '1.8rem', margin: '10px 0', color: 'var(--color-secondary)' }}>{formatCurrency(summary.totalDeductible)}</p>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Year-to-Date Performance ({year})</h2>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cumulative Revenue</span>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: 'var(--color-primary)' }}>{formatCurrency(yearlySummary.totalIncome)}</p>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cumulative Expenses</span>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#ff4d4d' }}>{formatCurrency(yearlySummary.totalExpenses)}</p>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cumulative Tax Savings</span>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: 'var(--color-secondary)' }}>{formatCurrency(yearlySummary.totalDeductible)}</p>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(15, 23, 42, 0.05)', paddingLeft: '30px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Net Profit</span>
                            <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>{formatCurrency(yearlySummary.balance)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
