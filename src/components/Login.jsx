import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import './Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === '123123') {
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <div className="login-icon">
            <Shield className="shield-icon" />
          </div>
          <h2>Secure Access</h2>
          <p className="login-subtitle">Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="security-note">
            <Shield size={14} />
            This session is secured with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;