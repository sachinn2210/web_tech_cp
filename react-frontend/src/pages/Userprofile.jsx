import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import toast from 'react-hot-toast';
import './UserProfile.css';

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [tab, setTab] = useState('questions');

  useEffect(() => {
    api.get(`/profiles/${username}/`).then(({ data }) => { setProfile(data); setBio(data.bio || ''); });
    api.get(`/questions/?search=`).then(({ data }) => {
      const all = data.results || data;
      setQuestions(all.filter(q => q.author?.username === username));
    });
  }, [username]);

  const saveBio = async () => {
    await api.put('/profiles/me/', { bio });
    setProfile(p => ({ ...p, bio }));
    setEditingBio(false);
    toast.success('Profile updated!');
  };

  if (!profile) return <div className="profile-container"><div className="skeleton" style={{ height: 200 }} /></div>;

  return (
    <div className="profile-container fade-up">
      <div className="profile-hero">
        <div className="profile-avatar-lg">{username[0].toUpperCase()}</div>
        <div className="profile-info">
          <h1 className="profile-username">{username}</h1>
          <div className="profile-stats">
            <div className="pstat"><span className="pstat-num">{profile.reputation}</span><span className="pstat-label">Reputation</span></div>
            <div className="pstat"><span className="pstat-num">{profile.question_count}</span><span className="pstat-label">Questions</span></div>
            <div className="pstat"><span className="pstat-num">{profile.answer_count}</span><span className="pstat-label">Answers</span></div>
          </div>
          <p className="profile-joined">Joined {new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="profile-bio-section">
        {editingBio ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." style={{ flex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn-submit" onClick={saveBio}>Save</button>
              <button className="btn-cancel" onClick={() => setEditingBio(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <p style={{ flex: 1, color: profile.bio ? 'var(--text)' : 'var(--text-dim)', fontStyle: profile.bio ? 'normal' : 'italic' }}>
              {profile.bio || 'No bio yet.'}
            </p>
            {user?.username === username && (
              <button className="action-btn edit" onClick={() => setEditingBio(true)}>Edit</button>
            )}
          </div>
        )}
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')}>
          Questions ({questions.length})
        </button>
      </div>

      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state"><p>No questions posted yet.</p></div>
        ) : (
          questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} />)
        )}
      </div>
    </div>
  );
}