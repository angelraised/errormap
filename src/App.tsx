import { useEffect, useState } from 'react';
import { Activity, BarChart3, BookOpen, Globe, Home, LogOut, Moon, Sun, User, Users } from 'lucide-react';
import type { Language } from './translations';
import { getBrowserLanguage, translations } from './translations';
import type { StudentProfile, SubjectId, UserAccount } from './types';
import { createFreshStudentProfile } from './mockData';
import { createAccount, getLearningProfile, saveLearningProfile, signInAccount, signOutAccount } from './services/accountService';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginView } from './components/LoginView';
import { AuthWizard } from './components/AuthWizard';
import { StudentDashboardView } from './components/StudentDashboardView';
import { SubjectSelectView } from './components/SubjectSelectView';
import { SubjectPageView } from './components/SubjectPageView';
import { DiagnosticView } from './components/DiagnosticView';
import { ResultsView } from './components/ResultsView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { TeacherClassRosterView } from './components/TeacherClassRosterView';
import { TeacherAnalyticsView } from './components/TeacherAnalyticsView';
import { ProfileView } from './components/ProfileView';
import { UserAvatar } from './components/UserAvatar';

type Screen = 'welcome' | 'login' | 'register' | 'student_home' | 'subjects' | 'subject' |
  'diagnostic' | 'results' | 'teacher_home' | 'teacher_roster' | 'teacher_analytics' | 'profile';

const ACCOUNT_KEY = 'skillpulse_active_user_v4';
const LANGUAGE_KEY = 'skillpulse_preferred_lang_v3';
const THEME_KEY = 'skillpulse_theme_v1';
const ACCOUNT_RESET_KEY = 'errormap_accounts_cleared_2026_09_24_v2';
type Theme = 'light' | 'dark';

function clearLegacyAccountData() {
  if (localStorage.getItem(ACCOUNT_RESET_KEY)) return;
  const legacyExactKeys = new Set([
    'skillpulse_active_user_v4',
    'skillpulse_accounts_v4',
    'skillpulse_credentials_v2',
    'skillpulse_active_user_v2',
    'skillpulse_active_user_v3',
    'skillpulse_accounts_v2',
    'skillpulse_accounts_v3',
    'skillpulse_credentials_v1'
  ]);
  Object.keys(localStorage).forEach(key => {
    if (legacyExactKeys.has(key) || key.startsWith('skillpulse_profile_v2_') || key.startsWith('skillpulse_profile_v3_') || key.startsWith('skillpulse_profile_v4_')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem(ACCOUNT_RESET_KEY, 'done');
}

clearLegacyAccountData();

const demoAccount: UserAccount = {
  id: 'demo_student', name: 'Alex Rivera', email: 'demo@errormap.app', role: 'student', avatar: '',
  createdAt: new Date().toLocaleDateString(), studentSubjects: ['english', 'programming'],
  studentLevel: 'advanced', studentGoal: 'olympiad'
};

function readAccount(): UserAccount | null {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) ?? 'null'); } catch { return null; }
}

function profileKey(accountId: string) { return `skillpulse_profile_v4_${accountId}`; }

function readProfile(account: UserAccount): StudentProfile {
  try {
    const raw = localStorage.getItem(profileKey(account.id));
    if (raw) return JSON.parse(raw) as StudentProfile;
  } catch { /* create a clean profile below */ }
  return createFreshStudentProfile(account.name, account.studentSubjects ?? []);
}

function initialScreen(account: UserAccount | null): Screen {
  if (!account) return 'welcome';
  return account.role === 'teacher' ? 'teacher_home' : 'student_home';
}

