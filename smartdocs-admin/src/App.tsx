import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Logs from './pages/Logs';
import Users from './pages/Users';
import Documents from './pages/Documents';
import Playground from './pages/Playground';
import './App.css';

const navItems = [
  { key: '/', label: 'Home' },
  { key: '/stats', label: 'Stats' },
  { key: '/logs', label: 'Logs' },
  { key: '/users', label: 'Users' },
  { key: '/documents', label: 'Documents' },
  { key: '/playground', label: 'Playground' },
];

function Navbar() {
  const location = useLocation();
  return (
    <div style={{ background: '#181c24', boxShadow: '0 2px 8px #0002', marginBottom: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[navItems.find(item => location.pathname.startsWith(item.key))?.key || '/']}
          style={{ background: 'transparent', fontSize: 18, borderBottom: 'none' }}
        >
          {navItems.map(item => (
            <Menu.Item key={item.key} style={{ fontWeight: 500 }}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>
    </div>
  );
}

const App: React.FC = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/users" element={<Users />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
  </Router>
);

export default App;
