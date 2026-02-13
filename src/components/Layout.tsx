import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};
