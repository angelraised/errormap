import React from 'react';
import type { StudentProfile } from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  TrendingUp
} from 'lucide-react';

interface FullSkillMapViewProps {
  profile: StudentProfile;
  language: Language;
  onBack: () => void;
}

export const FullSkillMapView: React.FC<FullSkillMapViewProps> = ({
  profile,
  language,
  onBack
}) => {
  const t = translations[language];
  const skillList = Object.values(profile.skills);
  const masteredCount = skillList.filter(s => s.status === 'mastered').length;
  const gapCount = skillList.filter(s => s.status === 'gap').length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="var(--primary)" />
            <span>{t.navProgress}</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t.simpleHeroSubtitle}
          </p>
        </div>

        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          {t.back}
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid-3" style={{ gap: '14px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp size={22} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.overallProgress}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{profile.overallMastery}%</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={22} color="var(--success)" />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.validatedStrengths}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{masteredCount} / {skillList.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={22} color="var(--danger)" />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.needsImmediateAttention}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>{gapCount}</div>
          </div>
        </div>
      </div>

      {/* Detailed Skill Cards */}
      <div id="tour-skill-map" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {skillList.map((skill) => {
          const badgeClass = 
            skill.status === 'mastered' ? 'badge-mastered' :
            skill.status === 'gap' ? 'badge-gap' : 'badge-learning';
          
          const barColor = 
            skill.status === 'mastered' ? 'var(--success)' :
            skill.status === 'gap' ? 'var(--danger)' : 'var(--primary)';

          const localizedSkill = t.skills[skill.id] || { name: skill.name, desc: skill.description };

          return (
            <div 
              key={skill.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    {localizedSkill.name}
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {localizedSkill.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {skill.score}%
                  </span>
                  <span className={`badge ${badgeClass}`}>
                    {skill.status}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div style={{ height: '6px', width: '100%', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ height: '100%', width: `${skill.score}%`, background: barColor, borderRadius: 'var(--radius-full)' }} />
              </div>

              {/* Misconception alert if any */}
              {skill.misconceptions.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: 'var(--danger-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--danger)'
                }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span><strong>{t.thMisconception}:</strong> {skill.misconceptions.join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
