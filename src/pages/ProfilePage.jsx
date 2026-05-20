import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, UserIcon, CheckCircleIcon, IdCardIcon, PhoneIcon, MailIcon, EditIcon, MapPinIcon, HomeIcon, SettingsIcon, GlobeIcon, ShieldCheckIcon, LogoutIcon, ChevronRight } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, isUrdu, toggleLang } = useLanguage();
  const { profile, loading, logout } = useUser();
  const [showLangMenu, setShowLangMenu] = useState(false);

  if (loading || !profile) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading profile...</div>;
  }

  const renderRow = (icon, label, value) => (
    <div className="profile-row hoverable">
      <div className="profile-row-icon">{icon}</div>
      <div style={{ flex: 1 }}>
        <span className="profile-row-label">{label}</span>
        <span className="profile-row-value">{value || 'Not provided'}</span>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      {/* Identity card */}
      <div className="sach-card hoverable" style={{ textAlign: 'center', marginBottom: 24, padding: 28, background: `linear-gradient(135deg, ${colors.bgCard}, rgba(1,118,58,0.06))` }}>
        <div className="profile-avatar" style={{ width: 72, height: 72, margin: '0 auto 14px', fontSize: 28 }}><UserIcon size={32} color="#fff" /></div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.full_name}</h2>
        <div className="verified-chip" style={{ display: 'inline-flex', marginTop: 6 }}><ShieldCheckIcon size={12} color={colors.emerald} /> {t('verifiedCitizen')}</div>
        <p style={{ fontSize: 11, color: colors.textSub, marginTop: 8, letterSpacing: 1 }}>{profile.cnic}</p>
        <button className="sach-btn sach-btn-outline" style={{ width: 'auto', padding: '10px 20px', marginTop: 16, fontSize: 13 }} onClick={() => navigate('/dashboard/edit-profile')}>
          <EditIcon size={14} /> {t('editProfile')}
        </button>
      </div>

      {/* Contact info */}
      <div className="sach-card hoverable" style={{ marginBottom: 16, padding: '4px 0' }}>
        <h4 className="section-title" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}><PhoneIcon size={14} color={colors.gold} /> Contact Information</h4>
        {renderRow(<PhoneIcon size={16} color={colors.gold} />, 'Phone', profile.phone || 'Not set')}
        {renderRow(<MailIcon size={16} color={colors.gold} />, 'Email', profile.email || 'Not set')}
      </div>

      {/* Residential info */}
      <div className="sach-card hoverable" style={{ marginBottom: 16, padding: '4px 0' }}>
        <h4 className="section-title" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}><HomeIcon size={14} color={colors.gold} /> Residential Information</h4>
        {renderRow(<MapPinIcon size={16} color={colors.gold} />, 'Address', profile.address || 'Not set')}
      </div>

      {/* Settings tiles */}
      <div className="sach-card" style={{ padding: '4px 0' }}>
        <div className="settings-tile hoverable" onClick={() => navigate('/dashboard/edit-profile')}>
          <SettingsIcon size={18} color={colors.gold} />
          <span style={{ flex: 1 }}>Account Settings</span>
          <ChevronRight size={16} color={colors.textSub} />
        </div>
        <div className="settings-tile" style={{ cursor: 'default', overflow: 'visible' }}>
          <GlobeIcon size={18} color={colors.gold} />
          <span style={{ flex: 1 }}>Language Preferences</span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${colors.divider}`,
                borderRadius: 8,
                color: colors.gold,
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {isUrdu ? 'اردو' : 'English'}
              <span style={{ 
                transform: showLangMenu ? 'rotate(-90deg)' : 'rotate(90deg)', 
                transition: 'transform 0.2s ease',
                display: 'inline-block',
                lineHeight: 1
              }}>
                <ChevronRight size={12} color={colors.gold} />
              </span>
            </button>

            {showLangMenu && (
              <>
                <div 
                  onClick={() => setShowLangMenu(false)} 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: '#0D1E11',
                    border: '1px solid rgba(212,175,55,0.35)',
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                    width: 100,
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'slideUp 0.15s ease'
                  }}
                >
                  <div
                    onClick={() => {
                      if (isUrdu) toggleLang();
                      setShowLangMenu(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: !isUrdu ? colors.gold : 'rgba(255,255,255,0.7)',
                      background: !isUrdu ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderBottom: `1px solid ${colors.divider}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                      e.currentTarget.style.color = colors.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = !isUrdu ? 'rgba(212,175,55,0.08)' : 'transparent';
                      e.currentTarget.style.color = !isUrdu ? colors.gold : 'rgba(255,255,255,0.7)';
                    }}
                  >
                    English
                  </div>
                  <div
                    onClick={() => {
                      if (!isUrdu) toggleLang();
                      setShowLangMenu(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: isUrdu ? colors.gold : 'rgba(255,255,255,0.7)',
                      background: isUrdu ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                      e.currentTarget.style.color = colors.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isUrdu ? 'rgba(212,175,55,0.08)' : 'transparent';
                      e.currentTarget.style.color = isUrdu ? colors.gold : 'rgba(255,255,255,0.7)';
                    }}
                  >
                    اردو
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="settings-tile hoverable" onClick={logout} style={{ color: colors.red }}>
          <LogoutIcon size={18} color={colors.red} />
          <span style={{ flex: 1 }}>{t('signOut')}</span>
          <ChevronRight size={16} color={colors.textSub} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
