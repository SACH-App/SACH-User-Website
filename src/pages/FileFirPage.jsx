import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
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
  
  // Coordinates & Map Refs
  const [latitude, setLatitude] = useState(33.6844); // Islamabad default
  const [longitude, setLongitude] = useState(73.0479); // Islamabad default
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const availableDistricts = city ? (cityDistricts[city] || []) : [];

  const performReverseGeocoding = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
      if (response.ok) {
        const data = await response.json();
        const addressData = data.address || {};
        
        // Extract road/neighbourhood/suburb
        const street = addressData.road || addressData.suburb || addressData.neighbourhood || addressData.amenity || addressData.village || data.display_name.split(',')[0] || 'Incident Location';
        const cityVal = addressData.city || addressData.town || addressData.village || addressData.county || 'Islamabad';
        const districtVal = addressData.county || addressData.suburb || addressData.city_district || '';

        setAddress(street);
        
        const matchedCity = cities.find(c => cityVal.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(cityVal.toLowerCase()));
        if (matchedCity) {
          setCity(matchedCity);
          const districtsList = cityDistricts[matchedCity] || [];
          const matchDist = districtsList.find(d => districtVal.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(districtVal.toLowerCase())) || districtsList[0] || '';
          setDistrict(matchDist);
        } else {
          // Defaults if no city is found in our system
          setCity('Islamabad');
          setDistrict('Islamabad Capital Territory');
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const handleUseGps = () => {
    if (navigator.geolocation) {
      setUseGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }
          performReverseGeocoding(lat, lng);
        },
        (error) => {
          console.error("GPS Error:", error);
          alert("Could not get your current location. Please select manually on the map.");
          setUseGps(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Initialize interactive map in Step 0
  useEffect(() => {
    if (step !== 0 || !mapContainerRef.current) return;
    
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([latitude, longitude], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Apply custom premium dark classes to leaflet pane
      L.DomUtil.addClass(map.getContainer(), 'sach-dark-map');
      
      const goldPinIcon = L.divIcon({
        html: `<div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #D4AF37; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #060E08; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <div style="width: 10px; height: 10px; background: #060E08; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
          <div style="background: rgba(212,175,55,0.4); width: 8px; height: 8px; border-radius: 50%; margin-top: -2px; filter: blur(1px);"></div>
        </div>`,
        className: 'custom-gold-pin',
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });

      const marker = L.marker([latitude, longitude], {
        icon: goldPinIcon,
        draggable: true
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
        performReverseGeocoding(position.lat, position.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setLatitude(lat);
        setLongitude(lng);
        performReverseGeocoding(lat, lng);
      });
    } else {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [step]);

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
        priority: 'medium',
        latitude,
        longitude
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
            <div ref={mapContainerRef} className="sach-map-container sach-dark-map" style={{ marginBottom: 16 }} />
            <button className={`sach-btn ${useGps ? 'sach-btn-gradient' : 'sach-btn-outline'}`} style={{ marginBottom: 20, padding: '10px 16px', fontSize: 13 }} onClick={handleUseGps}>
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
