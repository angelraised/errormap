import React, { useState, useRef } from 'react';
import type { UserAccount, SubjectId, StudentLevel, StudentGoal, TeacherAudience, TeacherGoal } from '../types';
import type { Language } from '../translations';
import { translations } from '../translations';
import { UserAvatar } from './UserAvatar';
import { uploadAvatar, updateAccount } from '../services/accountService';
import { 
  HelpCircle, 
  RefreshCw, 
  LogOut, 
  Mail, 
  Sparkles,
  Edit3,
  Camera,
  Check,
  AlertCircle
} from 'lucide-react';

interface ProfileViewProps {
  account: UserAccount;
  language: Language;
  onAccountUpdated?: (account: UserAccount) => void;
  onRestartTutorial: () => void;
  onResetData: () => void;
  onLogOut: () => void;
}

const ALL_SUBJECTS: SubjectId[] = ['math', 'english', 'programming', 'physics', 'chemistry', 'biology', 'history'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  account,
  language,
  onAccountUpdated,
  onRestartTutorial,
  onResetData,
  onLogOut
}) => {
  const t = translations[language];
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [name, setName] = useState(account.name);
  const [avatarPreview, setAvatarPreview] = useState(account.avatar || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Student fields
  const [studentSubjects, setStudentSubjects] = useState<SubjectId[]>(account.studentSubjects || ['math']);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>(account.studentLevel || 'intermediate');
  const [studentGoal, setStudentGoal] = useState<StudentGoal>(account.studentGoal || 'grades');

  // Teacher fields
  const [teacherSubjects, setTeacherSubjects] = useState<SubjectId[]>(account.teacherSubjects || ['math']);
  const [teacherAudience, setTeacherAudience] = useState<TeacherAudience>(account.teacherAudience || 'school');
  const [teacherGoal, setTeacherGoal] = useState<TeacherGoal>(account.teacherGoal || 'track_progress');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStartEdit = () => {
    setName(account.name);
    setAvatarPreview(account.avatar || '');
    setSelectedFile(null);
    setStudentSubjects(account.studentSubjects || ['math']);
    setStudentLevel(account.studentLevel || 'intermediate');
    setStudentGoal(account.studentGoal || 'grades');
    setTeacherSubjects(account.teacherSubjects || ['math']);
    setTeacherAudience(account.teacherAudience || 'school');
    setTeacherGoal(account.teacherGoal || 'track_progress');
    setStatusMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setStatusMessage({ type: 'error', text: 'Please upload a JPG, PNG, or WebP image.' });
      return;
    }

    // 2 MB limit
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image size exceeds 2 MB limit.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setStatusMessage(null);
  };

  const handleToggleSubject = (subjectId: SubjectId) => {
    if (account.role === 'student') {
      if (studentSubjects.includes(subjectId)) {
        if (studentSubjects.length > 1) {
          setStudentSubjects(prev => prev.filter(s => s !== subjectId));
        }
      } else {
        setStudentSubjects(prev => [...prev, subjectId]);
      }
    } else {
      if (teacherSubjects.includes(subjectId)) {
        if (teacherSubjects.length > 1) {
          setTeacherSubjects(prev => prev.filter(s => s !== subjectId));
        }
      } else {
        setTeacherSubjects(prev => [...prev, subjectId]);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      let finalAvatarUrl = account.avatar;

      if (selectedFile) {
        finalAvatarUrl = await uploadAvatar(account.id, selectedFile);
      }

      const updatedAccount: UserAccount = {
        ...account,
        name: name.trim(),
        avatar: finalAvatarUrl,
        ...(account.role === 'student'
          ? {
              studentSubjects,
              studentLevel,
              studentGoal
            }
          : {
              teacherSubjects,
              teacherAudience,
              teacherGoal
            })
      };

      const persisted = await updateAccount(updatedAccount);
      if (onAccountUpdated) {
        onAccountUpdated(persisted);
      }
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update profile.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t.profileTitle}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t.profileSubtitle}
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: statusMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {isEditing ? (
        /* Edit Profile Form */
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar name={name || account.name} src={avatarPreview} size={76} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  background: 'var(--primary)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: 'var(--radius-full)',
                  width: '28px',
                  height: '28px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer'
                }}
                title="Upload Avatar (JPG, PNG, WebP < 2MB)"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                Profile Photo
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                JPG, PNG, or WebP. Maximum size 2 MB.
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Subject Checkboxes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {account.role === 'student' ? t.studentSubjectsTitle : t.teacherSubjectsTitle}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_SUBJECTS.map((subjId) => {
                const isSelected = account.role === 'student' 
                  ? studentSubjects.includes(subjId)
                  : teacherSubjects.includes(subjId);

                return (
                  <button
                    key={subjId}
                    type="button"
                    onClick={() => handleToggleSubject(subjId)}
                    className={`badge ${isSelected ? 'badge-mastered' : 'badge-neutral'}`}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {t[`subj_${subjId}` as keyof typeof t] as string}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role-Specific Selectors */}
          {account.role === 'student' ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.studentLevelTitle}
                </label>
                <select
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value as StudentLevel)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    fontSize: '0.92rem',
                    background: 'white'
                  }}
                >
                  <option value="beginner">{t.lvl_beginner}</option>
                  <option value="intermediate">{t.lvl_intermediate}</option>
                  <option value="advanced">{t.lvl_advanced}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.studentGoalTitle}
                </label>
                <select
                  value={studentGoal}
                  onChange={(e) => setStudentGoal(e.target.value as StudentGoal)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    fontSize: '0.92rem',
                    background: 'white'
                  }}
                >
                  <option value="grades">{t.goal_grades}</option>
                  <option value="exam">{t.goal_exam}</option>
                  <option value="olympiad">{t.goal_olympiad}</option>
                  <option value="new_skill">{t.goal_new_skill}</option>
                  <option value="interest">{t.goal_interest}</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.teacherAudienceTitle}
                </label>
                <select
                  value={teacherAudience}
                  onChange={(e) => setTeacherAudience(e.target.value as TeacherAudience)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    fontSize: '0.92rem',
                    background: 'white'
                  }}
                >
                  <option value="school">{t.aud_school}</option>
                  <option value="university">{t.aud_university}</option>
                  <option value="adults">{t.aud_adults}</option>
                  <option value="professional">{t.aud_professional}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t.teacherGoalTitle}
                </label>
                <select
                  value={teacherGoal}
                  onChange={(e) => setTeacherGoal(e.target.value as TeacherGoal)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    fontSize: '0.92rem',
                    background: 'white'
                  }}
                >
                  <option value="track_progress">{t.tgoal_track_progress}</option>
                  <option value="create_lessons">{t.tgoal_create_lessons}</option>
                  <option value="find_gaps">{t.tgoal_find_gaps}</option>
                  <option value="prep_exams">{t.tgoal_prep_exams}</option>
                </select>
              </div>
            </>
          )}

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="btn btn-secondary"
              style={{ padding: '10px 20px' }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '10px 24px' }}
            >
              {isSaving ? 'Saving…' : t.saveChanges}
            </button>
          </div>
        </form>
      ) : (
        /* Regular Account Display */
        <>
          <div className="card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <UserAvatar name={account.name} src={account.avatar} size={70} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {account.name}
                </h2>
                <span className={`badge ${account.role === 'student' ? 'badge-learning' : 'badge-mastered'}`}>
                  {account.role === 'student' ? t.roleStudentTitle.split('—')[1] || 'Student' : t.roleTeacherTitle.split('—')[1] || 'Teacher'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <Mail size={14} />
                <span>{account.email}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t.memberSince}: {account.createdAt}
              </div>
            </div>
          </div>

          {/* Learning / Teaching Preferences Details */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <span>{account.role === 'student' ? t.studentSubjectsTitle : t.teacherSubjectsTitle}</span>
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {((account.role === 'student' ? account.studentSubjects : account.teacherSubjects) || ['math']).map((subjId) => (
                <span key={subjId} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {t[`subj_${subjId}` as keyof typeof t] as string}
                </span>
              ))}
            </div>

            {account.studentLevel && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <strong>{t.studentLevelTitle}:</strong> {t[`lvl_${account.studentLevel}` as keyof typeof t] as string}
              </div>
            )}

            {account.studentGoal && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong>{t.studentGoalTitle}:</strong> {t[`goal_${account.studentGoal}` as keyof typeof t] as string}
              </div>
            )}

            {account.teacherAudience && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <strong>{t.teacherAudienceTitle}:</strong> {t[`aud_${account.teacherAudience}` as keyof typeof t] as string}
              </div>
            )}

            {account.teacherGoal && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong>{t.teacherGoalTitle}:</strong> {t[`tgoal_${account.teacherGoal}` as keyof typeof t] as string}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onRestartTutorial}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <HelpCircle size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700 }}>{t.restartTourBtn}</span>
            </button>

            <button
              onClick={onResetData}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', color: 'var(--danger)' }}
            >
              <RefreshCw size={18} />
              <span style={{ fontWeight: 700 }}>{t.resetDataBtn}</span>
            </button>

            <button
              onClick={onLogOut}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', color: 'var(--text-secondary)' }}
            >
              <LogOut size={18} />
              <span style={{ fontWeight: 700 }}>{t.logOut}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
