import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CareerPathsPage from './pages/CareerPathsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';

const AppContent = () => {
  const { session } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {session && <Sidebar isOpen={isSidebarOpen} onLinkClick={() => setIsSidebarOpen(false)} />}
      <div className="main-content-wrapper">
        {session && <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/paths" element={<CareerPathsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
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