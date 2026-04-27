import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, formatCnic, formatPhone, validators, ShieldIcon, IdCardIcon, UserIcon, PhoneIcon, CheckCircleIcon, MessageIcon, ArrowLeft, ShieldCheckIcon } from '../theme';

const SignupPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('+92 ');
  const [errors, setErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  const handleCnicChange = (e) => {
    const raw = e.target.value;
    if (validators.cnicPartial(raw)) setCnic(formatCnic(raw));
  };

  const validate = () => {
    const errs = {};
    if (!validators.minLength(name, 3)) errs.name = 'Full name must be at least 3 characters';
    if (!validators.cnic(cnic)) errs.cnic = tab === 0 ? 'Enter valid CNIC (e.g., 42101-1234567-8)' : 'Enter valid NICOP number';
    { const phoneDigits = phone.replace(/[^\d]/g, '').slice(2); if (!validators.phone(phoneDigits)) errs.phone = 'Enter valid 10-digit mobile number (e.g., 3001234567)'; }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = () => { if (validate()) setShowOtpModal(true); };
  const handleOtpVerify = () => { if (otp.length === 6) { setShowOtpModal(false); navigate('/dashboard'); } };

  return (
    <div className="auth-page">
      <div className="bg-glow"><div className="glow-blob gold" /><div className="glow-blob green" /></div>

      <div className="auth-topbar">
        <button className="auth-topbar-back" onClick={() => navigate('/')}><ArrowLeft size={16} color={colors.gold} /></button>
        <div className="auth-topbar-brand">
          <div className="auth-topbar-icon"><ShieldIcon size={14} color="#fff" /></div>
          <span className="auth-topbar-text">SACH</span>
        </div>
      </div>

      <div className="auth-content">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-icon-circle" style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(1,118,58,0.15))' }}>
            <IdCardIcon size={26} color={colors.gold} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Citizen Registration</h2>
          <p style={{ fontSize: 13, color: colors.textSub }}>Register on SACH securely</p>
        </div>

        {/* Tab selector */}
        <div style={{ display: 'flex', background: 'rgba(9,21,9,0.7)', borderRadius: 12, padding: 4, marginBottom: 24, border: `1.5px solid ${colors.divider}` }}>
          {['Resident (CNIC)', 'Overseas (NICOP)'].map((label, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              background: tab === i ? `linear-gradient(135deg, ${colors.green}, ${colors.greenDark})` : 'transparent',
              color: tab === i ? '#fff' : colors.textSub, fontWeight: tab === i ? 700 : 500,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: tab === i ? '0 4px 12px rgba(1,118,58,0.3)' : 'none',
            }}>{label}</button>
          ))}
        </div>

        <label className="sach-label">Full Name (as per {tab === 0 ? 'CNIC' : 'NICOP'})</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.name ? 4 : 16 }}>
          <span className="icon-left"><UserIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        {errors.name && <p className="field-error">{errors.name}</p>}

        <label className="sach-label" style={{ marginTop: errors.name ? 12 : 0 }}>{tab === 0 ? 'CNIC Number' : 'NICOP Number'}</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.cnic ? 4 : 16 }}>
          <span className="icon-left"><IdCardIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="42101-1234567-8" value={cnic} onChange={handleCnicChange} maxLength={15} />
        </div>
        {errors.cnic && <p className="field-error">{errors.cnic}</p>}

        <label className="sach-label" style={{ marginTop: errors.cnic ? 12 : 0 }}>Mobile Number</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.phone ? 4 : 16 }}>
          <span className="icon-left"><PhoneIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="+92 3001234567" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={14} />
        </div>
        {errors.phone && <p className="field-error">{errors.phone}</p>}

        <div className="notice-box green" style={{ marginTop: 8, marginBottom: 24 }}>
          <CheckCircleIcon size={14} color={colors.green} />
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.green }}>Identity Verification</span>
            <p style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5, marginTop: 4 }}>
              Your identity will be verified via SMS OTP sent to your registered mobile number.
            </p>
          </div>
        </div>

        <button className="sach-btn sach-btn-gradient" onClick={handleRegister}>
          <ShieldCheckIcon size={16} /> Verify &amp; Register
        </button>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: colors.textSub }}>
          Already registered?{' '}
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: colors.gold, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Sign in here
          </button>
        </p>
      </div>



      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div className="modal-icon-circle"><MessageIcon size={28} color={colors.gold} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>SMS Verification</h3>
              <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 24 }}>Enter the 6-digit code sent to {phone}</p>
            </div>
            <input className="sach-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 12, fontWeight: 700 }} />
            <button className="sach-btn sach-btn-gradient" style={{ marginTop: 20 }} onClick={handleOtpVerify} disabled={otp.length !== 6}>Verify &amp; Complete Registration</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
