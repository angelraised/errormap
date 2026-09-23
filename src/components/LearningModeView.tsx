import { useState } from 'react';
import type { StudentProfile } from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { LEARNING_EXERCISES } from '../mockData';
import { 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  BrainCircuit, 
  Lock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearningModeProps {
  profile: StudentProfile;
  language: Language;
  onProgress: (updatedProfile: StudentProfile) => void;
  onFinished: (updatedProfile: StudentProfile) => void;
  onBackToDashboard: () => void;
}

export const LearningModeView: React.FC<LearningModeProps> = ({
  profile,
  language,
  onProgress,
  onFinished,
  onBackToDashboard
}) => {
  const t = translations[language];
  const completedIds = profile.completedExerciseIds ?? [];
  const recommendedIndex = LEARNING_EXERCISES.findIndex(ex => ex.skillId === profile.recommendedNextLesson.skillId && !completedIds.includes(ex.id));
  const firstIncompleteIndex = LEARNING_EXERCISES.findIndex(ex => !completedIds.includes(ex.id));
  const initialIndex = recommendedIndex >= 0 ? recommendedIndex : Math.max(0, firstIncompleteIndex);
  const [exerciseIndex, setExerciseIndex] = useState(initialIndex);
  const exercise = LEARNING_EXERCISES[exerciseIndex];
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const handleRevealNextHint = () => {
    if (revealedHintsCount < 3) {
      setRevealedHintsCount(prev => prev + 1);
    }
  };

  const handleSelectOption = (optId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setHasSubmitted(true);

    const isCorrect = exercise.options.find(o => o.id === selectedOptionId)?.isCorrect;
    if (isCorrect) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }
  };

  const handleFinishPractice = () => {
    const targetSkill = profile.skills[exercise.skillId];
    const isCorrect = exercise.options.find(o => o.id === selectedOptionId)?.isCorrect === true;
    const updatedScore = Math.min(100, targetSkill.score + (isCorrect ? 15 : 3));
    const updatedStatus: 'mastered' | 'learning' = updatedScore >= 80 ? 'mastered' : 'learning';

    const updatedMisconceptions = targetSkill.misconceptions.slice(1);

    const updatedSkills = {
      ...profile.skills,
      [exercise.skillId]: {
        ...targetSkill,
        score: updatedScore,
        status: updatedStatus,
        misconceptions: updatedMisconceptions
      }
    };

    const allScores = Object.values(updatedSkills).map(s => s.score);
    const overallMastery = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    const updatedProfile: StudentProfile = {
      ...profile,
      overallMastery,
      skills: updatedSkills,
      streakDays: Math.max(1, profile.streakDays),
      completedExerciseIds: Array.from(new Set([...(profile.completedExerciseIds ?? []), exercise.id])),
      recommendedNextLesson: {
        skillId: LEARNING_EXERCISES[(exerciseIndex + 1) % LEARNING_EXERCISES.length].skillId,
        title: LEARNING_EXERCISES[(exerciseIndex + 1) % LEARNING_EXERCISES.length].title,
        reason: 'Your next exercise covers a different skill to keep the learning path moving forward.'
      }
    };
    const nextIndex = LEARNING_EXERCISES.findIndex((candidate, index) =>
      index !== exerciseIndex && !updatedProfile.completedExerciseIds.includes(candidate.id)
    );

    if (nextIndex >= 0) {
      onProgress(updatedProfile);
      setExerciseIndex(nextIndex);
      setRevealedHintsCount(0);
      setSelectedOptionId(null);
      setHasSubmitted(false);
    } else {
      onFinished(updatedProfile);
    }
  };

  const selectedOpt = exercise.options.find(o => o.id === selectedOptionId);
  const isCorrect = !!selectedOpt?.isCorrect;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Exercise Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-teal-light)',
            color: 'var(--accent-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <span className="badge badge-learning" style={{ marginBottom: '4px' }}>{t.targetedIntervention}</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {exercise.title}
            </h1>
          </div>
        </div>

        <button onClick={onBackToDashboard} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          {t.backToDashboard}
        </button>
      </div>

      {/* Main Practice Problem Box */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          {t.step1Solve}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
          {exercise.problemStatement}
        </h2>

        {/* Interactive Multiple Choice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {exercise.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let border = '1.5px solid var(--border)';
            let bg = '#ffffff';

            if (hasSubmitted) {
              if (opt.isCorrect) {
                border = '2px solid var(--success)';
                bg = 'var(--success-light)';
              } else if (isSelected && !opt.isCorrect) {
                border = '2px solid var(--danger)';
                bg = 'var(--danger-light)';
              }
            } else if (isSelected) {
              border = '2px solid var(--primary)';
              bg = 'var(--primary-light)';
            }

            return (
              <button
                key={opt.id}
                disabled={hasSubmitted}
                onClick={() => handleSelectOption(opt.id)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: hasSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {opt.text}
                </span>

                {hasSubmitted && opt.isCorrect && (
                  <CheckCircle2 size={20} color="var(--success)" />
                )}
                {hasSubmitted && isSelected && !opt.isCorrect && (
                  <XCircle size={20} color="var(--danger)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Submit or feedback */}
        {!hasSubmitted ? (
          <button
            disabled={!selectedOptionId}
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            {t.checkAnswer}
          </button>
        ) : (
          <div className="animate-slide-up" style={{
            background: isCorrect ? 'var(--success-light)' : 'var(--danger-light)',
            border: `1.5px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {isCorrect ? <CheckCircle2 color="var(--success)" size={22} /> : <XCircle color="var(--danger)" size={22} />}
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {isCorrect ? t.signRuleMastered : t.checkWalkthrough}
              </strong>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {exercise.solutionWalkthrough}
            </p>

            <button
              onClick={handleFinishPractice}
              className="btn btn-primary"
              style={{ padding: '10px 22px' }}
            >
              <span>{t.applyMastery}</span>
              <TrendingUp size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 3 Progressive Hints Section */}
      <div className="card" style={{ padding: '28px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={22} color="var(--warning)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t.progressiveHints}
            </h2>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {revealedHintsCount} / 3 {t.unlocked}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          {t.hintsDesc}
        </p>

        {/* Hints Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {exercise.hints.map((hintText, idx) => {
            const isUnlocked = idx < revealedHintsCount;

            return (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: isUnlocked ? 'var(--warning-light)' : 'var(--bg-subtle)',
                  border: isUnlocked ? '1px solid rgba(245,158,11,0.3)' : '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                {isUnlocked ? (
                  <Lightbulb size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Lock size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}

                <div style={{ fontSize: '0.92rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {isUnlocked ? hintText : `${idx + 1}: ${t.lockedHint}`}
                </div>
              </div>
            );
          })}
        </div>

        {revealedHintsCount < 3 && (
          <button
            onClick={handleRevealNextHint}
            className="btn btn-secondary"
            style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
          >
            <Lightbulb size={16} />
            <span>{t.unlockHintBtn} {revealedHintsCount + 1}</span>
          </button>
        )}
      </div>
    </div>
  );
};
