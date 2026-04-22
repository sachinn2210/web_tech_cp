'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const auth = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = auth?.user;
  const loading = auth?.loading;

  const handleLogout = () => {
    auth?.logout();
    router.push('/');
    setShowUserMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4">

          {/* Logo + Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg tracking-tight">Q</span>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">CampusQA</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Questions
              </Link>
              <Link href="/achievements" className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Achievements
              </Link>
              {!loading && user && (
                <Link href="/ask" className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  Ask
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 hidden sm:flex items-center">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-900 transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-bold bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign up
                </Link>
              </>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-gray-900 hidden sm:block">{user?.username}</span>
                  <svg className="w-3.5 h-3.5 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border-2 border-gray-900 py-1 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-900 mb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                      </div>
                      <Link
                        href={`/profile/${user?.username}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        href="/ask"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ask a Question
                      </Link>
                      <div className="border-t-2 border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}