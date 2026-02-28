import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    M
                </div>
                MedFlow System
            </div>

            <nav className="sidebar-nav">
                {role === 'Patient' ? (
                    <NavLink
                        to="/patient"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        My Requests
                    </NavLink>
                ) : role === 'Admin' ? (
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Master Dashboard
                    </NavLink>
                ) : (
                    <NavLink
                        to="/staff"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
