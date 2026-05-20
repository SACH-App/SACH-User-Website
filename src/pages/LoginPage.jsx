import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, formatCnic, validators, ShieldIcon, LockIcon, IdCardIcon, KeyIcon, EyeIcon, EyeOffIcon, UnlockIcon, MessageIcon, ArrowLeft } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';
import sachLogo from '../assets/sach_logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { fetchProfile } = useUser();
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter CNIC to request, 2 = enter OTP and New Pass
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://sachbackend.live';
      const apiUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/i, '');

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

      await fetchProfile();
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://sachbackend.live';
      const apiUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/i, '');
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
        const baseUrl = import.meta.env.VITE_API_URL || 'https://sachbackend.live';
        const apiUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/i, '');
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
        await fetchProfile();
        navigate('/dashboard');
      } catch (err) {
        alert('Network error during OTP verification.');
      }
    }
  };

  const handleForgotRequest = async () => {
    if (!validate(true)) return;
    setBackendError('');
    setIsForgotLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://sachbackend.live';
      const apiUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/i, '');
      const response = await fetch(`${apiUrl}/api/v1/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnic })
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Failed to request password reset');
        return;
      }
      setForgotStep(2);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (otp.length !== 6 || newPassword.length < 8) {
      alert('Enter 6-digit OTP and new password (min 8 chars).');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://sachbackend.live';
      const apiUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/i, '');
      const response = await fetch(`${apiUrl}/api/v1/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnic, otp, new_password: newPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Failed to reset password');
        return;
      }

      // Step 2: Automatically log in
      const formData = new URLSearchParams();
      formData.append('username', cnic);
      formData.append('password', newPassword);

      const loginResponse = await fetch(`${apiUrl}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        alert('Password reset successfully! Please login with your new password.');
        setShowForgotModal(false);
        setForgotStep(1);
        setPassword('');
        setOtp('');
        setConfirmPassword('');
        return;
      }

      // Save tokens and redirect to dashboard with native SPA navigation
      localStorage.setItem('sach_access_token', loginData.access_token);
      localStorage.setItem('sach_refresh_token', loginData.refresh_token);

      await fetchProfile();
      navigate('/dashboard');

    } catch (err) {
      alert('Network error during password reset.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-glow"><div className="glow-blob gold" /><div className="glow-blob green" /></div>

      <div className="auth-topbar">
        <button className="auth-topbar-back" onClick={() => navigate('/')}><ArrowLeft size={16} color={colors.gold} /></button>
        <div className="auth-topbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={sachLogo} alt="SACH Logo" style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
          <div style={{ width: 1, height: 14, background: colors.divider }} />
          <span className="auth-topbar-text" style={{ color: colors.gold, fontWeight: 700, letterSpacing: 0.5, fontSize: 11 }}>PORTAL</span>
        </div>
      </div>

      <form className="auth-content" autoComplete="off" onSubmit={handleLogin}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src={sachLogo}
            alt="SACH Logo"
            style={{
              height: 80,
              width: 'auto',
              objectFit: 'contain',
              marginBottom: 12,
              filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.45))',
            }}
          />
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
          <button type="button" className="sach-btn-text" style={{ fontSize: 12, color: colors.gold }} onClick={() => setShowForgotModal(true)}>Forgot Password?</button>
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
            <input className="sach-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 12, fontWeight: 700 }} />
            <button className="sach-btn sach-btn-gradient" style={{ marginTop: 20 }} onClick={handleOtpVerify} disabled={otp.length !== 6}>Verify OTP</button>
            <button className="sach-btn-text" style={{ marginTop: 12, width: '100%', color: colors.textSub }} onClick={() => setShowOtpModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="modal-overlay" onClick={() => { setShowForgotModal(false); setForgotStep(1); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div className="modal-icon-circle"><KeyIcon size={28} color={colors.gold} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Reset Password</h3>
              <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 24 }}>
                {forgotStep === 1 ? 'Enter your CNIC to receive a reset OTP.' : 'Enter the 6-digit OTP and your new password.'}
              </p>
            </div>

            {forgotStep === 1 ? (
              <>
                <label className="sach-label">CNIC Number</label>
                <div className="sach-input-icon" style={{ marginBottom: 16 }}>
                  <span className="icon-left"><IdCardIcon size={16} color={colors.gold} /></span>
                  <input className="sach-input" placeholder="42101-1234567-8" value={cnic} onChange={handleCnicChange} maxLength={15} />
                </div>
                <button className="sach-btn sach-btn-gradient" style={{ marginTop: 12 }} onClick={handleForgotRequest} disabled={isForgotLoading}>
                  {isForgotLoading ? 'Sending...' : 'Send Reset OTP'}
                </button>
              </>
            ) : (
              <>
                <label className="sach-label">OTP Code</label>
                <input className="sach-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} autoComplete="one-time-code" style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, fontWeight: 700, marginBottom: 16 }} />

                <label className="sach-label">New Password</label>
                <div className="sach-input-icon" style={{ marginBottom: 16 }}>
                  <span className="icon-left"><LockIcon size={16} color={colors.gold} /></span>
                  <input className="sach-input" type="password" placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>

                <label className="sach-label">Confirm New Password</label>
                <div className="sach-input-icon" style={{ marginBottom: confirmPassword && newPassword !== confirmPassword ? 4 : 20 }}>
                  <span className="icon-left"><LockIcon size={16} color={confirmPassword && newPassword === confirmPassword ? colors.green : colors.gold} /></span>
                  <input
                    className="sach-input"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ borderColor: confirmPassword && newPassword !== confirmPassword ? 'rgba(220,38,38,0.5)' : undefined }}
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="field-error" style={{ marginBottom: 16 }}>Passwords do not match</p>
                )}

                <button className="sach-btn sach-btn-gradient" style={{ marginTop: 4 }} onClick={handleForgotReset} disabled={isForgotLoading || otp.length !== 6 || newPassword.length < 8 || newPassword !== confirmPassword}>
                  {isForgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
            <button className="sach-btn-text" style={{ marginTop: 12, width: '100%', color: colors.textSub }} onClick={() => { setShowForgotModal(false); setForgotStep(1); }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
