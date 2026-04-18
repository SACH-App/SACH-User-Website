import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { FirProvider } from './stores/FirStore';
import { AlertProvider } from './stores/AlertStore';
import { UserProvider } from './stores/UserStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyFirsPage from './pages/MyFirsPage';
import FileFirPage from './pages/FileFirPage';
import FirDetailPage from './pages/FirDetailPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import { useLanguage } from './LanguageContext';

// Page title mapping for the header
const pageTitles = {
  '/dashboard': 'goToDashboard',
  '/dashboard/my-firs': 'myComplaints',
  '/dashboard/file-fir': 'fileFir',
  '/dashboard/alerts': 'alertsTitle',
  '/dashboard/profile': 'profileTitle',
  '/dashboard/edit-profile': 'editProfile',
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  // Determine title from current path
  const path = window.location.pathname;
  const titleKey = pageTitles[path] || 'goToDashboard';
  const title = t(titleKey);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="app-main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <FirProvider>
          <AlertProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route path="/" element={<SplashPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Dashboard routes */}
                <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
                <Route path="/dashboard/my-firs" element={<DashboardLayout><MyFirsPage /></DashboardLayout>} />
                <Route path="/dashboard/file-fir" element={<DashboardLayout><FileFirPage /></DashboardLayout>} />
                <Route path="/dashboard/fir/:firId" element={<DashboardLayout><FirDetailPage /></DashboardLayout>} />
                <Route path="/dashboard/alerts" element={<DashboardLayout><AlertsPage /></DashboardLayout>} />
                <Route path="/dashboard/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
                <Route path="/dashboard/edit-profile" element={<DashboardLayout><EditProfilePage /></DashboardLayout>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AlertProvider>
        </FirProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
