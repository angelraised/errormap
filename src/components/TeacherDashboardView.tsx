import React, { useEffect, useState } from 'react';
import type { 
  TeacherStudentSummary, 
  UserAccount, 
  SubjectId, 
  LearningMaterial, 
  TeacherTest, 
  StudentLevel, 
  StudentGoal, 
  MaterialType,
  TeacherTestQuestion 
} from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { listStudentAccounts, getLearningMaterials, saveLearningMaterial, getTeacherTests, saveTeacherTest } from '../services/accountService';
import { DEMO_TEACHER_STUDENTS } from '../mockData';
import { UserAvatar } from './UserAvatar';
import { 
  Users, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight,
  BookOpen,
  X,
  Check,
  Eye,
} from 'lucide-react';

interface TeacherDashboardProps {
  account: UserAccount;
  language: Language;
  onViewMyClass: () => void;
  onOpenAnalytics: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardProps> = ({
  account,
  language,
  onViewMyClass,
  onOpenAnalytics
}) => {
  const t = translations[language];
  const isDemo = account.id.startsWith('demo_');
  const [students, setStudents] = useState<TeacherStudentSummary[]>(isDemo ? DEMO_TEACHER_STUDENTS : []);
  const [isLoading, setIsLoading] = useState(!isDemo);
  const [loadError, setLoadError] = useState('');

  // Materials & Tests state
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [tests, setTests] = useState<TeacherTest[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<'materials' | 'tests'>('materials');

  // Modals state
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Form state: Add Material
  const teacherSubjs: SubjectId[] = account.teacherSubjects || [];
  const defaultSubj = teacherSubjs[0] || 'programming';

  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState<SubjectId>(defaultSubj);
  const [matTopic, setMatTopic] = useState('');
  const [matType, setMatType] = useState<MaterialType>('text');
  const [matLevel, setMatLevel] = useState<StudentLevel>('advanced');
  const [matGoal] = useState<StudentGoal>('olympiad');
  const [matDesc, setMatDesc] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matStatus, setMatStatus] = useState<'draft' | 'published'>('published');

  // Form state: Create Test
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState<SubjectId>(defaultSubj);
  const [testTopic, setTestTopic] = useState('');
  const [testLevel, setTestLevel] = useState<StudentLevel>('advanced');
  const [testGoal, setTestGoal] = useState<StudentGoal>('olympiad');
  const [testIsAdaptive] = useState(false);
  const [testDuration, setTestDuration] = useState(15);
  const [testStatus, setTestStatus] = useState<'draft' | 'published'>('published');
  const [testQuestions] = useState<TeacherTestQuestion[]>([
    {
      id: `q_${Date.now()}_1`,
      text: 'Which data structure provides average O(1) time complexity for both lookup and insertion?',
      options: [
        { id: 'opt_1', text: 'Hash Table', isCorrect: true },
        { id: 'opt_2', text: 'Linked List', isCorrect: false, misconceptionNote: 'Linked list search requires O(N) linear traversal.' },
        { id: 'opt_3', text: 'Binary Search Tree', isCorrect: false, misconceptionNote: 'BST lookup is O(log N) balanced or O(N) worst case.' },
        { id: 'opt_4', text: 'Array (unsorted)', isCorrect: false, misconceptionNote: 'Unsorted array lookup requires linear scanning O(N).' }
      ],
      explanation: 'Hash tables map keys to bucket indices using a hash function, delivering expected O(1) operations.',
      hint: 'Think of constant-time direct indexing via hash codes.',
      verificationTask: 'What is the worst-case lookup complexity of a hash table with full collisions? (A) O(N) (B) O(1).'
    }
  ]);

  // Preview Test Modal
  const [previewTest, setPreviewTest] = useState<TeacherTest | null>(null);

  useEffect(() => {
    if (!isDemo) {
      listStudentAccounts()
        .then(setStudents)
        .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load student list.'))
        .finally(() => setIsLoading(false));
    }

    getLearningMaterials().then(m => {
      // Filter for teacher's subjects
      const filtered = teacherSubjs.length > 0 
        ? m.filter(item => teacherSubjs.includes(item.subject))
        : m;
      setMaterials(filtered);
    }).catch(() => {});

    getTeacherTests().then(tsts => {
      const filtered = teacherSubjs.length > 0
        ? tsts.filter(item => teacherSubjs.includes(item.subject))
        : tsts;
      setTests(filtered);
    }).catch(() => {});
  }, [isDemo, account.id]);

  const needsAttentionList = students.filter(s => s.status === 'needs_attention');
  const subjectsLabel = teacherSubjs.length > 0 
    ? teacherSubjs.map(s => t[`subj_${s}` as keyof typeof t] as string || s).join(', ')
    : 'None selected';

  // Handle Save Learning Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matContent.trim()) {
      alert('Please fill in title and content.');
      return;
    }

