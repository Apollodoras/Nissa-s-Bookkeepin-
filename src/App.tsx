import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<div className="glass-panel" style={{ padding: '40px' }}>Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
