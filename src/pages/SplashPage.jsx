import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, ShieldIcon, LockIcon, CheckCircleIcon, LinkIcon, KeyIcon, IdCardIcon } from '../theme';
import sachLogo from '../assets/sach_logo.png';

const SplashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="splash-page">
      <div className="bg-glow">
        <div className="glow-blob gold" />
        <div className="glow-blob green" />
        <div className="glow-blob emerald" />
      </div>

      {/* Logo centerpiece */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
        <img
          src={sachLogo}
          alt="SACH Logo"
          style={{
            height: 120,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 24px rgba(212, 175, 55, 0.6))',
          }}
        />
      </div>

      <p className="splash-subtitle" style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 1.2s ease', marginTop: 10 }}>
        SECURE &middot; AUTHENTICATED &middot; COMPLAINT &middot; HANDLING
      </p>

      {/* Trust badges */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 28, position: 'relative', zIndex: 1,
        animation: 'fadeIn 1.5s ease', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { icon: <LockIcon size={14} color={colors.gold} />, label: 'End-to-End Encrypted' },
          { icon: <CheckCircleIcon size={14} color={colors.gold} />, label: 'Identity Verified' },
          { icon: <ShieldIcon size={14} color={colors.gold} />, label: 'Cryptographically Signed' },
        ].map((badge, i) => (
          <div key={i} className="trust-badge hoverable" style={{
            background: 'rgba(1,118,58,0.06)', border: '1px solid rgba(1,118,58,0.2)', borderRadius: 50,
          }}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Auth card */}
      <div className="sach-card splash-auth-card" style={{
        position: 'relative', zIndex: 1, animation: 'slideUp 0.8s ease', textAlign: 'center',
      }}>
        <p style={{
          fontSize: 18, fontWeight: 700, marginBottom: 6,
          background: `linear-gradient(135deg, #fff, ${colors.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Citizens e-FIR Portal</p>
        <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 28, lineHeight: 1.6 }}>
          File your complaints securely online with<br />identity verification &amp; cryptographic tamper-proofing
        </p>
        <button className="sach-btn sach-btn-splash" onClick={() => navigate('/signup')} style={{ marginBottom: 12 }}>
          <IdCardIcon size={16} /> Register as Citizen
        </button>
        <button className="sach-btn sach-btn-outline" onClick={() => navigate('/login')}>
          <KeyIcon size={16} /> Secure Login
        </button>
      </div>

      {/* Footer */}
      <div className="splash-footer" style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 2s ease' }}>
        <span className="splash-footer-dot" />
        <span className="splash-footer-text">Secured via Cryptographic Signing</span>
      </div>
    </div>
  );
};

export default SplashPage;
