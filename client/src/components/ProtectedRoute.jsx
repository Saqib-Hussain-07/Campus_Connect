import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('campusconnect_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location, message: 'Please log in to host events, hackathons, projects, or groups.' }} replace />;
  }

  return children;
}
