import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, getStatusColor, getCategoryIcon, UserIcon, CheckCircleIcon, FileIcon, PlusIcon, FolderIcon, ClockIcon, ChevronRight, MapPinIcon, BellIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';
import { useFirs } from '../stores/FirStore';
import { useAlerts } from '../stores/AlertStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t, isUrdu } = useLanguage();
  const { profile } = useUser();
  const { firs, stats } = useFirs();
  const { alerts, unreadCount } = useAlerts();
  const recentFirs = firs.slice(0, 5);
  const recentAlerts = alerts.filter(a => a.isUnread).slice(0, 3);

  return (
    <div className="page-enter">
      {/* Welcome card */}
      <div className="sach-card hoverable" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', marginBottom: 24, background: `linear-gradient(135deg, ${colors.bgCard}, rgba(1,118,58,0.06))` }}>
        <div className="profile-avatar"><UserIcon size={28} color="#fff" /></div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{profile.fullName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="verified-chip"><CheckCircleIcon size={12} color={colors.emerald} /> {t('nadraVerified')}</span>
            <span style={{ fontSize: 11, color: colors.textSub }}>{profile.cnic}</span>
          </div>
        </div>
      </div>

      {/* Lodge FIR CTA */}
      <div className="sach-card hoverable" style={{ background: `linear-gradient(135deg, #0D2B15, #071A0E)`, border: `1.5px solid rgba(1,118,58,0.3)`, marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('/dashboard/file-fir')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{t('lodgeFir')}</h3>
            <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>{t('fileSecurely')}</p>
            <button className="sach-btn sach-btn-gradient" style={{ width: 'auto', padding: '12px 24px' }}>
              <PlusIcon size={16} /> {t('startNewComplaint')}
            </button>
          </div>
          <div style={{ opacity: 0.12 }}><FileIcon size={64} color="#fff" /></div>
        </div>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="stat-chip hoverable">
            <div className="stat-chip-icon"><FolderIcon size={18} color={colors.gold} /></div>
            <div><div className="stat-chip-label">{t('totalFirs')}</div><div className="stat-chip-value">{stats.total}</div></div>
          </div>
          <div className="stat-chip hoverable">
            <div className="stat-chip-icon" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}><ClockIcon size={18} color={colors.statusPending} /></div>
            <div><div className="stat-chip-label">{t('pending')}</div><div className="stat-chip-value" style={{ color: colors.statusPending }}>{stats.pending}</div></div>
          </div>
          <div className="stat-chip hoverable">
            <div className="stat-chip-icon" style={{ background: 'rgba(1,118,58,0.08)', borderColor: 'rgba(1,118,58,0.2)' }}><CheckCircleIcon size={18} color={colors.statusResolved} /></div>
            <div><div className="stat-chip-label">{t('resolved')}</div><div className="stat-chip-value" style={{ color: colors.statusResolved }}>{stats.resolved}</div></div>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('recentComplaints')}</h3>
          {firs.length > 0 && (
            <button className="sach-btn-text" style={{ color: colors.gold, fontSize: 12, fontWeight: 600 }} onClick={() => navigate('/dashboard/my-firs')}>
              {t('viewAll')} <ChevronRight size={12} />
            </button>
          )}
        </div>
        {recentFirs.length === 0 ? (
          <div className="sach-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ marginBottom: 14, opacity: 0.4 }}><FolderIcon size={44} color={colors.textSub} /></div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t('noComplaintsYet')}</p>
            <p style={{ fontSize: 12, color: colors.textSub, lineHeight: 1.6 }}>{t('noComplaintsHint')}</p>
          </div>
        ) : (
          <div className="stagger-list">
            {recentFirs.map((fir, i) => {
              const statusColor = getStatusColor(fir.status);
              return (
                <div key={fir.id} className="fir-card hoverable" onClick={() => navigate(`/dashboard/fir/${fir.id}`)} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="fir-card-icon">{getCategoryIcon(fir.category)}</div>
                  <div className="fir-card-body">
                    <div className="fir-card-header">
                      <div>
                        <div className="fir-card-id">{fir.id}</div>
                        <div className="fir-card-date">{fir.date}</div>
                      </div>
                      <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>{fir.status}</span>
                    </div>
                    <div className="fir-card-title">{fir.description}</div>
                    {fir.address && <div className="fir-card-location"><MapPinIcon size={11} color={colors.textSub} /> {fir.address}, {fir.city}</div>}
                  </div>
                  <span className="fir-card-chevron"><ChevronRight size={18} color={colors.textSub} /></span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Latest Alerts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('latestAlerts')}</h3>
            {unreadCount > 0 && <span style={{ background: 'rgba(212,175,55,0.12)', color: colors.gold, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(212,175,55,0.3)' }}>{unreadCount} {t('unread')}</span>}
          </div>
          <button className="sach-btn-text" style={{ color: colors.gold, fontSize: 12, fontWeight: 600 }} onClick={() => navigate('/dashboard/alerts')}>
            {t('viewAllAlerts')} <ChevronRight size={12} />
          </button>
        </div>
        {recentAlerts.length === 0 ? (
          <div className="sach-card-sm" style={{ textAlign: 'center', padding: 28, color: colors.textSub }}><p>{t('noAlertsYet')}</p></div>
        ) : (
          <div className="stagger-list">
            {recentAlerts.map((alert, i) => (
              <div key={alert.id} className="alert-card unread hoverable" onClick={() => navigate('/dashboard/alerts')} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="alert-icon-circle" style={{ background: 'rgba(1,118,58,0.08)', border: '1px solid rgba(1,118,58,0.2)' }}>
                  <BellIcon size={18} color={colors.gold} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{isUrdu ? alert.titleUr : alert.titleEn}</p>
                  <p style={{ fontSize: 11, color: colors.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isUrdu ? alert.subtitleUr : alert.subtitleEn}</p>
                </div>
                <div className="alert-unread-dot" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
