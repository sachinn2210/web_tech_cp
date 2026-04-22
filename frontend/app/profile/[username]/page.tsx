'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { profileAPI, questionAPI, answerAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

interface UserProfile {
  username: string;
  email: string;
  reputation: number;
  bio: string;
  date_joined: string;
  question_count: number;
  answer_count: number;
}
interface Question { id: number; title: string; created_at: string; vote_score: number; answer_count: number; }
interface Answer { id: number; content: string; created_at: string; vote_score: number; question: { id: number; title: string }; }

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  useEffect(() => {
    Promise.all([
      profileAPI.get(username).then(({ data }) => { setProfile(data); setBioText(data.bio || ''); }).catch(() => setProfile(null)),
      questionAPI.list({ author: username }).then(({ data }) => setQuestions(data.results ?? data)).catch(() => {}),
      answerAPI.listByAuthor(username).then(({ data }) => setAnswers(data.results ?? data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [username]);

  const handleSaveBio = async () => {
    try {
      await profileAPI.update({ bio: bioText });
      setProfile(profile ? { ...profile, bio: bioText } : null);
      setEditingBio(false);
    } catch {
      alert('Failed to update bio');
    }
  };

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="text-xl font-black text-gray-900">User not found</h1>
        <p className="text-gray-500 text-sm mt-1">This profile doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile card */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gray-900 relative">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-lg shrink-0">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 sm:pb-1">
                <h1 className="text-2xl font-black text-gray-900">{profile.username}</h1>
                <p className="text-sm font-semibold text-gray-400">@{profile.username}</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl shrink-0">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-black text-white text-sm">{profile.reputation}</span>
                <span className="text-xs text-gray-400 font-semibold">rep</span>
              </div>
            </div>

            {profile.bio && !editingBio && <p className="mt-4 text-gray-700 text-sm leading-relaxed">{profile.bio}</p>}
            {editingBio && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveBio} className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700">
                    Save
                  </button>
                  <button onClick={() => setEditingBio(false)} className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {user?.username === username && !editingBio && (
              <button onClick={() => setEditingBio(true)} className="mt-3 text-xs font-bold text-gray-500 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-all">
                ✏️ Edit Bio
              </button>
            )}

            <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Joined <span className="font-semibold text-gray-700">{new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">{questions.length}</p>
                  <p className="text-xs font-semibold text-gray-400">Questions</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">{answers.length}</p>
                  <p className="text-xs font-semibold text-gray-400">Answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border-2 border-gray-200 p-1">
          {(['questions', 'answers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors capitalize ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab} ({tab === 'questions' ? questions.length : answers.length})
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'questions' ? (
          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500 font-semibold">No questions yet</p>
              </div>
            ) : questions.map(q => (
              <Link key={q.id} href={`/question/${q.id}`}>
                <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 p-4 transition-all group">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{q.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <span className={`flex items-center gap-1 ${q.vote_score > 0 ? 'text-green-600' : q.vote_score < 0 ? 'text-red-500' : ''}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                      {q.vote_score} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {q.answer_count} answers
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {answers.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500 font-semibold">No answers yet</p>
              </div>
            ) : answers.map(a => (
              <div key={a.id} className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <Link href={`/question/${a.question.id}`}>
                  <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">{a.question.title}</h3>
                </Link>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{a.content}</p>
                <span className={`text-xs font-bold flex items-center gap-1 ${a.vote_score > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  {a.vote_score} votes
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}