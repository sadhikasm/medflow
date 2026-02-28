import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const fetchAdminData = async () => {
        try {
            const [statsRes, reqsRes, usersRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/admin/requests'),
                api.get('/admin/users/pending')
            ]);
            setStats(statsRes.data);
            setRequests(reqsRes.data);
            setPendingUsers(usersRes.data);
        } catch (err) {
            setError('Failed to fetch admin dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/approve`);
            fetchAdminData();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to approve user");
        }
    };

    const openHistoryModal = async (requestId) => {
        setHistoryModalOpen(true);
        setSelectedRequestId(requestId);
        setHistoryLoading(true);
        setSelectedHistory([]);

        try {
            const response = await api.get(`/requests/${requestId}/history`);
            setSelectedHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch request history.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setHistoryModalOpen(false);
        setSelectedRequestId(null);
    };

    const getStatusClass = (status) => {
        if (status === 'Pending') return 'status-pending';
        if (status === 'In Progress') return 'status-progress';
        if (status === 'Completed') return 'status-completed';
        return '';
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />

            <main className="main-content">
                <header className="top-header">
                    <h1 className="header-title">Admin Master Dashboard</h1>
                    <div className="user-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        System Admin
                    </div>
                </header>

                <div className="content-area">
                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="loading-container">Loading hospital system overview...</div>
                    ) : stats && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-title">Total Requests</span>
                                    <span className="stat-value">{stats.total_requests}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-title">Reception Queue</span>
                                    <span className="stat-value">{stats.reception_queue}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-title">Lab Queue</span>
                                    <span className="stat-value">{stats.lab_queue}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-title">Billing Queue</span>
                                    <span className="stat-value">{stats.billing_queue}</span>
                                </div>
                            </div>

                            <div className="table-container" style={{ marginTop: '2rem' }}>
                                <div className="table-header">
                                    <h2 className="table-title">All Hospital Requests</h2>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Type</th>
                                                <th>Location</th>
                                                <th>Priority</th>
                                                <th>Status</th>
                                                <th>History</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((req) => (
                                                <tr key={req.id}>
                                                    <td>#{req.id}</td>
                                                    <td style={{ fontWeight: 500 }}>{req.type}</td>
                                                    <td><strong>{req.current_department}</strong></td>
                                                    <td>{req.priority || 'Normal'}</td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => openHistoryModal(req.id)}
                                                        >
                                                            View History
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="table-container" style={{ marginTop: '2rem' }}>
                                <div className="table-header">
                                    <h2 className="table-title">Pending Approvals</h2>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Department</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                                        No pending approvals.
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingUsers.map((user) => (
                                                    <tr key={user.id}>
                                                        <td style={{ fontWeight: 500 }}>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td>{user.department || '-'}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => handleApprove(user.id)}
                                                                style={{ backgroundColor: '#10b981', color: '#fff' }}
                                                            >
                                                                Approve
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* History Modal */}
            {historyModalOpen && (
                <div className="modal-overlay" onClick={closeHistoryModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Request #{selectedRequestId} Details & History</h3>
                            <button className="close-btn" onClick={closeHistoryModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const req = requests.find(r => r.id === selectedRequestId);
                                if (!req) return null;
                                return (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ marginBottom: '0.75rem', color: '#0f172a' }}>Additional Information</h4>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            {req.payment_details && (
                                                <div style={{ marginBottom: '0.5rem' }}><strong>Payment Details (from Reception):</strong> {req.payment_details}</div>
                                            )}
                                            {req.lab_result && (
                                                <div style={{ marginBottom: '0.5rem' }}><strong>Lab Result:</strong> {req.lab_result}</div>
                                            )}
                                            {req.lab_report && (
                                                <div style={{ marginBottom: '0.5rem' }}><strong>Lab Report Link:</strong> <a href={req.lab_report} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>{req.lab_report}</a></div>
                                            )}
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Payment Status:</strong> {req.payment_confirmed ? <span style={{ color: '#10b981', fontWeight: 600 }}>Confirmed</span> : <span style={{ color: '#f59e0b', fontWeight: 600 }}>Pending</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <h4 style={{ marginBottom: '1rem', color: '#0f172a' }}>Timeline</h4>
                            {historyLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                    Loading history...
                                </div>
                            ) : selectedHistory.length === 0 ? (
                                <p>No history available.</p>
                            ) : (
                                <div className="timeline">
                                    {selectedHistory.map((hist, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="ti-date">
                                                {new Date(hist.timestamp).toLocaleString()}
                                            </div>
                                            <div className="ti-content">
                                                <strong>{hist.department}</strong> - Status changed to <span className={`status-badge ${getStatusClass(hist.status)}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{hist.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
