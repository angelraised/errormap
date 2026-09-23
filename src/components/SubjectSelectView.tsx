import type { Language } from '../translations';
import { translations } from '../translations';
import type { StudentProfile, SubjectId, UserAccount } from '../types';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

interface SubjectSelectViewProps {
  account: UserAccount;
  profile: StudentProfile;
  language: Language;
  onOpenSubject: (subject: SubjectId) => void;
  onBack: () => void;
}

const icons: Record<SubjectId, string> = {
  math: '📐', english: '📖', programming: '💻', physics: '⚡',
  chemistry: '🧪', biology: '🧬', history: '🏛️'
};

export function SubjectSelectView({ account, profile, language, onOpenSubject, onBack }: SubjectSelectViewProps) {
  const t = translations[language];
  const subjects = account.studentSubjects ?? [];
  return (
    <div className="page narrow animate-fade-in">
      <button className="btn btn-secondary back-button" onClick={onBack}><ArrowLeft size={16} /> {t.back}</button>
      <div className="page-heading">
        <span className="eyebrow"><BookOpen size={16} /> {t.mySubjectsTitle}</span>
        <h1>{t.mySubjectsTitle}</h1>
        <p>{t.mySubjectsSubtitle}</p>
      </div>
      {subjects.length === 0 ? <div className="empty-state">{t.noSubjectsSelected}</div> : (
        <div className="subject-list">
          {subjects.map(subject => {
            const progress = profile.subjectProgress?.[subject];
            const completed = progress?.diagnosticCompleted === true;
            return (
              <button key={subject} className="subject-row" onClick={() => onOpenSubject(subject)}>
                <span className="subject-icon">{icons[subject]}</span>
                <span className="subject-copy">
                  <strong>{t[`subj_${subject}` as keyof typeof t] as string}</strong>
                  <span>{completed ? `${progress?.overallMastery ?? 0}% • ${t.statusCompleted}` : t.statusNotStarted}</span>
                </span>
                {completed ? <CheckCircle2 size={22} className="success-icon" /> : <ArrowRight size={22} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
