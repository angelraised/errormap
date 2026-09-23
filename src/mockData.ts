import type { 
  Question, 
  LearningExercise, 
  StudentProfile, 
  TeacherStudentSummary, 
  SubjectId, 
  SubjectProgress, 
  SkillNode,
  LearningMaterial,
  TeacherTest
} from './types';

// ─── Legacy Math Skills (kept for backward compat with old localStorage) ─────
export const INITIAL_SKILLS: StudentProfile['skills'] = {
  algebra: {
    id: 'algebra',
    name: 'Algebraic Expressions',
    description: 'Simplifying and evaluating polynomial expressions and terms',
    score: 65,
    status: 'learning',
    misconceptions: []
  },
  linear_eq: {
    id: 'linear_eq',
    name: 'Linear Equations',
    description: 'Solving 1-step and 2-step linear equations and systems',
    score: 80,
    status: 'mastered',
    misconceptions: []
  },
  quadratic: {
    id: 'quadratic',
    name: 'Quadratic Functions',
    description: 'Factoring, roots, vertex form, and quadratic formula',
    score: 42,
    status: 'gap',
    misconceptions: ['Sign inversion during factoring', 'Square root ambiguity']
  },
  fractions: {
    id: 'fractions',
    name: 'Fractions & Rational Roots',
    description: 'Cross multiplication, common denominators, and division',
    score: 70,
    status: 'learning',
    misconceptions: []
  },
  geometry: {
    id: 'geometry',
    name: 'Coordinate Geometry & Slope',
    description: 'Cartesian plane, distance formula, and slope calculation',
    score: 55,
    status: 'learning',
    misconceptions: ['X/Y inversion in slope formula']
  }
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Alex Rivera',
  avatar: '',
  streakDays: 6,
  currentGoal: 'Master High-School Quadratic & Algebraic Foundations',
  overallMastery: 62,
  activeSubject: 'math',
  subjectProgress: {
    math: {
      status: 'completed',
      overallMastery: 62,
      skills: INITIAL_SKILLS,
      diagnosticHistory: []
    }
  },
  skills: INITIAL_SKILLS,
  diagnosticHistory: [],
  completedExerciseIds: [],
  recommendedNextLesson: {
    skillId: 'quadratic',
    title: 'De-mystifying Quadratic Factoring & Sign Rules',
    reason: 'Diagnostic detected a persistent sign flip error when factoring trinomials with negative constants.'
  }
};

/** Build a blank skills map for a given subject */
export function buildSubjectSkills(subject: SubjectId): Record<string, SkillNode> {
  const skillDefs: Record<SubjectId, { id: string; name: string; description: string }[]> = {
    math: [
      { id: 'algebra', name: 'Algebraic Expressions', description: 'Simplifying polynomials and expressions' },
      { id: 'linear_eq', name: 'Linear Equations', description: 'Solving linear equations and systems' },
      { id: 'quadratic', name: 'Quadratic Functions', description: 'Factoring, roots, and quadratic formula' },
      { id: 'fractions', name: 'Fractions & Rational Numbers', description: 'Operations with fractions' },
      { id: 'geometry', name: 'Coordinate Geometry', description: 'Distance, slope, and Cartesian plane' },
    ],
    english: [
      { id: 'vocabulary', name: 'Vocabulary & Lexicon', description: 'Word meanings, etymology, and contextual usage' },
      { id: 'grammar', name: 'Grammar & Syntax', description: 'Tenses, subject-verb agreement, and clause structure' },
      { id: 'reading', name: 'Reading Comprehension', description: 'Analyzing passages, subtext, and logical inference' },
      { id: 'writing', name: 'Writing & Rhetoric', description: 'Argumentation, thesis refinement, and coherence' },
      { id: 'usage', name: 'Stylistics & Devices', description: 'Nuanced meaning, rhetorical devices, and register' },
    ],
    programming: [
      { id: 'variables', name: 'Variables & Data Types', description: 'Memory representation, types, and scopes' },
      { id: 'control_flow', name: 'Control Flow & Logic', description: 'Branching, iterative loops, and conditions' },
      { id: 'functions', name: 'Functions & Recursion', description: 'Call stacks, pure functions, and recursive trees' },
      { id: 'data_structures', name: 'Data Structures', description: 'Lists, hash sets, maps, stacks, and trees' },
      { id: 'algorithms', name: 'Algorithms & Complexity', description: 'Graph traversal, dynamic programming, Big-O' },
    ],
    physics: [
      { id: 'kinematics', name: 'Kinematics & Motion', description: 'Displacement, velocity, acceleration vectors' },
      { id: 'forces', name: 'Dynamics & Newton Laws', description: 'Force diagrams, friction, and equilibrium' },
      { id: 'energy', name: 'Work, Energy & Momentum', description: 'Conservation laws and collisions' },
      { id: 'waves', name: 'Oscillations & Waves', description: 'Simple harmonic motion, optics, and interference' },
      { id: 'electromagnetism', name: 'Electromagnetism', description: 'Circuits, fields, and induction' },
    ],
    chemistry: [
      { id: 'atomic_structure', name: 'Atomic Structure', description: 'Orbitals, quantum numbers, electron configuration' },
      { id: 'bonding', name: 'Chemical Bonding', description: 'Covalent, ionic, polarity, and geometry' },
      { id: 'stoichiometry', name: 'Stoichiometry & Solutions', description: 'Mole calculations, molarity, and yields' },
      { id: 'reactions', name: 'Kinetics & Equilibrium', description: 'Le Chatelier principle and reaction rates' },
      { id: 'periodicity', name: 'Periodic Trends', description: 'Electronegativity and ionization energy' },
    ],
    biology: [
      { id: 'cell_biology', name: 'Cell Biology', description: 'Organelles, membrane transport, and respiration' },
      { id: 'genetics', name: 'Genetics & Molecular Bio', description: 'DNA replication, transcription, translation' },
      { id: 'evolution', name: 'Evolution & Adaptation', description: 'Natural selection, speciation, and phylogenetics' },
      { id: 'ecology', name: 'Ecology & Ecosystems', description: 'Biogeochemical cycles and population dynamics' },
      { id: 'physiology', name: 'Homeostasis & Organ Systems', description: 'Nervous, endocrine, and circulatory systems' },
    ],
    history: [
      { id: 'ancient_civilizations', name: 'Ancient Civilizations', description: 'Mesopotamia, Mediterranean, Indus Valley' },
      { id: 'medieval', name: 'Medieval Period', description: 'Feudal structures, trade routes, cultural exchange' },
      { id: 'early_modern', name: 'Early Modern Revolutions', description: 'Enlightenment, scientific revolution, statehood' },
      { id: 'modern', name: 'Modern Global Conflicts', description: 'World Wars, decolonization, and geopolitical treaties' },
      { id: 'historiography', name: 'Historical Source Analysis', description: 'Primary sources, bias, historiographical debate' },
    ],
  };

  const selectedDefs = skillDefs[subject];
  if (!selectedDefs) return {};

  return Object.fromEntries(
    selectedDefs.map(def => [
      def.id,
      { ...def, score: 0, status: 'untested' as const, misconceptions: [] }
    ])
  );
}

export function createFreshStudentProfile(name: string, subjects: SubjectId[] = []): StudentProfile {
  const firstSubj = subjects.length > 0 ? subjects[0] : undefined;
  const skills = firstSubj ? buildSubjectSkills(firstSubj) : {};

  const subjectProgress: Partial<Record<SubjectId, SubjectProgress>> = {};
  for (const s of subjects) {
    subjectProgress[s] = {
      status: 'untested',
      overallMastery: 0,
      skills: buildSubjectSkills(s),
      diagnosticHistory: [],
      errorMapHistory: [],
      completedTestIds: []
    };
  }

  return {
    name,
    avatar: '',
    streakDays: 0,
    currentGoal: 'Select a subject to begin learning',
    overallMastery: 0,
    activeSubject: firstSubj,
    subjectProgress,
    skills,
    diagnosticHistory: [],
    completedExerciseIds: [],
    recommendedNextLesson: {
      skillId: '',
      title: '',
      reason: ''
    }
  };
}

