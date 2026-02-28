import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, role, department } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      if (department) {
        localStorage.setItem('department', department);
      } else {
        localStorage.removeItem('department');
      }

      if (role === 'Patient') {
        navigate('/patient');
      } else if (role === 'Staff') {
        navigate('/staff');
      } else if (role === 'Admin') {
        navigate('/admin');
      } else {
        setError('Unknown role assigned.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">MedFlow Dashboard</h2>
        <p className="auth-subtitle">Login to Hospital Workflow System</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ marginBottom: '1rem', width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
