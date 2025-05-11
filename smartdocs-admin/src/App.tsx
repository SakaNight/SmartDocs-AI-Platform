import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Logs from './pages/Logs';
import './App.css';

const App: React.FC = () => (
  <Router>
    <div className="navbar" style={{ padding: 16, borderBottom: '1px solid #eee', marginBottom: 24 }}>
      <Link to="/" style={{ marginRight: 24 }}>Home</Link>
      <Link to="/stats" style={{ marginRight: 24 }}>Stats</Link>
      <Link to="/logs">Logs</Link>
    </div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/logs" element={<Logs />} />
    </Routes>
  </Router>
);

export default App;
