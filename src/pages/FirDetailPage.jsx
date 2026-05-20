import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { colors, getStatusColor, formatStatus, getCategoryIcon, ArrowLeft, SendIcon, EyeIcon, SearchIcon, CheckCircleIcon, LockIcon, ShieldIcon, CalendarIcon, MapPinIcon, HashIcon, FileIcon, UserIcon, LinkIcon, ClipboardIcon, FlagIcon, UploadIcon, ClockIcon, PhoneIcon, MailIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { fetchWithAuth } from '../utils/api';

const pipelineIcons = [
  <ClockIcon size={14} color="#fff" />,
  <EyeIcon size={14} color="#fff" />,
  <SearchIcon size={14} color="#fff" />,
  <CheckCircleIcon size={14} color="#fff" />,
  <LockIcon size={14} color="#fff" />,
];
const pipelineLabels = ['Pending', 'Reviewed', 'Investigating', 'Resolved', 'Closed'];
const pipelineMap = {
  'pending': 0, 'filed': 0,
  'under_review': 1, 'under review': 1, 'reviewed': 1,
  'under_investigation': 2, 'under investigation': 2, 'investigating': 2,
  'resolved': 3,
  'closed': 4
};

const FirDetailPage = () => {
  const { firId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!fir || !mapContainerRef.current) return;

    const initMap = async () => {
      let lat = fir.latitude;
      let lng = fir.longitude;

      // Geocoding fallback for legacy FIRs
      if (lat === null || lng === null || lat === undefined || lng === undefined) {
        // First try to extract embedded coords from incident_location string e.g. "...[33.123456,73.123456]"
        const coordMatch = (fir.incident_location || '').match(/\[(-?\d+\.\d+),(-?\d+\.\d+)\]/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        } else {
          try {
            const locationQuery = (fir.incident_location || '').replace(/\[.*?\]/, '').trim();
            const query = encodeURIComponent(locationQuery || 'Islamabad, Pakistan');
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                lat = parseFloat(data[0].lat);
                lng = parseFloat(data[0].lon);
              }
            }
          } catch (err) {
            console.error('Forward geocoding fallback error:', err);
          }
        }
      }

      // Default fallback
      if (lat === null || lng === null || lat === undefined || lng === undefined) {
        lat = 33.6844;
        lng = 73.0479;
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          attributionControl: false
        }).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        L.DomUtil.addClass(map.getContainer(), 'sach-dark-map');

        const goldPinIcon = L.divIcon({
          html: `<div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #D4AF37; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #060E08; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              <div style="width: 10px; height: 10px; background: #060E08; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="background: rgba(212,175,55,0.4); width: 8px; height: 8px; border-radius: 50%; margin-top: -2px; filter: blur(1px);"></div>
          </div>`,
          className: 'custom-gold-pin',
          iconSize: [32, 40],
          iconAnchor: [16, 40]
        });

        const marker = L.marker([lat, lng], {
          icon: goldPinIcon
        }).addTo(map);

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 14);
        markerRef.current.setLatLng([lat, lng]);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [fir]);

  const fetchFir = async () => {
    try {
      const res = await fetchWithAuth(`/api/v1/user/fir/${firId}`);
      if (res.ok) {
        const data = await res.json();
        setFir(data);
      }
    } catch (err) {
      console.error('Failed to fetch FIR detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFir();
  }, [firId]);

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetchWithAuth(`/api/v1/user/fir/${fir.id}/evidence`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await fetchFir();
        alert('Evidence uploaded successfully!');
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to upload evidence');
      }
    } catch (err) {
      console.error('Evidence upload error:', err);
      alert('An error occurred while uploading evidence.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  if (!fir) return (
    <div className="page-enter" style={{ textAlign: 'center', paddingTop: 60 }}>
      <FlagIcon size={48} color={colors.textSub} />
      <p style={{ fontSize: 18, fontWeight: 700, marginTop: 16 }}>FIR not found</p>
      <p style={{ fontSize: 13, color: colors.textSub, marginTop: 6 }}>Case ID "{firId}" does not exist</p>
      <button className="sach-btn sach-btn-outline" style={{ width: 'auto', padding: '10px 24px', marginTop: 20 }} onClick={() => navigate('/dashboard/my-firs')}>Back to My FIRs</button>
    </div>
  );

  const statusColor = getStatusColor(fir.status);
  const activeStep = pipelineMap[fir.status?.toLowerCase()] ?? 0;

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
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{fir.tracking_number}</h2>
            <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>{formatStatus(fir.status)}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 8 }}>{fir.title}</h3>
          <p style={{ fontSize: 12, color: colors.textSub, marginTop: 4 }}>{fir.category} &middot; {new Date(fir.created_at).toLocaleDateString()}</p>
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
                {i < pipelineLabels.length - 1 && <div className="timeline-line" style={{ background: i < activeStep ? colors.green : 'rgba(255,255,255,0.35)' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><HashIcon size={14} color={colors.gold} /><span className="detail-label">Case ID</span></div>
          <p className="detail-value">{fir.tracking_number}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><FileIcon size={14} color={colors.gold} /><span className="detail-label">Priority</span></div>
          <p className="detail-value" style={{ textTransform: 'capitalize' }}>{fir.priority}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><CalendarIcon size={14} color={colors.gold} /><span className="detail-label">Filed Date</span></div>
          <p className="detail-value">{new Date(fir.created_at).toLocaleDateString()}</p>
        </div>
        <div className="sach-card-sm hoverable">
          <div className="detail-row"><FileIcon size={14} color={colors.gold} /><span className="detail-label">Category</span></div>
          <p className="detail-value">{fir.category}</p>
        </div>
        <div className="sach-card-sm hoverable" style={{ gridColumn: '1 / -1' }}>
          <div className="detail-row"><MapPinIcon size={14} color={colors.gold} /><span className="detail-label">Location</span></div>
          <p className="detail-value">{(fir.incident_location || 'Not provided').replace(/\s*\[.*?\]\s*$/, '')}</p>
        </div>
      </div>

      {/* Map Portion */}
      <div className="sach-card hoverable" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><MapPinIcon size={14} color={colors.gold} /> Incident Location Map</h4>
        </div>
        <div ref={mapContainerRef} className="sach-dark-map" style={{ height: 220, position: 'relative' }} />
      </div>

      {/* Description */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardIcon size={14} color={colors.gold} /> Description</h4>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{fir.description}</p>
        {fir.incident_date && <p style={{ fontSize: 11, color: colors.textSub, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><CalendarIcon size={11} color={colors.textSub} /> Incident: {new Date(fir.incident_date).toLocaleString()}</p>}
      </div>

      {/* Assigned Officer card */}
      <div className="sach-card hoverable" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="officer-avatar" style={{ background: fir.officer_name ? 'rgba(1,118,58,0.15)' : 'rgba(255,255,255,0.03)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldIcon size={20} color={fir.officer_name ? colors.gold : colors.textSub} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: colors.textSub, fontWeight: 500 }}>Assigned Officer</p>
            <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: fir.officer_name ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {fir.officer_name || 'Not Assigned Yet'}
            </p>
          </div>
        </div>
        {fir.officer_name ? (
          <button 
            className="sach-btn sach-btn-gradient" 
            style={{ width: 'auto', padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setContactModalOpen(true)}
          >
            <PhoneIcon size={12} /> Contact Officer
          </button>
        ) : (
          <span style={{ fontSize: 12, color: colors.textSub, fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: 6 }}>
            Pending Assignment
          </span>
        )}
      </div>

      {/* Evidence */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><FileIcon size={14} color={colors.gold} /> Attached Evidence</h4>
        {fir.evidence && fir.evidence.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {fir.evidence.map(ev => (
              <a key={ev.id} href={ev.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, textDecoration: 'none', color: '#fff' }}>
                <FileIcon size={16} color={colors.textSub} />
                <span style={{ flex: 1, fontSize: 13 }}>{ev.file_name}</span>
                <span style={{ fontSize: 11, color: colors.green }}>View</span>
              </a>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 16 }}>No evidence attached to this case yet.</p>
        )}

        <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 8, border: `1.5px dashed ${colors.divider}`, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }} className="hoverable">
            <input type="file" style={{ display: 'none' }} onChange={handleEvidenceUpload} disabled={uploadingEvidence} accept="image/*,.pdf" />
            <UploadIcon size={16} color={colors.gold} />
            <span style={{ fontSize: 13, color: colors.textSub }}>
              {uploadingEvidence ? 'Uploading...' : 'Attach New Evidence (Image/PDF)'}
            </span>
          </label>
        </div>
      </div>

      {/* Comments / Updates */}
      {fir.comments && fir.comments.length > 0 && (
        <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><SendIcon size={14} color={colors.gold} /> Official Updates</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fir.comments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(1,118,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldIcon size={16} color={colors.gold} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{comment.author_name || 'System / Admin'}</span>
                    <span style={{ fontSize: 11, color: colors.textSub }}>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockchain */}
      {fir.blockchain_hash && (
        <div className="sach-card hoverable" style={{ background: 'rgba(1,118,58,0.04)' }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.green, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><LinkIcon size={14} color={colors.green} /> Secure Cryptographic Record</h4>
          <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#7FFFB8', wordBreak: 'break-all', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>{fir.blockchain_hash}</p>
          <p style={{ fontSize: 10, color: colors.textSub, marginTop: 8 }}>This record is secured via cryptographic digital signature and cannot be altered or deleted.</p>
        </div>
      )}

      {/* Contact Officer Modal */}
      {contactModalOpen && fir.officer_name && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(6, 14, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.25s ease-out'
        }} onClick={() => setContactModalOpen(false)}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div className="sach-card" style={{
            width: '90%',
            maxWidth: 420,
            background: colors.bgCard,
            border: `1.5px solid rgba(1, 118, 58, 0.3)`,
            boxShadow: colors.greenGlow,
            padding: 24,
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldIcon size={20} color={colors.gold} /> Contact Investigating Officer
            </h3>
            <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 20 }}>
              Direct encrypted communication channel for Case ID: <strong>{fir.tracking_number}</strong>
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20
            }}>
              <div className="profile-avatar" style={{ width: 44, height: 44, borderRadius: '50%', background: colors.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={20} color="#fff" />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fir.officer_name}</h4>
                <p style={{ fontSize: 11, color: colors.textSub }}>SACH Investigation Unit</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <PhoneIcon size={14} color={fir.officer_phone ? colors.gold : colors.textSub} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: colors.textSub }}>Direct Phone</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: fir.officer_phone ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                    {fir.officer_phone || 'Not available'}
                  </p>
                </div>
                {fir.officer_phone && (
                  <button className="sach-btn-text" style={{ padding: '4px 8px', fontSize: 11, color: colors.gold }} onClick={() => window.location.href = `tel:${fir.officer_phone}`}>Call</button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <MailIcon size={14} color={fir.officer_email ? colors.gold : colors.textSub} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: colors.textSub }}>Official Email</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: fir.officer_email ? '#fff' : 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fir.officer_email || 'Not available'}
                  </p>
                </div>
                {fir.officer_email && (
                  <button className="sach-btn-text" style={{ padding: '4px 8px', fontSize: 11, color: colors.gold }} onClick={() => window.location.href = `mailto:${fir.officer_email}`}>Email</button>
                )}
              </div>
            </div>

            <button className="sach-btn sach-btn-gradient" style={{ width: '100%' }} onClick={() => setContactModalOpen(false)}>
              Close Dialog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirDetailPage;
