import type { StudentProfile, SubjectId, TeacherStudentSummary, UserAccount, LearningMaterial, TeacherTest } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_LEARNING_MATERIALS, INITIAL_TEACHER_TESTS } from '../mockData';

const LOCAL_ACCOUNTS_KEY = 'skillpulse_accounts_v3';
const LOCAL_MATERIALS_KEY = 'skillpulse_materials_v2';
const LOCAL_TESTS_KEY = 'skillpulse_tests_v2';
const LOCAL_CREDENTIALS_KEY = 'skillpulse_credentials_v1';

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`skillpulse-local-demo:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function readLocalCredentials(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LOCAL_CREDENTIALS_KEY) ?? '{}'); }
  catch { return {}; }
}

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar_url: string | null;
  selected_subjects: SubjectId[] | null;
  student_level: UserAccount['studentLevel'] | null;
  student_goal: UserAccount['studentGoal'] | null;
  teacher_audience: UserAccount['teacherAudience'] | null;
  teacher_goal: UserAccount['teacherGoal'] | null;
  created_at: string;
};

function accountToMetadata(account: UserAccount) {
  return {
    name: account.name,
    role: account.role,
    avatar_url: account.avatar || '',
    selected_subjects: account.role === 'student' ? account.studentSubjects : account.teacherSubjects,
    student_level: account.studentLevel ?? null,
    student_goal: account.studentGoal ?? null,
    teacher_audience: account.teacherAudience ?? null,
    teacher_goal: account.teacherGoal ?? null
  };
}

function rowToAccount(row: ProfileRow): UserAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar_url ?? '',
    createdAt: new Date(row.created_at).toLocaleDateString(),
    ...(row.role === 'student'
      ? {
          studentSubjects: row.selected_subjects ?? [],
          studentLevel: row.student_level ?? undefined,
          studentGoal: row.student_goal ?? undefined
        }
      : {
          teacherSubjects: row.selected_subjects ?? [],
          teacherAudience: row.teacher_audience ?? undefined,
          teacherGoal: row.teacher_goal ?? undefined
        })
  };
}

function readLocalAccounts(): UserAccount[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function rememberLocalAccount(account: UserAccount) {
  const accounts = readLocalAccounts().filter(item => item.id !== account.id && item.email !== account.email);
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
}

export async function createAccount(account: UserAccount, password: string): Promise<UserAccount> {
  if (!isSupabaseConfigured || !supabase) {
    if (readLocalAccounts().some(item => item.email.toLowerCase() === account.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const localAccount = { ...account, id: account.id || `usr_${Date.now()}` };
    rememberLocalAccount(localAccount);
    const credentials = readLocalCredentials();
    credentials[localAccount.email.toLowerCase()] = await hashPassword(password);
    localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(credentials));
    return localAccount;
  }

  const { data, error } = await supabase.auth.signUp({
    email: account.email,
    password,
    options: { data: accountToMetadata(account) }
  });

  if (error) throw error;
  if (!data.user) throw new Error('Supabase did not return a created user.');

  const persisted = { ...account, id: data.user.id };
  rememberLocalAccount(persisted);
  return persisted;
}

export async function updateAccount(account: UserAccount): Promise<UserAccount> {
  rememberLocalAccount(account);
  if (!isSupabaseConfigured || !supabase) return account;

  const metadata = accountToMetadata(account);
  const { error: authError } = await supabase.auth.updateUser({ data: metadata });
  if (authError) throw authError;

  const { error } = await supabase
    .from('profiles')
    .update({
      name: account.name,
      avatar_url: account.avatar || null,
      selected_subjects: account.role === 'student' ? account.studentSubjects : account.teacherSubjects,
      student_level: account.studentLevel ?? null,
      student_goal: account.studentGoal ?? null,
      teacher_audience: account.teacherAudience ?? null,
      teacher_goal: account.teacherGoal ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', account.id);
  if (error) throw error;
  return account;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('Could not read avatar file.'));
      reader.readAsDataURL(file);
    });
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${extension}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type
  });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function saveLearningProfile(userId: string, profile: StudentProfile) {
  if (!isSupabaseConfigured || !supabase || userId.startsWith('usr_') || userId.startsWith('demo_')) return;
  const { error } = await supabase
    .from('learning_profiles')
    .upsert({ user_id: userId, profile_data: profile, updated_at: new Date().toISOString() });
  if (error) console.warn('Could not sync learning progress to Supabase:', error.message);
}

export async function getLearningProfile(userId: string): Promise<StudentProfile | null> {
  if (!isSupabaseConfigured || !supabase || userId.startsWith('usr_') || userId.startsWith('demo_')) return null;
  const { data, error } = await supabase
    .from('learning_profiles')
    .select('profile_data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  const profile = data?.profile_data;
  return profile && typeof profile === 'object' && Object.keys(profile).length > 0
    ? profile as StudentProfile
    : null;
}

export async function listStudentAccounts(): Promise<TeacherStudentSummary[]> {
  if (!isSupabaseConfigured || !supabase) {
    return readLocalAccounts()
      .filter(account => account.role === 'student')
      .map(account => ({
        id: account.id,
        name: account.name,
        avatar: account.avatar,
        overallScore: 0,
        status: 'on_track' as const,
        strugglingTopic: 'Starting diagnostic not completed',
        lastActive: 'Recently created',
        detectedMisconceptionsCount: 0,
        confidenceAccuracyGap: 'Not evaluated yet'
      }));
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,name,role,avatar_url,selected_subjects,student_level,student_goal,teacher_audience,teacher_goal,created_at,learning_profiles(profile_data)')
    .eq('role', 'student')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((raw) => {
    const row = raw as unknown as ProfileRow & { learning_profiles?: { profile_data: StudentProfile }[] };
    const learning = row.learning_profiles?.[0]?.profile_data;
    const weakSkill = learning
      ? Object.values(learning.skills).sort((a, b) => a.score - b.score)[0]
      : undefined;
    return {
      id: row.id,
      name: row.name,
      avatar: row.avatar_url ?? '',
      overallScore: learning?.overallMastery ?? 0,
      status: learning && learning.overallMastery >= 80 ? 'excelling' : learning && learning.overallMastery < 50 ? 'needs_attention' : 'on_track',
      strugglingTopic: weakSkill?.name ?? 'Starting diagnostic not completed',
      lastActive: learning ? 'Progress synced' : 'Recently created',
      detectedMisconceptionsCount: learning
        ? Object.values(learning.skills).reduce((sum, skill) => sum + skill.misconceptions.length, 0)
        : 0,
      confidenceAccuracyGap: learning ? 'Adaptive profile available' : 'Not evaluated yet'
    };
  });
}

export async function signInAccount(email: string, password: string): Promise<UserAccount> {
  if (!isSupabaseConfigured || !supabase) {
    const local = readLocalAccounts().find(
      a => a.email.toLowerCase() === email.toLowerCase()
    );
    if (!local) throw new Error('No account found with that email.');
    const storedHash = readLocalCredentials()[email.toLowerCase()];
    if (!storedHash) throw new Error('This old local account has no password. Create it again to enable login.');
    if (storedHash !== await hashPassword(password)) throw new Error('Incorrect email or password.');
    return local;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in did not return a user.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,email,name,role,avatar_url,selected_subjects,student_level,student_goal,teacher_audience,teacher_goal,created_at')
    .eq('id', data.user.id)
    .single();
  if (profileError || !profile) {
    // Fallback: reconstruct from auth metadata
    const meta = data.user.user_metadata as Record<string, unknown>;
    return {
      id: data.user.id,
      name: String(meta.name ?? 'User'),
      email: data.user.email ?? email,
      role: (meta.role as 'student' | 'teacher') ?? 'student',
      avatar: String(meta.avatar_url ?? ''),
      createdAt: new Date(data.user.created_at).toLocaleDateString(),
    };
  }

  const account = rowToAccount(profile as unknown as ProfileRow);
  rememberLocalAccount(account);
  return account;
}

export async function signOutAccount() {
  if (supabase) await supabase.auth.signOut();
}

export function getLocalMaterials(): LearningMaterial[] {
  try {
    const raw = localStorage.getItem(LOCAL_MATERIALS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(INITIAL_LEARNING_MATERIALS));
      return INITIAL_LEARNING_MATERIALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEARNING_MATERIALS;
  }
}

export async function getLearningMaterials(subject?: SubjectId): Promise<LearningMaterial[]> {
  let materials = getLocalMaterials();
  if (subject) {
    materials = materials.filter(m => m.subject === subject);
  }
  return materials;
}

export async function saveLearningMaterial(material: LearningMaterial): Promise<LearningMaterial> {
  const current = getLocalMaterials();
  const index = current.findIndex(m => m.id === material.id);
  let updated: LearningMaterial[];
  if (index >= 0) {
    updated = current.map(m => m.id === material.id ? material : m);
  } else {
    updated = [material, ...current];
  }
  localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(updated));
  return material;
}

export function getLocalTeacherTests(): TeacherTest[] {
  try {
    const raw = localStorage.getItem(LOCAL_TESTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TESTS_KEY, JSON.stringify(INITIAL_TEACHER_TESTS));
      return INITIAL_TEACHER_TESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEACHER_TESTS;
  }
}

export async function getTeacherTests(subject?: SubjectId): Promise<TeacherTest[]> {
  let tests = getLocalTeacherTests();
  if (subject) {
    tests = tests.filter(t => t.subject === subject);
  }
  return tests;
}

export async function saveTeacherTest(test: TeacherTest): Promise<TeacherTest> {
  const current = getLocalTeacherTests();
  const index = current.findIndex(t => t.id === test.id);
  let updated: TeacherTest[];
  if (index >= 0) {
    updated = current.map(t => t.id === test.id ? test : t);
  } else {
    updated = [test, ...current];
  }
  localStorage.setItem(LOCAL_TESTS_KEY, JSON.stringify(updated));
  return test;
}

export { isSupabaseConfigured, rowToAccount };
