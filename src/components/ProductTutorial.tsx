import { useEffect } from 'react';
import type { Language } from '../translations';
import { translations } from '../translations';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  titleKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'tour-brand',
    titleKey: 'tutStep1Title',
    descKey: 'tutStep1Desc'
  },
  {
    targetId: 'tour-recommendation',
    titleKey: 'tutStep2Title',
    descKey: 'tutStep2Desc'
  },
  {
    targetId: 'tour-start-diag',
    titleKey: 'tutStep3Title',
    descKey: 'tutStep3Desc'
  },
  {
    targetId: 'tour-confidence-concept',
    titleKey: 'tutStep4Title',
    descKey: 'tutStep4Desc'
  },
  {
    targetId: 'tour-lang-picker',
    titleKey: 'tutStep5Title',
    descKey: 'tutStep5Desc'
  }
];

interface ProductTutorialProps {
  currentStepIndex: number;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const ProductTutorial: React.FC<ProductTutorialProps> = ({
  currentStepIndex,
  language,
  onNext,
  onPrev,
  onClose
}) => {
  const t = translations[language];
  const step = TUTORIAL_STEPS[currentStepIndex];
  const total = TUTORIAL_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === total - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && !isLast) {
        onNext();
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, isFirst, isLast, onClose, onNext, onPrev]);

  useEffect(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  if (!step) return null;

  return (
    <div 
      className="tutorial-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t[step.titleKey] as string}
    >
      <div className="tutorial-card animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-learning" style={{ fontSize: '0.78rem' }}>
              <Sparkles size={12} style={{ marginRight: '4px' }} />
              {t.stepOf.replace('{current}', String(currentStepIndex + 1)).replace('{total}', String(total))}
            </span>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ padding: '4px 8px', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t[step.titleKey] as string}
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
          {t[step.descKey] as string}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStepIndex ? '24px' : '7px',
                height: '7px',
                borderRadius: 'var(--radius-full)',
                background: i === currentStepIndex ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {t.tutSkip}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={14} />
                <span>{t.back}</span>
              </button>
            )}

            <button
              onClick={isLast ? onClose : onNext}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <span>{isLast ? t.tutFinish : t.tutNext}</span>
              {isLast ? <Check size={16} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
