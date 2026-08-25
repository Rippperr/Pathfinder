import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CareerPathsPage from './pages/CareerPathsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EditProfilePage from './pages/EditProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage'; // 1. Import the new page
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import './App.css';

const AppContent = () => {
  const { session } = useUser();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isOnboarding = location.pathname === '/onboarding';
  const isPublicPage = ['/', '/login', '/signup', '/forgot-password', '/update-password'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {session && !isOnboarding && <Sidebar isOpen={isSidebarOpen} onLinkClick={() => setIsSidebarOpen(false)} />}
      <div className="main-content-wrapper">
        {session && !isOnboarding && <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
        <div className="page-content">
          <Routes>
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/paths" element={<CareerPathsPage />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
