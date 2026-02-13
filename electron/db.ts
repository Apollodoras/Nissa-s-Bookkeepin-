import fs from 'fs';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

const dbPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../bookkeeping.db')
    : path.join(app.getPath('userData'), 'bookkeeping.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDb() {
    try {
        db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL, -- 'income', 'expense'
          is_default_tax_deductible INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          amount INTEGER NOT NULL, -- stored in cents
          description TEXT,
          category_id TEXT,
          type TEXT NOT NULL, -- 'income', 'expense'
          is_business INTEGER DEFAULT 0,
          is_tax_deductible INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(category_id) REFERENCES categories(id)
        );
      `);

        // Migration: Add is_business column to categories if it doesn't exist
        const catTableInfo = db.prepare("PRAGMA table_info(categories)").all() as any[];
        if (!catTableInfo.some(col => col.name === 'is_business')) {
            db.exec("ALTER TABLE categories ADD COLUMN is_business INTEGER DEFAULT 1");
        }

        // Migration: Add is_business column to transactions if it doesn't exist
        const txTableInfo = db.prepare("PRAGMA table_info(transactions)").all() as any[];
        if (!txTableInfo.some(col => col.name === 'is_business')) {
            db.exec("ALTER TABLE transactions ADD COLUMN is_business INTEGER DEFAULT 0");
        }

        // Seed default categories if empty
        const stmt = db.prepare('SELECT count(*) as count FROM categories');
        const result = stmt.get() as { count: number };

        if (result.count === 0) {
            const insert = db.prepare('INSERT INTO categories (id, name, type, is_default_tax_deductible, is_business) VALUES (?, ?, ?, ?, ?)');
            const defaults = [
                // Business Income
                { name: 'Massage Services', type: 'income', ded: 0, biz: 1 },
                { name: 'Esthetician Services', type: 'income', ded: 0, biz: 1 },
                { name: 'Product Sales', type: 'income', ded: 0, biz: 1 },
                { name: 'Tips', type: 'income', ded: 0, biz: 1 },
                { name: 'Workshop/Class Income', type: 'income', ded: 0, biz: 1 },
                { name: 'Gift Certificate Sales', type: 'income', ded: 0, biz: 1 },

                // Business Expenses
                { name: 'Clinic Supplies (Oils, Linens)', type: 'expense', ded: 1, biz: 1 },
                { name: 'Spa Supplies (Skin care, Wax)', type: 'expense', ded: 1, biz: 1 },
                { name: 'Laundry & Cleaning', type: 'expense', ded: 1, biz: 1 },
                { name: 'Rent & Studio Fees', type: 'expense', ded: 1, biz: 1 },
                { name: 'Professional Insurance', type: 'expense', ded: 1, biz: 1 },
                { name: 'Licenses & Permits', type: 'expense', ded: 1, biz: 1 },
                { name: 'Professional Training (CEUs)', type: 'expense', ded: 1, biz: 1 },
                { name: 'Marketing & Social Media', type: 'expense', ded: 1, biz: 1 },
                { name: 'Website & SEO', type: 'expense', ded: 1, biz: 1 },
                { name: 'Software & Booking Apps', type: 'expense', ded: 1, biz: 1 },
                { name: 'Utilities & Business Phone', type: 'expense', ded: 1, biz: 1 },
                { name: 'Equipment & Furniture', type: 'expense', ded: 1, biz: 1 },
                { name: 'Professional Memberships', type: 'expense', ded: 1, biz: 1 },
                { name: 'Travel & Mobile Kit', type: 'expense', ded: 1, biz: 1 },
                { name: 'Home Office Deduction', type: 'expense', ded: 1, biz: 1 },
                { name: 'Business Bank Fees', type: 'expense', ded: 1, biz: 1 },
                { name: 'Tax Prep Fees', type: 'expense', ded: 1, biz: 1 },
                { name: 'Merchant Fees (Stripe/Square)', type: 'expense', ded: 1, biz: 1 },
                { name: 'Shipping & Postage', type: 'expense', ded: 1, biz: 1 },
                { name: 'Uniforms/Workwear', type: 'expense', ded: 1, biz: 1 },

                // Personal Expenses
                { name: 'Groceries', type: 'expense', ded: 0, biz: 0 },
                { name: 'Dining & Drinks', type: 'expense', ded: 0, biz: 0 },
                { name: 'Housing (Mortgage/Rent)', type: 'expense', ded: 0, biz: 0 },
                { name: 'Home Utilities', type: 'expense', ded: 0, biz: 0 },
                { name: 'Clothing & Personal Care', type: 'expense', ded: 0, biz: 0 },
                { name: 'Health & Medical', type: 'expense', ded: 0, biz: 0 },
                { name: 'Fitness & Wellness', type: 'expense', ded: 0, biz: 0 },
                { name: 'Entertainment & Hobbies', type: 'expense', ded: 0, biz: 0 },
                { name: 'Transportation (Personal)', type: 'expense', ded: 0, biz: 0 },
                { name: 'Debt & Loans', type: 'expense', ded: 0, biz: 0 },
                { name: 'Gifts & Donations', type: 'expense', ded: 0, biz: 0 },
                { name: 'Savings & Investments', type: 'expense', ded: 0, biz: 0 },
                { name: 'Pet Care', type: 'expense', ded: 0, biz: 0 },
                { name: 'Personal Education', type: 'expense', ded: 0, biz: 0 },
                { name: 'Travel (Personal)', type: 'expense', ded: 0, biz: 0 },
                { name: 'Childcare', type: 'expense', ded: 0, biz: 0 },
                { name: 'Household Supplies', type: 'expense', ded: 0, biz: 0 },
            ];

            defaults.forEach(c => insert.run(uuidv4(), c.name, c.type, c.ded, c.biz));
        }

        // Migration: Update existing categories to be business
        db.prepare('UPDATE categories SET is_business = 1 WHERE is_business IS NULL').run();

        // Ensure all exhaustive categories exist
        const exhaustiveCategories = [
            // Business Income
            { name: 'Massage Services', type: 'income', ded: 0, biz: 1 },
            { name: 'Esthetician Services', type: 'income', ded: 0, biz: 1 },
            { name: 'Product Sales', type: 'income', ded: 0, biz: 1 },
            { name: 'Tips', type: 'income', ded: 0, biz: 1 },
            { name: 'Workshop/Class Income', type: 'income', ded: 0, biz: 1 },
            { name: 'Gift Certificate Sales', type: 'income', ded: 0, biz: 1 },

            // Business Expenses
            { name: 'Clinic Supplies (Oils, Linens)', type: 'expense', ded: 1, biz: 1 },
            { name: 'Spa Supplies (Skin care, Wax)', type: 'expense', ded: 1, biz: 1 },
            { name: 'Laundry & Cleaning', type: 'expense', ded: 1, biz: 1 },
            { name: 'Rent & Studio Fees', type: 'expense', ded: 1, biz: 1 },
            { name: 'Professional Insurance', type: 'expense', ded: 1, biz: 1 },
            { name: 'Licenses & Permits', type: 'expense', ded: 1, biz: 1 },
            { name: 'Professional Training (CEUs)', type: 'expense', ded: 1, biz: 1 },
            { name: 'Marketing & Social Media', type: 'expense', ded: 1, biz: 1 },
            { name: 'Website & SEO', type: 'expense', ded: 1, biz: 1 },
            { name: 'Software & Booking Apps', type: 'expense', ded: 1, biz: 1 },
            { name: 'Utilities & Business Phone', type: 'expense', ded: 1, biz: 1 },
            { name: 'Equipment & Furniture', type: 'expense', ded: 1, biz: 1 },
            { name: 'Professional Memberships', type: 'expense', ded: 1, biz: 1 },
            { name: 'Travel & Mobile Kit', type: 'expense', ded: 1, biz: 1 },
            { name: 'Home Office Deduction', type: 'expense', ded: 1, biz: 1 },
            { name: 'Business Bank Fees', type: 'expense', ded: 1, biz: 1 },
            { name: 'Tax Prep Fees', type: 'expense', ded: 1, biz: 1 },
            { name: 'Merchant Fees (Stripe/Square)', type: 'expense', ded: 1, biz: 1 },
            { name: 'Shipping & Postage', type: 'expense', ded: 1, biz: 1 },
            { name: 'Uniforms/Workwear', type: 'expense', ded: 1, biz: 1 },

            // Personal Expenses
            { name: 'Groceries', type: 'expense', ded: 0, biz: 0 },
            { name: 'Dining & Drinks', type: 'expense', ded: 0, biz: 0 },
            { name: 'Housing (Mortgage/Rent)', type: 'expense', ded: 0, biz: 0 },
            { name: 'Home Utilities', type: 'expense', ded: 0, biz: 0 },
            { name: 'Clothing & Personal Care', type: 'expense', ded: 0, biz: 0 },
            { name: 'Health & Medical', type: 'expense', ded: 0, biz: 0 },
            { name: 'Fitness & Wellness', type: 'expense', ded: 0, biz: 0 },
            { name: 'Entertainment & Hobbies', type: 'expense', ded: 0, biz: 0 },
            { name: 'Transportation (Personal)', type: 'expense', ded: 0, biz: 0 },
            { name: 'Debt & Loans', type: 'expense', ded: 0, biz: 0 },
            { name: 'Gifts & Donations', type: 'expense', ded: 0, biz: 0 },
            { name: 'Savings & Investments', type: 'expense', ded: 0, biz: 0 },
            { name: 'Pet Care', type: 'expense', ded: 0, biz: 0 },
            { name: 'Personal Education', type: 'expense', ded: 0, biz: 0 },
            { name: 'Travel (Personal)', type: 'expense', ded: 0, biz: 0 },
            { name: 'Childcare', type: 'expense', ded: 0, biz: 0 },
            { name: 'Household Supplies', type: 'expense', ded: 0, biz: 0 },
        ];

        const checkStmt = db.prepare('SELECT id FROM categories WHERE name = ?');
        const insertStmt = db.prepare('INSERT INTO categories (id, name, type, is_default_tax_deductible, is_business) VALUES (?, ?, ?, ?, ?)');

        exhaustiveCategories.forEach(c => {
            const existing = checkStmt.get(c.name);
            if (!existing) {
                insertStmt.run(uuidv4(), c.name, c.type, c.ded, c.biz);
            }
        });

        // Migration: Move transactions from "Personal" category to is_business = 0
        const personalCat = db.prepare("SELECT id FROM categories WHERE name = 'Personal'").get() as { id: string } | undefined;
        if (personalCat) {
            db.prepare("UPDATE transactions SET is_business = 0, category_id = NULL WHERE category_id = ?").run(personalCat.id);
            db.prepare("DELETE FROM categories WHERE id = ?").run(personalCat.id);
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        // On dev, you might want to see this error more clearly
        if (process.env.NODE_ENV === 'development') {
            fs.appendFileSync(path.join(__dirname, '../../db_error.log'), `[${new Date().toISOString()}] ${error}\n`);
        }
    }
}

// Transaction Types
export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    category_id: string;
    type: 'income' | 'expense';
    is_business: boolean;
    is_tax_deductible: boolean;
    created_at?: string;
}

export const dbOps = {
    getTransactions: (month?: number, year?: number) => {
        let sql = `
          SELECT t.*, c.name as category_name 
          FROM transactions t 
          LEFT JOIN categories c ON t.category_id = c.id
        `;
        const params: any[] = [];

        if (year) {
            sql += ` WHERE strftime('%Y', t.date) = ?`;
            params.push(year.toString());
            if (month) {
                sql += ` AND strftime('%m', t.date) = ?`;
                params.push(month.toString().padStart(2, '0'));
            }
        }

        sql += ` ORDER BY date DESC`;
        return db.prepare(sql).all(...params);
    },

    addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => {
        const id = uuidv4();
        const info = db.prepare(`
      INSERT INTO transactions (id, date, amount, description, category_id, type, is_business, is_tax_deductible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, t.date, t.amount, t.description, t.category_id, t.type, t.is_business ? 1 : 0, t.is_tax_deductible ? 1 : 0);
        return { ...t, id };
    },

    deleteTransaction: (id: string) => {
        return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    },

    updateTransaction: (t: Transaction) => {
        return db.prepare(`
        UPDATE transactions 
        SET date = ?, amount = ?, description = ?, category_id = ?, type = ?, is_business = ?, is_tax_deductible = ?
        WHERE id = ?
      `).run(t.date, t.amount, t.description, t.category_id, t.type, t.is_business ? 1 : 0, t.is_tax_deductible ? 1 : 0, t.id);
    },

    getCategories: () => {
        return db.prepare('SELECT * FROM categories ORDER BY name').all();
    },

    addCategory: (name: string, type: string, isDefaultDeductible: boolean, isBusiness: boolean = true) => {
        const id = uuidv4();
        db.prepare('INSERT INTO categories (id, name, type, is_default_tax_deductible, is_business) VALUES (?, ?, ?, ?, ?)').run(id, name, type, isDefaultDeductible ? 1 : 0, isBusiness ? 1 : 0);
        return { id, name, type, is_default_tax_deductible: isDefaultDeductible, is_business: isBusiness ? 1 : 0 };
    },

    getSummary: (month?: number, year?: number) => {
        let whereClause = "";
        const params: string[] = [];

        if (year) {
            whereClause = ` AND strftime('%Y', date) = ?`;
            params.push(year.toString());
            if (month) {
                whereClause += ` AND strftime('%m', date) = ?`;
                params.push(month.toString().padStart(2, '0'));
            }
        }

        const income = db.prepare(`SELECT SUM(amount) as total FROM transactions WHERE type = 'income' ${whereClause}`).get(...params) as { total: number };
        const expenses = db.prepare(`SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' ${whereClause}`).get(...params) as { total: number };

        // Only count deductible if it's a BUSINESS expense
        const deductible = db.prepare(`SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND is_tax_deductible = 1 AND is_business = 1 ${whereClause}`).get(...params) as { total: number };

        return {
            totalIncome: income.total || 0,
            totalExpenses: expenses.total || 0,
            totalDeductible: deductible.total || 0,
            balance: (income.total || 0) - (expenses.total || 0)
        };
    }
};
