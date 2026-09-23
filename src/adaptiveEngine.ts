import type { 
  Question, 
  DiagnosticAnswer, 
  StudentProfile, 
  ConfidenceLevel, 
  SubjectId,
  StudentLevel,
  StudentGoal,
  ErrorMapRecord,
  SkillNode
} from './types';
import { SUBJECT_QUESTION_BANKS } from './mockData';

export interface DifficultyBounds {
  start: 1 | 2 | 3 | 4 | 5;
  min: 1 | 2 | 3 | 4 | 5;
  max: 1 | 2 | 3 | 4 | 5;
}

/**
 * Calculates starting difficulty and allowed difficulty range strictly based on studentLevel and studentGoal.
 */
export function getDifficultyRange(
  level: StudentLevel = 'intermediate',
  goal: StudentGoal = 'grades'
): DifficultyBounds {
  if (level === 'beginner') {
    return { start: 1, min: 1, max: 3 };
  }
  if (level === 'intermediate') {
    return { start: 3, min: 2, max: 4 };
  }
  // Advanced / Expert
  if (goal === 'olympiad') {
    return { start: 5, min: 4, max: 5 };
  }
  if (goal === 'exam') {
    return { start: 4, min: 4, max: 5 };
  }
  // Advanced + personal interest or grades or new skill
  return { start: 4, min: 3, max: 5 };
}

export interface AdaptiveUpdateResult {
  updatedProfile: StudentProfile;
  nextDifficulty: 1 | 2 | 3 | 4 | 5;
  nextQuestion: Question;
  confidenceScoreDelta: number;
  detectedMisconception?: string;
  errorMapRecord?: ErrorMapRecord;
  adaptationReason: string;
}

/**
 * ErrorMap Adaptive Engine
 * Adapts questions based on accuracy, confidence level, and response time,
 * strictly bounded by studentLevel and studentGoal.
 */