// ─── SUBJECT QUESTION BANKS ──────────────────────────────────────────────────
// Rules:
// • Multiple authentic questions per difficulty level (1 to 5)
// • Balanced correct option positions: distributed across A, B, C, and D
// • High-level questions (diff 4 & 5 / Olympiad) require non-trivial reasoning
// • Rich misconception notes for ErrorMap detection
// • Clarification questions and verification tasks included
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECT_QUESTION_BANKS: Record<SubjectId, Question[]> = {
  // ── ENGLISH ───────────────────────────────────────────────────────────────
  english: [
    {
      id: 'eng_d1_1',
      skillId: 'vocabulary',
      difficulty: 1,
      text: 'Which word is the closest synonym for "benevolent"?',
      options: [
        { id: 'e1a', text: 'Cruel and hostile', isCorrect: false, misconceptionNote: 'Selected antonym instead of synonym.' },
        { id: 'e1b', text: 'Kind and generous', isCorrect: true },
        { id: 'e1c', text: 'Melancholic and sad', isCorrect: false, misconceptionNote: 'Confused benevolent with bereaved or mournful.' },
        { id: 'e1d', text: 'Aggressive and warlike', isCorrect: false, misconceptionNote: 'Confused benevolent with belligerent.' },
      ],
      explanation: '"Benevolent" derives from Latin bene (well) + velle (to wish). It means showing kindness and goodwill.',
      clarificationQuestion: 'Did you accidentally look for the opposite of benevolent, or confuse the prefix with "belli-" (war)?',
      verificationTask: 'Identify which prefix means "bad/ill": (A) Bene- (B) Mal- (C) Pro- (D) Syn-.'
    },
    {
      id: 'eng_d1_2',
      skillId: 'grammar',
      difficulty: 1,
      text: 'Choose the sentence with the correct simple past tense form:',
      options: [
        { id: 'e1_2a', text: 'She went to the library yesterday.', isCorrect: true },
        { id: 'e1_2b', text: 'She goed to the library yesterday.', isCorrect: false, misconceptionNote: 'Overregularization of irregular verb "go".' },
        { id: 'e1_2c', text: 'She was go to the library yesterday.', isCorrect: false, misconceptionNote: 'Redundant auxiliary "was" before base verb.' },
        { id: 'e1_2d', text: 'She has went to the library yesterday.', isCorrect: false, misconceptionNote: 'Mixed present perfect with definite past adverbial "yesterday".' },
      ],
      explanation: '"Go" is an irregular verb whose simple past form is "went".',
      clarificationQuestion: 'Did you apply regular "-ed" inflection to an irregular verb, or misplace an auxiliary verb?',
      verificationTask: 'What is the past simple of "catch"? (A) catched (B) caught (C) catching (D) was caught.'
    },
    {
      id: 'eng_d2_1',
      skillId: 'grammar',
      difficulty: 2,
      text: 'Select the sentence with correct prepositional usage:',
      options: [
        { id: 'e2_1a', text: 'The conference begins at Monday in 9:00 AM.', isCorrect: false, misconceptionNote: 'Swapped "at" and "on" for days and specific clock times.' },
        { id: 'e2_1b', text: 'The conference begins in Monday on 9:00 AM.', isCorrect: false, misconceptionNote: 'Used "in" for days of the week.' },
        { id: 'e2_1c', text: 'The conference begins on Monday at 9:00 AM.', isCorrect: true },
        { id: 'e2_1d', text: 'The conference begins by Monday on 9:00 AM.', isCorrect: false, misconceptionNote: 'Misused deadline preposition "by" for scheduled events.' },
      ],
      explanation: 'Use "on" for specific days and dates, and "at" for specific clock times.',
      clarificationQuestion: 'Do you remember the standard rule for time prepositions: "at" for clock times, "on" for days, "in" for months/years?',
      verificationTask: 'Which is correct: "We met ___ July"? (A) at (B) on (C) in (D) by.'
    },
    {
      id: 'eng_d3_1',
      skillId: 'reading',
      difficulty: 3,
      text: 'Read: "Despite the torrential rain, she insisted on walking to the ceremony on foot." What grammatical function does "despite" perform here?',
      options: [
        { id: 'e3_1a', text: 'It indicates a direct causal relationship between the rain and her walking.', isCorrect: false, misconceptionNote: 'Confused concessive relationship with causal explanation.' },
        { id: 'e3_1b', text: 'It introduces a condition that must be fulfilled prior to the ceremony.', isCorrect: false, misconceptionNote: 'Confused concession with a conditional clause.' },
        { id: 'e3_1c', text: 'It marks a concession, showing an action taking place contrary to expectations.', isCorrect: true },
        { id: 'e3_1d', text: 'It establishes a chronological sequence between two separate events.', isCorrect: false, misconceptionNote: 'Interpreted preposition as temporal connector.' },
      ],
      explanation: '"Despite" is a preposition of concession, signaling that the main clause occurs notwithstanding the circumstance described.',
      clarificationQuestion: 'Did you think "despite" explained the reason for walking rather than contrasting with an obstacle?',
      verificationTask: 'Which word can replace "despite" with a noun phrase: (A) Although (B) In spite of (C) Because (D) Since.'
    },
    {
      id: 'eng_d3_2',
      skillId: 'reading',
      difficulty: 3,
      text: 'Read: "The author notes that while early electric vehicles were praised, their adoption stalled due to infrastructure limits." What is the primary implication?',
      options: [
        { id: 'e3_2a', text: 'Early consumers disliked electric cars for aesthetic reasons.', isCorrect: false, misconceptionNote: 'Unsubstantiated assumption not present in the text.' },
        { id: 'e3_2b', text: 'Technological merit alone was insufficient for market transition without supporting systems.', isCorrect: true },
        { id: 'e3_2c', text: 'Infrastructure limits completely prevented any further automobile development.', isCorrect: false, misconceptionNote: 'Overgeneralized the scope of the restriction.' },
        { id: 'e3_2d', text: 'Electric vehicles were inherently inferior to internal combustion engines.', isCorrect: false, misconceptionNote: 'Value judgment contradicting "praised".' },
      ],
      explanation: 'The contrast between positive perception ("praised") and poor adoption due to "infrastructure limits" implies that ecosystem support is vital.',
      clarificationQuestion: 'Did you infer personal preferences rather than focusing on the infrastructure dependency highlighted by the text?',
      verificationTask: 'True or False: A concessive clause ("while...") often qualifies the scope of the main claim.'
    },
    {
      id: 'eng_d4_1',
      skillId: 'grammar',
      difficulty: 4,
      text: 'Which sentence correctly utilizes formal conditional inversion without "if"?',
      options: [
        { id: 'e4_1a', text: 'Were he to receive the grant, he would expand his research team immediately.', isCorrect: true },
        { id: 'e4_1b', text: 'Had he received the grant, he would expand his research team immediately.', isCorrect: false, misconceptionNote: 'Tense mismatch between past perfect condition and present conditional consequence.' },
        { id: 'e4_1c', text: 'Should he received the grant, he will expand his research team.', isCorrect: false, misconceptionNote: 'Used past participle after modal auxiliary "should".' },
        { id: 'e4_1d', text: 'Was he to receive the grant, he would expand his research team.', isCorrect: false, misconceptionNote: 'Used indicative "was" instead of subjunctive "were" in formal inversion.' },
      ],
      explanation: '"Were he to receive" is the standard inverted second conditional structure expressing a hypothetical future event.',
      clarificationQuestion: 'Did you use indicative "was" or mix second and third conditional verb forms?',
      verificationTask: 'Invert: "If you should need assistance..." -> (A) Need you (B) Should you need (C) Were you needing.'
    },
    {
      id: 'eng_d4_2',
      skillId: 'writing',
      difficulty: 4,
      text: 'Evaluate the following thesis statements. Which one satisfies academic rigor by presenting an arguable, specific, and defensible claim?',
      options: [
        { id: 'e4_2a', text: 'Artificial intelligence is very interesting and will affect many careers.', isCorrect: false, misconceptionNote: 'Broad informational statement with no arguable stance.' },
        { id: 'e4_2b', text: 'Many people believe that artificial intelligence has both advantages and disadvantages.', isCorrect: false, misconceptionNote: 'Vague neutral summary that avoids taking a thesis position.' },
        { id: 'e4_2c', text: 'Because generative AI disproportionately automates entry-level cognitive tasks, universities must restructure degree requirements to emphasize audit and synthesis skills.', isCorrect: true },
        { id: 'e4_2d', text: 'Generative AI was created through decades of computational research by engineers.', isCorrect: false, misconceptionNote: 'Purely descriptive historical fact, not an arguable claim.' },
      ],
      explanation: 'Option C provides a causal rationale ("Because..."), identifies a specific mechanism, and offers a clear, debatable policy recommendation.',
      clarificationQuestion: 'Did you mistake a neutral summary of facts for a strong argumentative thesis statement?',
      verificationTask: 'What are the three essential components of a strong academic thesis?'
    },
    {
      id: 'eng_d5_1',
      skillId: 'usage',
      difficulty: 5,
      text: 'Analyze the rhetorical device in this excerpt: "He carried a strobe light and the responsibility for the lives of his men." What stylistic figure is employed?',
      options: [
        { id: 'e5_1a', text: 'Chiasmus (criss-cross inverted syntactic structure)', isCorrect: false, misconceptionNote: 'Confused conceptual coupling with symmetrical syntactic inversion.' },
        { id: 'e5_1b', text: 'Synecdoche (substituting a part for the whole)', isCorrect: false, misconceptionNote: 'No part-to-whole substitution occurs here.' },
        { id: 'e5_1c', text: 'Zeugma / Syllepsis (one governing verb applied to two objects in differing concrete and abstract senses)', isCorrect: true },
        { id: 'e5_1d', text: 'Litotes (understatement via negating the contrary)', isCorrect: false, misconceptionNote: 'No negation or double negative is utilized.' },
      ],
      explanation: 'The verb "carried" governs both a physical object ("strobe light") and an abstract burden ("responsibility") in distinct semantic senses—the textbook definition of zeugma.',
      clarificationQuestion: 'Did you recognize that "carried" is operating simultaneously in a literal and a figurative domain?',
      verificationTask: 'Identify the governing word in: "She broke his car and his heart." (A) broke (B) car (C) heart.'
    },
    {
      id: 'eng_d5_2',
      skillId: 'usage',
      difficulty: 5,
      text: 'In rigorous textual analysis, what logical flaw exists in the argument: "No published study has definitively proven that microplastics cause cardiovascular lesions in living human subjects; therefore, regulatory thresholds on airborne microplastics are baseless"?',
      options: [
        { id: 'e5_2a', text: 'Post hoc ergo propter hoc (faulty causal sequence attribution)', isCorrect: false, misconceptionNote: 'Argument is not asserting temporal succession as cause.' },
        { id: 'e5_2b', text: 'Argumentum ad ignorantiam (conflating absence of definitive evidence with evidence of absence)', isCorrect: true },
        { id: 'e5_2c', text: 'Affirming the consequent (formal deductive fallacy)', isCorrect: false, misconceptionNote: 'This is an informal epistemological fallacy rather than formal syllogistic inversion.' },
        { id: 'e5_2d', text: 'False dilemma (improperly restricting choices to two poles)', isCorrect: false, misconceptionNote: 'The crux is evidentiary absence rather than restricted binary choice.' },
      ],
      explanation: 'Asserting that lack of definitive proof entails safety or unjustified regulation is an appeal to ignorance (ad ignorantiam).',
      clarificationQuestion: 'Did you mistake an absence of epidemiological studies for proof of harmlessness?',
      verificationTask: 'Which principle states "absence of evidence is not evidence of absence"?'
    }
  ],

  // ── PROGRAMMING ────────────────────────────────────────────────────────────
  programming: [
    {
      id: 'prog_d1_1',
      skillId: 'variables',
      difficulty: 1,
      text: 'What is the output of the following Python snippet?\n\nx = 15\ny = 4\nprint(x % y)',
      options: [
        { id: 'p1_1a', text: '3.75', isCorrect: false, misconceptionNote: 'Used true division (/) instead of modulo (%) operator.' },
        { id: 'p1_1b', text: '3', isCorrect: true },
        { id: 'p1_1c', text: '4', isCorrect: false, misconceptionNote: 'Returned divisor or integer quotient.' },
        { id: 'p1_1d', text: '60', isCorrect: false, misconceptionNote: 'Multiplied x by y.' },
      ],
      explanation: 'The modulo operator % returns the remainder of integer division. 15 = 4 * 3 + 3, so 15 % 4 evaluates to 3.',
      clarificationQuestion: 'Did you think % calculates percentage or performs division instead of returning the integer remainder?',
      verificationTask: 'What is 19 % 5? (A) 3 (B) 4 (C) 3.8 (D) 0.'
    },
    {
      id: 'prog_d1_2',
      skillId: 'control_flow',
      difficulty: 1,
      text: 'Consider this conditional branch in Python:\n\nscore = 85\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"\nprint(grade)',
      options: [
        { id: 'p1_2a', text: '"A"', isCorrect: false, misconceptionNote: 'Evaluated condition without checking if 85 >= 90 is false.' },
        { id: 'p1_2b', text: '"B"', isCorrect: true },
        { id: 'p1_2c', text: '"C"', isCorrect: false, misconceptionNote: 'Skipped the matching elif branch.' },
        { id: 'p1_2d', text: 'SyntaxError', isCorrect: false, misconceptionNote: 'Believed elif requires additional parentheses.' },
      ],
      explanation: 'Since 85 >= 90 is False, execution moves to elif score >= 80, which is True (85 >= 80). grade is assigned "B".',
      clarificationQuestion: 'Did you track the execution order through if, then elif, in sequence?',
      verificationTask: 'If score = 92, which branch executes first? (A) if (B) elif (C) else.'
    },
    {
      id: 'prog_d2_1',
      skillId: 'control_flow',
      difficulty: 2,
      text: 'What will be printed by this loop?\n\ntotal = 0\nfor i in range(1, 5):\n    total += i\nprint(total)',
      options: [
        { id: 'p2_1a', text: '15', isCorrect: false, misconceptionNote: 'Inclusive upper bound assumption (included 5 in range(1,5)).' },
        { id: 'p2_1b', text: '10', isCorrect: true },
        { id: 'p2_1c', text: '4', isCorrect: false, misconceptionNote: 'Only printed the last value of i instead of accumulating.' },
        { id: 'p2_1d', text: '5', isCorrect: false, misconceptionNote: 'Off-by-one confusion.' },
      ],
      explanation: 'range(1, 5) generates [1, 2, 3, 4] (the upper bound 5 is exclusive). 1 + 2 + 3 + 4 = 10.',
      clarificationQuestion: 'Did you remember that Python range(start, stop) excludes the stop value?',
      verificationTask: 'How many iterations does range(2, 6) perform? (A) 3 (B) 4 (C) 5 (D) 6.'
    },
    {
      id: 'prog_d3_1',
      skillId: 'functions',
      difficulty: 3,
      text: 'What does this recursive function compute for compute(4)?\n\ndef compute(n):\n    if n <= 1:\n        return 1\n    return n * compute(n - 1)',
      options: [
        { id: 'p3_1a', text: '10', isCorrect: false, misconceptionNote: 'Summed numbers instead of multiplying (factorial vs triangular sum).' },
        { id: 'p3_1b', text: '16', isCorrect: false, misconceptionNote: 'Raised n to power of 2.' },
        { id: 'p3_1c', text: '24', isCorrect: true },
        { id: 'p3_1d', text: '12', isCorrect: false, misconceptionNote: 'Stopped recursion one step too early.' },
      ],
      explanation: 'compute(4) = 4 * compute(3) = 4 * (3 * compute(2)) = 4 * 3 * (2 * 1) = 24. This calculates 4! (factorial).',
      clarificationQuestion: 'Did you trace the call stack down to the base case n <= 1?',
      verificationTask: 'What is compute(3)? (A) 6 (B) 9 (C) 3 (D) 12.'
    },
    {
      id: 'prog_d3_2',
      skillId: 'data_structures',
      difficulty: 3,
      text: 'What is the value of `result`?\n\nnums = [1, 2, 3, 4, 5, 6]\nresult = [x * 2 for x in nums if x % 2 != 0]',
      options: [
        { id: 'p3_2a', text: '[4, 8, 12]', isCorrect: false, misconceptionNote: 'Filtered for even numbers (x % 2 == 0) instead of odd.' },
        { id: 'p3_2b', text: '[2, 6, 10]', isCorrect: true },
        { id: 'p3_2c', text: '[1, 3, 5]', isCorrect: false, misconceptionNote: 'Filtered correctly but forgot to apply expression x * 2.' },
        { id: 'p3_2d', text: '[2, 4, 6, 8, 10, 12]', isCorrect: false, misconceptionNote: 'Ignored the if condition.' },
      ],
      explanation: 'The condition x % 2 != 0 selects odd numbers: [1, 3, 5]. Multiplying each by 2 yields [2, 6, 10].',
      clarificationQuestion: 'Did you invert the predicate `!= 0` or omit the transformation expression?',
      verificationTask: 'Evaluate: [x for x in [10, 15, 20] if x > 12].'
    },
    {
      id: 'prog_d4_1',
      skillId: 'functions',
      difficulty: 4,
      text: 'Trace the output of this Python code with default mutable arguments:\n\ndef append_to(val, target=[]):\n    target.append(val)\n    return target\n\nlist1 = append_to(10)\nlist2 = append_to(20, [])\nlist3 = append_to(30)\nprint(list1)',
      options: [
        { id: 'p4_1a', text: '[10]', isCorrect: false, misconceptionNote: 'Assumed default argument is recreated afresh on each call.' },
        { id: 'p4_1b', text: '[10, 20, 30]', isCorrect: false, misconceptionNote: 'Believed list2 modified the shared default list.' },
        { id: 'p4_1c', text: '[10, 30]', isCorrect: true },
        { id: 'p4_1d', text: '[30]', isCorrect: false, misconceptionNote: 'Thought default list was overwritten rather than appended to.' },
      ],
      explanation: 'In Python, default parameter objects are evaluated once at function definition time. list1 and list3 share the same default list instance, while list2 uses an explicitly passed new list []. Thus, list1 contains [10, 30].',
      clarificationQuestion: 'Did you know that default arguments with mutable types persist across function calls in Python?',
      verificationTask: 'What is the standard idiom to prevent mutable default argument sharing? (A) target=None (B) target=list() (C) target=copy().'
    },
    {
      id: 'prog_d4_2',
      skillId: 'data_structures',
      difficulty: 4,
      text: 'What does this function return for the input s = "anagram", t = "nagaram"?\n\ndef is_valid(s, t):\n    if len(s) != len(t): return False\n    counts = {}\n    for ch in s: counts[ch] = counts.get(ch, 0) + 1\n    for ch in t:\n        if ch not in counts or counts[ch] == 0: return False\n        counts[ch] -= 1\n    return True',
      options: [
        { id: 'p4_2a', text: 'False, because dictionary keys are compared in order', isCorrect: false, misconceptionNote: 'Believed dictionary key order affects frequency checks.' },
        { id: 'p4_2b', text: 'True, with O(N) time complexity and O(K) auxiliary space where K is alphabet size', isCorrect: true },
        { id: 'p4_2c', text: 'True, but it requires O(N log N) time complexity due to hash collisions', isCorrect: false, misconceptionNote: 'Confused hash table average O(1) lookups with sorting.' },
        { id: 'p4_2d', text: 'RuntimeError due to KeyError in the second loop', isCorrect: false, misconceptionNote: 'Missed the safety check `if ch not in counts or counts[ch] == 0`.' },
      ],
      explanation: 'The function counts character frequencies in O(N) time and compares them, confirming that "anagram" and "nagaram" are valid anagrams.',
      clarificationQuestion: 'Did you think hash table lookups take O(N) or cause errors when guarded by `in` checks?',
      verificationTask: 'What would is_valid("rat", "car") return? (A) True (B) False.'
    },
    {
      id: 'prog_d5_1',
      skillId: 'algorithms',
      difficulty: 5,
      text: 'Consider the classic 0/1 Knapsack dynamic programming recurrence:\n`dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + value[i])`\nIf we optimize the space from 2D `dp[N+1][W+1]` to a 1D array `dp[W+1]`, how must the inner loop over capacity `w` be traversed, and why?',
      options: [
        { id: 'p5_1a', text: 'From 0 up to W, because smaller subproblems must be updated first for the current item.', isCorrect: false, misconceptionNote: 'Forward iteration allows an item to be selected multiple times, turning it into Unbounded Knapsack.' },
        { id: 'p5_1b', text: 'From W down to weight[i], because updating backwards ensures values from the previous item iteration dp[i-1] are not overwritten before use.', isCorrect: true },
        { id: 'p5_1c', text: 'In arbitrary order using random shuffling, because state transitions are commutative.', isCorrect: false, misconceptionNote: 'Dynamic programming requires topological ordering of state dependencies.' },
        { id: 'p5_1d', text: 'It cannot be compressed to 1D without increasing time complexity to O(2^N).', isCorrect: false, misconceptionNote: '1D space optimization retains exact O(N*W) time complexity.' },
      ],
      explanation: 'Iterating backward from W down to weight[i] ensures that when calculating dp[w], the value dp[w - weight[i]] still represents the state from the previous item (dp[i-1]), preventing multiple inclusions of the same item.',
      clarificationQuestion: 'Did you realize that forward iteration in 1D knapsack causes the unbounded/infinite item bug?',
      verificationTask: 'In 1D unbounded knapsack where items can be reused infinitely, which direction is the inner loop? (A) Forward (B) Backward.'
    },
    {
      id: 'prog_d5_2',
      skillId: 'algorithms',
      difficulty: 5,
      text: 'Given a directed graph G with N vertices and M edges, which may contain negative-weight edges but NO negative cycles. Which algorithm correctly finds shortest paths from a single source in O(N * M) time?',
      options: [
        { id: 'p5_2a', text: "Dijkstra's Algorithm with a Min-Heap", isCorrect: false, misconceptionNote: "Dijkstra's algorithm assumes non-negative edge weights and fails with negative edges." },
        { id: 'p5_2b', text: 'Floyd-Warshall Algorithm', isCorrect: false, misconceptionNote: 'Floyd-Warshall is an all-pairs algorithm running in O(N^3) time.' },
        { id: 'p5_2c', text: 'Bellman-Ford Algorithm', isCorrect: true },
        { id: 'p5_2d', text: 'Breadth-First Search (BFS)', isCorrect: false, misconceptionNote: 'BFS only works on unweighted graphs (or graphs with uniform edge weights).' },
      ],
      explanation: 'Bellman-Ford relaxes all M edges N-1 times, correctly handling negative weights in O(N * M) time and capable of detecting negative cycles on an N-th iteration.',
      clarificationQuestion: 'Did you remember that Dijkstra fails when negative edges can retroactively reduce path weights of already finalized vertices?',
      verificationTask: 'What happens if a negative cycle is present in Bellman-Ford? (A) It loops forever (B) Distance decreases on iteration N (C) It throws Exception.'
    },
    {
      id: 'prog_d5_3',
      skillId: 'algorithms',
      difficulty: 5,
      text: 'What is the tightest worst-case time complexity of finding the Median of an unsorted array of N elements using the Median-of-Medians (BFPRT) algorithm?',
      options: [
        { id: 'p5_3a', text: 'O(N log N)', isCorrect: false, misconceptionNote: 'O(N log N) is standard comparison sorting; BFPRT is strictly faster.' },
        { id: 'p5_3b', text: 'O(N)', isCorrect: true },
        { id: 'p5_3c', text: 'O(log N)', isCorrect: false, misconceptionNote: 'Sublinear median selection is impossible on unsorted input.' },
        { id: 'p5_3d', text: 'O(N²)', isCorrect: false, misconceptionNote: 'O(N^2) is the worst-case of naive Quickselect with poor pivots, which BFPRT prevents.' },
      ],
      explanation: 'Median-of-Medians guarantees at least a 30/70 pivot split, yielding the recurrence T(N) <= T(N/5) + T(7N/10) + O(N). Since 1/5 + 7/10 = 9/10 < 1, T(N) = O(N) deterministic worst-case.',
      clarificationQuestion: 'Did you confuse the deterministic linear worst-case of BFPRT with naive Quickselect?',
      verificationTask: 'What group size is traditionally partitioned in BFPRT? (A) 3 (B) 5 (C) 10.'
    }
  ],

  // ── MATHEMATICS ────────────────────────────────────────────────────────────
  math: [
    {
      id: 'math_d1_1',
      skillId: 'linear_eq',
      difficulty: 1,
      text: 'Solve for x:  3x + 9 = 24',
      options: [
        { id: 'm1a', text: 'x = 11', isCorrect: false, misconceptionNote: 'Added 9 instead of subtracting from both sides.' },
        { id: 'm1b', text: 'x = 3', isCorrect: false, misconceptionNote: 'Divided 24 by 3 before subtracting 9.' },
        { id: 'm1c', text: 'x = 5', isCorrect: true },
        { id: 'm1d', text: 'x = 8', isCorrect: false, misconceptionNote: 'Subtracted 9 but forgot to divide by coefficient 3.' },
      ],
      explanation: 'Subtract 9 from both sides: 3x = 15. Divide by 3: x = 5.',
      clarificationQuestion: 'Did you remember to perform inverse operations: subtract constant first, then divide by coefficient?',
      verificationTask: 'Solve for y: 2y + 4 = 16. (A) 6 (B) 10 (C) 8.'
    },
    {
      id: 'math_d2_1',
      skillId: 'fractions',
      difficulty: 2,
      text: 'Simplify:  (3/4) + (1/6)',
      options: [
        { id: 'm2a', text: '4/10', isCorrect: false, misconceptionNote: 'Added numerators and denominators separately (3+1)/(4+6).' },
        { id: 'm2b', text: '11/12', isCorrect: true },
        { id: 'm2c', text: '2/5', isCorrect: false, misconceptionNote: 'Averaged fractions incorrectly.' },
        { id: 'm2d', text: '5/8', isCorrect: false, misconceptionNote: 'Used incorrect common denominator.' },
      ],
      explanation: 'Least Common Denominator is 12. 3/4 = 9/12, 1/6 = 2/12. 9/12 + 2/12 = 11/12.',
      clarificationQuestion: 'Did you find a common denominator before adding fraction numerators?',
      verificationTask: 'Compute: 1/3 + 1/4. (A) 2/7 (B) 7/12 (C) 5/12.'
    },
    {
      id: 'math_d3_1',
      skillId: 'algebra',
      difficulty: 3,
      text: 'Expand and simplify:  (x + 4)(x − 3)',
      options: [
        { id: 'm3a', text: 'x² + x − 12', isCorrect: true },
        { id: 'm3b', text: 'x² − x − 12', isCorrect: false, misconceptionNote: 'Sign error on the linear term (4 - 3 = +1, not -1).' },
        { id: 'm3c', text: 'x² + x + 12', isCorrect: false, misconceptionNote: 'Sign error on constant term (+4 * -3 = -12).' },
        { id: 'm3d', text: 'x² − 12', isCorrect: false, misconceptionNote: 'Omitted middle cross terms completely.' },
      ],
      explanation: 'Using FOIL: x*x - 3x + 4x - 12 = x² + x - 12.',
      clarificationQuestion: 'Did you calculate the outer and inner product sum correctly: 4x + (-3x) = +1x?',
      verificationTask: 'Expand (x + 2)(x - 5). (A) x² - 3x - 10 (B) x² + 3x - 10.'
    },
    {
      id: 'math_d4_1',
      skillId: 'quadratic',
      difficulty: 4,
      text: 'Find all real solutions to:  2x² − 5x − 3 = 0',
      options: [
        { id: 'm4a', text: 'x = 3 and x = 1/2', isCorrect: false, misconceptionNote: 'Sign error in root formula.' },
        { id: 'm4b', text: 'x = −3 and x = −1/2', isCorrect: false, misconceptionNote: 'Inverted both roots.' },
        { id: 'm4c', text: 'x = 3 and x = −1/2', isCorrect: true },
        { id: 'm4d', text: 'x = 1 and x = −3/2', isCorrect: false, misconceptionNote: 'Incorrect factoring decomposition.' },
      ],
      explanation: 'Factoring: (2x + 1)(x - 3) = 0 -> 2x + 1 = 0 => x = -1/2, or x - 3 = 0 => x = 3.',
      clarificationQuestion: 'Did you check your factors by multiplying back: (2x+1)(x-3) = 2x² - 5x - 3?',
      verificationTask: 'What are the roots of x² - 4 = 0? (A) 2, -2 (B) 4, -4.'
    },
    {
      id: 'math_d5_1',
      skillId: 'geometry',
      difficulty: 5,
      text: 'Line L passes through point P(2, 5) and is perpendicular to the line 3x + y = 7. What is the equation of line L in slope-intercept form?',
      options: [
        { id: 'm5a', text: 'y = −3x + 11', isCorrect: false, misconceptionNote: 'Used original slope instead of negative reciprocal.' },
        { id: 'm5b', text: 'y = (1/3)x + 13/3', isCorrect: true },
        { id: 'm5c', text: 'y = 3x − 1', isCorrect: false, misconceptionNote: 'Used reciprocal without changing the sign.' },
        { id: 'm5d', text: 'y = (−1/3)x + 17/3', isCorrect: false, misconceptionNote: 'Applied negative sign to an already negative slope.' },
      ],
      explanation: 'The given line is y = -3x + 7 (slope m1 = -3). Perpendicular slope m2 = -1/(-3) = 1/3. Equation: y - 5 = (1/3)(x - 2) => y = (1/3)x - 2/3 + 15/3 = (1/3)x + 13/3.',
      clarificationQuestion: 'Did you remember that perpendicular lines satisfy m1 * m2 = -1, so the slope of L is +1/3?',
      verificationTask: 'What is the perpendicular slope to a line with slope -2? (A) 2 (B) 1/2 (C) -1/2.'
    }
  ],

  // ── PHYSICS ────────────────────────────────────────────────────────────────
  physics: [
    {
      id: 'phys_d1_1',
      skillId: 'kinematics',
      difficulty: 1,
      text: 'What is the SI unit of force?',
      options: [
        { id: 'ph1a', text: 'Joule (J)', isCorrect: false, misconceptionNote: 'Joule is the unit of work/energy.' },
        { id: 'ph1b', text: 'Watt (W)', isCorrect: false, misconceptionNote: 'Watt is the unit of power.' },
        { id: 'ph1c', text: 'Pascal (Pa)', isCorrect: false, misconceptionNote: 'Pascal is the unit of pressure.' },
        { id: 'ph1d', text: 'Newton (N)', isCorrect: true },
      ],
      explanation: 'Force equals mass times acceleration (F = ma). The SI unit is kg·m/s², named the Newton (N).',
      clarificationQuestion: 'Did you confuse the units of energy (Joule) or power (Watt) with force?',
      verificationTask: '1 Newton is equivalent to: (A) 1 kg·m/s² (B) 1 kg·m²/s² (C) 1 kg/s.'
    },
    {
      id: 'phys_d2_1',
      skillId: 'kinematics',
      difficulty: 2,
      text: 'A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?',
      options: [
        { id: 'ph2a', text: '100 m/s²', isCorrect: false, misconceptionNote: 'Multiplied velocity by time instead of dividing.' },
        { id: 'ph2b', text: '4 m/s²', isCorrect: true },
        { id: 'ph2c', text: '2 m/s²', isCorrect: false, misconceptionNote: 'Arithmetic error in division.' },
        { id: 'ph2d', text: '15 m/s²', isCorrect: false, misconceptionNote: 'Subtracted time from velocity.' },
      ],
      explanation: 'Acceleration a = (v_final - v_initial) / t = (20 - 0) / 5 = 4 m/s².',
      clarificationQuestion: 'Did you apply the formula a = Δv / Δt?',
      verificationTask: 'If speed increases by 15 m/s over 3 seconds, what is a? (A) 5 m/s² (B) 45 m/s².'
    },
    {
      id: 'phys_d3_1',
      skillId: 'forces',
      difficulty: 3,
      text: 'A 5 kg block rests on a horizontal frictionless surface. A horizontal force of 20 N is applied. What is the acceleration of the block?',
      options: [
        { id: 'ph3a', text: '100 m/s²', isCorrect: false, misconceptionNote: 'Multiplied mass by force.' },
        { id: 'ph3b', text: '4 m/s²', isCorrect: true },
        { id: 'ph3c', text: '0.25 m/s²', isCorrect: false, misconceptionNote: 'Divided mass by force instead of force by mass.' },
        { id: 'ph3d', text: '15 m/s²', isCorrect: false, misconceptionNote: 'Subtracted mass from force.' },
      ],
      explanation: 'According to Newton\'s Second Law, F = ma => a = F/m = 20 N / 5 kg = 4 m/s².',
      clarificationQuestion: 'Did you set up a = F / m correctly?',
      verificationTask: 'What force is needed to accelerate 2 kg at 6 m/s²? (A) 12 N (B) 3 N.'
    },
    {
      id: 'phys_d4_1',
      skillId: 'energy',
      difficulty: 4,
      text: 'A roller coaster car of mass m starts from rest at height H at the top of a frictionless loop-the-loop of radius R. What is the minimum height H required so that the car maintains contact with the track at the very top of the loop?',
      options: [
        { id: 'ph4a', text: 'H = 2.0 R', isCorrect: false, misconceptionNote: 'Equated height directly to loop height without accounting for required centripetal speed.' },
        { id: 'ph4b', text: 'H = 2.5 R', isCorrect: true },
        { id: 'ph4c', text: 'H = 3.0 R', isCorrect: false, misconceptionNote: 'Overestimated centrifugal margin.' },
        { id: 'ph4d', text: 'H = 1.5 R', isCorrect: false, misconceptionNote: 'Car would fall off track before reaching apex.' },
      ],
      explanation: 'At the apex, critical speed requires mg = m v² / R => v² = g R. By conservation of energy from height H: mgH = mg(2R) + (1/2)m v² = 2mgR + (1/2)mgR = 2.5 mgR => H = 2.5 R.',
      clarificationQuestion: 'Did you account for both potential energy at height 2R and the kinetic energy needed for centripetal acceleration?',
      verificationTask: 'What is the critical speed at the top of a loop of radius R? (A) √(gR) (B) gR (C) 2gR.'
    },
    {
      id: 'phys_d5_1',
      skillId: 'energy',
      difficulty: 5,
      text: 'A uniform solid cylinder of mass M and radius R rolls without slipping down an incline of angle θ. What is its linear acceleration down the incline?',
      options: [
        { id: 'ph5a', text: 'g sin(θ)', isCorrect: false, misconceptionNote: 'Assumed frictionless sliding without rotational inertia.' },
        { id: 'ph5b', text: '(1/2) g sin(θ)', isCorrect: false, misconceptionNote: 'Applied incorrect moment of inertia ratio.' },
        { id: 'ph5c', text: '(2/3) g sin(θ)', isCorrect: true },
        { id: 'ph5d', text: '(3/4) g sin(θ)', isCorrect: false, misconceptionNote: 'Used spherical moment of inertia formula.' },
      ],
      explanation: 'For a solid cylinder, moment of inertia I = (1/2) M R². Linear acceleration a = g sin(θ) / (1 + I/(MR²)) = g sin(θ) / (1 + 1/2) = (2/3) g sin(θ).',
      clarificationQuestion: 'Did you combine Newton\'s second law for translation (Mg sin θ - f = Ma) and rotation (f R = I α with α = a/R)?',
      verificationTask: 'What is the moment of inertia of a solid cylinder? (A) (1/2)MR² (B) (2/5)MR² (C) MR².'
    }
  ],

  // ── CHEMISTRY ──────────────────────────────────────────────────────────────
  chemistry: [
    {
      id: 'chem_d1_1',
      skillId: 'atomic_structure',
      difficulty: 1,
      text: 'What subatomic particles are located inside the nucleus of an atom?',
      options: [
        { id: 'ch1a', text: 'Electrons and protons', isCorrect: false, misconceptionNote: 'Electrons orbit the nucleus; they are not in the core.' },
        { id: 'ch1b', text: 'Protons and neutrons', isCorrect: true },
        { id: 'ch1c', text: 'Neutrons and electrons', isCorrect: false, misconceptionNote: 'Electrons are extranuclear.' },
        { id: 'ch1d', text: 'Only electrons', isCorrect: false, misconceptionNote: 'Fundamental error in atomic structure.' },
      ],
      explanation: 'The atomic nucleus consists of nucleons: positively charged protons and uncharged neutrons.',
      clarificationQuestion: 'Did you distinguish between nucleons inside the nucleus and electrons in electron shells?',
      verificationTask: 'Which particle carries a negative charge? (A) Proton (B) Neutron (C) Electron.'
    },
    {
      id: 'chem_d2_1',
      skillId: 'bonding',
      difficulty: 2,
      text: 'What type of chemical bond is formed when electrons are transferred from a metal atom to a non-metal atom?',
      options: [
        { id: 'ch2a', text: 'Covalent bond', isCorrect: false, misconceptionNote: 'Covalent bonds involve electron sharing, not complete transfer.' },
        { id: 'ch2b', text: 'Hydrogen bond', isCorrect: false, misconceptionNote: 'Hydrogen bonds are intermolecular dipole attractions.' },
        { id: 'ch2c', text: 'Ionic bond', isCorrect: true },
        { id: 'ch2d', text: 'Metallic bond', isCorrect: false, misconceptionNote: 'Metallic bonds consist of a delocalized sea of electrons among metals.' },
      ],
      explanation: 'Electron transfer creates oppositely charged ions that form an electrostatic ionic bond.',
      clarificationQuestion: 'Do you remember: transfer = ionic, sharing = covalent?',
      verificationTask: 'NaCl is an example of what type of bond? (A) Ionic (B) Covalent.'
    },
    {
      id: 'chem_d3_1',
      skillId: 'stoichiometry',
      difficulty: 3,
      text: 'In the reaction:  2H₂ + O₂ → 2H₂O\nHow many moles of water are produced by completely reacting 4.0 moles of H₂ with excess O₂?',
      options: [
        { id: 'ch3a', text: '2.0 moles', isCorrect: false, misconceptionNote: 'Divided moles by coefficient.' },
        { id: 'ch3b', text: '4.0 moles', isCorrect: true },
        { id: 'ch3c', text: '8.0 moles', isCorrect: false, misconceptionNote: 'Multiplied instead of using mole ratio.' },
        { id: 'ch3d', text: '1.0 mole', isCorrect: false, misconceptionNote: 'Used oxygen stoichiometric ratio.' },
      ],
      explanation: 'The molar ratio between H₂ and H₂O is 2:2 (or 1:1). Therefore, 4.0 moles of H₂ yield 4.0 moles of H₂O.',
      clarificationQuestion: 'Did you check the stoichiometric coefficients: 2 moles of H₂ produce 2 moles of H₂O?',
      verificationTask: 'How many moles of O₂ are needed for 4 moles of H₂? (A) 2 (B) 4 (C) 1.'
    },
    {
      id: 'chem_d4_1',
      skillId: 'reactions',
      difficulty: 4,
      text: 'For the exothermic equilibrium:  N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  (ΔH = −92 kJ/mol)\nAccording to Le Chatelier\'s principle, which change will shift the equilibrium position to the right (toward products)?',
      options: [
        { id: 'ch4a', text: 'Increasing temperature', isCorrect: false, misconceptionNote: 'Exothermic reactions shift left toward reactants when heated.' },
        { id: 'ch4b', text: 'Increasing total pressure by reducing volume', isCorrect: true },
        { id: 'ch4c', text: 'Removing H₂ as it forms', isCorrect: false, misconceptionNote: 'Removing reactant shifts equilibrium left.' },
        { id: 'ch4d', text: 'Adding an inert gas at constant volume', isCorrect: false, misconceptionNote: 'Inert gas at constant volume does not change partial pressures.' },
      ],
      explanation: 'Reactant side has 4 moles of gas (1 N₂ + 3 H₂); product side has 2 moles of gas. Increasing pressure shifts equilibrium toward fewer gas moles (the right).',
      clarificationQuestion: 'Did you compare total gas moles on each side (4 vs 2)?',
      verificationTask: 'Does increasing pressure favor the side with MORE or FEWER moles of gas?'
    },
    {
      id: 'chem_d5_1',
      skillId: 'periodicity',
      difficulty: 5,
      text: 'Which element has the highest second ionization energy (IE₂)?',
      options: [
        { id: 'ch5a', text: 'Magnesium (Mg, Z = 12)', isCorrect: false, misconceptionNote: 'Mg loses two electrons readily to reach noble gas core.' },
        { id: 'ch5b', text: 'Sodium (Na, Z = 11)', isCorrect: true },
        { id: 'ch5c', text: 'Aluminum (Al, Z = 13)', isCorrect: false, misconceptionNote: 'Al loses second electron from 3s valence orbital.' },
        { id: 'ch5d', text: 'Silicon (Si, Z = 14)', isCorrect: false, misconceptionNote: 'Si retains outer valence electrons for IE₂.' },
      ],
      explanation: 'Sodium (Na: [Ne] 3s¹) loses its first electron easily. Its second electron must be removed from the stable, tightly bound noble-gas core [Ne] (2p⁶), causing an enormous surge in IE₂.',
      clarificationQuestion: 'Did you identify which element loses an electron from an inner noble-gas shell for IE₂?',
      verificationTask: 'Which group has extremely high IE₂? (A) Alkali metals (Group 1) (B) Alkaline earth metals (Group 2).'
    }
  ],

  // ── BIOLOGY ────────────────────────────────────────────────────────────────
  biology: [
    {
      id: 'bio_d1_1',
      skillId: 'cell_biology',
      difficulty: 1,
      text: 'Which organelle is known as the "powerhouse of the cell" responsible for ATP synthesis via cellular respiration?',
      options: [
        { id: 'b1a', text: 'Ribosome', isCorrect: false, misconceptionNote: 'Ribosomes are sites of protein synthesis.' },
        { id: 'b1b', text: 'Golgi apparatus', isCorrect: false, misconceptionNote: 'Golgi apparatus packages and sorts proteins.' },
        { id: 'b1c', text: 'Mitochondrion', isCorrect: true },
        { id: 'b1d', text: 'Nucleolus', isCorrect: false, misconceptionNote: 'Nucleolus produces ribosomal RNA.' },
      ],
      explanation: 'Mitochondria generate most of the cell\'s chemical energy in the form of ATP via oxidative phosphorylation.',
      clarificationQuestion: 'Did you confuse protein synthesis (ribosome) with aerobic respiration (mitochondrion)?',
      verificationTask: 'Where does photosynthesis occur in plant cells? (A) Chloroplast (B) Mitochondria.'
    },
    {
      id: 'bio_d2_1',
      skillId: 'genetics',
      difficulty: 2,
      text: 'In pea plants, purple flowers (P) are dominant over white flowers (p). If two heterozygous plants (Pp) are crossed, what phenotypic ratio is expected in the offspring?',
      options: [
        { id: 'b2a', text: '1 purple : 1 white', isCorrect: false, misconceptionNote: 'This is the ratio for a test cross (Pp x pp).' },
        { id: 'b2b', text: '3 purple : 1 white', isCorrect: true },
        { id: 'b2c', text: '1 purple : 2 intermediate : 1 white', isCorrect: false, misconceptionNote: 'Confused complete dominance with incomplete dominance.' },
        { id: 'b2d', text: 'All purple', isCorrect: false, misconceptionNote: 'Occurs only when crossing homozygous dominant (PP x PP or PP x pp).' },
      ],
      explanation: 'Punnett square for Pp x Pp: 1 PP, 2 Pp, 1 pp. PP and Pp express purple (3), while pp expresses white (1). Phenotypic ratio is 3:1.',
      clarificationQuestion: 'Did you count both PP and Pp as exhibiting the dominant phenotype?',
      verificationTask: 'What is the genotypic ratio of a monohybrid cross Pp x Pp? (A) 1:2:1 (B) 3:1.'
    },
    {
      id: 'bio_d3_1',
      skillId: 'genetics',
      difficulty: 3,
      text: 'During DNA replication, what is the role of DNA ligase on the lagging strand?',
      options: [
        { id: 'b3a', text: 'Unwinds the double helix at the replication fork', isCorrect: false, misconceptionNote: 'Helicase unwinds the double helix.' },
        { id: 'b3b', text: 'Synthesizes short RNA primers', isCorrect: false, misconceptionNote: 'Primase synthesizes RNA primers.' },
        { id: 'b3c', text: 'Catalyzes phosphodiester bonds to join Okazaki fragments', isCorrect: true },
        { id: 'b3d', text: 'Proofreads newly synthesized nucleotides', isCorrect: false, misconceptionNote: 'DNA Polymerase proofreads.' },
      ],
      explanation: 'DNA ligase seals nicks in the sugar-phosphate backbone by forming covalent phosphodiester bonds between adjacent Okazaki fragments.',
      clarificationQuestion: 'Did you confuse the unwinding enzyme (helicase) with the joining enzyme (ligase)?',
      verificationTask: 'Which enzyme unwinds the double helix? (A) Helicase (B) Ligase.'
    },
    {
      id: 'bio_d4_1',
      skillId: 'evolution',
      difficulty: 4,
      text: 'In a population in Hardy-Weinberg equilibrium, the frequency of homozygous recessive individuals (q²) for an autosomal recessive trait is 0.09. What is the frequency of heterozygous carriers (2pq)?',
      options: [
        { id: 'b4a', text: '0.91', isCorrect: false, misconceptionNote: 'Subtracted q² from 1 instead of calculating 2pq.' },
        { id: 'b4b', text: '0.42', isCorrect: true },
        { id: 'b4c', text: '0.21', isCorrect: false, misconceptionNote: 'Calculated p*q without multiplying by 2 for heterozygote frequency.' },
        { id: 'b4d', text: '0.49', isCorrect: false, misconceptionNote: 'Calculated p² (homozygous dominant) instead of 2pq.' },
      ],
      explanation: 'q² = 0.09 => q = 0.3. Since p + q = 1, p = 0.7. Carrier frequency 2pq = 2 * (0.7) * (0.3) = 0.42 (42%).',
      clarificationQuestion: 'Did you remember the factor of 2 in the Hardy-Weinberg binomial expansion p² + 2pq + q² = 1?',
      verificationTask: 'If q = 0.2, what is p? (A) 0.8 (B) 0.04 (C) 0.96.'
    },
    {
      id: 'bio_d5_1',
      skillId: 'physiology',
      difficulty: 5,
      text: 'During an action potential in a mammalian neuron, what mechanism is directly responsible for the rapid repolarization phase?',
      options: [
        { id: 'b5a', text: 'Active transport of 3 Na⁺ out and 2 K⁺ in via the Na⁺/K⁺ ATPase pump', isCorrect: false, misconceptionNote: 'The Na⁺/K⁺ pump restores long-term resting gradients, not fast millisecond repolarization.' },
        { id: 'b5b', text: 'Inactivation of voltage-gated Na⁺ channels and opening of voltage-gated K⁺ channels', isCorrect: true },
        { id: 'b5c', text: 'Opening of voltage-gated Ca²⁺ channels triggering exocytosis', isCorrect: false, misconceptionNote: 'Ca²⁺ entry occurs at the axon terminal to release neurotransmitters.' },
        { id: 'b5d', text: 'Rapid influx of Cl⁻ ions through GABA receptors', isCorrect: false, misconceptionNote: 'Cl⁻ influx mediates hyperpolarizing IPSPs, not the repolarization wave.' },
      ],
      explanation: 'Depolarization peaks when voltage-gated Na⁺ channels inactivate (close) and slower voltage-gated K⁺ channels open, allowing massive K⁺ efflux that repolarizes the membrane.',
      clarificationQuestion: 'Did you think the ATP pump operates rapidly enough to produce millisecond repolarization?',
      verificationTask: 'Which ion flows OUT of the neuron to cause repolarization? (A) Na⁺ (B) K⁺ (C) Ca²⁺.'
    }
  ],

  // ── HISTORY ────────────────────────────────────────────────────────────────
  history: [
    {
      id: 'hist_d1_1',
      skillId: 'ancient_civilizations',
      difficulty: 1,
      text: 'Between which two rivers was the ancient Mesopotamian civilization established?',
      options: [
        { id: 'h1a', text: 'Nile and Amazon', isCorrect: false, misconceptionNote: 'Nile is in Egypt; Amazon is in South America.' },
        { id: 'h1b', text: 'Tigris and Euphrates', isCorrect: true },
        { id: 'h1c', text: 'Indus and Ganges', isCorrect: false, misconceptionNote: 'Indus and Ganges are in South Asia.' },
        { id: 'h1d', text: 'Yellow and Yangtze', isCorrect: false, misconceptionNote: 'Yellow and Yangtze are in China.' },
      ],
      explanation: '"Mesopotamia" literally translates from Greek as "(land) between rivers"—the Tigris and Euphrates.',
      clarificationQuestion: 'Did you confuse the Fertile Crescent with Egyptian or Indian river valleys?',
      verificationTask: 'Which ancient script originated in Mesopotamia? (A) Cuneiform (B) Hieroglyphics.'
    },
    {
      id: 'hist_d2_1',
      skillId: 'medieval',
      difficulty: 2,
      text: 'In 1215, English barons forced King John to seal which foundational legal document that established limits on monarchical power?',
      options: [
        { id: 'h2a', text: 'The Declaration of Independence', isCorrect: false, misconceptionNote: 'Drafted in America in 1776.' },
        { id: 'h2b', text: 'The English Bill of Rights', isCorrect: false, misconceptionNote: 'Enacted in 1689 following the Glorious Revolution.' },
        { id: 'h2c', text: 'Magna Carta', isCorrect: true },
        { id: 'h2d', text: 'The Treaty of Versailles', isCorrect: false, misconceptionNote: 'Signed in 1919 after WWI.' },
      ],
      explanation: 'Magna Carta (Great Charter) of 1215 established that everyone, even the king, is subject to the rule of law.',
      clarificationQuestion: 'Did you confuse 13th-century Magna Carta with 17th- or 18th-century rights documents?',
      verificationTask: 'What year was Magna Carta granted? (A) 1215 (B) 1066 (C) 1492.'
    },
    {
      id: 'hist_d3_1',
      skillId: 'early_modern',
      difficulty: 3,
      text: 'What major technological invention by Johannes Gutenberg around 1440 catalyzed the European Reformation and Scientific Revolution?',
      options: [
        { id: 'h3a', text: 'The magnetic compass', isCorrect: false, misconceptionNote: 'Invented in ancient China.' },
        { id: 'h3b', text: 'Movable type printing press', isCorrect: true },
        { id: 'h3c', text: 'The mechanical steam engine', isCorrect: false, misconceptionNote: 'Developed by Newcomen and Watt in the 18th century.' },
        { id: 'h3d', text: 'The astronomical telescope', isCorrect: false, misconceptionNote: 'Refined by Galileo in 1609.' },
      ],
      explanation: 'Gutenberg\'s movable type printing press enabled the rapid dissemination of translated texts, scientific tracts, and philosophical pamphlets.',
      clarificationQuestion: 'Did you confuse Gutenberg\'s printing press with later Industrial Revolution inventions?',
      verificationTask: 'Which text was the first major book printed by Gutenberg? (A) The Bible (B) The Iliad.'
    },
    {
      id: 'hist_d4_1',
      skillId: 'modern',
      difficulty: 4,
      text: 'Which diplomatic agreement in 1648 concluded the European Thirty Years\' War and established the foundational principle of modern national sovereignty (Westphalian sovereignty)?',
      options: [
        { id: 'h4a', text: 'Peace of Westphalia', isCorrect: true },
        { id: 'h4b', text: 'Congress of Vienna', isCorrect: false, misconceptionNote: 'Congress of Vienna occurred in 1814-1815 after Napoleon.' },
        { id: 'h4c', text: 'Treaty of Utrecht', isCorrect: false, misconceptionNote: 'Concluded the War of the Spanish Succession in 1713.' },
        { id: 'h4d', text: 'Edict of Nantes', isCorrect: false, misconceptionNote: 'Granted religious rights to French Huguenots in 1598.' },
      ],
      explanation: 'The Peace of Westphalia established territorial integrity, legal equality of states, and non-interference in domestic affairs.',
      clarificationQuestion: 'Did you confuse the 1648 Peace of Westphalia with the 1815 Congress of Vienna?',
      verificationTask: 'What principle did Westphalia establish? (A) State sovereignty (B) United Nations.'
    },
    {
      id: 'hist_d5_1',
      skillId: 'historiography',
      difficulty: 5,
      text: 'In historiographical source criticism, what distinguishes the fallacy of "presentism" from other interpretive biases?',
      options: [
        { id: 'h5a', text: 'Relying exclusively on primary oral accounts rather than written records', isCorrect: false, misconceptionNote: 'This is a source modality critique, not presentism.' },
        { id: 'h5b', text: 'Anachronistically judging past historical actors and institutions through contemporary modern ethical and cultural frameworks', isCorrect: true },
        { id: 'h5c', text: 'Assuming that history inevitably progresses toward greater human freedom and enlightenment', isCorrect: false, misconceptionNote: 'This describes Whig history or teleological progressivism.' },
        { id: 'h5d', text: 'Attributing historical causation solely to the intentions of prominent political leaders', isCorrect: false, misconceptionNote: 'This is the "Great Man" theory of history.' },
      ],
      explanation: 'Presentism is the anachronistic introduction of present-day ideas and perspectives into depictions or interpretations of the past without historical contextualization.',
      clarificationQuestion: 'Did you confuse judging the past with modern morality (presentism) with the teleological view of progress (Whig history)?',
      verificationTask: 'What term describes placing an object or idea in the wrong historical time period? (A) Anachronism (B) Empiricism.'
    }
  ]
};

