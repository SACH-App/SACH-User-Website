import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, getStatusColor, getCategoryIcon, SearchIcon, PlusIcon, FolderIcon, ChevronRight, MapPinIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useFirs } from '../stores/FirStore';

const statusFilters = ['All', 'Pending', 'Investigating', 'Resolved', 'Closed', 'Under Review'];

const MyFirsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { firs } = useFirs();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    return firs.filter(fir => {
      if (filter !== 'All' && fir.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return fir.id.toLowerCase().includes(q) || fir.category.toLowerCase().includes(q) || fir.description.toLowerCase().includes(q) || fir.city.toLowerCase().includes(q) || fir.address.toLowerCase().includes(q);
      }
      return true;
    });
  }, [firs, filter, search]);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="sach-input-icon" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon-left"><SearchIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="sach-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          {statusFilters.map(s => <option key={s} value={s}>{s === 'All' ? t('allComplaints') : s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: colors.textSub }}>
          {filtered.length} {filtered.length === 1 ? 'complaint' : 'complaints'}{filter !== 'All' ? ` · ${filter}` : ''}
        </p>
        <button className="sach-btn sach-btn-gradient" style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }} onClick={() => navigate('/dashboard/file-fir')}>
          <PlusIcon size={14} /> {t('fileNewFir')}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="sach-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ marginBottom: 16, opacity: 0.4 }}><FolderIcon size={52} color={colors.textSub} /></div>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t('noComplaintsFilter')}</p>
          <p style={{ fontSize: 13, color: colors.textSub }}>{t('tapToFileFir')}</p>
        </div>
      ) : (
        <div className="stagger-list">
          {filtered.map((fir, i) => {
            const statusColor = getStatusColor(fir.status);
            return (
              <div key={fir.id} className="fir-card hoverable" onClick={() => navigate(`/dashboard/fir/${fir.id}`)} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="fir-card-icon">{getCategoryIcon(fir.category)}</div>
                <div className="fir-card-body">
                  <div className="fir-card-header">
                    <div>
                      <div className="fir-card-id">{fir.id}</div>
                      <div className="fir-card-date">{fir.date}</div>
                    </div>
                    <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>{fir.status}</span>
                  </div>
                  {fir.category && <div style={{ fontSize: 12, color: colors.gold, fontWeight: 600, marginTop: 6 }}>{fir.category}</div>}
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
  );
};

export default MyFirsPage;
