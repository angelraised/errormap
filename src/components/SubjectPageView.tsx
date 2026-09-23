import React, { useEffect, useState } from 'react';
import type { 
  SubjectId, 
  StudentProfile, 
  UserAccount, 
  LearningMaterial, 
  TeacherTest, 
  MaterialType,
  ErrorMapRecord 
} from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { getLearningMaterials, getTeacherTests } from '../services/accountService';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  BrainCircuit, 
  CheckCircle2, 
  Play, 
  ExternalLink, 
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  X,
  FileCheck
} from 'lucide-react';

interface SubjectPageViewProps {
  subject: SubjectId;
  account: UserAccount;
  profile: StudentProfile;
  language: Language;
  onBackToMySubjects: () => void;
  onStartAdaptiveAssessment: (subject: SubjectId) => void;
  onTakeTeacherTest?: (test: TeacherTest) => void;
}

export const SubjectPageView: React.FC<SubjectPageViewProps> = ({
  subject,
  account,
  profile,
  language,
  onBackToMySubjects,
  onStartAdaptiveAssessment,
  onTakeTeacherTest
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'materials' | 'tests' | 'errormap'>('materials');
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [tests, setTests] = useState<TeacherTest[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [viewingMaterial, setViewingMaterial] = useState<LearningMaterial | null>(null);

  const prog = profile.subjectProgress?.[subject];
  const isDiagnosticCompleted = Boolean(prog?.diagnosticCompleted || prog?.status === 'completed');
  const mastery = prog?.overallMastery ?? 0;
  const currentLevel = prog?.estimatedLevel || account.studentLevel || 'intermediate';
  const errorMapHistory: ErrorMapRecord[] = prog?.errorMapHistory || [];

  useEffect(() => {
    getLearningMaterials(subject).then(items => setMaterials(items.filter(item => item.status === 'published'))).catch(() => {});
    getTeacherTests(subject).then(items => setTests(items.filter(item => item.status === 'published'))).catch(() => {});
  }, [subject]);

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

  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'link': return '🔗';
      case 'text': return '📝';
    }
  };

  const localizedSubjectName = t[`subj_${subject}` as keyof typeof t] as string || subject;
  const levelLabel = t[`lvl_${currentLevel}` as keyof typeof t] as string || currentLevel;

  // Topics for filtering
  const allTopics = Array.from(new Set(materials.map(m => m.topic).filter(Boolean)));
  const filteredMaterials = selectedTopic === 'all' 
    ? materials 
    : materials.filter(m => m.topic === selectedTopic);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBackToMySubjects}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.88rem' }}
        >
          <ArrowLeft size={16} />
          <span>{t.backToSubjects}</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Level: <strong style={{ color: 'var(--primary)' }}>{levelLabel}</strong>
        </span>
      </div>

      {/* Subject Header Card */}
      <div className="card" style={{
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%)',
        border: '1.5px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            flexShrink: 0
          }}>
            {getSubjectIcon(subject)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {localizedSubjectName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-learning" style={{ textTransform: 'capitalize' }}>
                {levelLabel}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                • {materials.length} Materials • {tests.length + (isDiagnosticCompleted ? 0 : 1)} Tests
              </span>
            </div>
          </div>
        </div>

        {/* Mastery Meter */}
        <div style={{ minWidth: '130px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t.overallProgress}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isDiagnosticCompleted ? 'var(--primary)' : 'var(--text-secondary)' }}>
            {mastery}%
          </div>
          <div style={{ width: '120px', height: '6px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${mastery}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>
      </div>

      {/* Initial Assessment Banner (if not yet completed) */}
      {!isDiagnosticCompleted && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #3b82f6',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '520px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <BrainCircuit size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 4px 0' }}>
                {t.takeInitialDiagnostic}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#1e40af', margin: 0, lineHeight: 1.45 }}>
                {t.initialAssessmentDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartAdaptiveAssessment(subject)}
            className="btn btn-primary"
            style={{ 
              padding: '12px 22px', 
              fontSize: '0.95rem', 
              background: '#2563eb', 
              borderColor: '#1d4ed8',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' 
            }}
          >
            <span>{t.takeInitialDiagnostic}</span>
            <Play size={16} fill="currentColor" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border)',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('materials')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: 800,
            color: activeTab === 'materials' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'materials' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={18} />
          <span>{t.tabMaterials}</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'materials' ? 'var(--primary-light)' : '#f1f5f9',
            color: activeTab === 'materials' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            {materials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: 800,
            color: activeTab === 'tests' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'tests' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} />
          <span>{t.tabTests}</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'tests' ? 'var(--primary-light)' : '#f1f5f9',
            color: activeTab === 'tests' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            {tests.length + (isDiagnosticCompleted ? 0 : 1)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('errormap')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: 800,
            color: activeTab === 'errormap' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'errormap' ? '3px solid var(--accent-purple)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldAlert size={18} />
          <span>{t.tabErrorMap}</span>
          {errorMapHistory.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 800
            }}>
              {errorMapHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab A: Learning Materials */}
      {activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Topic Filters */}
          {allTopics.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Topic:</span>
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedTopic === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedTopic === 'all' ? 'var(--primary-light)' : '#ffffff',
                  color: selectedTopic === 'all' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All Topics
              </button>
              {allTopics.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: selectedTopic === topic ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedTopic === topic ? 'var(--primary-light)' : '#ffffff',
                    color: selectedTopic === topic ? 'var(--primary)' : 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          {filteredMaterials.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <BookOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t.noMaterialsYet}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {filteredMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge" style={{ background: '#f8fafc', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>{getTypeIcon(mat.type)}</span>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800 }}>{mat.type}</span>
                      </span>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {mat.topic}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {mat.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {mat.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      By {mat.teacherName}
                    </span>

                    <button
                      onClick={() => setViewingMaterial(mat)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    >
                      {mat.type === 'link' ? <ExternalLink size={14} /> : <BookOpen size={14} />}
                      <span>Open Material</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab B: Tests */}
      {activeTab === 'tests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Diagnostic Card in Tests list */}
          <div className="card" style={{
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            border: '1.5px solid var(--primary)',
            background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BrainCircuit size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Adaptive Diagnostic Calibration
                  </h3>
                  <span className="badge" style={{ background: 'var(--primary)', color: '#ffffff', fontSize: '0.72rem' }}>
                    ADAPTIVE
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  5 adaptive questions • 5-8 min • Calibrates level and maps misconceptions
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartAdaptiveAssessment(subject)}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <span>{isDiagnosticCompleted ? 'Retake Assessment' : t.takeInitialDiagnostic}</span>
              <Play size={14} fill="currentColor" />
            </button>
          </div>

          {/* Teacher Created Tests */}
          {tests.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t.noTestsYet}
              </p>
            </div>
          ) : (
            tests.map(test => {
              const isCompleted = prog?.completedTestIds?.includes(test.id);
              return (
                <div
                  key={test.id}
                  className="card"
                  style={{
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: '#f1f5f9',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileCheck size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {test.title}
                        </h3>
                        {isCompleted && (
                          <span className="badge badge-mastered" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                        {test.topic} • {test.questions.length} questions • {test.durationMinutes} min • Target: {test.targetLevel}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onTakeTeacherTest ? onTakeTeacherTest(test) : alert('Starting test: ' + test.title)}
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                  >
                    <span>{isCompleted ? 'Review Test' : 'Start Test'}</span>
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab C: ErrorMap History */}
      {activeTab === 'errormap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMapHistory.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <ShieldAlert size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                ErrorMap Clean
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
                {t.noErrorMapYet}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {errorMapHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="card"
                  style={{
                    padding: '24px',
                    border: '1.5px solid #fecaca',
                    background: '#fffdfd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="#dc2626" />
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#dc2626' }}>
                        {rec.misconception}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: '#fee2e2',
                        color: '#991b1b'
                      }}>
                        Certainty: {rec.classificationConfidence}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rec.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Context Question & Selected Answer */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Question:</strong> {rec.questionText}
                    <div style={{ marginTop: '4px', color: '#dc2626' }}>
                      <strong>Your Answer:</strong> {rec.selectedOptionText}
                    </div>
                  </div>

                  {/* Clarification & Explanation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <strong>Diagnosis:</strong> {rec.explanation}
                    </div>

                    <div style={{
                      background: '#eff6ff',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <HelpCircle size={16} />
                      <span><strong>Clarification check:</strong> {rec.clarificationQuestion}</span>
                    </div>
                  </div>

                  {/* Verification Task */}
                  {rec.verificationTask && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.85rem',
                      color: '#166534'
                    }}>
                      <strong>Self-Verification Task:</strong> {rec.verificationTask}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Material Modal Reader */}
      {viewingMaterial && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            position: 'relative'
          }}>
            <button
              onClick={() => setViewingMaterial(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-learning">
                {viewingMaterial.topic}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Target: {viewingMaterial.recommendedLevel}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
              {viewingMaterial.title}
            </h2>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: '20px'
            }}>
              {viewingMaterial.contentOrUrl}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Author: {viewingMaterial.teacherName}
              </span>

              <button
                onClick={() => setViewingMaterial(null)}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