// Flat QUESTION_BANK for legacy / fallback reference
export const QUESTION_BANK: Question[] = SUBJECT_QUESTION_BANKS.math;

// ─── INITIAL LEARNING MATERIALS ──────────────────────────────────────────────
export const INITIAL_LEARNING_MATERIALS: LearningMaterial[] = [
  // English
  {
    id: 'mat_eng_1',
    teacherId: 'teacher_1',
    teacherName: 'Dr. Sarah Mitchell',
    title: 'Advanced Transition Signals & Rhetorical Devices',
    subject: 'english',
    topic: 'Stylistics & Devices',
    recommendedLevel: 'advanced',
    recommendedGoal: 'olympiad',
    description: 'An in-depth guide on analyzing zeugma, chiasmus, and concessive syntax in academic and competition essays.',
    type: 'text',
    contentOrUrl: 'In advanced prose analysis, stylistic coherence relies on precise rhetorical balancing. Zeugma unites disparate semantic fields under a singular governing verb (e.g. "He took his hat and his leave"). Master this technique to enhance your stylistic score in Olympiads.',
    status: 'published',
    createdAt: '2026-09-20'
  },
  {
    id: 'mat_eng_2',
    teacherId: 'teacher_1',
    teacherName: 'Dr. Sarah Mitchell',
    title: 'Mastering Formal Conditional Inversion Without "If"',
    subject: 'english',
    topic: 'Grammar & Syntax',
    recommendedLevel: 'advanced',
    recommendedGoal: 'exam',
    description: 'Video masterclass explaining "Were he to...", "Had they known...", and "Should you require...".',
    type: 'video',
    contentOrUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'published',
    createdAt: '2026-09-21'
  },
  {
    id: 'mat_eng_3',
    teacherId: 'teacher_1',
    teacherName: 'Dr. Sarah Mitchell',
    title: 'IELTS / SAT Critical Reading & Thesis Refinement',
    subject: 'english',
    topic: 'Reading Comprehension',
    recommendedLevel: 'intermediate',
    recommendedGoal: 'grades',
    description: 'Downloadable PDF summarizing argumentative thesis construction and fallacious reasoning detection.',
    type: 'pdf',
    contentOrUrl: 'https://errormap.edu/docs/sat-reading-strategies.pdf',
    status: 'published',
    createdAt: '2026-09-22'
  },

  // Programming
  {
    id: 'mat_prog_1',
    teacherId: 'teacher_2',
    teacherName: 'Prof. David Vance',
    title: 'Dynamic Programming: 1D Space Optimization & Knapsack',
    subject: 'programming',
    topic: 'Algorithms & Complexity',
    recommendedLevel: 'advanced',
    recommendedGoal: 'olympiad',
    description: 'Complete breakdown of why iterating backward is mandatory in 0/1 knapsack 1D compression.',
    type: 'text',
    contentOrUrl: 'When reducing 2D DP dp[i][w] to 1D dp[w], iterating backward from W down to weight[i] guarantees that dp[w - weight[i]] represents the state from item (i - 1), preventing item reuse.',
    status: 'published',
    createdAt: '2026-09-19'
  },
  {
    id: 'mat_prog_2',
    teacherId: 'teacher_2',
    teacherName: 'Prof. David Vance',
    title: 'Graph Traversals: Bellman-Ford vs Dijkstra Walkthrough',
    subject: 'programming',
    topic: 'Algorithms & Complexity',
    recommendedLevel: 'advanced',
    recommendedGoal: 'olympiad',
    description: 'Video analyzing negative weight cycles and why greedy choice in Dijkstra fails on negative edges.',
    type: 'video',
    contentOrUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'published',
    createdAt: '2026-09-21'
  },
  {
    id: 'mat_prog_3',
    teacherId: 'teacher_2',
    teacherName: 'Prof. David Vance',
    title: 'Big-O Complexity Cheat Sheet & Amortized Analysis',
    subject: 'programming',
    topic: 'Algorithms & Complexity',
    recommendedLevel: 'intermediate',
    recommendedGoal: 'new_skill',
    description: 'Reference link to asymptotic time and space complexities for popular standard library data structures.',
    type: 'link',
    contentOrUrl: 'https://www.bigocheatsheet.com/',
    status: 'published',
    createdAt: '2026-09-22'
  },

  // Physics
  {
    id: 'mat_phys_1',
    teacherId: 'teacher_3',
    teacherName: 'Elena Rostova',
    title: 'Rotational Dynamics & Rolling Without Slipping',
    subject: 'physics',
    topic: 'Work, Energy & Momentum',
    recommendedLevel: 'advanced',
    recommendedGoal: 'olympiad',
    description: 'Step-by-step derivation of angular acceleration and friction torque on inclined planes.',
    type: 'text',
    contentOrUrl: 'For any symmetric body rolling without slipping down an incline θ: a = g sin(θ) / (1 + I / (M R²)). Solid cylinders yield a = (2/3) g sin(θ), while solid spheres yield (5/7) g sin(θ).',
    status: 'published',
    createdAt: '2026-09-20'
  },

  // Math
  {
    id: 'mat_math_1',
    teacherId: 'teacher_4',
    teacherName: 'Marcus Aurel',
    title: 'De-mystifying Quadratic Factoring & Sign Rules',
    subject: 'math',
    topic: 'Quadratic Functions',
    recommendedLevel: 'intermediate',
    recommendedGoal: 'grades',
    description: 'Overcoming the sign-flip misconception when factoring trinomials with negative constant terms.',
    type: 'text',
    contentOrUrl: 'When factoring x² + bx + c where c is negative, the two numbers must have opposite signs. The larger number in absolute value takes the sign of b.',
    status: 'published',
    createdAt: '2026-09-21'
  }
];

