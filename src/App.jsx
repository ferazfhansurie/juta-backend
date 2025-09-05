import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import Status from './components/Status';
import Logs from './components/Logs';
import FinancialStatement from './components/FinancialStatement';
import ClientAnalytics from './components/ClientAnalytics';
import MarketingAnalytics from './components/MarketingAnalytics';
import AIPageTester from './components/AIPageTester';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <Navigation onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/database" element={<Database />} />
            <Route path="/status" element={<Status />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/client-analytics" element={<ClientAnalytics />} />
            <Route path="/financial" element={<FinancialStatement />} />
            <Route path="/marketing-analytics" element={<MarketingAnalytics />} />
            <Route path="/tester-bot" element={<AIPageTester />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
