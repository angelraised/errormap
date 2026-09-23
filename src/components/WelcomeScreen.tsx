import React from 'react';
import type { Language } from '../translations';
import { translations } from '../translations';
import { Activity, Sparkles, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface WelcomeScreenProps {
  language: Language;
  onStartCreateAccount: () => void;
  onLogIn: () => void;
  onExploreDemo: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onStartCreateAccount,
  onLogIn,
  onExploreDemo
}) => {
  const t = translations[language];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '40px auto 0', textAlign: 'center' }}>
      {/* Brand Icon & Title */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        color: 'white',
        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
        marginBottom: '20px'
      }}>
        <Activity size={36} />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px' }}>
        <Sparkles size={14} />
        <span>Adaptive EdTech</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: 1.2,
        marginBottom: '14px'
      }}>
        {t.brand} <br />
        <span style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t.brandTagline}
        </span>
      </h1>

      <p style={{
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: '36px',
        padding: '0 10px'
      }}>
        {t.simpleHeroSubtitle}
      </p>

      {/* Main Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto 28px' }}>
        <button
          onClick={onStartCreateAccount}
          className="btn btn-primary"
          style={{ padding: '14px 24px', fontSize: '1.05rem', borderRadius: 'var(--radius-lg)' }}
        >
          <UserPlus size={18} />
          <span>{t.createAccount}</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={onLogIn}
          className="btn btn-secondary"
          style={{ padding: '12px 24px', fontSize: '0.98rem', borderRadius: 'var(--radius-lg)' }}
        >
          <LogIn size={18} />
          <span>{t.logIn}</span>
        </button>
      </div>

      {/* Quick Demo Access Link */}
      <div>
        <button
          onClick={onExploreDemo}
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textDecoration: 'underline',
            background: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ⚡ {t.exploreDemo}
        </button>
      </div>
    </div>
  );
};
