import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';
import { useAlerts } from '../stores/AlertStore';
import { colors, gradients, DashboardIcon, FileIcon, PlusIcon, BellIcon, UserIcon, LogoutIcon } from '../theme';
import sachLogo from '../assets/sach_logo.png';

const navItems = [
  {
    path: '/dashboard',
    labelKey: 'goToDashboard',
    icon: <DashboardIcon />,
  },
  {
    path: '/dashboard/my-firs',
    labelKey: 'goToMyFirs',
    icon: <FileIcon />,
  },
  {
    path: '/dashboard/file-fir',
    labelKey: 'fileNewFir',
    icon: <PlusIcon />,
  },
  {
    path: '/dashboard/alerts',
    labelKey: 'goToAlerts',
    icon: <BellIcon />,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { logout } = useUser();
  const { unreadCount } = useAlerts();

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const navBtnStyle = (path) => ({
    backgroundColor: isActive(path) ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
    color: isActive(path) ? colors.gold : colors.textSub,
    border: isActive(path) ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent',
  });

  const hoverIn = (e, path) => {
    if (!isActive(path)) {
      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.06)';
      e.currentTarget.style.color = colors.gold;
    }
  };
  const hoverOut = (e, path) => {
    if (!isActive(path)) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = colors.textSub;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <div
        className={`sidebar ${isOpen ? 'open' : ''}`}
        style={{
          backgroundColor: colors.bgSidebar,
          borderRight: `1px solid ${colors.divider}`,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${colors.divider}`,
        }}>
          <img
            src={sachLogo}
            alt="SACH Logo"
            style={{
              height: 36,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          />
          <div style={{
            width: 1,
            height: 24,
            background: colors.divider,
          }} />
          <div>
            <h1 style={{ fontSize: 11, fontWeight: 700, color: colors.gold, letterSpacing: 0.5, lineHeight: 1.2, textTransform: 'uppercase' }}>
              Citizens
            </h1>
            <p style={{ fontSize: 9, letterSpacing: 1.5, color: colors.emerald, fontWeight: 600 }}>
              e-FIR PORTAL
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                background: 'none',
                marginBottom: 4,
                transition: 'all 0.2s',
                ...navBtnStyle(item.path),
              }}
              onMouseEnter={(e) => hoverIn(e, item.path)}
              onMouseLeave={(e) => hoverOut(e, item.path)}
            >
              {item.icon}
              <span style={{ flex: 1, textAlign: 'left' }}>{t(item.labelKey)}</span>
              {item.labelKey === 'goToAlerts' && unreadCount > 0 && (
                <span style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: colors.gold,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 6,
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: '0 12px 16px' }}>
          {/* Profile */}
          <button
            onClick={() => handleNav('/dashboard/profile')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              background: 'none',
              marginBottom: 4,
              transition: 'all 0.2s',
              ...navBtnStyle('/dashboard/profile'),
            }}
            onMouseEnter={(e) => hoverIn(e, '/dashboard/profile')}
            onMouseLeave={(e) => hoverOut(e, '/dashboard/profile')}
          >
            <UserIcon />
            <span>{t('goToProfile')}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => { logout(); onClose?.(); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              background: 'none',
              border: '1px solid transparent',
              color: '#ef4444',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogoutIcon color="#ef4444" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
