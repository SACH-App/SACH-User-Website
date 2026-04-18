import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, UserIcon, CheckCircleIcon, IdCardIcon, PhoneIcon, MailIcon, EditIcon, MapPinIcon, HomeIcon, SettingsIcon, GlobeIcon, ShieldCheckIcon, LogoutIcon, ChevronRight } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useUser();

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
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.fullName}</h2>
        <div className="verified-chip" style={{ display: 'inline-flex', marginTop: 6 }}><ShieldCheckIcon size={12} color={colors.emerald} /> {t('nadraVerified')}</div>
        <p style={{ fontSize: 11, color: colors.textSub, marginTop: 8, letterSpacing: 1 }}>{profile.cnic}</p>
        <button className="sach-btn sach-btn-outline" style={{ width: 'auto', padding: '10px 20px', marginTop: 16, fontSize: 13 }} onClick={() => navigate('/dashboard/edit-profile')}>
          <EditIcon size={14} /> {t('editProfile')}
        </button>
      </div>

      {/* Contact info */}
      <div className="sach-card hoverable" style={{ marginBottom: 16, padding: '4px 0' }}>
        <h4 className="section-title" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}><PhoneIcon size={14} color={colors.gold} /> Contact Information</h4>
        {renderRow(<PhoneIcon size={16} color={colors.gold} />, 'Phone', profile.altPhone || 'Not set')}
        {renderRow(<MailIcon size={16} color={colors.gold} />, 'Email', profile.email || 'Not set')}
      </div>

      {/* Residential info */}
      <div className="sach-card hoverable" style={{ marginBottom: 16, padding: '4px 0' }}>
        <h4 className="section-title" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}><HomeIcon size={14} color={colors.gold} /> Residential Information</h4>
        {renderRow(<MapPinIcon size={16} color={colors.gold} />, 'Address', profile.address || 'Not set')}
        {renderRow(<HomeIcon size={16} color={colors.gold} />, 'District / City', `${profile.district || 'N/A'} · ${profile.city || 'N/A'}`)}
      </div>

      {/* Settings tiles */}
      <div className="sach-card" style={{ padding: '4px 0' }}>
        <div className="settings-tile hoverable" onClick={() => navigate('/dashboard/edit-profile')}>
          <SettingsIcon size={18} color={colors.gold} />
          <span style={{ flex: 1 }}>Account Settings</span>
          <ChevronRight size={16} color={colors.textSub} />
        </div>
        <div className="settings-tile hoverable">
          <GlobeIcon size={18} color={colors.gold} />
          <span style={{ flex: 1 }}>Language Preferences</span>
          <ChevronRight size={16} color={colors.textSub} />
        </div>
        <div className="settings-tile hoverable" onClick={() => navigate('/')} style={{ color: colors.red }}>
          <LogoutIcon size={18} color={colors.red} />
          <span style={{ flex: 1 }}>{t('signOut')}</span>
          <ChevronRight size={16} color={colors.textSub} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
