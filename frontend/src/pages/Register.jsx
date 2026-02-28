import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Patient'); // Default role
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (role === 'Staff' && !department) {
            setError('Please select a department for staff.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/register', {
                name,
                email,
                password,
                role,
                department: role === 'Staff' ? department : null
            });

            alert('Registration successful! Your account is pending admin approval.');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create an Account</h2>
                <p className="auth-subtitle">Join MedFlow System</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

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

                    <div className="form-group">
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Role</label>
                        <select
                            id="role"
                            className="form-input"
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                if (e.target.value !== 'Staff') setDepartment('');
                            }}
                            disabled={loading}
                        >
                            <option value="Patient">Patient</option>
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {role === 'Staff' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="department">Department</label>
                            <select
                                id="department"
                                className="form-input"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                disabled={loading}
                                required={role === 'Staff'}
                            >
                                <option value="">Select Department...</option>
                                <option value="Reception">Reception</option>
                                <option value="Lab">Lab</option>
                                <option value="Billing">Billing</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn" disabled={loading} style={{ marginBottom: '1rem', width: '100%' }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Sign in here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
