'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { questionAPI, categoryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Category { id: number; name: string; }

export default function AskQuestionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.results ?? data));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/ask');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      setError('');
      const tagNames = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      tagNames.forEach(tag => submitData.append('tags', tag));
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      await questionAPI.create(submitData);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-black text-gray-900">Ask a Question</h1>
          <p className="text-gray-500 text-sm mt-1">The more detail you give, the better your answers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Title */}
              <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-gray-900 transition-colors overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. How do I reverse a linked list in Python?"
                    className="w-full text-gray-900 font-semibold text-base placeholder-gray-300 focus:outline-none bg-transparent pb-3"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">{formData.title.length}/200</span>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-gray-900 transition-colors overflow-hidden">
                <div className="px-5 pt-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Describe your question. Include what you've tried, what you expected, and what happened..."
                    rows={9}
                    className="w-full text-gray-800 text-sm leading-relaxed placeholder-gray-300 focus:outline-none bg-transparent resize-none pb-4"
                    required
                  />
                </div>
              </div>

              {/* Category + Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-gray-900 transition-colors px-5 py-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full text-gray-900 font-semibold text-sm focus:outline-none bg-transparent cursor-pointer"
                    required
                  >
                    <option value="">Select…</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-gray-900 transition-colors px-5 py-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="python, django, api"
                    className="w-full text-gray-900 font-semibold text-sm placeholder-gray-300 focus:outline-none bg-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Comma-separated</p>
                </div>
              </div>

              {/* Tag preview */}
              {formData.tags && (
                <div className="flex flex-wrap gap-2 px-1">
                  {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-gray-900 transition-colors overflow-hidden">
                <div className="px-5 pt-4 pb-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl px-5 py-3.5">
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white px-7 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Post Question</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tips sidebar — 1/3 */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-sm font-black text-white mb-3">Tips for great questions</h3>
              <ul className="space-y-2.5">
                {[
                  'Search first to avoid duplicates',
                  'Use a clear, specific title',
                  "Include what you've already tried",
                  'Add tags for better visibility',
                  'Be respectful and specific',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-black text-white/60">{i + 1}</span>
                    </div>
                    <span className="text-xs text-gray-300 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Community Rules</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Be kind, stay on-topic, and help others learn. Questions that show effort get better answers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}