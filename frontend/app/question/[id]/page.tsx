'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { questionAPI, answerAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

interface User { username: string; }
interface Tag { id: number; name: string; }
interface Category { id: number; name: string; }
interface Answer { id: number; content: string; author: User; created_at: string; vote_score: number; upvote_count: number; downvote_count: number; is_best: boolean; time_since: string; }
interface Question { id: number; title: string; content: string; author: User; created_at: string; vote_score: number; upvote_count: number; downvote_count: number; category: Category; tags: Tag[]; time_since: string; image?: string; }

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchQuestion = async () => { try { const { data } = await questionAPI.get(id); setQuestion(data); setEditTitle(data.title); setEditContent(data.content); } catch { setError('Failed to load question'); } };
  const fetchAnswers = async () => { try { const { data } = await answerAPI.list(id); setAnswers(Array.isArray(data) ? data : data.results || []); } catch {} finally { setLoading(false); } };

  useEffect(() => { Promise.all([fetchQuestion(), fetchAnswers()]); }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      await answerAPI.create({ question: parseInt(id), content: answerContent });
      setAnswerContent('');
      fetchAnswers();
    } catch { setError('Failed to post answer'); } finally { setSubmitting(false); }
  };

  const handleVoteQuestion = async (direction: 'up' | 'down') => {
    if (!user || !question) return;
    try {
      const { data } = await questionAPI[direction === 'up' ? 'upvote' : 'downvote'](parseInt(id));
      setQuestion({
        ...question,
        vote_score: data.vote_score,
        upvote_count: data.upvote_count,
        downvote_count: data.downvote_count
      });
    } catch {}
  };

  const handleVoteAnswer = async (answerId: number, direction: 'up' | 'down') => {
    if (!user) return;
    try {
      const { data } = direction === 'up'
        ? await answerAPI.upvote(answerId)
        : await answerAPI.downvote(answerId);
      setAnswers(answers.map(a =>
        a.id === answerId ? {
          ...a,
          vote_score: data.vote_score,
          upvote_count: data.upvote_count,
          downvote_count: data.downvote_count
        } : a
      ));
    } catch {}
  };

  const handleMarkBest = async (answerId: number) => {
    if (!user) return;
    try { await answerAPI.markBest(answerId); fetchAnswers(); } catch { setError('Failed to mark best answer'); }
  };

  const handleEditQuestion = async () => {
    if (!question) return;
    try {
      await questionAPI.update(question.id, { title: editTitle, content: editContent });
      setQuestion({ ...question, title: editTitle, content: editContent });
      setEditing(false);
    } catch { alert('Failed to update question'); }
  };

  const handleDeleteQuestion = async () => {
    if (!question || !confirm('Delete this question?')) return;
    try {
      await questionAPI.delete(question.id);
      window.location.href = '/';
    } catch { alert('Failed to delete question'); }
  };

  if (!question && !loading) return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-black text-gray-900">Question not found</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : question ? (
          <>
            {/* Question card */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <div className="flex gap-5">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button onClick={() => handleVoteQuestion('up')} disabled={!user} className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40 group">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <span className="font-black text-base text-green-600">
                    {question.upvote_count || 0}
                  </span>
                  <button onClick={() => handleVoteQuestion('down')} disabled={!user} className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 group">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <span className="font-black text-base text-red-600">
                    {question.downvote_count || 0}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xl font-bold border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        className="w-full text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEditQuestion} className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-700">
                          Save
                        </button>
                        <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-black text-gray-900 leading-snug mb-4">{question.title}</h1>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-5">{question.content}</p>
                      {question.image && (
                        <div className="mb-5">
                          <img src={question.image} alt={question.title} className="w-full max-h-96 object-cover rounded-lg border-2 border-gray-200" />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags?.map(tag => (
                      <span key={tag.id} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200">#{tag.name}</span>
                    ))}
                    {question.category?.name && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-200">{question.category.name}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Asked by</span>
                      <Link href={`/profile/${question.author?.username}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {question.author?.username}
                      </Link>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-400 text-xs">{question.time_since || question.created_at}</span>
                    </div>
                    {user?.username === question.author?.username && !editing && (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(true)} className="text-xs font-bold text-gray-500 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-all">
                          ✎ Edit
                        </button>
                        <button onClick={handleDeleteQuestion} className="text-xs font-bold text-gray-500 hover:text-red-600 border-2 border-gray-200 hover:border-red-400 px-3 py-1 rounded-lg transition-all">
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answers header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>
              {answers.some(a => a.is_best) && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Best answer marked
                </span>
              )}
            </div>

            {answers.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center mb-6">
                <p className="text-gray-500 font-semibold mb-1">No answers yet</p>
                <p className="text-gray-400 text-sm">Be the first to help!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {answers.map(answer => (
                  <div key={answer.id} className={`bg-white rounded-xl border-2 p-5 transition-all ${answer.is_best ? 'border-green-500' : 'border-gray-200'}`}>
                    {answer.is_best && (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-xs mb-3 pb-3 border-b border-green-100">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        BEST ANSWER
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <button onClick={() => handleVoteAnswer(answer.id, 'up')} disabled={!user} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40 group">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <span className="text-sm font-black text-green-600">{answer.upvote_count || 0}</span>
                        <button onClick={() => handleVoteAnswer(answer.id, 'down')} disabled={!user} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 group">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <span className="text-sm font-black text-red-600">{answer.downvote_count || 0}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{answer.content}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs">
                            <Link href={`/profile/${answer.author?.username}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">{answer.author?.username}</Link>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400">{answer.time_since || answer.created_at}</span>
                          </div>
                          {user?.username === question.author?.username && !answer.is_best && (
                            <button onClick={() => handleMarkBest(answer.id)} className="text-xs font-bold text-gray-500 hover:text-green-600 border-2 border-gray-200 hover:border-green-400 px-3 py-1 rounded-lg transition-all">
                              ✓ Mark best
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answer form */}
            {user ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b-2 border-gray-100">
                  <h3 className="text-sm font-black text-gray-900">Your Answer</h3>
                </div>
                <form onSubmit={handleSubmitAnswer}>
                  <textarea
                    value={answerContent}
                    onChange={e => setAnswerContent(e.target.value)}
                    placeholder="Write a clear, helpful answer. Share what you know..."
                    rows={7}
                    className="w-full px-6 py-4 text-gray-800 text-sm leading-relaxed placeholder-gray-300 focus:outline-none resize-none bg-transparent"
                    required
                  />
                  <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-semibold">Be specific. Cite sources where relevant.</p>
                    <button
                      type="submit"
                      disabled={submitting || !answerContent.trim()}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors"
                    >
                      {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting…</> : 'Post Answer'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-6 text-center">
                <p className="text-gray-300 text-sm mb-4 font-semibold">Log in to post an answer</p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                  Log In to Answer
                </Link>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}