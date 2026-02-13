import React, { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', isDefaultDeductible: false });

    const loadCategories = async () => {
        const cats = await window.electron.ipcRenderer.getCategories();
        setCategories(cats);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name) return;
        await window.electron.ipcRenderer.addCategory(newCategory);
        setNewCategory({ name: '', type: 'expense', isDefaultDeductible: false });
        setIsAdding(false);
        loadCategories();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient">Categories</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your transaction tags</p>
                </div>
                {!isAdding && (
                    <button className="btn-primary" onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New Category
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</label>
                            <input
                                className="input-field"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="e.g. Software, Marketing"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Type</label>
                            <select
                                className="input-field"
                                value={newCategory.type}
                                onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <input
                                    type="checkbox"
                                    checked={newCategory.isDefaultDeductible}
                                    onChange={e => setNewCategory({ ...newCategory, isDefaultDeductible: e.target.checked })}
                                />
                                Deductible by default
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">Add</button>
                            <button type="button" className="btn-primary" style={{ borderColor: 'transparent' }} onClick={() => setIsAdding(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {categories.map(cat => (
                    <div key={cat.id} className="glass-panel" style={{ padding: '15px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: cat.type === 'income' ? 'var(--color-primary-glow)' : 'rgba(255, 77, 77, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: cat.type === 'income' ? 'var(--color-primary)' : '#ff4d4d'
                        }}>
                            <Tag size={16} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 500 }}>{cat.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                                {cat.is_default_tax_deductible === 1 && " • Deductible"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
