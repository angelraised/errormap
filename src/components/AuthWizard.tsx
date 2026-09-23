import React, { useState } from 'react';
import type { 
  UserRole, 
  SubjectId, 
  StudentLevel, 
  StudentGoal, 
  TeacherAudience, 
  TeacherGoal, 
  UserAccount 
} from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Check
} from 'lucide-react';

interface AuthWizardProps {
  language: Language;
  onComplete: (account: UserAccount, password: string) => Promise<void>;
  onCancel: () => void;
}

const ALL_SUBJECTS: { id: SubjectId; icon: string }[] = [
  { id: 'math', icon: '📐' },
  { id: 'english', icon: '📖' },
  { id: 'programming', icon: '💻' },
  { id: 'physics', icon: '⚡' },
  { id: 'chemistry', icon: '🧪' },
  { id: 'biology', icon: '🧬' },
  { id: 'history', icon: '🏛️' }
];

export const AuthWizard: React.FC<AuthWizardProps> = ({
  language,
  onComplete,
  onCancel
}) => {
  const t = translations[language];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const [studentSubjects, setStudentSubjects] = useState<SubjectId[]>([]);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('intermediate');
  const [studentGoal, setStudentGoal] = useState<StudentGoal>('grades');

  const [teacherSubjects, setTeacherSubjects] = useState<SubjectId[]>([]);
  const [teacherAudience, setTeacherAudience] = useState<TeacherAudience>('school');
  const [teacherGoal, setTeacherGoal] = useState<TeacherGoal>('track_progress');

  const handleToggleSubject = (subjId: SubjectId, isTeacher = false) => {
    if (isTeacher) {
      setTeacherSubjects(prev => 
        prev.includes(subjId) ? prev.filter(s => s !== subjId) : [...prev, subjId]
      );
    } else {
      setStudentSubjects(prev => 
        prev.includes(subjId) ? prev.filter(s => s !== subjId) : [...prev, subjId]
      );
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg(t.fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(2);
  };

  const handleFinishWizard = async () => {
    if (selectedRole === 'student' && studentSubjects.length === 0) {
      setErrorMsg(t.noSubjectsSelected || 'Please select at least one subject.');
      return;
    }
    if (selectedRole === 'teacher' && teacherSubjects.length === 0) {
      setErrorMsg('Please select at least one subject to teach.');
      return;
    }

    const account: UserAccount = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Alex Rivera',
      email: email.trim() || 'alex@example.com',
      role: selectedRole,
      avatar: '',
      createdAt: new Date().toLocaleDateString(),
      ...(selectedRole === 'student' ? {
        studentSubjects,
        studentLevel,
        studentGoal
      } : {
        teacherSubjects,
        teacherAudience,
        teacherGoal
      })
    };

    setIsSaving(true);
    setErrorMsg('');
    try {
      await onComplete(account, password);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Could not create account. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '20px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(prev => prev - 1)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={14} />
          <span>{currentStep === 1 ? t.cancel : t.back}</span>
        </button>

        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {t.stepOf.replace('{current}', String(currentStep)).replace('{total}', String(totalSteps))}
        </span>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.registerTitle}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t.registerSubtitle}
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>

            <div className="grid-2" style={{ gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
              <span>{t.continue}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.roleSelectTitle}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t.roleSelectSubtitle}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                onClick={() => setSelectedRole('student')}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: selectedRole === 'student' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedRole === 'student' ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <GraduationCap size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {t.roleStudentTitle}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {t.roleStudentDesc}
                  </div>
                </div>
                {selectedRole === 'student' && <Check size={20} color="var(--primary)" />}
              </div>

              <div
                onClick={() => setSelectedRole('teacher')}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: selectedRole === 'teacher' ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
                  background: selectedRole === 'teacher' ? 'var(--accent-purple-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Users size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {t.roleTeacherTitle}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {t.roleTeacherDesc}
                  </div>
                </div>
                {selectedRole === 'teacher' && <Check size={20} color="var(--accent-purple)" />}
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="btn btn-primary"
              style={{ padding: '12px', marginTop: '10px' }}
            >
              <span>{t.continue}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {currentStep === 3 && selectedRole === 'student' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.studentSubjectsTitle}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {t.studentSubjectsSubtitle}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_SUBJECTS.map((subj) => {
                const isSelected = studentSubjects.includes(subj.id);
                const subjName = t[`subj_${subj.id}` as keyof typeof t] as string;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleToggleSubject(subj.id, false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{subj.icon}</span>
                    <span>{subjName}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t.studentLevelTitle}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(['beginner', 'intermediate', 'advanced'] as StudentLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStudentLevel(lvl)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: studentLevel === lvl ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: studentLevel === lvl ? 'var(--primary-light)' : '#ffffff',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: studentLevel === lvl ? 'var(--primary)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{t[`lvl_${lvl}` as keyof typeof t] as string}</span>
                    {studentLevel === lvl && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t.studentGoalTitle}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(['grades', 'exam', 'olympiad', 'new_skill', 'interest'] as StudentGoal[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setStudentGoal(g)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: studentGoal === g ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: studentGoal === g ? 'var(--primary-light)' : '#ffffff',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: studentGoal === g ? 'var(--primary)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{t[`goal_${g}` as keyof typeof t] as string}</span>
                    {studentGoal === g && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinishWizard}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '14px', marginTop: '10px' }}
            >
              <span>{isSaving ? 'Saving…' : t.finish}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {currentStep === 3 && selectedRole === 'teacher' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.teacherSubjectsTitle}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {t.teacherSubjectsSubtitle}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_SUBJECTS.map((subj) => {
                const isSelected = teacherSubjects.includes(subj.id);
                const subjName = t[`subj_${subj.id}` as keyof typeof t] as string;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleToggleSubject(subj.id, true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--accent-purple)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--accent-purple-light)' : '#ffffff',
                      color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{subj.icon}</span>
                    <span>{subjName}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t.teacherAudienceTitle}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(['school', 'university', 'adults', 'professional'] as TeacherAudience[]).map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTeacherAudience(aud)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: teacherAudience === aud ? '1.5px solid var(--accent-purple)' : '1px solid var(--border)',
                      background: teacherAudience === aud ? 'var(--accent-purple-light)' : '#ffffff',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: teacherAudience === aud ? 'var(--accent-purple)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{t[`aud_${aud}` as keyof typeof t] as string}</span>
                    {teacherAudience === aud && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t.teacherGoalTitle}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(['create_lessons', 'track_progress', 'find_gaps', 'prep_exams'] as TeacherGoal[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setTeacherGoal(g)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: teacherGoal === g ? '1.5px solid var(--accent-purple)' : '1px solid var(--border)',
                      background: teacherGoal === g ? 'var(--accent-purple-light)' : '#ffffff',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: teacherGoal === g ? 'var(--accent-purple)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{t[`tgoal_${g}` as keyof typeof t] as string}</span>
                    {teacherGoal === g && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinishWizard}
              className="btn btn-primary"
              style={{
                padding: '14px',
                marginTop: '10px',
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, #6366f1 100%)'
              }}
            >
              <span>{t.finish}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
