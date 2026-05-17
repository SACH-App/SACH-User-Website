import React, { useState } from 'react';
import { colors, BellIcon, CheckCircleIcon, TrashIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useAlerts } from '../stores/AlertStore';

const AlertsPage = () => {
  const { t } = useLanguage();
  const { alerts, unreadCount, markAllRead, markRead, clearAll } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('alertsTitle')}</h3>
          {unreadCount > 0 && <span style={{ background: 'rgba(212,175,55,0.12)', color: colors.gold, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(212,175,55,0.3)' }}>{unreadCount} {t('unread')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sach-btn sach-btn-outline" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={markAllRead}>
            <CheckCircleIcon size={14} /> {t('markAllRead')}
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="sach-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ opacity: 0.3, marginBottom: 14 }}><BellIcon size={48} color={colors.textSub} /></div>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t('noAlerts')}</p>
          <p style={{ fontSize: 13, color: colors.textSub }}>{t('noAlertsHint')}</p>
        </div>
      ) : (
        <div className="stagger-list">
          {alerts.map((alert, i) => (
            <div key={alert.id} className={`alert-card hoverable ${!alert.is_read ? 'unread' : ''}`} style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => { markRead(alert.id); setSelectedAlert(alert); }}>
              <div className="alert-icon-circle" style={{
                background: !alert.is_read ? 'rgba(1,118,58,0.08)' : 'transparent',
                border: `1px solid ${!alert.is_read ? 'rgba(1,118,58,0.2)' : colors.divider}`,
              }}>
                <BellIcon size={18} color={!alert.is_read ? colors.gold : colors.textSub} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: !alert.is_read ? 700 : 500, marginBottom: 2 }}>{alert.title}</p>
                <p style={{ fontSize: 11, color: colors.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.message}</p>
                <p style={{ fontSize: 9, color: colors.textSub, marginTop: 4 }}>{new Date(alert.created_at).toLocaleString()}</p>
              </div>
              {!alert.is_read && <div className="alert-unread-dot" />}
            </div>
          ))}
        </div>
      )}

      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="modal-icon-circle"><BellIcon size={28} color={colors.gold} /></div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{selectedAlert.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, textAlign: 'center' }}>{selectedAlert.message}</p>
            <p style={{ fontSize: 11, color: colors.textSub, marginTop: 12, textAlign: 'center' }}>{new Date(selectedAlert.created_at).toLocaleString()}</p>
            <button className="sach-btn sach-btn-outline" style={{ marginTop: 20 }} onClick={() => setSelectedAlert(null)}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