// ─── INITIAL TEACHER TESTS ───────────────────────────────────────────────────
export const INITIAL_TEACHER_TESTS: TeacherTest[] = [
  {
    id: 'test_eng_adv_1',
    teacherId: 'teacher_1',
    teacherName: 'Dr. Sarah Mitchell',
    subject: 'english',
    topic: 'Stylistics & Rhetoric',
    title: 'Advanced Rhetoric & Formal Inversion Test',
    targetLevel: 'advanced',
    targetGoal: 'olympiad',
    isAdaptive: false,
    durationMinutes: 15,
    status: 'published',
    createdAt: '2026-09-22',
    questions: [
      {
        id: 't_eng_q1',
        text: 'Identify the rhetorical figure: "He opened his mind and his wallet."',
        options: [
          { id: 'to1', text: 'Chiasmus', isCorrect: false, misconceptionNote: 'Confused with reciprocal inverted syntax.' },
          { id: 'to2', text: 'Zeugma', isCorrect: true },
          { id: 'to3', text: 'Litotes', isCorrect: false, misconceptionNote: 'No understatement through double negation.' },
          { id: 'to4', text: 'Synecdoche', isCorrect: false, misconceptionNote: 'No part-for-whole substitution.' },
        ],
        explanation: '"Opened" applies both to an abstract state (mind) and a physical object (wallet).',
        hint: 'Look for one verb controlling two different nouns in different senses.',
        verificationTask: 'Which verb creates a zeugma with "the race" and "a cold"? (A) lost (B) ran (C) caught.'
      },
      {
        id: 't_eng_q2',
        text: 'Which sentence correctly uses conditional inversion without "if"?',
        options: [
          { id: 'to2_1', text: 'Should you have questions, please contact our support team.', isCorrect: true },
          { id: 'to2_2', text: 'Should you had questions, please contact our support team.', isCorrect: false, misconceptionNote: 'Used past participle instead of bare infinitive after should.' },
          { id: 'to2_3', text: 'Had you questions, please contact our support team.', isCorrect: false, misconceptionNote: 'Incorrect tense match for present/future instruction.' },
          { id: 'to2_4', text: 'Were you have questions, please contact our support team.', isCorrect: false, misconceptionNote: 'Missing "to" after "were you".' },
        ],
        explanation: '"Should you have" is the standard inversion for "If you should have".',
        hint: 'Modal auxiliary "should" takes the base form of the verb.',
        verificationTask: 'Invert: "If you need help" -> (A) Need you help (B) Should you need help.'
      }
    ]
  },
  {
    id: 'test_prog_adv_1',
    teacherId: 'teacher_2',
    teacherName: 'Prof. David Vance',
    subject: 'programming',
    topic: 'Algorithms & Data Structures',
    title: 'Olympiad Algorithms & State Optimization',
    targetLevel: 'advanced',
    targetGoal: 'olympiad',
    isAdaptive: false,
    durationMinutes: 20,
    status: 'published',
    createdAt: '2026-09-22',
    questions: [
      {
        id: 't_prog_q1',
        text: 'In 1D 0/1 knapsack dynamic programming, why must the capacity loop run backward?',
        options: [
          { id: 'tpo1', text: 'To ensure values from the current item overwrite older states.', isCorrect: false, misconceptionNote: 'Overwriting older states prematurely creates multiple copies of the same item.' },
          { id: 'tpo2', text: 'To prevent using the current item multiple times in the same step.', isCorrect: true },
          { id: 'tpo3', text: 'To improve CPU cache locality.', isCorrect: false, misconceptionNote: 'Direction does not change asymptotic cache complexity.' },
          { id: 'tpo4', text: 'Because Python lists do not support forward index lookups.', isCorrect: false, misconceptionNote: 'Python lists naturally support both index directions.' },
        ],
        explanation: 'Iterating backward preserves previous item states dp[i-1][w] intact.',
        hint: 'Think about what happens if dp[w - weight] was already updated in the current item iteration.',
        verificationTask: 'If we iterate forward in 1D knapsack, what variant problem is solved? (A) Fractional (B) Unbounded.'
      }
    ]
  }
];

