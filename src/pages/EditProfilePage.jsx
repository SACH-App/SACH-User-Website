import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, cities, validators, UserIcon, IdCardIcon, LockIcon, PhoneIcon, MailIcon, MapPinIcon, HomeIcon, SaveIcon, InfoIcon, ArrowLeft, CheckCircleIcon } from '../theme';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../stores/UserStore';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, updateProfile } = useUser();
  const [form, setForm] = useState({ ...profile });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const onChange = (k, v) => setForm({ ...form, [k]: v });

  const validate = () => {
    const errs = {};
    if (form.email && !validators.email(form.email)) errs.email = 'Enter a valid email';
    if (form.altPhone && !validators.phone(form.altPhone)) errs.altPhone = 'Enter a valid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      updateProfile(form);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Locked fields (NADRA verified — not editable)
  const lockedFields = [
    { icon: <UserIcon size={16} color={colors.gold} />, label: 'Full Name', value: form.fullName },
    { icon: <IdCardIcon size={16} color={colors.gold} />, label: 'CNIC Number', value: form.cnic },
  ];

  return (
    <div className="page-enter">
      <button className="sach-btn-text" style={{ color: colors.gold, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }} onClick={() => navigate('/dashboard/profile')}>
        <ArrowLeft size={16} /> Back to Profile
      </button>

      {/* NADRA notice */}
      <div className="notice-box green" style={{ marginBottom: 24 }}>
        <LockIcon size={14} color={colors.green} />
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.green }}>NADRA Verified Fields</span>
          <p style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5, marginTop: 4 }}>
            Name and CNIC are locked as they are verified through NADRA. To update these, visit your nearest NADRA office.
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

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PhoneIcon size={14} color={colors.gold} /> Alternate Phone</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.altPhone ? 4 : 16 }}>
          <span className="icon-left"><PhoneIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="e.g., 03001234567" value={form.altPhone} onChange={(e) => onChange('altPhone', e.target.value)} />
        </div>
        {errors.altPhone && <p className="field-error">{errors.altPhone}</p>}

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MailIcon size={14} color={colors.gold} /> Email Address</label>
        <div className="sach-input-icon" style={{ marginBottom: errors.email ? 4 : 16 }}>
          <span className="icon-left"><MailIcon size={16} color={colors.gold} /></span>
          <input className="sach-input" placeholder="you@email.com" value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        </div>
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPinIcon size={14} color={colors.gold} /> Residential Address</label>
        <input className="sach-input" placeholder="Enter your residential address" value={form.address} onChange={(e) => onChange('address', e.target.value)} style={{ marginBottom: 16 }} />

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HomeIcon size={14} color={colors.gold} /> City</label>
        <select className="sach-select" value={form.city} onChange={(e) => onChange('city', e.target.value)} style={{ marginBottom: 16 }}>
          <option value="">Select City</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="sach-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HomeIcon size={14} color={colors.gold} /> District</label>
        <input className="sach-input" placeholder="Enter district" value={form.district} onChange={(e) => onChange('district', e.target.value)} style={{ marginBottom: 24 }} />

        <button className="sach-btn sach-btn-gradient" onClick={handleSave}><SaveIcon size={16} /> Save Changes</button>
      </div>

      {showToast && (
        <div className="toast"><CheckCircleIcon size={18} color={colors.green} /> Profile updated successfully</div>
      )}
    </div>
  );
};

export default EditProfilePage;
