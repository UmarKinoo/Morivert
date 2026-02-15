import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { AuthGuard } from './admin/AuthGuard';
import { UserLogin } from './user/UserLogin';
import { ResetPassword } from './user/ResetPassword';
import { UserDashboard } from './user/UserDashboard';
import { UserAuthGuard } from './user/UserAuthGuard';
import { ProfilePage } from './user/ProfilePage';
import { QuoteBuilderPage } from './components/QuoteBuilderPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/*" element={<App />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* User (Google login) */}
      <Route
        path="/dashboard"
        element={
          <UserAuthGuard>
            <UserDashboard />
          </UserAuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <UserAuthGuard>
            <ProfilePage />
          </UserAuthGuard>
        }
      />
      <Route path="/quote" element={<QuoteBuilderPage />} />

      {/* Admin (email/password); users cannot access */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AuthGuard>
            <AdminDashboard />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
