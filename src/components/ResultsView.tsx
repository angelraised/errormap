import type { StudentProfile } from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  Sparkles
} from 'lucide-react';

interface ResultsProps {
  profile: StudentProfile;
  language: Language;
  onContinueToPractice: () => void;
  onBackToDashboard: () => void;
}

export const ResultsView: React.FC<ResultsProps> = ({
  profile,
  language,
  onContinueToPractice,
  onBackToDashboard
}) => {
  const t = translations[language];
  const skillList = Object.values(profile.skills);
  const strongSkills = skillList.filter(s => s.status === 'mastered' || s.score >= 75);
  const gapSkills = skillList.filter(s => s.status === 'gap' || s.score < 60);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.9 }}>
          <Sparkles size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.assessmentComplete}
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          {t.cognitiveMapGenerated}
        </h1>
        <p style={{ maxWidth: '600px', fontSize: '1rem', opacity: 0.9, lineHeight: 1.5 }}>
          {t.resultsSubtitle}
        </p>

        <div style={{
          marginTop: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{t.calibratedMastery}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{profile.overallMastery}%</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{t.questionsEvaluated}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{t.itemsCount}</div>
          </div>
        </div>
      </div>

      {/* Strengths & Gaps Two Column Grid */}
      <div className="grid-2">
        {/* Strong Skills */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.validatedStrengths}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.solidRetention}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {strongSkills.map(skill => {
              const localizedName = t.skills[skill.id]?.name || skill.name;
              return (
                <div key={skill.id} style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{localizedName}</span>
                  <span className="badge badge-mastered">{skill.score}%</span>
                </div>
              );
            })}
            {strongSkills.length === 0 && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t.keepPracticing}</div>
            )}
          </div>
        </div>

        {/* Detected Gaps */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.targetedIntervention}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.targetedIntervention}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gapSkills.map(skill => {
              const localizedName = t.skills[skill.id]?.name || skill.name;
              return (
                <div key={skill.id} style={{
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{localizedName}</span>
                    <span className="badge badge-gap">{skill.score}%</span>
                  </div>
                  {skill.misconceptions.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
                      ⚠️ {skill.misconceptions[0]}
                    </div>
                  )}
                </div>
              );
            })}
            {gapSkills.length === 0 && (
              <div style={{ fontSize: '0.88rem', color: 'var(--success)', fontWeight: 600 }}>{t.noGapsFound}</div>
            )}
          </div>
        </div>
      </div>

      {/* Next Step Recommendation Callout */}
      <div className="card" style={{
        padding: '28px',
        border: '2px solid var(--primary)',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <BookOpen size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t.whyChosen}
          </h2>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          border: '1px solid var(--border)',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
            {profile.recommendedNextLesson.title}
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {profile.recommendedNextLesson.reason}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button 
            onClick={onBackToDashboard} 
            className="btn btn-secondary"
            style={{ padding: '12px 20px' }}
          >
            <span>{t.backToDashboard}</span>
          </button>

          <button 
            onClick={onContinueToPractice} 
            className="btn btn-primary"
            style={{ padding: '12px 26px', fontSize: '1rem' }}
          >
            <span>{t.continueLearning}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