export function App() {
  const initialAccount = readAccount();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    return saved === 'en' || saved === 'ru' || saved === 'kz' ? saved : getBrowserLanguage();
  });
  const [account, setAccount] = useState<UserAccount | null>(initialAccount);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [screen, setScreen] = useState<Screen>(() => initialScreen(initialAccount));
  const [profile, setProfile] = useState<StudentProfile>(() => initialAccount ? readProfile(initialAccount) : createFreshStudentProfile('', []));
  const [activeSubject, setActiveSubject] = useState<SubjectId | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    else localStorage.removeItem(ACCOUNT_KEY);
  }, [account]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!account || account.role !== 'student') return;
    localStorage.setItem(profileKey(account.id), JSON.stringify(profile));
    void saveLearningProfile(account.id, profile);
  }, [account, profile]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem(LANGUAGE_KEY, next);
  };

  const completeRegistration = async (candidate: UserAccount, password: string) => {
    const saved = await createAccount(candidate, password);
    setAccount(saved);
    if (saved.role === 'student') {
      setProfile(createFreshStudentProfile(saved.name, saved.studentSubjects ?? []));
      setScreen('student_home');
    } else setScreen('teacher_home');
  };

  const login = async (email: string, password: string) => {
    const saved = await signInAccount(email, password);
    setAccount(saved);
    if (saved.role === 'student') {
      const cloudProfile = await getLearningProfile(saved.id);
      setProfile(cloudProfile ?? readProfile(saved));
      setScreen('student_home');
    } else setScreen('teacher_home');
  };

  const exploreDemo = () => {
    setAccount(demoAccount);
    setProfile(createFreshStudentProfile(demoAccount.name, demoAccount.studentSubjects ?? []));
    setScreen('student_home');
  };

  const logout = async () => {
    await signOutAccount();
    setAccount(null);
    setActiveSubject(null);
    setScreen('welcome');
  };

  const openSubject = (subject: SubjectId) => {
    if (!account?.studentSubjects?.includes(subject)) return;
    setActiveSubject(subject);
    setScreen('subject');
  };

  const startDiagnostic = (subject: SubjectId) => {
    if (!account?.studentSubjects?.includes(subject)) return;
    setActiveSubject(subject);
    setScreen('diagnostic');
  };

  const resetProfile = () => {
    if (!account || account.role !== 'student') return;
    setProfile(createFreshStudentProfile(account.name, account.studentSubjects ?? []));
    setActiveSubject(null);
    setScreen('student_home');
  };

  const home = () => {
    if (!account) setScreen('welcome');
    else setScreen(account.role === 'teacher' ? 'teacher_home' : 'student_home');
  };
  const signedIn = Boolean(account && !['welcome', 'login', 'register'].includes(screen));

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-inner">
          <button className="brand" onClick={home}>
            <span className="brand-icon-wrap"><Activity size={20} /></span>
            <span>ErrorMap<span className="brand-dot">.</span></span>
          </button>

          {signedIn && account && (
            <nav className="simple-nav" aria-label="Main navigation">
              <button className={screen.endsWith('home') ? 'active' : ''} onClick={home}><Home size={17} /> {t.navHome}</button>
              {account.role === 'student' ? (
                <button className={screen === 'subjects' || screen === 'subject' ? 'active' : ''} onClick={() => setScreen('subjects')}><BookOpen size={17} /> {t.mySubjectsBtn}</button>
              ) : (
                <>
                  <button className={screen === 'teacher_roster' ? 'active' : ''} onClick={() => setScreen('teacher_roster')}><Users size={17} /> {t.navTeach}</button>
                  <button className={screen === 'teacher_analytics' ? 'active' : ''} onClick={() => setScreen('teacher_analytics')}><BarChart3 size={17} /> {t.navAnalytics}</button>
                </>
              )}
              <button className={screen === 'profile' ? 'active' : ''} onClick={() => setScreen('profile')}><User size={17} /> {t.navProfile}</button>
            </nav>
          )}

          <div className="nav-actions">
            <div className="lang-switcher"><Globe size={14} />
              {(['en', 'ru', 'kz'] as Language[]).map(item => <button key={item} className={`lang-btn ${language === item ? 'active' : ''}`} onClick={() => changeLanguage(item)}>{item.toUpperCase()}</button>)}
            </div>
            <button
              className="icon-button theme-toggle"
              onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Dark theme' : 'Light theme'}
              aria-label={theme === 'light' ? 'Enable dark theme' : 'Enable light theme'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {signedIn && <button className="icon-button" onClick={logout} title={t.logOut}><LogOut size={18} /></button>}
          </div>
        </div>
      </header>

      <main className="main-content">
        {screen === 'welcome' && <WelcomeScreen language={language} onStartCreateAccount={() => setScreen('register')} onLogIn={() => setScreen('login')} onExploreDemo={exploreDemo} />}
        {screen === 'login' && <LoginView language={language} onLogin={login} onBack={() => setScreen('welcome')} onExploreDemo={exploreDemo} />}
        {screen === 'register' && <AuthWizard language={language} onComplete={completeRegistration} onCancel={() => setScreen('welcome')} />}

        {screen === 'student_home' && account?.role === 'student' && <StudentDashboardView account={account} profile={profile} language={language} onOpenMySubjects={() => setScreen('subjects')} onContinueLearning={() => setScreen('subjects')} onViewSkillMap={() => setScreen('subjects')} />}
        {screen === 'subjects' && account?.role === 'student' && <SubjectSelectView account={account} profile={profile} language={language} onOpenSubject={openSubject} onBack={() => setScreen('student_home')} />}
        {screen === 'subject' && account?.role === 'student' && activeSubject && <SubjectPageView subject={activeSubject} account={account} profile={profile} language={language} onBackToMySubjects={() => setScreen('subjects')} onStartAdaptiveAssessment={startDiagnostic} />}
        {screen === 'diagnostic' && account?.role === 'student' && activeSubject && <DiagnosticView key={`${activeSubject}-${language}`} profile={profile} account={account} language={language} subject={activeSubject} onCancel={() => setScreen('subject')} onComplete={updated => { setProfile(updated); setScreen('results'); }} />}
        {screen === 'results' && activeSubject && <ResultsView profile={profile} language={language} onContinueToPractice={() => setScreen('subject')} onBackToDashboard={() => setScreen('subject')} />}

        {screen === 'teacher_home' && account?.role === 'teacher' && <TeacherDashboardView key={`teacher-${language}`} account={account} language={language} onViewMyClass={() => setScreen('teacher_roster')} onOpenAnalytics={() => setScreen('teacher_analytics')} />}
        {screen === 'teacher_roster' && account?.role === 'teacher' && <TeacherClassRosterView language={language} onBack={() => setScreen('teacher_home')} />}
        {screen === 'teacher_analytics' && account?.role === 'teacher' && <TeacherAnalyticsView language={language} onBack={() => setScreen('teacher_home')} />}
        {screen === 'profile' && account && <ProfileView account={account} language={language} onAccountUpdated={setAccount} onRestartTutorial={home} onResetData={resetProfile} onLogOut={logout} />}
      </main>

      {signedIn && account && <div className="mobile-user"><UserAvatar name={account.name} src={account.avatar} size={30} /><span>{account.name}</span></div>}
    </div>
  );
}

export default App;
