import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Database,
  BarChart3,
  Activity,
  FileText,
  DollarSign,
  Brain,
  LogOut
} from 'lucide-react';
import logo from '../assets/logo.png';

const Navigation = ({ onLogout }) => {
  const navItems = [
    { path: '/status', icon: Activity, label: 'Status', description: 'Bot Status Monitor' },
    { path: '/logs', icon: FileText, label: 'Logs', description: 'PM2 Logs Monitor' },
 
    { path: '/', icon: Home, label: 'Dashboard', description: 'Overview & Analytics' },
    { path: '/client-analytics', icon: BarChart3, label: 'Clients', description: 'Client Analytics' },
    { path: '/financial', icon: DollarSign, label: 'Financial', description: 'Financial Statement' },

    { path: '/database', icon: Database, label: 'Database', description: 'Manage Users' },
 
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="logo-container">
          <img src={logo} alt="Juta Robot Logo" className="nav-logo" />
          <div className="logo-text">
            <h1 className="nav-title">JUTA</h1>
          </div>
        </div>
      </div>
      
      <div className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="nav-footer">
        <div className="ai-status">
          <div className="ai-indicator">
            <div className="ai-dot"></div>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
