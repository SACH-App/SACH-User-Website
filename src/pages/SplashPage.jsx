import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, ShieldIcon, LockIcon, CheckCircleIcon, LinkIcon, KeyIcon, IdCardIcon } from '../theme';

const SplashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="splash-page">
      <div className="bg-glow">
        <div className="glow-blob gold" />
        <div className="glow-blob green" />
        <div className="glow-blob emerald" />
      </div>

      {/* Logo animation */}
      <div className="splash-logo-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="splash-pulse" />
        <div className="splash-dot" style={{ background: colors.green, animationDuration: '6s' }} />
        <div className="splash-dot" style={{ background: colors.gold, animationDelay: '-3s', animationDuration: '6s' }} />
        <div className="splash-dot" style={{ background: colors.emerald, animationDelay: '-1.5s', animationDuration: '8s', width: 5, height: 5 }} />
        <div className="splash-dot" style={{ background: 'rgba(255,255,255,0.3)', animationDelay: '-4.5s', animationDuration: '8s', width: 4, height: 4 }} />
        <div className="splash-core"><ShieldIcon size={36} color="#fff" /></div>
      </div>

      <h1 className="splash-title" style={{ position: 'relative', zIndex: 1 }}>SACH</h1>
      <p className="splash-subtitle" style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 1.2s ease' }}>
        SECURE &middot; AUTHENTICATED &middot; COMPLAINT &middot; HANDLING
      </p>

      {/* Trust badges */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 28, position: 'relative', zIndex: 1,
        animation: 'fadeIn 1.5s ease', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { icon: <LockIcon size={14} color={colors.gold} />, label: 'End-to-End Encrypted' },
          { icon: <CheckCircleIcon size={14} color={colors.gold} />, label: 'NADRA Verified' },
          { icon: <LinkIcon size={14} color={colors.gold} />, label: 'Blockchain Secured' },
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
          File your complaints securely online with NADRA<br />biometric verification &amp; blockchain tamper-proofing
        </p>
        <button className="sach-btn sach-btn-splash" onClick={() => navigate('/signup')} style={{ marginBottom: 12 }}>
          <IdCardIcon size={16} /> Register via NADRA
        </button>
        <button className="sach-btn sach-btn-outline" onClick={() => navigate('/login')}>
          <KeyIcon size={16} /> Secure Login
        </button>
      </div>

      {/* Footer */}
      <div className="splash-footer" style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 2s ease' }}>
        <span className="splash-footer-dot" />
        <span className="splash-footer-text">Secured via Hyperledger Fabric &middot; NADRA Integration</span>
      </div>
    </div>
  );
};

export default SplashPage;
