import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { 
  Question, 
  ConfidenceLevel, 
  StudentProfile, 
  SubjectId, 
  UserAccount,
  LearningMaterial
} from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { SUBJECT_QUESTION_BANKS } from '../mockData';
import { processAdaptiveAnswer, getDifficultyRange, type AdaptiveUpdateResult } from '../adaptiveEngine';
import { getLearningMaterials } from '../services/accountService';
import { 
  Timer, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticProps {
  profile: StudentProfile;
  account: UserAccount;
  language: Language;
  subject: SubjectId;
  onComplete: (updatedProfile: StudentProfile) => void;
  onCancel: () => void;
}

export const DiagnosticView: React.FC<DiagnosticProps> = ({ 
  profile, 
  account, 
  language, 
  subject, 
  onComplete,
  onCancel 
}) => {
  const t = translations[language];
  const TOTAL_QUESTIONS = 5;

  const bank = SUBJECT_QUESTION_BANKS[subject];

  if (!bank || bank.length === 0) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          No adaptive assessment is available for this subject yet
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Questions for this subject are currently being prepared by teachers.
        </p>
        <button onClick={onCancel} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>{t.backToSubject}</span>
        </button>
      </div>
    );
  }

  const bounds = useMemo(() => 
    getDifficultyRange(account.studentLevel, account.studentGoal),
    [account.studentLevel, account.studentGoal]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(profile);
  
  // Find initial starting question matching bounds.start
  const initialQuestion = useMemo(() => {
    return bank.find(q => q.difficulty === bounds.start) || bank[0];
  }, [bank, bounds.start]);

  const [currentQuestion, setCurrentQuestion] = useState<Question>(initialQuestion);
  
  // Stable option shuffling per question: never reshuffle while visible
  const shuffledOptions = useMemo(() => {
    const opts = [...currentQuestion.options];
    // Seeded/stable random shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentQuestion.id]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
  const [step, setStep] = useState<'answering' | 'confidence' | 'feedback'>('answering');
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [lastAdaptation, setLastAdaptation] = useState<AdaptiveUpdateResult | null>(null);
  
  // ErrorMap student feedback confirmation state
  const [misconceptionConfirmation, setMisconceptionConfirmation] = useState<'confirmed' | 'rejected' | null>(null);
  const [verificationDone, setVerificationDone] = useState(false);
  const [matchingMaterial, setMatchingMaterial] = useState<LearningMaterial | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setElapsedSeconds(0);
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion.id]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setStep('confidence');
  };

  const handleSelectConfidence = async (conf: ConfidenceLevel) => {
    setSelectedConfidence(conf);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!selectedOptionId) return;

    const result = processAdaptiveAnswer(
      currentProfile,
      currentQuestion,
      selectedOptionId,
      conf,
      elapsedSeconds,
      answeredIds,
      subject,
      account.studentLevel,
      account.studentGoal
    );

    setLastAdaptation(result);
    setCurrentProfile(result.updatedProfile);
    setAnsweredIds(prev => [...prev, currentQuestion.id]);
    setMisconceptionConfirmation(null);
    setVerificationDone(false);

    const isCorrect = currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect;
    if (isCorrect && conf === 'confident') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } else if (!isCorrect) {
      // Find matching teacher material for recommended guidance
      try {
        const mats = await getLearningMaterials(subject);
        const match = mats.find(m => m.topic.toLowerCase().includes(currentQuestion.skillId.toLowerCase()) || m.status === 'published');
        setMatchingMaterial(match || mats[0] || null);
      } catch {
        setMatchingMaterial(null);
      }
    }

    setStep('feedback');
  };

  const handleNextQuestion = () => {
    // If student confirmed or rejected misconception, update in errorMapHistory
    if (lastAdaptation?.errorMapRecord && misconceptionConfirmation) {
      const updatedErrorMap = (lastAdaptation.updatedProfile.subjectProgress?.[subject]?.errorMapHistory || []).map(rec => 
        rec.id === lastAdaptation.errorMapRecord?.id 
          ? { ...rec, status: misconceptionConfirmation }
          : rec
      );
      if (lastAdaptation.updatedProfile.subjectProgress?.[subject]) {
        lastAdaptation.updatedProfile.subjectProgress[subject]!.errorMapHistory = updatedErrorMap;
      }
    }

    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      if (lastAdaptation) {
        onComplete(lastAdaptation.updatedProfile);
      } else {
        onComplete(currentProfile);
      }
      return;
    }

    if (lastAdaptation) {
      setCurrentQuestion(lastAdaptation.nextQuestion);
    }
    setQuestionIndex(prev => prev + 1);
    setSelectedOptionId(null);
    setSelectedConfidence(null);
    setLastAdaptation(null);
    setStep('answering');
  };

  const selectedOpt = shuffledOptions.find(o => o.id === selectedOptionId);
  const isCorrect = !!selectedOpt?.isCorrect;
  const localizedSubject = t[`subj_${subject}` as keyof typeof t] as string || subject;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={14} />
          <span>{t.backToSubject}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-learning" style={{ fontWeight: 800 }}>
            {localizedSubject}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
            Question {questionIndex + 1} of {TOTAL_QUESTIONS}
          </span>
        </div>
      </div>

      {/* Progress Bar & Difficulty Tag */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Adaptive Calibration Progress</span>
            <span>{Math.round(((questionIndex + (step === 'feedback' ? 1 : 0)) / TOTAL_QUESTIONS) * 100)}%</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ 
              width: `${((questionIndex + (step === 'feedback' ? 1 : 0)) / TOTAL_QUESTIONS) * 100}%`, 
              height: '100%', 
              background: 'var(--primary)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: currentQuestion.difficulty >= 4 ? '#fef3c7' : '#e0e7ff',
            color: currentQuestion.difficulty >= 4 ? '#b45309' : '#3730a3'
          }}>
            Difficulty {currentQuestion.difficulty} / 5
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Timer size={14} />
            <span>{elapsedSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
          {currentQuestion.text}
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shuffledOptions.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOptionId === opt.id;
            let border = isSelected ? '2px solid var(--primary)' : '1px solid var(--border)';
            let bg = isSelected ? 'var(--primary-light)' : '#ffffff';

            if (step === 'feedback') {
              if (opt.isCorrect) {
                border = '2px solid var(--success)';
                bg = '#f0fdf4';
              } else if (isSelected && !opt.isCorrect) {
                border = '2px solid #ef4444';
                bg = '#fef2f2';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={step === 'feedback'}
                onClick={() => handleSelectOption(opt.id)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  border,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: step === 'feedback' ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--primary)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {letter}
                </span>

                <span style={{ flex: 1 }}>{opt.text}</span>

                {step === 'feedback' && opt.isCorrect && (
                  <CheckCircle2 size={18} color="var(--success)" />
                )}
                {step === 'feedback' && isSelected && !opt.isCorrect && (
                  <AlertCircle size={18} color="#ef4444" />
                )}
              </button>
            );
          })}
        </div>

        {/* Step 2: Confidence Rating (if answered and not yet evaluated) */}
        {step === 'confidence' && (
          <div className="animate-fade-in" style={{
            marginTop: '24px',
            padding: '20px',
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              How confident are you in this answer?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              SkillPulse uses your confidence calibration to detect deep misconceptions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSelectConfidence('guessed')}
                className="btn btn-secondary"
                style={{ padding: '12px', fontSize: '0.88rem' }}
              >
                🎲 Guessed
              </button>
              <button
                type="button"
                onClick={() => handleSelectConfidence('not_sure')}
                className="btn btn-secondary"
                style={{ padding: '12px', fontSize: '0.88rem' }}
              >
                🤔 Not Sure
              </button>
              <button
                type="button"
                onClick={() => handleSelectConfidence('confident')}
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '0.88rem' }}
              >
                🎯 Confident
              </button>
            </div>
          </div>
        )}

        {/* Step 3: ErrorMap Feedback (When answered incorrectly) */}
        {step === 'feedback' && !isCorrect && (
          <div className="animate-fade-in" style={{
            marginTop: '24px',
            padding: '24px',
            background: '#fffdfd',
            border: '2px solid #fecaca',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#dc2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                  {t.errorMapFeedbackTitle}
                </h3>
              </div>

              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: '#fee2e2',
                color: '#991b1b'
              }}>
                {t.classificationCertainty}: {lastAdaptation?.errorMapRecord?.classificationConfidence || 88}%
              </span>
            </div>

            {/* Misconception statement */}
            <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.9rem', color: '#991b1b' }}>
              <strong>{t.misconceptionFound}:</strong> {lastAdaptation?.detectedMisconception || selectedOpt?.misconceptionNote}
            </div>

            {/* Explanation of why the answer suggests this */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </div>

            {/* Clarification Check question */}
            <div style={{
              background: '#eff6ff',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontSize: '0.9rem', fontWeight: 700 }}>
                <HelpCircle size={18} />
                <span>{t.clarificationPrompt}: {currentQuestion.clarificationQuestion || 'Did you make this mistake because of this specific misconception?'}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMisconceptionConfirmation('confirmed')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: misconceptionConfirmation === 'confirmed' ? '2px solid #2563eb' : '1px solid #93c5fd',
                    background: misconceptionConfirmation === 'confirmed' ? '#2563eb' : '#ffffff',
                    color: misconceptionConfirmation === 'confirmed' ? '#ffffff' : '#1e40af',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={14} />
                  <span>{t.confirmError}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMisconceptionConfirmation('rejected')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: misconceptionConfirmation === 'rejected' ? '2px solid #64748b' : '1px solid #cbd5e1',
                    background: misconceptionConfirmation === 'rejected' ? '#64748b' : '#ffffff',
                    color: misconceptionConfirmation === 'rejected' ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <X size={14} />
                  <span>{t.rejectError}</span>
                </button>
              </div>
            </div>

            {/* Targeted Scaffolding Hint */}
            {currentQuestion.hintSteps && currentQuestion.hintSteps[0] && (
              <div style={{ fontSize: '0.88rem', color: '#854d0e', background: '#fefce8', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                <strong>{t.targetedHint}:</strong> {currentQuestion.hintSteps[0]}
              </div>
            )}

            {/* Recommended Teacher Material for this exact subject/topic */}
            {matchingMaterial && (
              <div style={{
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {t.recommendedTeacherMaterial}:
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {matchingMaterial.title}
                    </div>
                  </div>
                </div>

                <span className="badge badge-learning">
                  {matchingMaterial.topic}
                </span>
              </div>
            )}

            {/* Self-Verification Task */}
            {currentQuestion.verificationTask && (
              <div style={{
                background: '#f0fdf4',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bbf7d0',
                fontSize: '0.88rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <strong>{t.verificationTask}:</strong> {currentQuestion.verificationTask}
                </div>

                <button
                  type="button"
                  onClick={() => setVerificationDone(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: verificationDone ? '#16a34a' : '#ffffff',
                    color: verificationDone ? '#ffffff' : '#166534',
                    border: '1.5px solid #16a34a',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {verificationDone ? '✓ Verified' : t.checkVerificationBtn}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success Feedback (When answered correctly) */}
        {step === 'feedback' && isCorrect && (
          <div className="animate-fade-in" style={{
            marginTop: '24px',
            padding: '20px',
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: 'var(--radius-xl)',
            color: '#166534'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={20} color="#16a34a" />
              <strong style={{ fontSize: '1rem' }}>Correct! Well reasoned.</strong>
            </div>
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.45 }}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next Question / Finish Button */}
        {step === 'feedback' && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            >
              <span>{questionIndex + 1 >= TOTAL_QUESTIONS ? 'Complete Assessment' : 'Next Question'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
