import React, { useEffect, useState } from 'react';
import type { Language } from '../translations';
import type { TeacherStudentSummary } from '../types';
import { translations } from '../translations';
import { listStudentAccounts } from '../services/accountService';
import { UserAvatar } from './UserAvatar';
import { Users, ArrowLeft } from 'lucide-react';

interface TeacherClassRosterProps {
  language: Language;
  onBack: () => void;
}

export const TeacherClassRosterView: React.FC<TeacherClassRosterProps> = ({ language, onBack }) => {
  const t = translations[language];
  const [students, setStudents] = useState<TeacherStudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    listStudentAccounts()
      .then(setStudents)
      .catch(error => setLoadError(error instanceof Error ? error.message : 'Could not load students.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="var(--accent-purple)" />
            <span>{t.studentRosterTitle}</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t.studentRosterSub}
          </p>
        </div>

        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </button>
      </div>

      {/* Student Roster Table */}
      <div className="card" style={{ padding: '24px' }}>
        {isLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading student accounts…</p>}
        {!isLoading && loadError && <p style={{ color: 'var(--danger)' }}>{loadError}</p>}
        {!isLoading && !loadError && students.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
            <Users size={36} color="var(--accent-purple)" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{t.noStudentsRegisteredYet}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Student accounts will appear here automatically when they sign up.
            </p>
          </div>
        )}
        {!isLoading && !loadError && students.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>{t.thStudent}</th>
                <th style={{ padding: '12px 14px' }}>{t.thStatus}</th>
                <th style={{ padding: '12px 14px' }}>{t.thMastery}</th>
                <th style={{ padding: '12px 14px' }}>{t.thMisconception}</th>
                <th style={{ padding: '12px 14px' }}>{t.thConfidenceCalib}</th>
                <th style={{ padding: '12px 14px' }}>{t.thLastActive}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr 
                  key={student.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border)',
                    background: student.status === 'needs_attention' ? '#fffafb' : 'transparent'
                  }}
                >
                  <td style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserAvatar name={student.name} src={student.avatar} size={36} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      {student.name}
                    </span>
                  </td>

                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${
                      student.status === 'excelling' ? 'badge-mastered' :
                      student.status === 'needs_attention' ? 'badge-gap' : 'badge-learning'
                    }`}>
                      {student.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ padding: '14px' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {student.overallScore}%
                    </strong>
                  </td>

                  <td style={{ padding: '14px', fontSize: '0.85rem', color: student.detectedMisconceptionsCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {student.strugglingTopic}
                  </td>

                  <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {student.confidenceAccuracyGap}
                  </td>

                  <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {student.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
