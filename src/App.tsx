import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '@/src/context/AppContext';
import { Toaster } from 'react-hot-toast';
import Landing from '@/src/pages/Landing';
import Layout from '@/src/components/Layout';
import StudentDashboard from '@/src/pages/StudentDashboard';
import LecturerDashboard from '@/src/pages/LecturerDashboard';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const { role } = useAppContext();
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lecturer" 
              element={
                <ProtectedRoute allowedRole="lecturer">
                  <LecturerDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
    </AppProvider>
  );
}
