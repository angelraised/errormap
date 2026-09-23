import React, { useEffect, useState } from 'react';
import type { Language } from '../translations';
import type { TeacherStudentSummary } from '../types';
import { translations } from '../translations';
import { DEMO_TEACHER_STUDENTS } from '../mockData';
import { listStudentAccounts } from '../services/accountService';
import { 
  Sparkles, 
  Send
} from 'lucide-react';

interface TeacherAnalyticsProps {
  language: Language;
  onBack: () => void;
  isDemo?: boolean;
}

export const TeacherAnalyticsView: React.FC<TeacherAnalyticsProps> = ({ language, onBack, isDemo = false }) => {
  const t = translations[language];
  const [students, setStudents] = useState<TeacherStudentSummary[]>(isDemo ? DEMO_TEACHER_STUDENTS : []);
  const [, setIsLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) return;
    listStudentAccounts()
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  }, [isDemo]);

  const avgMastery = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.overallScore, 0) / students.length)
    : 0;
  const needsAttentionList = students.filter(s => s.status === 'needs_attention');

  // Topic bottlenecks aggregation
  const topicBottlenecks = [
    { topic: language === 'ru' ? 'Факторизация квадратичных уравнений (знаки)' : language === 'kz' ? 'Квадраттық теңдеулерді көбейткіштерге жіктеу (таңбалар)' : 'Quadratic Factoring (Negative Signs)', failureRate: '68%', affectedStudents: 3, riskLevel: 'High' },
    { topic: language === 'ru' ? 'Инверсия при расчете наклона (Δx/Δy)' : language === 'kz' ? 'Көлбеулікті есептеудегі инверсия (Δx/Δy)' : 'Slope Delta Inversion (Δx/Δy)', failureRate: '42%', affectedStudents: 2, riskLevel: 'Medium' },
    { topic: language === 'ru' ? 'Рациональные показатели степени' : language === 'kz' ? 'Рационал дәреже көрсеткіштері' : 'Rational Exponent Expansion', failureRate: '28%', affectedStudents: 1, riskLevel: 'Low' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {t.curriculumDistribution} & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t.studentRosterSub}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
            {t.back}
          </button>
          <button onClick={() => alert(t.broadcastAlert)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
            <Send size={15} />
            <span>{t.broadcastBtn}</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid-3">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {t.classAvgMastery}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
            {avgMastery}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t.targetGoal}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
            {t.needsImmediateAttention}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--danger)', marginTop: '4px' }}>
            {needsAttentionList.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px' }}>
            {t.persistentMisconceptions}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
            {t.misconceptionCalibration}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-teal)', marginTop: '4px' }}>
            82% {t.accurate}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t.selfAssessmentAcc}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Classroom Progress Chart & Misconception Bottlenecks */}
      <div className="grid-2">
        {/* Simple Progress Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {t.curriculumDistribution}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>
                <span>{t.skills.linear_eq.name}</span>
                <span style={{ color: 'var(--success)' }}>84%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '84%', background: 'var(--success)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>
                <span>{t.skills.algebra.name}</span>
                <span style={{ color: 'var(--primary)' }}>72%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '72%', background: 'var(--primary)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>
                <span>{t.skills.fractions.name}</span>
                <span style={{ color: 'var(--accent-purple)' }}>68%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '68%', background: 'var(--accent-purple)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>
                <span>{t.skills.quadratic.name}</span>
                <span style={{ color: 'var(--danger)' }}>46%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '46%', background: 'var(--danger)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Topics Where Most Students Struggle */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {t.topStruggling}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topicBottlenecks.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: item.riskLevel === 'High' ? 'var(--danger-light)' : 'var(--bg-subtle)',
                  border: item.riskLevel === 'High' ? '1px solid rgba(239,68,68,0.25)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {item.topic}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {item.affectedStudents} students flagged
                  </div>
                </div>

                <span className={`badge ${item.riskLevel === 'High' ? 'badge-gap' : 'badge-learning'}`}>
                  {item.failureRate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations for the Teacher */}
      <div className="card" style={{
        padding: '24px 28px',
        border: '1.5px solid var(--primary)',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t.autoPedagogicalRecs}
          </h2>
        </div>

        <div className="grid-3">
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '0.92rem', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>
              {t.rec1Title}
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.rec1Desc}
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '0.92rem', color: 'var(--accent-purple)', display: 'block', marginBottom: '6px' }}>
              {t.rec2Title}
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.rec2Desc}
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '0.92rem', color: 'var(--accent-teal)', display: 'block', marginBottom: '6px' }}>
              {t.rec3Title}
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.rec3Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