// ─── LEARNING EXERCISES ──────────────────────────────────────────────────────
export const LEARNING_EXERCISES: LearningExercise[] = [
  {
    id: 'ex_quadratic_1',
    skillId: 'quadratic',
    title: 'Factoring: Sign Rule Drill',
    problemStatement: 'Factor this quadratic expression:  x² − 5x + 6',
    options: [
      { id: 'ex1a', text: '(x − 2)(x − 3)', isCorrect: true },
      { id: 'ex1b', text: '(x + 2)(x + 3)', isCorrect: false },
      { id: 'ex1c', text: '(x − 6)(x + 1)', isCorrect: false },
      { id: 'ex1d', text: '(x + 5)(x − 1)', isCorrect: false },
    ],
    hints: [
      'Find two numbers that multiply to +6.',
      'Those two numbers must also add to −5.',
      '−2 and −3 multiply to +6 and add to −5. Both factors are (x − 2) and (x − 3).'
    ],
    solutionWalkthrough: 'We need (x + a)(x + b) where a×b = 6 and a+b = −5. Testing: (−2)×(−3) = 6 ✓ and (−2)+(−3) = −5 ✓. Answer: (x−2)(x−3).'
  },
  {
    id: 'ex_algebra_1',
    skillId: 'algebra',
    title: 'Expanding Brackets',
    problemStatement: 'Expand:  3(2x − 4) + 5x',
    options: [
      { id: 'ex2a', text: '11x − 12', isCorrect: true },
      { id: 'ex2b', text: '6x − 4 + 5x', isCorrect: false },
      { id: 'ex2c', text: '11x + 12', isCorrect: false },
      { id: 'ex2d', text: '11x − 4', isCorrect: false },
    ],
    hints: [
      'Distribute the 3 across the bracket first.',
      '3 × 2x = 6x and 3 × (−4) = −12.',
      'Combine 6x + 5x = 11x, keeping the −12.'
    ],
    solutionWalkthrough: '3(2x−4) + 5x = 6x − 12 + 5x = 11x − 12.'
  },
  {
    id: 'ex_linear_1',
    skillId: 'linear_eq',
    title: 'Two-Step Linear Equation',
    problemStatement: 'Solve for x:  5x − 7 = 28',
    options: [
      { id: 'ex3a', text: 'x = 7', isCorrect: true },
      { id: 'ex3b', text: 'x = 4.2', isCorrect: false },
      { id: 'ex3c', text: 'x = 35', isCorrect: false },
      { id: 'ex3d', text: 'x = 21', isCorrect: false },
    ],
    hints: [
      'Add 7 to both sides first.',
      '5x = 35.',
      'Divide both sides by 5.'
    ],
    solutionWalkthrough: '5x − 7 = 28 → 5x = 35 → x = 7.'
  }
];

// ─── DEMO TEACHER STUDENTS ───────────────────────────────────────────────────
export const DEMO_TEACHER_STUDENTS: TeacherStudentSummary[] = [
  {
    id: 'demo_stu_1',
    name: 'Maya Johnson',
    avatar: '',
    overallScore: 78,
    status: 'excelling',
    strugglingTopic: 'Quadratic Factoring',
    lastActive: '2 hours ago',
    detectedMisconceptionsCount: 1,
    confidenceAccuracyGap: 'Well calibrated'
  },
  {
    id: 'demo_stu_2',
    name: 'Ethan Park',
    avatar: '',
    overallScore: 43,
    status: 'needs_attention',
    strugglingTopic: 'Sign rules in algebra',
    lastActive: '1 day ago',
    detectedMisconceptionsCount: 3,
    confidenceAccuracyGap: 'Overconfident on gaps'
  },
  {
    id: 'demo_stu_3',
    name: 'Sofia Chen',
    avatar: '',
    overallScore: 60,
    status: 'on_track',
    strugglingTopic: 'Fractions division',
    lastActive: '3 hours ago',
    detectedMisconceptionsCount: 0,
    confidenceAccuracyGap: 'Slightly underconfident'
  },
];