    const newMat: LearningMaterial = {
      id: `mat_${Date.now()}`,
      teacherId: account.id,
      teacherName: account.name,
      title: matTitle.trim(),
      subject: matSubject,
      topic: matTopic.trim() || 'General',
      type: matType,
      recommendedLevel: matLevel,
      recommendedGoal: matGoal,
      description: matDesc.trim() || matTitle.trim(),
      contentOrUrl: matContent.trim(),
      status: matStatus,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveLearningMaterial(newMat);
    setMaterials(prev => [newMat, ...prev]);
    setIsAddMaterialOpen(false);
    setNotificationMsg(`Material "${newMat.title}" successfully published!`);
    setTimeout(() => setNotificationMsg(''), 4000);

    // Reset form
    setMatTitle('');
    setMatDesc('');
    setMatContent('');
  };

  // Handle Save Test
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || testQuestions.length === 0) {
      alert('Please enter a test title and at least one question.');
      return;
    }

    const newTest: TeacherTest = {
      id: `test_${Date.now()}`,
      teacherId: account.id,
      teacherName: account.name,
      subject: testSubject,
      topic: testTopic.trim() || 'General',
      title: testTitle.trim(),
      targetLevel: testLevel,
      targetGoal: testGoal,
      isAdaptive: testIsAdaptive,
      durationMinutes: testDuration,
      questions: testQuestions,
      status: testStatus,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveTeacherTest(newTest);
    setTests(prev => [newTest, ...prev]);
    setIsCreateTestOpen(false);
    setNotificationMsg(`Test "${newTest.title}" successfully created and saved!`);
    setTimeout(() => setNotificationMsg(''), 4000);

    // Reset form
    setTestTitle('');
    setTestTopic('');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Friendly Clean Greeting */}
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
          <UserAvatar name={account.name} src={account.avatar} />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              {t.teacherHello}, {account.name}! 👋
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              {t.teachingSubjects}: <strong style={{ color: 'var(--accent-purple)' }}>{subjectsLabel}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsAddMaterialOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.88rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <BookOpen size={16} />
            <span>Add Learning Material</span>
          </button>

          <button
            onClick={() => setIsCreateTestOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.88rem', background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
          >
            <PlusCircle size={16} />
            <span>Create Test</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notificationMsg && (
        <div className="animate-fade-in" style={{
          padding: '12px 18px',
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-md)',
          color: '#166534',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 2. Simplified Stats Card */}
      <div className="grid-2" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-purple-light)',
            color: 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t.totalStudents}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {isLoading ? '…' : students.length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
              {t.needsAttentionCount}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--danger)' }}>
              {isLoading ? '…' : needsAttentionList.length}
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
          {loadError}
        </div>
      )}

      {/* 3. Published Curriculum Management */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setActiveViewTab('materials')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 800,
                color: activeViewTab === 'materials' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeViewTab === 'materials' ? '2px solid var(--primary)' : 'none',
                paddingBottom: '4px',
                cursor: 'pointer'
              }}
            >
              Published Materials ({materials.length})
            </button>
            <button
              onClick={() => setActiveViewTab('tests')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 800,
                color: activeViewTab === 'tests' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderBottom: activeViewTab === 'tests' ? '2px solid var(--accent-purple)' : 'none',
                paddingBottom: '4px',
                cursor: 'pointer'
              }}
            >
              Created Tests ({tests.length})
            </button>
          </div>
        </div>

        {activeViewTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {materials.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No materials created for your assigned subjects yet.
              </p>
            ) : (
              materials.map(mat => (
                <div key={mat.id} style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-learning" style={{ textTransform: 'capitalize' }}>
                        {mat.subject}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{mat.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({mat.type})</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Topic: {mat.topic} • Target: {mat.recommendedLevel} • Status: <strong style={{ color: mat.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>{mat.status}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeViewTab === 'tests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tests.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No tests created for your assigned subjects yet.
              </p>
            ) : (
              tests.map(test => (
                <div key={test.id} style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-mastered" style={{ textTransform: 'capitalize' }}>
                        {test.subject}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{test.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({test.questions.length} questions, {test.durationMinutes}m)</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Topic: {test.topic} • Target: {test.targetLevel} • Status: <strong style={{ color: test.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>{test.status}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewTest(test)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. Student Roster Call to Action */}
      <div className="card" style={{
        padding: '28px',
        border: '2px solid var(--accent-purple)',
        background: 'linear-gradient(135deg, var(--accent-purple-light) 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t.studentRosterTitle}
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {t.studentRosterSub}
        </p>

        <button
          onClick={onViewMyClass}
          className="btn btn-primary"
          style={{
            padding: '14px 24px',
            fontSize: '1.05rem',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #6366f1 100%)',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          <span>{t.viewMyClassBtn}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Analytics link */}
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <button
          onClick={onOpenAnalytics}
          style={{
            fontSize: '0.92rem',
            color: 'var(--accent-purple)',
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
          <span>{t.viewAnalyticsLink}</span>
        </button>
      </div>

      {/* MODAL 1: ADD LEARNING MATERIAL */}
      {isAddMaterialOpen && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsAddMaterialOpen(false)}
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

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Publish Learning Material
            </h2>

            <form onSubmit={handleSaveMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Traversals: DFS and BFS in Practice"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Subject (Restricted to Teaching Profile)
                  </label>
                  <select
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value as SubjectId)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    {teacherSubjs.map(subj => (
                      <option key={subj} value={subj}>
                        {t[`subj_${subj}` as keyof typeof t] as string || subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Type
                  </label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as MaterialType)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="text">Text Lesson</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF Document</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Topic / Skill
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graph Algorithms"
                    value={matTopic}
                    onChange={(e) => setMatTopic(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Target Level
                  </label>
                  <select
                    value={matLevel}
                    onChange={(e) => setMatLevel(e.target.value as StudentLevel)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Description / Overview
                </label>
                <input
                  type="text"
                  placeholder="Summary of concepts covered..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Content or URL
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write lesson text or provide video/document link..."
                  value={matContent}
                  onChange={(e) => setMatContent(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <select
                  value={matStatus}
                  onChange={(e) => setMatStatus(e.target.value as 'draft' | 'published')}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="published">Publish Immediately</option>
                  <option value="draft">Save as Draft</option>
                </select>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddMaterialOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px' }}
                  >
                    Save Material
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TEST */}
      {isCreateTestOpen && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsCreateTestOpen(false)}
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

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Create Assessment Test
            </h2>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Test Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Dynamic Programming Check"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Subject (Restricted to Teaching Profile)
                  </label>
                  <select
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value as SubjectId)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    {teacherSubjs.map(subj => (
                      <option key={subj} value={subj}>
                        {t[`subj_${subj}` as keyof typeof t] as string || subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Topic / Domain
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Algorithms"
                    value={testTopic}
                    onChange={(e) => setTestTopic(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Target Level
                  </label>
                  <select
                    value={testLevel}
                    onChange={(e) => setTestLevel(e.target.value as StudentLevel)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Target Goal
                  </label>
                  <select
                    value={testGoal}
                    onChange={(e) => setTestGoal(e.target.value as StudentGoal)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="olympiad">Olympiad</option>
                    <option value="exam">Exam</option>
                    <option value="grades">Grades</option>
                    <option value="new_skill">New Skill</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* Question summary / editor */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Question 1 (with attached Misconceptions)
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Q:</strong> {testQuestions[0].text}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Options: {testQuestions[0].options.map(o => o.text).join(' | ')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <select
                  value={testStatus}
                  onChange={(e) => setTestStatus(e.target.value as 'draft' | 'published')}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="published">Publish Immediately</option>
                  <option value="draft">Save as Draft</option>
                </select>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateTestOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
                  >
                    Publish Test
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW TEST */}
      {previewTest && (
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
              onClick={() => setPreviewTest(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-mastered" style={{ textTransform: 'capitalize' }}>
                {previewTest.subject}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: {previewTest.targetLevel}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
              {previewTest.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {previewTest.questions.map((q, idx) => (
                <div key={q.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px' }}>
                    {idx + 1}. {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                    {q.options.map(opt => (
                      <div key={opt.id} style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                        border: opt.isCorrect ? '1.5px solid #86efac' : '1px solid var(--border)',
                        color: opt.isCorrect ? '#166534' : 'var(--text-primary)'
                      }}>
                        {opt.text} {opt.isCorrect && '✓ (Correct)'}
                        {opt.misconceptionNote && (
                          <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '2px' }}>
                            Misconception note: {opt.misconceptionNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewTest(null)}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
