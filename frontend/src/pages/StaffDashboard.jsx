import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');

  // Create Request Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ patient_id: '', type: '', description: '', priority: 'Normal' });
  const [creating, setCreating] = useState(false);

  // Forward Modal State
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedForwardRequest, setSelectedForwardRequest] = useState(null);
  const [forwardData, setForwardData] = useState({ payment_details: '', lab_report: '', lab_result: '', payment_confirmed: false });
  const [forwarding, setForwarding] = useState(false);

  const department = localStorage.getItem('department');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reqsRes, patientsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/department/requests'),
        api.get('/patients')
      ]);
      setStats(statsRes.data);
      setRequests(reqsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoadingStats(false);
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openForwardModal = (requestId) => {
    setSelectedForwardRequest(requestId);
    setForwardModalOpen(true);
    setForwardData({ payment_details: '', lab_report: '', lab_result: '', payment_confirmed: false });
  };

  const submitForward = async (e) => {
    e.preventDefault();
    setForwarding(true);
    try {
      await api.put(`/requests/${selectedForwardRequest}/forward`, forwardData);
      setForwardModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to forward request');
    } finally {
      setForwarding(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.patient_id || !newRequest.type || !newRequest.description) {
      alert("Please fill out all required fields.");
      return;
    }

    setCreating(true);
    try {
      await api.post('/requests', newRequest);
      setCreateModalOpen(false);
      setNewRequest({ patient_id: '', type: '', description: '', priority: 'Normal' });
      fetchDashboardData();
      alert('Request created successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'status-pending';
    if (status === 'In Progress') return 'status-progress';
    if (status === 'Completed') return 'status-completed';
    return '';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="Staff" />

      <main className="main-content">
        <header className="top-header">
          <h1 className="header-title">Staff Dashboard</h1>
          <div className="user-badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Staff
          </div>
        </header>

        <div className="content-area">
          {error && <div className="error-message">{error}</div>}

          {loadingStats ? (
            <div className="loading-container">Loading stats...</div>
          ) : stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-title">Total Requests</span>
                <span className="stat-value">{stats.total_requests}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Pending</span>
                <span className="stat-value" style={{ color: '#d97706' }}>{stats.pending}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">In Progress</span>
                <span className="stat-value" style={{ color: '#2563eb' }}>{stats.in_progress}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Completed</span>
                <span className="stat-value" style={{ color: '#059669' }}>{stats.completed}</span>
              </div>
            </div>
          ) : null}

          {loadingRequests ? (
            <div className="loading-container">Loading requests...</div>
          ) : (
            <div className="table-container">
              <div className="table-header">
                <h2 className="table-title">Department Requests</h2>
                {department === 'Reception' && (
                  <button className="btn" onClick={() => setCreateModalOpen(true)}>
                    + Create Request
                  </button>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                          No requests in your department right now.
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req.id}>
                          <td>#{req.id}</td>
                          <td style={{ fontWeight: 500 }}>{req.type}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              backgroundColor: req.priority === 'High' ? '#fee2e2' : req.priority === 'Medium' ? '#fef3c7' : '#d1fae5',
                              color: req.priority === 'High' ? '#b91c1c' : req.priority === 'Medium' ? '#92400e' : '#065f46'
                            }}>
                              {req.priority || 'Normal'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm"
                              onClick={() => openForwardModal(req.id)}
                            >
                              Forward
                              <svg style={{ marginLeft: '4px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Request Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Request</h3>
              <button className="close-btn" onClick={() => setCreateModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateRequest}>
                <div className="form-group">
                  <label className="form-label" htmlFor="patient_id">Select Patient</label>
                  <select
                    id="patient_id"
                    className="form-input"
                    value={newRequest.patient_id}
                    onChange={(e) => setNewRequest({ ...newRequest, patient_id: e.target.value })}
                    disabled={creating}
                    required
                  >
                    <option value="">-- Choose a Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="type">Request Type (e.g., Blood Test, X-Ray)</label>
                  <input
                    id="type"
                    type="text"
                    className="form-input"
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                    disabled={creating}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description & Notes</label>
                  <textarea
                    id="description"
                    className="form-input"
                    rows="3"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    disabled={creating}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    className="form-input"
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    disabled={creating}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button type="submit" className="btn" disabled={creating} style={{ width: '100%' }}>
                  {creating ? 'Creating...' : 'Create Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {forwardModalOpen && (
        <div className="modal-overlay" onClick={() => setForwardModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Forward Request #{selectedForwardRequest}</h3>
              <button className="close-btn" onClick={() => setForwardModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitForward}>

                {department === 'Reception' && (
                  <div className="form-group">
                    <label className="form-label">Update Payment Details (To notify Billing)</label>
                    <textarea
                      placeholder="e.g. Estimated cost $250. Patient will pay at discharge."
                      className="form-input"
                      rows="2"
                      value={forwardData.payment_details}
                      onChange={(e) => setForwardData({ ...forwardData, payment_details: e.target.value })}
                      required
                    ></textarea>
                  </div>
                )}

                {department === 'Lab' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Enter Lab Result Details</label>
                      <textarea
                        placeholder="e.g. Blood type O+, WBC 7.5. Everything normal."
                        className="form-input"
                        rows="3"
                        value={forwardData.lab_result}
                        onChange={(e) => setForwardData({ ...forwardData, lab_result: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lab Report URL / Document link</label>
                      <input
                        type="text"
                        placeholder="https://hospital.com/reports/123"
                        className="form-input"
                        value={forwardData.lab_report}
                        onChange={(e) => setForwardData({ ...forwardData, lab_report: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {department === 'Billing' && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                      type="checkbox"
                      id="paymentConfirmed"
                      checked={forwardData.payment_confirmed}
                      onChange={(e) => setForwardData({ ...forwardData, payment_confirmed: e.target.checked })}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                      required
                    />
                    <label htmlFor="paymentConfirmed" style={{ fontWeight: 500 }}>Confirm payment received</label>
                  </div>
                )}

                <button type="submit" className="btn" disabled={forwarding} style={{ width: '100%', backgroundColor: department === 'Billing' ? '#10b981' : 'var(--primary-color)' }}>
                  {forwarding ? 'Processing...' : department === 'Billing' ? 'Complete Request' : `Forward to ${department === 'Reception' ? 'Lab' : 'Billing'}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
