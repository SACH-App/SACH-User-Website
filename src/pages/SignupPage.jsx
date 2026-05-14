import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, formatCnic, formatPhone, validators, ShieldIcon, IdCardIcon, UserIcon, PhoneIcon, CheckCircleIcon, MessageIcon, ArrowLeft, ShieldCheckIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon } from '../theme';

const SignupPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('+92 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  // Explicitly clear state on mount to prevent browser back-navigation caching
  useEffect(() => {
    setName('');
    setCnic('');
    setPhone('+92 ');
    setEmail('');
    setPassword('');
  }, []);

  const handleCnicChange = (e) => {
    const raw = e.target.value;
    if (validators.cnicPartial(raw)) setCnic(formatCnic(raw));
  };

  const validate = () => {
    const errs = {};
    if (!validators.minLength(name, 3)) errs.name = 'Full name must be at least 3 characters';
    if (!validators.cnic(cnic)) errs.cnic = tab === 0 ? 'Enter valid CNIC (e.g., 42101-1234567-8)' : 'Enter valid NICOP number';
    { const phoneDigits = phone.replace(/[^\d]/g, '').slice(2); if (!validators.phone(phoneDigits)) errs.phone = 'Enter valid 10-digit mobile number (e.g., 3001234567)'; }
    if (!email) errs.email = 'Email address is required';
    else if (!validators.email(email)) errs.email = 'Enter a valid email address';
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = () => { if (validate()) setShowOtpModal(true); };
  const handleOtpVerify = async () => { 
    if (otp.length === 6) { 
      setBackendError('');
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const apiUrl = baseUrl.replace(/\/+$/, '');
        const response = await fetch(`${apiUrl}/api/v1/user/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cnic: cnic,
            full_name: name,
            phone: phone.replace(/[^\d+]/g, ''),
            email: email,
            password: password
          })
        });

        const data = await response.json();
        if (!response.ok) {
          setBackendError(data.detail || 'Registration failed');
          setShowOtpModal(false);
          return;
        }

        setShowOtpModal(false); 
        navigate('/dashboard'); 
      } catch (err) {
        setBackendError('Network error. Please try again.');
        setShowOtpModal(false);
      }
    } 
  };

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

      <form className="auth-content" autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
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
            <button type="button" key={i} onClick={() => setTab(i)} style={{
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

        <label className="sach-label" style={{ marginTop: errors.phone ? 12 : 0 }}>Email</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.email ? 4 : 16 }}>
          <span className="icon-left"><MailIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        </div>
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label className="sach-label" style={{ marginTop: errors.email ? 12 : 0 }}>Password</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.password ? 4 : 16, position: 'relative' }}>
          <span className="icon-left"><LockIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" style={{ paddingRight: 40 }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password}</p>}

        {backendError && (
          <div className="notice-box" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)', marginBottom: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: colors.red, marginTop: 2 }}>⚠️</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.red }}>Registration Error</span>
                <p style={{ fontSize: 11, color: '#fca5a5', lineHeight: 1.5, marginTop: 4 }}>{backendError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="notice-box green" style={{ marginTop: 8, marginBottom: 24 }}>
          <CheckCircleIcon size={14} color={colors.green} />
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.green }}>Identity Verification</span>
            <p style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5, marginTop: 4 }}>
              Your identity will be verified via SMS OTP sent to your registered mobile number.
            </p>
          </div>
        </div>

        <button type="submit" className="sach-btn sach-btn-gradient">
          <ShieldCheckIcon size={16} /> Verify &amp; Register
        </button>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: colors.textSub }}>
          Already registered?{' '}
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: colors.gold, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Sign in here
          </button>
        </p>
      </form>



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
