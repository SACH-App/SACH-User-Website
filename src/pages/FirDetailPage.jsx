import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, getStatusColor, getCategoryIcon, ArrowLeft, SendIcon, EyeIcon, SearchIcon, CheckCircleIcon, LockIcon, ShieldIcon, CalendarIcon, MapPinIcon, HashIcon, FileIcon, UserIcon, LinkIcon, ClipboardIcon, FlagIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useFirs } from '../stores/FirStore';

const pipelineIcons = [
  <SendIcon size={14} color="#fff" />,
  <EyeIcon size={14} color="#fff" />,
  <SearchIcon size={14} color="#fff" />,
  <CheckCircleIcon size={14} color="#fff" />,
  <LockIcon size={14} color="#fff" />,
];
const pipelineLabels = ['Filed', 'Reviewed', 'Investigating', 'Resolved', 'Closed'];
const pipelineMap = { 'Pending': 0, 'Under Review': 1, 'Investigating': 2, 'Resolved': 3, 'Closed': 4 };

const FirDetailPage = () => {
  const { firId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getFir } = useFirs();
  const fir = getFir(firId);

  if (!fir) return (
    <div className="page-enter" style={{ textAlign: 'center', paddingTop: 60 }}>
      <FlagIcon size={48} color={colors.textSub} />
      <p style={{ fontSize: 18, fontWeight: 700, marginTop: 16 }}>FIR not found</p>
      <p style={{ fontSize: 13, color: colors.textSub, marginTop: 6 }}>Case ID "{firId}" does not exist</p>
      <button className="sach-btn sach-btn-outline" style={{ width: 'auto', padding: '10px 24px', marginTop: 20 }} onClick={() => navigate('/dashboard/my-firs')}>Back to My FIRs</button>
    </div>
  );

  const statusColor = getStatusColor(fir.status);
  const activeStep = pipelineMap[fir.status] ?? 0;

  return (
    <div className="page-enter">
      <button className="sach-btn-text" style={{ color: colors.gold, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }} onClick={() => navigate('/dashboard/my-firs')}>
        <ArrowLeft size={16} /> Back to My FIRs
      </button>

      {/* Header card */}
      <div className="sach-card hoverable" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="fir-card-icon" style={{ width: 52, height: 52, borderRadius: 14 }}>{getCategoryIcon(fir.category)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{fir.id}</h2>
            <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>{fir.status}</span>
          </div>
          <p style={{ fontSize: 12, color: colors.textSub, marginTop: 4 }}>{fir.category} &middot; {fir.date}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><FlagIcon size={14} color={colors.gold} /> Status Timeline</h4>
        <div className="timeline">
          {pipelineLabels.map((label, i) => {
            const done = i <= activeStep;
            return (
              <React.Fragment key={i}>
                <div className="timeline-step">
                  <div className="timeline-circle" style={{
                    background: done ? colors.green : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${done ? colors.green : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: i === activeStep ? '0 0 14px rgba(1,118,58,0.5)' : 'none',
                  }}>{pipelineIcons[i]}</div>
                  <span className="timeline-label" style={{ color: done ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: i === activeStep ? 700 : 500 }}>{label}</span>
                </div>
                {i < pipelineLabels.length - 1 && <div className="timeline-line" style={{ background: i < activeStep ? colors.green : 'rgba(255,255,255,0.1)' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><HashIcon size={14} color={colors.gold} /><span className="detail-label">Case ID</span></div>
          <p className="detail-value">{fir.id}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><CalendarIcon size={14} color={colors.gold} /><span className="detail-label">Filed Date</span></div>
          <p className="detail-value">{fir.date}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><FileIcon size={14} color={colors.gold} /><span className="detail-label">Category</span></div>
          <p className="detail-value">{fir.category}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><MapPinIcon size={14} color={colors.gold} /><span className="detail-label">Location</span></div>
          <p className="detail-value">{fir.address}, {fir.city}</p>
        </div>
      </div>

      {/* Description */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardIcon size={14} color={colors.gold} /> Description</h4>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{fir.description}</p>
        {fir.incidentDate && <p style={{ fontSize: 11, color: colors.textSub, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><CalendarIcon size={11} color={colors.textSub} /> Incident: {fir.incidentDate}</p>}
      </div>

      {/* Officer card */}
      {fir.officer && (
        <div className="sach-card hoverable" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="officer-avatar"><ShieldIcon size={20} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>{fir.officer.name}</p>
            <p style={{ fontSize: 11, color: colors.textSub }}>{fir.officer.rank} &middot; {fir.officer.badge}</p>
          </div>
          <div className="officer-badge"><UserIcon size={14} color={colors.gold} /></div>
        </div>
      )}

      {/* Meta card */}
      <div className="sach-card-sm hoverable" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: colors.textSub }}>District: {fir.district || 'N/A'}</span>
          <span style={{ fontSize: 11, color: colors.textSub }}>City: {fir.city}</span>
        </div>
      </div>

      {/* Blockchain */}
      {fir.blockchainHash && (
        <div className="sach-card hoverable" style={{ background: 'rgba(1,118,58,0.04)' }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.green, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><LinkIcon size={14} color={colors.green} /> Blockchain Immutable Record</h4>
          <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#7FFFB8', wordBreak: 'break-all', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>{fir.blockchainHash}</p>
          <p style={{ fontSize: 10, color: colors.textSub, marginTop: 8 }}>This record is secured on Hyperledger Fabric and cannot be altered or deleted.</p>
        </div>
      )}
    </div>
  );
};

export default FirDetailPage;