export function processAdaptiveAnswer(
  currentProfile: StudentProfile,
  currentQuestion: Question,
  selectedOptionId: string,
  confidence: ConfidenceLevel,
  timeSpentSeconds: number,
  answeredQuestionIds: string[],
  subject: SubjectId,
  studentLevel: StudentLevel = 'intermediate',
  studentGoal: StudentGoal = 'grades'
): AdaptiveUpdateResult {
  const currentBank = SUBJECT_QUESTION_BANKS[subject] || [];
  if (currentBank.length === 0) {
    throw new Error(`No adaptive assessment is available for subject: ${subject}`);
  }

  const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
  const isCorrect = !!selectedOption?.isCorrect;
  
  // Ensure subject progress skills exist
  const existingSubjectSkills = currentProfile.subjectProgress?.[subject]?.skills || currentProfile.skills;
  const currentSkill: SkillNode = existingSubjectSkills[currentQuestion.skillId] || {
    id: currentQuestion.skillId,
    name: currentQuestion.skillId,
    description: '',
    score: 50,
    status: 'learning',
    misconceptions: []
  };

  const bounds = getDifficultyRange(studentLevel, studentGoal);

  let scoreDelta = 0;
  let adaptationReason = '';
  let detectedMisconception: string | undefined = undefined;
  let errorMapRecord: ErrorMapRecord | undefined = undefined;

  // 1. Core Accuracy + Confidence Calibration
  if (isCorrect) {
    if (confidence === 'confident') {
      scoreDelta = 20;
      adaptationReason = 'Mastery demonstrated with high confidence. Escalating challenge level.';
    } else if (confidence === 'not_sure') {
      scoreDelta = 10;
      adaptationReason = 'Correct answer with hesitation. Maintaining steady calibration.';
    } else { // guessed
      scoreDelta = 4;
      adaptationReason = 'Correct, but marked as a guess. Holding level to verify grounding.';
    }
  } else {
    detectedMisconception = selectedOption?.misconceptionNote || 'Systematic concept misconception detected';

    let classificationConfidence = 85;
    if (confidence === 'confident') {
      scoreDelta = -18;
      classificationConfidence = 94;
      adaptationReason = `High-confidence misconception identified: "${detectedMisconception}". Lowering difficulty within range to scaffold.`;
    } else if (confidence === 'not_sure') {
      scoreDelta = -10;
      classificationConfidence = 76;
      adaptationReason = 'Uncertainty confirmed on incorrect answer. Stepping down for remediation.';
    } else { // guessed
      scoreDelta = -6;
      classificationConfidence = 55;
      adaptationReason = 'Guess failed. Pivoting to foundational question in allowed range.';
    }

    errorMapRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      subject,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      selectedOptionText: selectedOption?.text || '',
      misconception: detectedMisconception,
      explanation: currentQuestion.explanation,
      classificationConfidence,
      clarificationQuestion: currentQuestion.clarificationQuestion || 'Did you apply a different rule when evaluating this problem?',
      hint: currentQuestion.hintSteps?.[0] || 'Focus on the governing principle before calculating.',
      verificationTask: currentQuestion.verificationTask || 'Try applying the verified formula to a simple benchmark example.',
      status: 'confirmed',
      timestamp: new Date().toISOString()
    };
  }

  // 2. Response Time Speed Factor
  if (timeSpentSeconds > 35) {
    scoreDelta = scoreDelta > 0 ? Math.round(scoreDelta * 0.8) : scoreDelta - 2;
  } else if (timeSpentSeconds < 8 && isCorrect && confidence === 'confident') {
    scoreDelta += 3;
  }

  // Calculate new skill score [0, 100]
  const newSkillScore = Math.max(5, Math.min(100, currentSkill.score + scoreDelta));
  let newStatus: 'mastered' | 'learning' | 'gap' | 'untested' = 'learning';
  if (newSkillScore >= 80) newStatus = 'mastered';
  else if (newSkillScore < 50 || (detectedMisconception && !isCorrect)) newStatus = 'gap';

  const updatedMisconceptions = [...currentSkill.misconceptions];
  if (detectedMisconception && !updatedMisconceptions.includes(detectedMisconception)) {
    updatedMisconceptions.push(detectedMisconception);
  }

  const updatedSkills = {
    ...existingSubjectSkills,
    [currentQuestion.skillId]: {
      ...currentSkill,
      score: newSkillScore,
      status: newStatus,
      misconceptions: updatedMisconceptions
    }
  };

  // Recalculate subject mastery average
  const allScores = Object.values(updatedSkills).map(s => s.score);
  const overallMastery = Math.round(allScores.reduce((a, b) => a + b, 0) / Math.max(1, allScores.length));

  // 3. Compute Next Difficulty Level strictly respecting bounds:
  // - correct + confident -> harder
  // - correct + not sure -> same level
  // - correct + guessed -> same or easier
  // - wrong + confident -> easier and record misconception
  // - wrong + not sure -> one level easier
  // - wrong + guessed -> foundational check
  let nextDiffNum: number = currentQuestion.difficulty;
  if (isCorrect) {
    if (confidence === 'confident') {
      nextDiffNum = currentQuestion.difficulty + 1;
    } else if (confidence === 'not_sure') {
      nextDiffNum = currentQuestion.difficulty;
    } else { // guessed
      nextDiffNum = currentQuestion.difficulty;
    }
  } else {
    if (confidence === 'confident') {
      nextDiffNum = currentQuestion.difficulty - 1;
    } else if (confidence === 'not_sure') {
      nextDiffNum = currentQuestion.difficulty - 1;
    } else { // guessed
      nextDiffNum = bounds.min;
    }
  }

  // Clamp within the student's allowed adaptive range
  const nextDifficulty = Math.max(bounds.min, Math.min(bounds.max, nextDiffNum)) as 1 | 2 | 3 | 4 | 5;

  // 4. Find next question:
  // Never repeat an answered question during the same test
  const remainingQuestions = currentBank.filter(
    q => !answeredQuestionIds.includes(q.id) && q.id !== currentQuestion.id
  );

  let nextQuestion = remainingQuestions.find(q => q.difficulty === nextDifficulty);
  if (!nextQuestion) {
    // Pick closest question within allowed bounds
    const inBoundsRemaining = remainingQuestions.filter(q => q.difficulty >= bounds.min && q.difficulty <= bounds.max);
    const candidates = inBoundsRemaining.length > 0 ? inBoundsRemaining : remainingQuestions;
    nextQuestion = [...candidates].sort((a, b) => 
      Math.abs(a.difficulty - nextDifficulty) - Math.abs(b.difficulty - nextDifficulty)
    )[0];
  }

  // If still none, fallback safely to any remaining or first question in bank
  if (!nextQuestion) {
    nextQuestion = currentBank[0];
  }

  // Record Diagnostic Answer
  const recordedAnswer: DiagnosticAnswer = {
    questionId: currentQuestion.id,
    skillId: currentQuestion.skillId,
    selectedOptionId,
    isCorrect,
    confidence,
    timeSpentSeconds,
    difficulty: currentQuestion.difficulty,
    misconceptionDetected: detectedMisconception
  };

  const existingSubjHistory = currentProfile.subjectProgress?.[subject]?.diagnosticHistory || [];
  const updatedSubjHistory = [...existingSubjHistory, recordedAnswer];

  const existingErrorMapHistory = currentProfile.subjectProgress?.[subject]?.errorMapHistory || [];
  const updatedErrorMapHistory = errorMapRecord 
    ? [errorMapRecord, ...existingErrorMapHistory]
    : existingErrorMapHistory;

  const isCompleted = updatedSubjHistory.length >= 5;
  const subjectStatus = isCompleted ? 'completed' : 'in_progress';

  // Estimate subject level from final performance
  let estimatedLevel: StudentLevel = studentLevel;
  if (isCompleted) {
    if (overallMastery >= 75) estimatedLevel = 'advanced';
    else if (overallMastery >= 45) estimatedLevel = 'intermediate';
    else estimatedLevel = 'beginner';
  }

  const gapSkills = Object.values(updatedSkills).filter(s => s.status === 'gap' || s.score < 55);
  const weakestSkill = gapSkills.sort((a, b) => a.score - b.score)[0] || Object.values(updatedSkills)[0];

  const updatedSubjectProgress = {
    ...(currentProfile.subjectProgress || {}),
    [subject]: {
      status: subjectStatus,
      overallMastery,
      estimatedLevel,
      diagnosticCompleted: isCompleted,
      skills: updatedSkills,
      diagnosticHistory: updatedSubjHistory,
      errorMapHistory: updatedErrorMapHistory,
      completedTestIds: currentProfile.subjectProgress?.[subject]?.completedTestIds || [],
      recommendedNextLesson: {
        skillId: weakestSkill.id,
        title: `Remediate & Master: ${weakestSkill.name}`,
        reason: weakestSkill.misconceptions.length > 0 
          ? `ErrorMap detected: "${weakestSkill.misconceptions[0]}". Tailored remediation recommended.`
          : `Current mastery is ${weakestSkill.score}%. Target practice will build fluency.`
      }
    }
  };

  const updatedProfile: StudentProfile = {
    ...currentProfile,
    overallMastery,
    activeSubject: subject,
    subjectProgress: updatedSubjectProgress,
    skills: updatedSkills,
    diagnosticHistory: [...currentProfile.diagnosticHistory, recordedAnswer]
  };

  return {
    updatedProfile,
    nextDifficulty,
    nextQuestion,
    confidenceScoreDelta: scoreDelta,
    detectedMisconception,
    errorMapRecord,
    adaptationReason
  };
}
