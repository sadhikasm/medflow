import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Import our global CSS
import './styles.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they have a token but wrong role, redirect to their proper dashboard
    if (role === 'Patient') {
      return <Navigate to="/patient" replace />;
    }
    if (role === 'Staff') {
      return <Navigate to="/staff" replace />;
    }
    if (role === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    // Fallback
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/*"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root redirect logic based on token and role */}
        <Route path="/" element={
          <RootRedirect />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Helper component to redirect from root
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (role === 'Patient') return <Navigate to="/patient" replace />;
  if (role === 'Staff') return <Navigate to="/staff" replace />;
  if (role === 'Admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
};

export default App;
