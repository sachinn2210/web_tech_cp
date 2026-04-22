'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:8000/api';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE}/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      await login({ username: formData.username, password: formData.password });
      router.push('/');
    } catch (err: any) {
      const d = err.response?.data;
      if (!err.response) setError('Cannot connect to server.');
      else if (typeof d === 'object' && d !== null) setError((Object.values(d).flat()[0] as string) || 'Signup failed.');
      else setError(`Signup failed (${err.response.status}).`);
    } finally {
      setLoading(false);
    }
  };

  const strength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f8f6' }}>

      {/* Left — dark panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-black text-lg">Q</span>
          </div>
          <span className="text-xl font-black text-white">CampusQA</span>
        </Link>
        <div className="relative space-y-6">
          <p className="text-4xl font-black text-white leading-tight">Join your campus knowledge network.</p>
          <div className="space-y-3">
            {[
              { icon: '💬', text: 'Ask questions, get answers from peers' },
              { icon: '⭐', text: 'Build reputation by helping others' },
              { icon: '🏷️', text: 'Organize by tags and categories' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-gray-500">By signing up you agree to our Terms of Service and Privacy Policy.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">Q</span>
            </div>
            <span className="text-lg font-black text-gray-900">CampusQA</span>
          </Link>

          <h1 className="text-2xl font-black text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Username', name: 'username', type: 'text', placeholder: 'your_username', autoComplete: 'username' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@university.edu', autoComplete: 'email' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-sm placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-sm placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 font-semibold text-sm placeholder-gray-300 focus:outline-none transition-colors ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-gray-900'
                }`}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs font-semibold text-red-500 mt-1.5">Passwords don't match</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-gray-900 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}