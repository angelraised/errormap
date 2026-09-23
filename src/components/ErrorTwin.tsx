import { useMemo, useState } from 'react';
import { Bot, CheckCircle2, RotateCcw, X } from 'lucide-react';
import type { Language } from '../translations';
import type { ErrorMapRecord, SubjectId } from '../types';

type TwinDemo = { question: string; answer: string; misconception: string; explanation: string; verification: string };

const DEMOS: Record<SubjectId, TwinDemo> = {
  math: { question: 'Solve: 3(x − 2) = 12', answer: 'x = 2', misconception: 'I divided by 3 but forgot to restore the subtracted 2.', explanation: 'After dividing, x − 2 = 4, so x = 6.', verification: 'Solve 2(x − 3) = 10.' },
  english: { question: 'Choose: “Had I known, I ___ earlier.”', answer: 'will come', misconception: 'I treated an inverted third conditional like a future sentence.', explanation: 'The correct form is “would have come”.', verification: 'Complete: “Were I you, I ___ that offer.”' },
  programming: { question: 'Why does the loop read undefined at the end?', answer: 'The array is empty.', misconception: 'I used i <= array.length and assumed the last index equals length.', explanation: 'The last valid index is length − 1, so the condition must be i < array.length.', verification: 'Fix: for (let i = 0; i <= items.length; i++).' },
  physics: { question: 'A 20 N force acts on 4 kg. Find acceleration.', answer: '80 m/s²', misconception: 'I multiplied force by mass instead of using a = F/m.', explanation: 'Newton’s second law gives 20/4 = 5 m/s².', verification: 'Find acceleration for 18 N acting on 3 kg.' },
  chemistry: { question: 'How many moles of H₂ form from 2 mol H₂O?', answer: '4 mol', misconception: 'I multiplied by a coefficient without comparing both sides of the equation.', explanation: 'The H₂O:H₂ ratio is 2:2, therefore the answer is 2 mol.', verification: 'Use 2H₂ + O₂ → 2H₂O for 3 mol H₂.' },
  biology: { question: 'Which organelle produces ATP?', answer: 'Ribosome', misconception: 'I confused protein synthesis with cellular respiration.', explanation: 'Mitochondria produce most cellular ATP; ribosomes assemble proteins.', verification: 'Name the organelle that modifies and packages proteins.' },
  history: { question: 'Why is judging the past only by modern values risky?', answer: 'Because written sources are always false.', misconception: 'I confused presentism with source reliability.', explanation: 'Presentism means imposing today’s standards without reconstructing historical context.', verification: 'Explain presentism in one sentence using a new example.' }
};

const COPY = {
  en: { title: 'Your Error Twin', personal: 'Built from your latest misconception', demo: 'Demo based on a common mistake', prompt: 'Your twin solved the task like this. Tap the first faulty step.', found: 'You caught it!', miss: 'That step can be improved, but it is not the root mistake. Try again.', why: 'Why it is wrong', verify: 'Now prove the idea', reset: 'Try again', close: 'Close' },
  ru: { title: 'Твой Error Twin', personal: 'Создан из твоего последнего заблуждения', demo: 'Демо на основе типичной ошибки', prompt: 'Двойник решил задачу так. Нажми на первый ошибочный шаг.', found: 'Ты поймал ошибку!', miss: 'Этот шаг можно улучшить, но корень ошибки не здесь. Попробуй ещё.', why: 'Почему это неверно', verify: 'Теперь закрепи идею', reset: 'Ещё раз', close: 'Закрыть' },
  kz: { title: 'Сенің Error Twin', personal: 'Соңғы қате түсінігіңнен жасалды', demo: 'Жиі кездесетін қате бойынша демо', prompt: 'Егіз тапсырманы осылай шешті. Бірінші қате қадамды таңда.', found: 'Қатені таптың!', miss: 'Бұл негізгі қате емес. Қайта байқап көр.', why: 'Неліктен қате', verify: 'Енді біліміңді тексер', reset: 'Қайтадан', close: 'Жабу' }
} as const;

export function ErrorTwin({ subject, record, language, onClose }: { subject: SubjectId; record?: ErrorMapRecord; language: Language; onClose: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const copy = COPY[language];
  const twin = useMemo<TwinDemo>(() => record ? {
    question: record.questionText,
    answer: record.selectedOptionText,
    misconception: record.misconception,
    explanation: record.explanation,
    verification: record.verificationTask
  } : DEMOS[subject], [record, subject]);
  const steps = [
    `1. I read the task: “${twin.question}”`,
    `2. I used this rule: ${twin.misconception}`,
    `3. Therefore my answer is: “${twin.answer}”`
  ];
  const solved = picked === 1;

  return (
    <div className="twin-overlay" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="twin-modal animate-fade-in">
        <button className="twin-close" onClick={onClose} aria-label={copy.close}><X size={20} /></button>
        <div className="twin-heading">
          <div className="twin-avatar"><Bot size={30} /></div>
          <div><span className="eyebrow">ERRORMAP LAB</span><h2>{copy.title}</h2><p>{record ? copy.personal : copy.demo}</p></div>
        </div>
        <div className="twin-question"><strong>Task:</strong> {twin.question}</div>
        <p className="twin-prompt">{copy.prompt}</p>
        <div className="twin-steps">
          {steps.map((step, index) => (
            <button key={step} onClick={() => setPicked(index)} className={`twin-step ${picked === index ? (index === 1 ? 'correct' : 'wrong') : ''}`}>{step}</button>
          ))}
        </div>
        {picked !== null && (
          <div className={`twin-feedback ${solved ? 'success' : 'retry'}`}>
            <strong>{solved ? copy.found : copy.miss}</strong>
            {solved && <><p><b>{copy.why}:</b> {twin.explanation}</p><p><b>{copy.verify}:</b> {twin.verification}</p></>}
          </div>
        )}
        <div className="twin-actions">
          {picked !== null && <button className="btn btn-secondary" onClick={() => setPicked(null)}><RotateCcw size={16} />{copy.reset}</button>}
          {solved && <button className="btn btn-primary" onClick={onClose}><CheckCircle2 size={16} />{copy.close}</button>}
        </div>
      </div>
    </div>
  );
}
