import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, categories, cities, cityDistricts, generateBlockchainHash, validators, MapPinIcon, MapIcon, CalendarIcon, FileIcon, UploadIcon, CheckCircleIcon, InfoIcon, ShieldCheckIcon, ChevronRight, LinkIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useFirs } from '../stores/FirStore';
import { fetchWithAuth } from '../utils/api';

const steps = ['Location', 'Details', 'Evidence'];

const FileFirPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addFir, firs } = useFirs();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedFir, setSubmittedFir] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableDistricts = city ? (cityDistricts[city] || []) : [];

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!validators.required(address)) errs.address = 'Street address is required';
      if (!city) errs.city = 'Please select a city';
      if (!district) errs.district = 'Please select a district';
    } else if (step === 1) {
      if (!incidentDate) errs.incidentDate = 'Incident date is required';
      if (!category) errs.category = 'Incident category is required';
      if (!validators.minLength(description, 10)) errs.description = 'Description must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Prepare Date
      const isoDate = new Date(`${incidentDate}T${incidentTime || '00:00'}:00Z`).toISOString();
      
      // 2. Prepare payload
      const categoryMap = {
        'Theft': 'theft',
        'Robbery': 'robbery',
        'Assault / Violence': 'assault',
        'Fraud / Scam': 'fraud',
        'Cybercrime': 'cybercrime',
        'Harassment': 'harassment',
        'Murder': 'murder',
        'Kidnapping': 'kidnapping',
        'Domestic Violence': 'domestic_violence',
        'Other': 'other'
      };
      const backendCategory = categoryMap[category] || 'other';

      const payload = {
        title: category,
        description,
        incident_date: isoDate,
        incident_location: `${address}, ${district}, ${city}`,
        category: backendCategory,
        priority: 'medium'
      };

      // 3. Submit FIR
      const res = await fetchWithAuth('/api/v1/user/fir', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to submit FIR');
      }

      const createdFir = await res.json();

      // 4. Upload Evidence if present
      if (evidenceFile) {
        const formData = new FormData();
        formData.append('file', evidenceFile);
        
        await fetchWithAuth(`/api/v1/user/fir/${createdFir.id}/evidence`, {
          method: 'POST',
          body: formData
        });
      }

      setSubmittedFir(createdFir);
      setShowSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIcons = [<MapPinIcon size={12} color="#fff" />, <FileIcon size={12} color="#fff" />, <UploadIcon size={12} color="#fff" />];

  return (
    <div className="page-enter">
      {/* Stepper */}
      <div className="sach-card" style={{ padding: '16px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="stepper-step">
                <div className="stepper-circle" style={{
                  background: i <= step ? colors.green : 'rgba(9,21,9,0.3)', border: `2px solid ${i <= step ? colors.green : colors.divider}`,
                  color: i <= step ? '#fff' : colors.textSub, boxShadow: i === step ? '0 0 12px rgba(1,118,58,0.4)' : 'none',
                }}>{i < step ? <CheckCircleIcon size={14} color="#fff" /> : stepIcons[i]}</div>
                <span className="stepper-label" style={{ color: i <= step ? colors.green : colors.textSub, fontWeight: i === step ? 700 : 500 }}>{t(`step${label}`)}</span>
              </div>
              {i < steps.length - 1 && <div className="stepper-line" style={{ flex: 1, background: i < step ? colors.green : colors.divider, marginTop: 14 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="sach-card" style={{ animation: 'slideUp 0.3s ease' }}>
        {step === 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><MapPinIcon size={18} color={colors.gold} /> {t('stepLocation')}</h3>
            <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 20 }}>Enter the incident location details</p>
            <div style={{ width: '100%', height: 180, borderRadius: 12, background: 'linear-gradient(135deg, #0a1f12, #081a0e)', border: `1.5px solid ${colors.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(1,118,58,0.1), transparent 70%)' }} />
              <div style={{ textAlign: 'center', zIndex: 1 }}><MapIcon size={32} color={colors.textSub} /><p style={{ fontSize: 11, color: colors.textSub, marginTop: 6 }}>Map view</p></div>
              {useGps && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 20, height: 20, borderRadius: '50%', background: colors.green, border: '3px solid #fff', boxShadow: `0 0 12px ${colors.green}`, zIndex: 2, animation: 'pulse 2s infinite' }} />}
            </div>
            <button className={`sach-btn ${useGps ? 'sach-btn-gradient' : 'sach-btn-outline'}`} style={{ marginBottom: 20, padding: '10px 16px', fontSize: 13 }} onClick={() => setUseGps(!useGps)}>
              <MapPinIcon size={14} /> {useGps ? t('usingCurrentLocation') : t('useCurrentLocation')}
            </button>
            <label className="sach-label">{t('streetAddress')}</label>
            <input className="sach-input" placeholder="Enter street address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ marginBottom: errors.address ? 4 : 16 }} />
            {errors.address && <p className="field-error">{errors.address}</p>}
            <label className="sach-label" style={{ marginTop: errors.address ? 12 : 0 }}>{t('cityArea')}</label>
            <select className="sach-select" value={city} onChange={(e) => { setCity(e.target.value); setDistrict(''); }} style={{ marginBottom: errors.city ? 4 : 16 }}>
              <option value="">Select City</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="field-error">{errors.city}</p>}
            <label className="sach-label" style={{ marginTop: errors.city ? 12 : 0 }}>{t('district')}</label>
            <select className="sach-select" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!city} style={{ marginBottom: errors.district ? 4 : 16 }}>
              <option value="">{t('selectDistrict')}</option>{availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="field-error">{errors.district}</p>}
            <button className="sach-btn sach-btn-gradient" style={{ marginTop: 8 }} onClick={handleNext}>{t('nextDetails')} <ChevronRight size={14} /></button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><FileIcon size={18} color={colors.gold} /> {t('stepDetails')}</h3>
            <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 20 }}>Provide incident details</p>
            <label className="sach-label">{t('incidentDateTime')}</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: errors.incidentDate ? 4 : 16 }}>
              <input className="sach-input" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} style={{ flex: 1, colorScheme: 'dark' }} />
              <input className="sach-input" type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} style={{ flex: 1, colorScheme: 'dark' }} />
            </div>
            {errors.incidentDate && <p className="field-error">{errors.incidentDate}</p>}
            <label className="sach-label" style={{ marginTop: errors.incidentDate ? 12 : 0 }}>{t('incidentCategory')}</label>
            <select className="sach-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginBottom: errors.category ? 4 : 16 }}>
              <option value="">{t('selectCategory')}</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
            <label className="sach-label" style={{ marginTop: errors.category ? 12 : 0 }}>{t('incidentDescription')}</label>
            <textarea className="sach-textarea" placeholder={t('descHint')} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: errors.description ? 4 : 16 }} />
            {errors.description && <p className="field-error">{errors.description}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="sach-btn sach-btn-outline" onClick={() => setStep(0)}>Back</button>
              <button className="sach-btn sach-btn-gradient" onClick={handleNext}>{t('nextEvidence')} <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><UploadIcon size={18} color={colors.gold} /> {t('stepEvidence')}</h3>
            <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 20 }}>{t('uploadHint')}</p>
            <label className="upload-zone hoverable" style={{ borderColor: evidenceFile ? colors.green : colors.divider, background: evidenceFile ? 'rgba(1,118,58,0.06)' : 'transparent', display: 'block', cursor: 'pointer' }}>
              <input type="file" style={{ display: 'none' }} onChange={(e) => setEvidenceFile(e.target.files[0])} accept="image/*,.pdf" />
              {evidenceFile ? <CheckCircleIcon size={36} color={colors.green} /> : <UploadIcon size={36} color={colors.textSub} />}
              <p style={{ fontSize: 14, fontWeight: 600, color: evidenceFile ? colors.green : colors.textSub, marginTop: 8 }}>{evidenceFile ? evidenceFile.name : t('tapToUpload')}</p>
            </label>
            <div className="notice-box gold" style={{ marginBottom: 24, marginTop: 16 }}>
              <InfoIcon size={14} color={colors.gold} />
              <p style={{ fontSize: 11, color: 'rgba(212,175,55,0.8)', lineHeight: 1.6 }}>{t('evidenceOptional')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="sach-btn sach-btn-outline" onClick={() => setStep(1)} disabled={isSubmitting}>Back</button>
              <button className="sach-btn sach-btn-gradient" onClick={handleSubmit} disabled={isSubmitting}>
                <ShieldCheckIcon size={16} /> {isSubmitting ? 'Submitting...' : t('submitFir')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showSuccess && submittedFir && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div className="modal-icon-circle pulse-anim"><CheckCircleIcon size={36} color={colors.green} /></div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{t('firSubmitted')}</h2>
            <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 20 }}>{t('firConfirmMsg')}</p>
            <div style={{ background: 'rgba(1,118,58,0.08)', border: '1px solid rgba(1,118,58,0.25)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: colors.textSub }}>Case ID</span>
              <p style={{ fontSize: 16, fontWeight: 800, color: colors.gold, marginTop: 2 }}>{submittedFir.tracking_number}</p>
            </div>
            <div style={{ background: 'rgba(1,118,58,0.04)', border: '1px solid rgba(1,118,58,0.15)', borderRadius: 10, padding: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 10, color: colors.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><LinkIcon size={10} color={colors.green} /> Blockchain Hash</span>
              <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#7FFFB8', marginTop: 4, wordBreak: 'break-all', lineHeight: 1.5 }}>{submittedFir.blockchain_hash || 'Pending Confirmation'}</p>
            </div>
            <button className="sach-btn sach-btn-gradient" onClick={() => navigate('/dashboard')}>{t('viewDashboard')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileFirPage;
