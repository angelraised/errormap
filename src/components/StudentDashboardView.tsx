import React from 'react';
import type { StudentProfile, UserAccount, SubjectId } from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { UserAvatar } from './UserAvatar';
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  BookOpen,
  Award,
  Compass
} from 'lucide-react';

interface StudentDashboardProps {
  account: UserAccount;
  profile: StudentProfile;
  language: Language;
  onOpenMySubjects: () => void;
  onContinueLearning: () => void;
  onViewSkillMap: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardProps> = ({
  account,
  profile,
  language,
  onOpenMySubjects,
  onContinueLearning,
  onViewSkillMap
}) => {
  const t = translations[language];
  const subjects: SubjectId[] = account.studentSubjects || [];
  
  const hasActivity = 
    profile.diagnosticHistory.length > 0 || 
    profile.completedExerciseIds.length > 0 || 
    profile.overallMastery > 0;

  const getSubjectIcon = (subj: SubjectId) => {
    switch (subj) {
      case 'math': return '📐';
      case 'english': return '📖';
      case 'programming': return '💻';
      case 'physics': return '⚡';
      case 'chemistry': return '🧪';
      case 'biology': return '🧬';
      case 'history': return '🏛️';
      default: return '📚';
    }
  };

  const levelLabel = account.studentLevel 
    ? (t[`lvl_${account.studentLevel}` as keyof typeof t] as string)
    : t.lvl_intermediate;

  const goalLabel = account.studentGoal 
    ? (t[`goal_${account.studentGoal}` as keyof typeof t] as string)
    : t.goal_grades;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Friendly Clean Greeting & Profile Snapshot */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <UserAvatar name={account.name} src={account.avatar || profile.avatar} />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {t.studentHello}, {account.name}! 👋
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              {subjects.length > 0 ? (
                subjects.map(subject => (
                  <span key={subject} className="badge badge-learning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{getSubjectIcon(subject)}</span>
                    <span>{t[`subj_${subject}` as keyof typeof t] as string}</span>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t.noSubjectsSelected}
                </span>
              )}

              {hasActivity && profile.streakDays > 0 && (
                <span style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                  <Flame size={14} /> {profile.streakDays} {t.activeStreak}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Learning Configuration Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)'
          }}>
            {levelLabel}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            🎯 {goalLabel}
          </span>
        </div>
      </div>

      {/* 2. Main Primary Action Card — "My Subjects" */}
      <div 
        id="tour-my-subjects"
        className="card" 
        style={{
          padding: '28px',
          border: '2px solid var(--primary)',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              {t.mySubjectsTitle}
            </h2>
          </div>

          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {hasActivity ? (
              <>{t.overallProgress}: <strong style={{ color: 'var(--primary)' }}>{profile.overallMastery}%</strong></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>0% — {t.notEvaluatedYet}</span>
            )}
          </span>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {t.mySubjectsSubtitle}
        </p>

        {/* Progress Bar (shows 0% if no activity) */}
        <div style={{ height: '8px', width: '100%', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${hasActivity ? profile.overallMastery : 0}%`, 
            background: 'var(--primary)', 
            borderRadius: 'var(--radius-full)', 
            transition: 'width 0.5s ease' 
          }} />
        </div>

        {/* Clear Primary Action Button */}
        <button
          onClick={onOpenMySubjects}
          className="btn btn-primary"
          style={{ 
            padding: '16px 28px', 
            fontSize: '1.1rem', 
            borderRadius: 'var(--radius-lg)', 
            width: '100%', 
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <BookOpen size={20} />
          <span>{t.mySubjectsBtn}</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* 3. Recommended Next Action — ONLY if student already has activity */}
      {hasActivity && profile.recommendedNextLesson && profile.recommendedNextLesson.title && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.recommendedNext}
            </span>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {profile.recommendedNextLesson.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {profile.recommendedNextLesson.reason}
            </p>
          </div>

          <button
            onClick={onContinueLearning}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <Play size={16} fill="currentColor" />
            <span>{t.continueLearningBtn}</span>
          </button>
        </div>
      )}

      {/* 4. Link to Detailed Skill Map (only if student has activity) */}
      {hasActivity && (
        <div style={{ textAlign: 'center', padding: '6px 0' }}>
          <button
            onClick={onViewSkillMap}
            style={{
              fontSize: '0.92rem',
              color: 'var(--primary)',
              fontWeight: 700,
              background: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            <Award size={16} />
            <span>{t.viewSkillMapLink}</span>
          </button>
        </div>
      )}
    </div>
  );
};
