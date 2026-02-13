import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Receipt, PieChart, Settings, Tag } from 'lucide-react';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Wallet className={styles.logoIcon} size={32} />
                <h1>Nissa's<br />Bookkeepin'</h1>
            </div>

            <nav className={styles.nav}>
                <NavLink to="/" className={({ isActive }) => isActive ? styles.active : styles.link}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => isActive ? styles.active : styles.link}>
                    <Receipt size={20} />
                    <span>Transactions</span>
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => isActive ? styles.active : styles.link}>
                    <Tag size={20} />
                    <span>Categories</span>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => isActive ? styles.active : styles.link}>
                    <PieChart size={20} />
                    <span>Reports</span>
                </NavLink>
            </nav>

            <div className={styles.footer}>
                <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : styles.link}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </div>
    );
};
