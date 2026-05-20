import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, cities, validators, formatPhone, UserIcon, IdCardIcon, LockIcon, PhoneIcon, MailIcon, MapPinIcon, HomeIcon, SaveIcon, InfoIcon, ArrowLeft, CheckCircleIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, saveEdits, loading } = useUser();
  const [form, setForm] = useState({
    phone: profile?.phone || '',
    email: profile?.email || '',
    address: profile?.address || ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [passErrors, setPassErrors] = useState({});
  const [showToast, setShowToast] = useState('');
  // Separate loading states for each section
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const onChange = (k, v) => setForm({ ...form, [k]: v });
  const onPassChange = (k, v) => setPasswordForm({ ...passwordForm, [k]: v });

  const validate = () => {
    const errs = {};
    if (form.email && !validators.email(form.email)) errs.email = 'Enter a valid email';
    if (form.phone && form.phone !== '+92 ') {
      const phoneDigits = form.phone.replace(/[^\d]/g, '').slice(2);
      if (!validators.phone(phoneDigits)) errs.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs = {};
    if (passwordForm.newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSavingProfile(true);
      const res = await saveEdits({
        phone: form.phone === '+92 ' ? null : form.phone,
        email: form.email
      });
      setIsSavingProfile(false);
      if (res.success) {
        setShowToast('Profile updated successfully');
        setTimeout(() => setShowToast(''), 3000);
      } else {
        alert(res.error);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setIsSavingPassword(true);
    try {
      const { fetchWithAuth } = await import('../utils/api');
      const res = await fetchWithAuth('/api/v1/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });
      if (res.ok) {
        setShowToast('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassErrors({});
        setTimeout(() => setShowToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to change password');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loading || !profile) return <div style={{ padding: 20 }}>Loading...</div>;

  // Locked fields (identity verified — not editable)
  const lockedFields = [
    { icon: <UserIcon size={16} color={colors.gold} />, label: 'Full Name', value: profile.full_name || profile.fullName },
    { icon: <IdCardIcon size={16} color={colors.gold} />, label: 'CNIC Number', value: profile.cnic },
    { icon: <MapPinIcon size={16} color={colors.gold} />, label: 'Verified Permanent Address', value: profile.address || 'No address on file' },
  ];

  return (
    <div className="page-enter">
      <button className="sach-btn-text" style={{ color: colors.gold, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }} onClick={() => navigate('/dashboard/profile')}>
        <ArrowLeft size={16} /> Back to Profile
      </button>

      {/* Locked fields notice */}
      <div className="notice-box green" style={{ marginBottom: 24 }}>
        <LockIcon size={14} color={colors.green} />
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.green }}>Verified Fields</span>
          <p style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5, marginTop: 4 }}>
            Name, CNIC, and Address are locked as they are officially verified and non-modifiable.
          </p>
        </div>
      </div>

      {/* Locked fields */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        {lockedFields.map((f, i) => (
          <div key={i} className="locked-field" style={{ marginBottom: i < lockedFields.length - 1 ? 16 : 0 }}>
            <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{f.icon} {f.label} <LockIcon size={10} color={colors.textSub} /></label>
            <div className="locked-input">{f.value}</div>
          </div>
        ))}
      </div>

      {/* Editable fields */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}><InfoIcon size={14} color={colors.gold} /> Editable Information</h4>

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PhoneIcon size={14} color={colors.gold} /> Phone Number</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.phone ? 4 : 16 }}>
          <span className="icon-left"><PhoneIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="+92 3001234567" value={form.phone || ''} onChange={(e) => onChange('phone', formatPhone(e.target.value))} maxLength={14} onFocus={(e) => { if (!e.target.value || e.target.value.trim() === '') onChange('phone', '+92 '); }} />
        </div>
        {errors.phone && <p className="field-error">{errors.phone}</p>}

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MailIcon size={14} color={colors.gold} /> Email Address</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.email ? 4 : 24 }}>
          <span className="icon-left"><MailIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="you@email.com" value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        </div>
        {errors.email && <p className="field-error" style={{ marginBottom: 24 }}>{errors.email}</p>}

        <button className="sach-btn sach-btn-gradient" onClick={handleSave} disabled={isSavingProfile}>
          <SaveIcon size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="sach-card hoverable" style={{ marginBottom: 24 }}>
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}><LockIcon size={14} color={colors.gold} /> Change Password</h4>

        <label className="sach-label">Current Password</label>
        <div className="sach-input-icon" style={{ marginBottom: 16 }}>
          <span className="icon-left"><LockIcon size={16} color={colors.gold} /></span>
          <input type="password" className="sach-input" placeholder="Enter current password" value={passwordForm.currentPassword} onChange={(e) => onPassChange('currentPassword', e.target.value)} />
        </div>

        <label className="sach-label">New Password</label>
        <div className="sach-input-icon" style={{ marginBottom: passErrors.newPassword ? 4 : 16 }}>
          <span className="icon-left"><LockIcon size={16} color={colors.gold} /></span>
          <input type="password" className="sach-input" placeholder="Enter new password (min 8 chars)" value={passwordForm.newPassword} onChange={(e) => onPassChange('newPassword', e.target.value)} />
        </div>
        {passErrors.newPassword && <p className="field-error">{passErrors.newPassword}</p>}

        <label className="sach-label" style={{ marginTop: passErrors.newPassword ? 12 : 0 }}>Confirm New Password</label>
        <div className="sach-input-icon" style={{ marginBottom: passErrors.confirmPassword ? 4 : 24 }}>
          <span className="icon-left"><LockIcon size={16} color={passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword ? colors.green : colors.gold} /></span>
          <input
            type="password"
            className="sach-input"
            placeholder="Re-enter new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => onPassChange('confirmPassword', e.target.value)}
            style={{ borderColor: passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'rgba(220,38,38,0.5)' : undefined }}
          />
        </div>
        {passErrors.confirmPassword && <p className="field-error" style={{ marginBottom: 24 }}>{passErrors.confirmPassword}</p>}

        <button
          className="sach-btn sach-btn-outline"
          onClick={handleChangePassword}
          disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
        >
          <LockIcon size={16} /> {isSavingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {showToast && (
        <div className="toast"><CheckCircleIcon size={18} color={colors.green} /> {showToast}</div>
      )}
    </div>
  );
};

export default EditProfilePage;
