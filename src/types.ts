export type UserRole = 'student' | 'teacher';

export type ConfidenceLevel = 'guessed' | 'not_sure' | 'confident';

/** Math-specific skill IDs kept for backward compat with old localStorage profiles */
export type MathSkillCategory = 'algebra' | 'linear_eq' | 'quadratic' | 'fractions' | 'geometry';

/** Per-subject skill IDs. Math uses MathSkillCategory; other subjects use descriptive strings. */
export type SkillCategory = string;

export type SubjectId = 'math' | 'english' | 'programming' | 'physics' | 'chemistry' | 'biology' | 'history';

export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export type StudentGoal = 'grades' | 'exam' | 'olympiad' | 'new_skill' | 'interest';

export type TeacherAudience = 'school' | 'university' | 'adults' | 'professional';

export type TeacherGoal = 'create_lessons' | 'track_progress' | 'find_gaps' | 'prep_exams';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  // Student specific onboarding
  studentSubjects?: SubjectId[];
  studentLevel?: StudentLevel;
  studentGoal?: StudentGoal;
  // Teacher specific onboarding
  teacherSubjects?: SubjectId[];
  teacherAudience?: TeacherAudience;
  teacherGoal?: TeacherGoal;
}

export interface SkillNode {
  id: SkillCategory;
  name: string;
  description: string;
  score: number; // 0 to 100
  status: 'mastered' | 'learning' | 'gap' | 'untested';
  misconceptions: string[];
}

export interface Question {
  id: string;
  skillId: SkillCategory;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1: very easy, 5: hard
  text: string;
  latexFormula?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionNote?: string;
  }[];
  explanation: string;
  hintSteps?: string[];
  clarificationQuestion?: string;
  verificationTask?: string;
}

export interface DiagnosticAnswer {
  questionId: string;
  skillId: SkillCategory;
  selectedOptionId: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  timeSpentSeconds: number;
  difficulty: number;
  misconceptionDetected?: string;
}

export interface LearningExercise {
  id: string;
  skillId: SkillCategory;
  title: string;
  problemStatement: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  hints: [string, string, string];
  solutionWalkthrough: string;
}

export type DiagnosticStatus = 'untested' | 'in_progress' | 'completed';

export type MaterialType = 'text' | 'video' | 'pdf' | 'link';

export interface LearningMaterial {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  subject: SubjectId;
  topic: string;
  recommendedLevel: StudentLevel;
  recommendedGoal: StudentGoal;
  description: string;
  type: MaterialType;
  contentOrUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface TeacherTestQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionNote?: string;
  }[];
  explanation: string;
  hint: string;
  verificationTask: string;
}

export interface TeacherTest {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: SubjectId;
  topic: string;
  title: string;
  targetLevel: StudentLevel;
  targetGoal: StudentGoal;
  isAdaptive: boolean;
  durationMinutes: number;
  questions: TeacherTestQuestion[];
  status: 'draft' | 'published';
  createdAt: string;
}

export interface ErrorMapRecord {
  id: string;
  subject: SubjectId;
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  misconception: string;
  explanation: string;
  classificationConfidence: number; // e.g. 88%
  clarificationQuestion: string;
  recommendedMaterialId?: string;
  recommendedMaterialTitle?: string;
  hint: string;
  verificationTask: string;
  verificationSolution?: string;
  status: 'confirmed' | 'rejected' | 'uncertain';
  timestamp: string;
}

export interface SubjectProgress {
  status: DiagnosticStatus;
  overallMastery: number;
  estimatedLevel?: StudentLevel;
  diagnosticCompleted?: boolean;
  skills: Record<SkillCategory, SkillNode>;
  diagnosticHistory: DiagnosticAnswer[];
  errorMapHistory?: ErrorMapRecord[];
  completedTestIds?: string[];
  recommendedNextLesson?: {
    skillId: SkillCategory;
    title: string;
    reason: string;
  };
}

export interface StudentProfile {
  name: string;
  avatar: string;
  streakDays: number;
  currentGoal: string;
  overallMastery: number;
  activeSubject?: SubjectId;
  subjectProgress?: Partial<Record<SubjectId, SubjectProgress>>;
  /** Legacy flat skills map — kept for backward compat */
  skills: Record<SkillCategory, SkillNode>;
  diagnosticHistory: DiagnosticAnswer[];
  completedExerciseIds: string[];
  recommendedNextLesson: {
    skillId: SkillCategory;
    title: string;
    reason: string;
  };
}

export interface TeacherStudentSummary {
  id: string;
  name: string;
  avatar: string;
  overallScore: number;
  status: 'excelling' | 'on_track' | 'needs_attention';
  strugglingTopic: string;
  lastActive: string;
  detectedMisconceptionsCount: number;
  confidenceAccuracyGap: string;
}

export type LessonStatus = 'draft' | 'published';

export interface Lesson {
  id: string;
  teacherId: string;
  title: string;
  subject: SubjectId;
  studentLevel: StudentLevel;
  learningObjective: string;
  description: string;
  content: string;
  practicalTask: string;
  dueDate?: string;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

