import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const PatientDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/my-requests');
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openHistoryModal = async (requestId) => {
    setHistoryModalOpen(true);
    setSelectedRequestId(requestId);
    setHistoryLoading(true);
    setHistoryError('');
    setSelectedHistory([]);

    try {
      const response = await api.get(`/requests/${requestId}/history`);
      setSelectedHistory(response.data);
    } catch (err) {
      setHistoryError('Failed to fetch request history.');
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

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'high';
    if (priority === 'Medium') return 'medium';
    if (priority === 'Low') return 'low';
    return '';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="Patient" />

      <main className="main-content">
        <header className="top-header">
          <h1 className="header-title">My Requests</h1>
          <div className="user-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Patient
          </div>
        </header>

        <div className="content-area">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-container">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="stat-card" style={{ alignItems: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No requests found.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map(req => (
                <div key={req.id} className="request-card">
                  <div className="rc-header">
                    <h3 className="rc-title">{req.type}</h3>
                    <span className={`rc-prio ${getPriorityClass(req.priority)}`}>
                      {req.priority || 'Normal'} priority
                    </span>
                  </div>

                  <div className="rc-body">
                    <div className="rc-row">
                      <span className="rc-label">Current Department</span>
                      <span className="rc-value">{req.current_department}</span>
                    </div>
                    <div className="rc-row">
                      <span className="rc-label">Status</span>
                      <span className={`status-badge ${getStatusClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => openHistoryModal(req.id)}
                  >
                    View History
                  </button>
                </div>
              ))}
            </div>
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
                        <div style={{ marginBottom: '0.5rem' }}><strong>Payment Expected:</strong> {req.payment_details}</div>
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
              ) : historyError ? (
                <div className="error-message">{historyError}</div>
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

export default PatientDashboard;
