import React, { useState } from 'react';
import type { Language } from '../translations';
import { translations } from '../translations';
import { Activity, LogIn, ArrowLeft, Mail, Lock, Loader } from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onExploreDemo: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onLogin,
  onBack,
  onExploreDemo,
}) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t.fillAllFields);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '40px auto 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </button>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--text-primary)'
          }}
        >
          <Activity size={20} color="var(--primary)" />
          ErrorMap
        </div>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogIn size={22} color="var(--primary)" />
          {t.logIn}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t.alreadyHaveAccount}
        </p>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {t.emailLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                className="input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {t.passwordLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                className="input"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-light, #fee2e2)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ padding: '13px', fontSize: '1rem', marginTop: '4px' }}
          >
            {isLoading ? <Loader size={18} className="spin" /> : <LogIn size={18} />}
            <span>{isLoading ? '…' : t.logIn}</span>
          </button>
        </form>

        {/* Demo link */}
        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            onClick={onExploreDemo}
            style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'underline', background: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ⚡ {t.exploreDemo}
          </button>
        </div>
      </div>

      {/* No account link */}
      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {t.dontHaveAccount}{' '}
        <button
          onClick={onBack}
          style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', padding: '0', textDecoration: 'underline' }}
        >
          {t.createAccount}
        </button>
      </p>
    </div>
  );
};
