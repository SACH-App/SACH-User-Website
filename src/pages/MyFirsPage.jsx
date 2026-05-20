import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, getStatusColor, formatStatus, getCategoryIcon, SearchIcon, PlusIcon, FolderIcon, ChevronRight, MapPinIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { fetchWithAuth } from '../utils/api';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_investigation', label: 'Under Investigation' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const MyFirsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadFirs = async () => {
      try {
        const res = await fetchWithAuth('/api/v1/user/firs?page=1&page_size=100');
        if (res.ok) {
          const data = await res.json();
          setFirs(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load FIRs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFirs();
  }, []);

  const filtered = useMemo(() => {
    return firs.filter(fir => {
      if (filter !== 'all' && fir.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (fir.tracking_number?.toLowerCase().includes(q) || 
                fir.category?.toLowerCase().includes(q) || 
                fir.description?.toLowerCase().includes(q) || 
                fir.incident_location?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [firs, filter, search]);

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="sach-input-icon" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon-left"><SearchIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="sach-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          {statusFilters.map(s => <option key={s.value} value={s.value}>{s.value === 'all' ? t('allComplaints') : s.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: colors.textSub }}>
          {filtered.length} {filtered.length === 1 ? 'complaint' : 'complaints'}{filter !== 'all' ? ` · ${statusFilters.find(s => s.value === filter)?.label}` : ''}
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
            const dateStr = new Date(fir.created_at).toLocaleDateString();
            return (
              <div key={fir.id} className="fir-card hoverable" onClick={() => navigate(`/dashboard/fir/${fir.id}`)} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="fir-card-icon">{getCategoryIcon(fir.category)}</div>
                <div className="fir-card-body">
                  <div className="fir-card-header">
                    <div>
                      <div className="fir-card-id">{fir.tracking_number}</div>
                      <div className="fir-card-date">{dateStr}</div>
                    </div>
                    <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>{formatStatus(fir.status)}</span>
                  </div>
                  {fir.category && <div style={{ fontSize: 12, color: colors.gold, fontWeight: 600, marginTop: 6 }}>{fir.category}</div>}
                  <div className="fir-card-title">{fir.description.substring(0, 80)}...</div>
                  {fir.incident_location && <div className="fir-card-location"><MapPinIcon size={11} color={colors.textSub} /> {fir.incident_location}</div>}
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
