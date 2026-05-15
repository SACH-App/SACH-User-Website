import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, formatCnic, validators, ShieldIcon, LockIcon, IdCardIcon, KeyIcon, EyeIcon, EyeOffIcon, UnlockIcon, MessageIcon, ArrowLeft } from '../theme';
import { useLanguage } from '../LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  useEffect(() => {
    setCnic('');
    setPassword('');
  }, []);

  const handleCnicChange = (e) => {
    const raw = e.target.value;
    if (validators.cnicPartial(raw)) setCnic(formatCnic(raw));
  };

  const validate = (onlyCnic = false) => {
    const errs = {};
    if (!validators.cnic(cnic)) errs.cnic = 'Enter valid CNIC (e.g., 42101-1234567-8)';
    if (!onlyCnic && !validators.password(password)) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    
    setBackendError('');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.replace(/\/+$/, '');
      
      const formData = new URLSearchParams();
      formData.append('username', cnic);
      formData.append('password', password);

      const response = await fetch(`${apiUrl}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const data = await response.json();
      if (!response.ok) {
        setBackendError(data.detail || 'Login failed. Please check your credentials.');
        return;
      }

      localStorage.setItem('sach_access_token', data.access_token);
      localStorage.setItem('sach_refresh_token', data.refresh_token);
      
      navigate('/dashboard');
    } catch (err) {
      setBackendError('Network error. Please try again.');
    }
  };

  const handleOtpRequest = async () => {
    if (!validate(true)) return;
    setBackendError('');
    setIsOtpLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/api/v1/user/login/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnic })
      });
      const data = await response.json();
      if (!response.ok) {
        setBackendError(data.detail || 'Failed to request OTP');
        return;
      }
      setShowOtpModal(true);
    } catch (err) {
      setBackendError('Network error. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length === 6) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const apiUrl = baseUrl.replace(/\/+$/, '');
        const response = await fetch(`${apiUrl}/api/v1/user/login/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cnic, otp })
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.detail || 'Invalid OTP');
          return;
        }
        localStorage.setItem('sach_access_token', data.access_token);
        localStorage.setItem('sach_refresh_token', data.refresh_token);
        setShowOtpModal(false);
        navigate('/dashboard');
      } catch (err) {
        alert('Network error during OTP verification.');
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

      <form className="auth-content" autoComplete="off" onSubmit={handleLogin}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-icon-circle"><LockIcon size={26} color={colors.green} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Secure Login</h2>
          <p style={{ fontSize: 13, color: colors.textSub }}>Access your SACH Citizens Portal</p>
        </div>

        <label className="sach-label">CNIC Number</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.cnic ? 4 : 16 }}>
          <span className="icon-left"><IdCardIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="42101-1234567-8" value={cnic} onChange={handleCnicChange} maxLength={15} autoComplete="off" readOnly onFocus={(e) => e.target.removeAttribute('readonly')} />
        </div>
        {errors.cnic && <p className="field-error">{errors.cnic}</p>}

        <label className="sach-label" style={{ marginTop: errors.cnic ? 12 : 0 }}>Password</label>
        <div className="sach-input-icon has-right" style={{ marginBottom: errors.password ? 4 : 16 }}>
          <span className="icon-left"><LockIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" readOnly onFocus={(e) => e.target.removeAttribute('readonly')} />
          <button className="icon-right" onClick={() => setShowPass(!showPass)} type="button">
            {showPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password}</p>}

        {backendError && (
          <div className="notice-box" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)', marginBottom: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: colors.red, marginTop: 2 }}>⚠️</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.red }}>Login Error</span>
                <p style={{ fontSize: 11, color: '#fca5a5', lineHeight: 1.5, marginTop: 4 }}>{backendError}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <button type="button" className="sach-btn-text" style={{ fontSize: 12, color: colors.gold }}>Forgot Password?</button>
        </div>

        <button type="submit" className="sach-btn sach-btn-gradient">
          <UnlockIcon size={16} /> Secure Sign In
        </button>

        <div className="sach-divider" style={{ margin: '24px 0' }}><span>or sign in with</span></div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="sach-btn sach-btn-outline" onClick={handleOtpRequest} disabled={isOtpLoading} style={{ flex: 1 }}>
            <MessageIcon size={16} /> {isOtpLoading ? 'Sending...' : 'Email OTP'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: colors.textSub }}>
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: colors.gold, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Register as Citizen
          </button>
        </p>
      </form>

      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div className="modal-icon-circle"><MessageIcon size={28} color={colors.gold} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Email Verification</h3>
              <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 24 }}>Enter the 6-digit OTP sent to your registered email address</p>
            </div>
            <input className="sach-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 12, fontWeight: 700 }} />
            <button className="sach-btn sach-btn-gradient" style={{ marginTop: 20 }} onClick={handleOtpVerify} disabled={otp.length !== 6}>Verify OTP</button>
          </div>
        </div>
      )}


    </div>
  );
};

export default LoginPage;
