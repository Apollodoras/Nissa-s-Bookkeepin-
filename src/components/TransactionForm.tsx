import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSave: (transaction: any) => Promise<void>;
    initialData?: any;
}

export const TransactionForm: React.FC<Props> = ({ onClose, onSave, initialData }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category_id: '',
        type: 'expense' as 'income' | 'expense',
        is_business: true,
        is_tax_deductible: false,
    });

    useEffect(() => {
        const loadCategories = async () => {
            const cats = await window.electron.ipcRenderer.getCategories();
            setCategories(cats);
        };
        loadCategories();

        if (initialData) {
            setFormData({
                ...initialData,
                amount: (initialData.amount / 100).toFixed(2),
                date: initialData.date.split('T')[0]
            });
        }
    }, [initialData]);

    useEffect(() => {
        // If Personal is selected, force Tax Deductible to false
        if (!formData.is_business) {
            setFormData(prev => ({ ...prev, is_tax_deductible: false }));
            return;
        }

        // If Business is selected, find the category and apply its default
        const selectedCat = categories.find(c => c.id === formData.category_id);
        if (selectedCat) {
            setFormData(prev => ({
                ...prev,
                is_tax_deductible: selectedCat.is_default_tax_deductible === 1
            }));
        }
    }, [formData.category_id, formData.is_business, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountCents = Math.round(parseFloat(formData.amount) * 100);
        await onSave({
            ...formData,
            amount: amountCents,
            id: initialData?.id
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ width: '500px', padding: '30px', position: 'relative' }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 className="text-gradient" style={{ marginTop: 0 }}>{initialData ? 'Edit Transaction' : 'New Transaction'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid var(--border-color)' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-main)', fontWeight: 600 }}>Classification</label>
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '1.05rem' }}>
                                <input
                                    type="radio"
                                    name="classification"
                                    checked={formData.is_business}
                                    onChange={() => {
                                        setFormData({ ...formData, is_business: true, category_id: '' });
                                    }}
                                />
                                Business
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '1.05rem' }}>
                                <input
                                    type="radio"
                                    name="classification"
                                    checked={!formData.is_business}
                                    onChange={() => {
                                        setFormData({ ...formData, is_business: false, category_id: '' });
                                    }}
                                />
                                Personal
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Type</label>
                            <select
                                className="input-field"
                                style={{ width: '100%' }}
                                value={formData.type}
                                onChange={e => {
                                    const newType = e.target.value as 'income' | 'expense';
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        category_id: '',
                                        is_tax_deductible: newType === 'income' ? false : formData.is_tax_deductible
                                    });
                                }}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Date</label>
                            <input
                                type="date"
                                className="input-field"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Amount ($)</label>
                        <input
                            type="number"
                            className="input-field"
                            style={{ width: '100%', boxSizing: 'border-box', fontSize: '1.2rem' }}
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Description</label>
                        <input
                            type="text"
                            className="input-field"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Category</label>
                        <select
                            className="input-field"
                            style={{ width: '100%' }}
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories
                                .filter(c =>
                                    (c.type === formData.type || c.type === 'both') &&
                                    (c.is_business === (formData.is_business ? 1 : 0))
                                )
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                    </div>

                    {formData.type === 'expense' && formData.is_business && (
                        <div style={{ marginTop: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_tax_deductible}
                                    onChange={e => setFormData({ ...formData, is_tax_deductible: e.target.checked })}
                                />
                                Tax Deductible Business Expense
                            </label>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                        Save Transaction
                    </button>
                </form>
            </div>
        </div>
    );
};
