'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { questionAPI, answerAPI } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface User {
  username: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Answer {
  id: number;
  content: string;
  author: User;
  created_at: string;
  vote_score: number;
  is_best: boolean;
  time_since: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  author: User;
  created_at: string;
  vote_score: number;
  category: Category;
  tags: Tag[];
  time_since: string;
}

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

  const fetchQuestion = async () => {
    try {
      const { data } = await questionAPI.get(id);
      setQuestion(data);
    } catch {
      setError('Failed to load question');
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data } = await answerAPI.list(id);
      setAnswers(data);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchQuestion(), fetchAnswers()]);
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      await answerAPI.create({ question: parseInt(id), content: answerContent });
      setAnswerContent('');
      fetchAnswers();
    } catch {
      setError('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteQuestion = async (direction: 'up' | 'down') => {
    if (!user || !question) return;
    try {
      const endpoint = direction === 'up' ? 'upvote' : 'downvote';
      const { data } = await questionAPI[endpoint](parseInt(id));
      setQuestion({ ...question, vote_score: data.vote_score });
    } catch {
      // Handle error silently
    }
  };

  const handleVoteAnswer = async (answerId: number) => {
    if (!user) return;
    try {
      await answerAPI.upvote(answerId);
      fetchAnswers();
    } catch {
      // Handle error silently
    }
  };

  const handleMarkBest = async (answerId: number) => {
    if (!user) return;
    try {
      await answerAPI.markBest(answerId);
      fetchAnswers();
    } catch {
      setError('Failed to mark best answer');
    }
  };

  if (!question && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700">Question not found</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : question ? (
          <>
            {/* Question */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                {/* Vote */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVoteQuestion('up')}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                  >
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className={`font-bold text-lg ${question.vote_score > 0 ? 'text-green-600' : question.vote_score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {question.vote_score}
                  </span>
                  <button
                    onClick={() => handleVoteQuestion('down')}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h1>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{question.content}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {question.category?.name}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Asked by <span className="font-medium text-gray-700">{question.author?.username}</span></span>
                    <span>{question.time_since || question.created_at}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>

              {answers.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-4">No answers yet. Be the first to answer!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`bg-white rounded-xl border p-6 ${answer.is_best ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}
                    >
                      <div className="flex gap-4">
                        {/* Vote */}
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => handleVoteAnswer(answer.id)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          >
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <span className={`font-bold ${answer.vote_score > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {answer.vote_score}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          {answer.is_best && (
                            <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Best Answer
                            </div>
                          )}
                          <p className="text-gray-700 whitespace-pre-wrap mb-3">{answer.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              <span className="font-medium text-gray-700">{answer.author?.username}</span>
                              <span className="ml-2">{answer.time_since || answer.created_at}</span>
                            </div>
                            {user?.username === question.author?.username && !answer.is_best && (
                              <button
                                onClick={() => handleMarkBest(answer.id)}
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                              >
                                Mark as best
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Form */}
            {user ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answer</h3>
                <form onSubmit={handleSubmitAnswer}>
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Write your answer..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                    >
                      {submitting ? 'Posting...' : 'Post Answer'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-gray-700 mb-4">Please log in to post an answer</p>
                <a
                  href="/login"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Log In
                </a>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
