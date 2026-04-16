'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { profileAPI, questionAPI, answerAPI } from '../../../../lib/api';
import Link from 'next/link';

interface UserProfile {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reputation: number;
  bio: string;
  created_at: string;
}

interface Question {
  id: number;
  title: string;
  created_at: string;
  vote_score: number;
  answer_count: number;
}

interface Answer {
  id: number;
  content: string;
  created_at: string;
  vote_score: number;
  question: {
    id: number;
    title: string;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileAPI.get(username);
        setProfile(data);
      } catch {
        setProfile(null);
      }
    };

    const fetchQuestions = async () => {
      try {
        const { data } = await questionAPI.list({ author: username });
        setQuestions(data);
      } catch {
        // Handle error silently
      }
    };

    const fetchAnswers = async () => {
      try {
        const { data } = await answerAPI.list(username);
        setAnswers(data);
      } catch {
        // Handle error silently
      }
    };

    Promise.all([fetchProfile(), fetchQuestions(), fetchAnswers()]).finally(() => {
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700">User not found</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Avatar and Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white">
                {profile.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 pt-12 sm:pt-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.user.first_name || profile.user.username}
                </h1>
                <p className="text-gray-500">@{profile.user.username}</p>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-orange-600">{profile.reputation} reputation</span>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{questions.length} questions</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'questions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'answers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Answers ({answers.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'questions' ? (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No questions yet</p>
              </div>
            ) : (
              questions.map((q) => (
                <Link key={q.id} href={`/question/${q.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{q.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {q.vote_score}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {q.answer_count} answers
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {answers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No answers yet</p>
              </div>
            ) : (
              answers.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <Link href={`/question/${a.question.id}`}>
                    <h3 className="font-semibold text-blue-600 hover:underline mb-2">
                      {a.question.title}
                    </h3>
                  </Link>
                  <p className="text-gray-700 text-sm line-clamp-3 mb-3">{a.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      {a.vote_score}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
