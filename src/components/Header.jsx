import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';
import { useAlerts } from '../stores/AlertStore';
import { colors, gradients, SearchIcon, ChevronDown, UserIcon, SettingsIcon, GlobeIcon, LockIcon, MenuIcon, CheckCircleIcon } from '../theme';

const Header = ({ title, onMenuClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { t, isUrdu, toggleLang } = useLanguage();
  const { profile, logout } = useUser();
  const { unreadCount } = useAlerts();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = profile.full_name || profile.fullName || '';
  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2);

  const menuItemStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    fontSize: 13,
    color: colors.textSub,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: "'Roboto', sans-serif",
  };

  const menuHoverIn = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.06)';
    e.currentTarget.style.color = colors.gold;
  };
  const menuHoverOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = colors.textSub;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 64,
      borderBottom: `1px solid ${colors.divider}`,
      backgroundColor: colors.bgDeep,
      position: 'sticky',
      top: 0,
      zIndex: 40,
      fontFamily: "'Roboto', sans-serif",
    }}>
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="mobile-menu-btn" onClick={onMenuClick}><MenuIcon size={22} /></button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{title}</h1>
      </div>

      {/* Right: Search + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: colors.textSub,
          }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t('search')}
            style={{
              paddingLeft: 38,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
              color: '#fff',
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.divider}`,
              minWidth: 200,
              transition: 'border-color 0.2s',
              fontFamily: "'Roboto', sans-serif",
            }}
            onFocus={(e) => { e.target.style.borderColor = colors.green; }}
            onBlur={(e) => { e.target.style.borderColor = colors.divider; }}
          />
        </div>

        {/* User chip + dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: gradients.goldChip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
            }}>
              {initials}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{fullName}</p>
              <p style={{ fontSize: 10, color: colors.textSub }}>{t('verifiedCitizen')}</p>
            </div>
            <ChevronDown color={colors.textSub} />
          </div>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 240,
              borderRadius: 12,
              padding: '6px 0',
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.divider}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 50,
              animation: 'fadeIn 0.15s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.divider}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{fullName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 600,
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: colors.gold,
                  }}>
                    CNIC: {profile.cnic}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 10, fontWeight: 600, color: colors.emerald,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      backgroundColor: colors.emerald,
                    }} />
                    Active
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <button
                onClick={() => { setMenuOpen(false); navigate('/dashboard/profile'); }}
                style={menuItemStyle}
                onMouseEnter={menuHoverIn}
                onMouseLeave={menuHoverOut}
              >
                <UserIcon size={16} /> {t('goToProfile')}
              </button>

              <div style={{ height: 1, background: colors.divider, margin: '4px 0' }} />

              <button
                onClick={() => { toggleLang(); setMenuOpen(false); }}
                style={menuItemStyle}
                onMouseEnter={menuHoverIn}
                onMouseLeave={menuHoverOut}
              >
                <GlobeIcon /> {t('urduToggle')}
              </button>

              <div style={{ height: 1, background: colors.divider, margin: '4px 0' }} />

              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                style={{ ...menuItemStyle, color: '#ef4444' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <LockIcon size={16} color="#ef4444" /> {t('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
