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

const teacherCopy = {
  en: { addMaterial: 'Add Learning Material', createTest: 'Create Test', materials: 'Published Materials', tests: 'Created Tests', noMaterials: 'No materials created for your assigned subjects yet.', noTests: 'No tests created for your assigned subjects yet.', topic: 'Topic', target: 'Target', status: 'Status', questions: 'questions', preview: 'Preview', publishMaterial: 'Publish Learning Material', title: 'Title', subject: 'Subject (restricted to teaching profile)', type: 'Type', textLesson: 'Text lesson', video: 'Video', pdf: 'PDF document', link: 'External link', topicSkill: 'Topic / skill', level: 'Target level', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', description: 'Description / overview', content: 'Content or URL', publishNow: 'Publish immediately', draft: 'Save as draft', cancel: 'Cancel', saveMaterial: 'Save material', createAssessment: 'Create assessment test', testTitle: 'Test title', topicDomain: 'Topic / domain', goal: 'Target goal', olympiad: 'Olympiad', exam: 'Exam', grades: 'Grades', newSkill: 'New skill', duration: 'Duration (min)', question: 'Question', options: 'Options', publishTest: 'Publish test', correct: 'Correct', misconception: 'Misconception note', close: 'Close preview', none: 'None selected', fillMaterial: 'Please fill in title and content.', fillTest: 'Please enter a test title and at least one question.' },
  ru: { addMaterial: 'Добавить материал', createTest: 'Создать тест', materials: 'Опубликованные материалы', tests: 'Созданные тесты', noMaterials: 'По вашим предметам пока нет материалов.', noTests: 'По вашим предметам пока нет тестов.', topic: 'Тема', target: 'Уровень', status: 'Статус', questions: 'вопросов', preview: 'Посмотреть', publishMaterial: 'Опубликовать учебный материал', title: 'Название', subject: 'Предмет (из профиля преподавателя)', type: 'Тип', textLesson: 'Текстовый урок', video: 'Видео', pdf: 'PDF-документ', link: 'Внешняя ссылка', topicSkill: 'Тема / навык', level: 'Уровень учеников', beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый', description: 'Описание', content: 'Содержание или ссылка', publishNow: 'Опубликовать сразу', draft: 'Сохранить как черновик', cancel: 'Отмена', saveMaterial: 'Сохранить материал', createAssessment: 'Создать проверочный тест', testTitle: 'Название теста', topicDomain: 'Тема / раздел', goal: 'Цель', olympiad: 'Олимпиада', exam: 'Экзамен', grades: 'Оценки', newSkill: 'Новый навык', duration: 'Длительность (мин)', question: 'Вопрос', options: 'Варианты', publishTest: 'Опубликовать тест', correct: 'Правильный ответ', misconception: 'Типичная ошибка', close: 'Закрыть', none: 'Ничего не выбрано', fillMaterial: 'Заполните название и содержание.', fillTest: 'Введите название теста и добавьте хотя бы один вопрос.' },
  kz: { addMaterial: 'Материал қосу', createTest: 'Тест жасау', materials: 'Жарияланған материалдар', tests: 'Жасалған тесттер', noMaterials: 'Пәндеріңіз бойынша материалдар әзірге жоқ.', noTests: 'Пәндеріңіз бойынша тесттер әзірге жоқ.', topic: 'Тақырып', target: 'Деңгей', status: 'Күйі', questions: 'сұрақ', preview: 'Қарау', publishMaterial: 'Оқу материалын жариялау', title: 'Атауы', subject: 'Пән (мұғалім профилінен)', type: 'Түрі', textLesson: 'Мәтіндік сабақ', video: 'Бейне', pdf: 'PDF құжаты', link: 'Сыртқы сілтеме', topicSkill: 'Тақырып / дағды', level: 'Оқушы деңгейі', beginner: 'Бастапқы', intermediate: 'Орта', advanced: 'Жоғары', description: 'Сипаттама', content: 'Мазмұн немесе сілтеме', publishNow: 'Бірден жариялау', draft: 'Жоба ретінде сақтау', cancel: 'Бас тарту', saveMaterial: 'Материалды сақтау', createAssessment: 'Тексеру тестін жасау', testTitle: 'Тест атауы', topicDomain: 'Тақырып / бөлім', goal: 'Мақсат', olympiad: 'Олимпиада', exam: 'Емтихан', grades: 'Бағалар', newSkill: 'Жаңа дағды', duration: 'Ұзақтығы (мин)', question: 'Сұрақ', options: 'Нұсқалар', publishTest: 'Тестті жариялау', correct: 'Дұрыс жауап', misconception: 'Типтік қате', close: 'Жабу', none: 'Ештеңе таңдалмаған', fillMaterial: 'Атауы мен мазмұнын толтырыңыз.', fillTest: 'Тест атауын енгізіп, кемінде бір сұрақ қосыңыз.' }
} as const;

const defaultTestQuestion = (language: Language): TeacherTestQuestion => {
  const localized = language === 'ru'
    ? { text: 'Какая структура данных обеспечивает поиск и вставку в среднем за O(1)?', options: ['Хеш-таблица', 'Связный список', 'Двоичное дерево поиска', 'Неотсортированный массив'], explanation: 'Хеш-таблица использует хеш-функцию и в среднем выполняет операции за O(1).', hint: 'Вспомните прямой доступ по хешу.', verification: 'Какова худшая сложность поиска при множестве коллизий? O(n) или O(1)?' }
    : language === 'kz'
      ? { text: 'Қай деректер құрылымы іздеу мен қосуды орташа O(1) уақытта орындайды?', options: ['Хеш-кесте', 'Байланысқан тізім', 'Екілік іздеу ағашы', 'Сұрыпталмаған массив'], explanation: 'Хеш-кесте хеш-функцияны қолданып, операцияларды орташа O(1) уақытта орындайды.', hint: 'Хеш арқылы тікелей қолжетімділікті еске түсір.', verification: 'Көп коллизия болғандағы іздеудің ең нашар күрделілігі қандай: O(n) әлде O(1)?' }
      : { text: 'Which data structure provides average O(1) time complexity for both lookup and insertion?', options: ['Hash Table', 'Linked List', 'Binary Search Tree', 'Array (unsorted)'], explanation: 'Hash tables map keys to bucket indices using a hash function, delivering expected O(1) operations.', hint: 'Think of constant-time direct indexing via hash codes.', verification: 'What is the worst-case lookup complexity with full collisions: O(n) or O(1)?' };

  return {
    id: `q_${Date.now()}_1`, text: localized.text,
    options: localized.options.map((text, index) => ({ id: `opt_${index + 1}`, text, isCorrect: index === 0, misconceptionNote: index === 0 ? undefined : language === 'ru' ? 'Эта структура не обеспечивает среднее O(1) для обеих операций.' : language === 'kz' ? 'Бұл құрылым екі операцияға да орташа O(1) уақытын бермейді.' : 'This structure does not provide average O(1) for both operations.' })),
    explanation: localized.explanation, hint: localized.hint, verificationTask: localized.verification
  };
};

export const TeacherDashboardView: React.FC<TeacherDashboardProps> = ({
  account,
  language,
  onViewMyClass,
  onOpenAnalytics
}) => {
  const t = translations[language];
  const c = teacherCopy[language];
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
  const [testQuestions] = useState<TeacherTestQuestion[]>(() => [defaultTestQuestion(language)]);

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
    : c.none;

  // Handle Save Learning Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matContent.trim()) {
      alert(c.fillMaterial);
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
      alert(c.fillTest);
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
    <div className="animate-fade-in teacher-dashboard" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
            <span>{c.addMaterial}</span>
          </button>

          <button
            onClick={() => setIsCreateTestOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.88rem', background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
          >
            <PlusCircle size={16} />
            <span>{c.createTest}</span>
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
              {c.materials} ({materials.length})
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
              {c.tests} ({tests.length})
            </button>
          </div>
        </div>

        {activeViewTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {materials.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                {c.noMaterials}
              </p>
            ) : (
              materials.map(mat => (
                <div key={mat.id} className="teacher-content-card" style={{
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
                      {c.topic}: {mat.topic} • {c.target}: {mat.recommendedLevel} • {c.status}: <strong style={{ color: mat.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>{mat.status}</strong>
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
                {c.noTests}
              </p>
            ) : (
              tests.map(test => (
                <div key={test.id} className="teacher-content-card" style={{
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
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({test.questions.length} {c.questions}, {test.durationMinutes} мин)</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {c.topic}: {test.topic} • {c.target}: {test.targetLevel} • {c.status}: <strong style={{ color: test.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>{test.status}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewTest(test)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    <Eye size={14} />
                    <span>{c.preview}</span>
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
              {c.publishMaterial}
            </h2>

            <form onSubmit={handleSaveMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {c.title}
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
                    {c.subject}
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
                    {c.type}
                  </label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as MaterialType)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="text">{c.textLesson}</option>
                    <option value="video">{c.video}</option>
                    <option value="pdf">{c.pdf}</option>
                    <option value="link">{c.link}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {c.topicSkill}
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
                    {c.level}
                  </label>
                  <select
                    value={matLevel}
                    onChange={(e) => setMatLevel(e.target.value as StudentLevel)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="beginner">{c.beginner}</option>
                    <option value="intermediate">{c.intermediate}</option>
                    <option value="advanced">{c.advanced}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {c.description}
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
                  {c.content}
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
                  <option value="published">{c.publishNow}</option>
                  <option value="draft">{c.draft}</option>
                </select>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddMaterialOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    {c.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px' }}
                  >
                    {c.saveMaterial}
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
              {c.createAssessment}
            </h2>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {c.testTitle}
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
                    {c.subject}
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
                    {c.topicDomain}
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
                    {c.level}
                  </label>
                  <select
                    value={testLevel}
                    onChange={(e) => setTestLevel(e.target.value as StudentLevel)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="beginner">{c.beginner}</option>
                    <option value="intermediate">{c.intermediate}</option>
                    <option value="advanced">{c.advanced}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {c.goal}
                  </label>
                  <select
                    value={testGoal}
                    onChange={(e) => setTestGoal(e.target.value as StudentGoal)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="olympiad">{c.olympiad}</option>
                    <option value="exam">{c.exam}</option>
                    <option value="grades">{c.grades}</option>
                    <option value="new_skill">{c.newSkill}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {c.duration}
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
              <div className="teacher-content-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {c.question} 1 (ErrorMap)
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Q:</strong> {testQuestions[0].text}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {c.options}: {testQuestions[0].options.map(o => o.text).join(' | ')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <select
                  value={testStatus}
                  onChange={(e) => setTestStatus(e.target.value as 'draft' | 'published')}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="published">{c.publishNow}</option>
                  <option value="draft">{c.draft}</option>
                </select>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateTestOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    {c.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
                  >
                    {c.publishTest}
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
                {c.target}: {previewTest.targetLevel}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
              {previewTest.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {previewTest.questions.map((q, idx) => (
                <div key={q.id} className="teacher-content-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px' }}>
                    {idx + 1}. {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                    {q.options.map(opt => (
                      <div key={opt.id} className={opt.isCorrect ? 'teacher-answer-card correct' : 'teacher-answer-card'} style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                        border: opt.isCorrect ? '1.5px solid #86efac' : '1px solid var(--border)',
                        color: opt.isCorrect ? '#166534' : 'var(--text-primary)'
                      }}>
                        {opt.text} {opt.isCorrect && `✓ (${c.correct})`}
                        {opt.misconceptionNote && (
                          <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '2px' }}>
                            {c.misconception}: {opt.misconceptionNote}
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
                {c.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
