import React, { useEffect, useState } from 'react';
import { Plus, Tag, Edit2, Trash2, Check, X, Briefcase, User, ArrowUpCircle, ArrowDownCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    is_default_tax_deductible: number;
    is_business: number;
}

interface CategoryCardProps {
    cat: Category;
    isEditing: boolean;
    editForm: Category | null;
    setEditForm: (form: Category | null) => void;
    handleSaveEdit: () => Promise<void>;
    setEditingId: (id: string | null) => void;
    handleEdit: (cat: Category) => void;
    handleDelete: (id: string) => Promise<void>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    cat,
    isEditing,
    editForm,
    setEditForm,
    handleSaveEdit,
    setEditingId,
    handleEdit,
    handleDelete
}) => {
    if (isEditing && editForm) {
        return (
            <div className="glass-panel" style={{ padding: '15px', border: '1px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        className="input-field"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            className="input-field"
                            value={editForm.type}
                            onChange={e => setEditForm({ ...editForm, type: e.target.value as any })}
                            style={{ flex: 1, padding: '5px' }}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        {editForm.type === 'expense' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={editForm.is_default_tax_deductible === 1}
                                    onChange={e => setEditForm({ ...editForm, is_default_tax_deductible: e.target.checked ? 1 : 0 })}
                                />
                                Deductible
                            </label>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={handleSaveEdit} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                            <Check size={14} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: 'transparent' }}>
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'transform 0.2s',
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: cat.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cat.type === 'income' ? '#10b981' : '#f43f5e'
                }}>
                    <Tag size={18} />
                </div>
                <div>
                    <div style={{ fontWeight: 600 }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {cat.is_business === 1 ? (
                            <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Briefcase size={10} /> Business
                            </span>
                        ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <User size={10} /> Personal
                            </span>
                        )}
                        {cat.is_business === 1 && cat.type === 'expense' && (
                            <>
                                <span>•</span>
                                {cat.is_default_tax_deductible === 1 ? (
                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <ShieldCheck size={10} /> Deductible
                                    </span>
                                ) : (
                                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <ShieldAlert size={10} /> Not Deductible
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(cat)} className="btn-icon" title="Edit" style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '5px'
                }}>
                    <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="btn-icon" title="Delete" style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', padding: '5px'
                }}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', isDefaultDeductible: false, isBusiness: true });
    const [editForm, setEditForm] = useState<Category | null>(null);

    // Filters
    const [view, setView] = useState<'business' | 'personal'>('business');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [deductibleFilter, setDeductibleFilter] = useState<'all' | 'deductible' | 'none'>('all');

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
        await window.electron.ipcRenderer.addCategory({
            name: newCategory.name,
            type: newCategory.type,
            isDefaultDeductible: newCategory.isDefaultDeductible,
            isBusiness: newCategory.isBusiness
        });
        setNewCategory({ name: '', type: 'expense', isDefaultDeductible: false, isBusiness: true });
        setIsAdding(false);
        loadCategories();
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditForm({ ...cat });
    };

    const handleSaveEdit = async () => {
        if (!editForm) return;
        await window.electron.ipcRenderer.updateCategory({
            id: editForm.id,
            name: editForm.name,
            type: editForm.type,
            is_default_tax_deductible: editForm.is_default_tax_deductible,
            is_business: editForm.is_business
        });
        setEditingId(null);
        setEditForm(null);
        loadCategories();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? Transactions using it will be uncategorized.')) {
            await window.electron.ipcRenderer.deleteCategory(id);
            loadCategories();
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesView = view === 'business' ? cat.is_business === 1 : cat.is_business === 0;
        const matchesType = typeFilter === 'all' || cat.type === typeFilter;
        const matchesDeductible = deductibleFilter === 'all' ||
            (deductibleFilter === 'deductible' && cat.is_default_tax_deductible === 1) ||
            (deductibleFilter === 'none' && cat.is_default_tax_deductible === 0);
        return matchesView && matchesType && matchesDeductible;
    });

    const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
    const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient">Edit Categories</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Customize your classification system</p>
                </div>
                {!isAdding && (
                    <button className="btn-primary" onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New Category
                    </button>
                )}
            </div>

            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                <button
                    className={`btn-primary ${view === 'business' ? 'active' : ''}`}
                    onClick={() => setView('business')}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: view === 'business' ? 'var(--color-primary)' : 'white',
                        color: view === 'business' ? 'white' : 'var(--color-primary)'
                    }}
                >
                    <Briefcase size={18} /> Business
                </button>
                <button
                    className={`btn-primary ${view === 'personal' ? 'active' : ''}`}
                    onClick={() => setView('personal')}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: view === 'personal' ? 'var(--color-primary)' : 'white',
                        color: view === 'personal' ? 'white' : 'var(--color-primary)'
                    }}
                >
                    <User size={18} /> Personal
                </button>
            </div>

            {/* Quick Filters */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', padding: '0 5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type:</label>
                    <select
                        className="input-field"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expense Only</option>
                    </select>
                </div>
                {view === 'business' && typeFilter !== 'income' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tax Status:</label>
                        <select
                            className="input-field"
                            value={deductibleFilter}
                            onChange={(e) => setDeductibleFilter(e.target.value as any)}
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                        >
                            <option value="all">Any Status</option>
                            <option value="deductible">Deductible</option>
                            <option value="none">Non-Deductible</option>
                        </select>
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', border: '2px solid var(--color-primary-glow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Create New Category</h3>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name</label>
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
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type</label>
                            <select
                                className="input-field"
                                style={{ width: '100%' }}
                                value={newCategory.type}
                                onChange={e => setNewCategory({ ...newCategory, type: e.target.value as any })}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classification</label>
                            <div style={{ display: 'flex', gap: '15px', height: '42px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={newCategory.isBusiness} onChange={e => setNewCategory({ ...newCategory, isBusiness: e.target.checked })} />
                                    Business
                                </label>
                                {newCategory.isBusiness && newCategory.type === 'expense' && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={newCategory.isDefaultDeductible} onChange={e => setNewCategory({ ...newCategory, isDefaultDeductible: e.target.checked })} />
                                        Deductible
                                    </label>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">Create</button>
                            <button type="button" className="btn-primary" style={{ borderColor: 'transparent' }} onClick={() => setIsAdding(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Income Section */}
            {incomeCategories.length > 0 && (
                <div style={{ marginBottom: '35px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <ArrowUpCircle size={20} color="#10b981" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Income Categories</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>{incomeCategories.length} items</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {incomeCategories.map(cat => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                isEditing={editingId === cat.id}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                handleSaveEdit={handleSaveEdit}
                                setEditingId={setEditingId}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Expense Section */}
            {expenseCategories.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <ArrowDownCircle size={20} color="#f43f5e" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Expense Categories</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(244, 63, 94, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>{expenseCategories.length} items</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {expenseCategories.map(cat => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                isEditing={editingId === cat.id}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                handleSaveEdit={handleSaveEdit}
                                setEditingId={setEditingId}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {filteredCategories.length === 0 && (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Tag size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <p>No categories found matching these filters.</p>
                </div>
            )}
        </div>
    );
};
