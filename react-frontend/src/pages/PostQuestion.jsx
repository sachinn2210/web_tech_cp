import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './PostQuestion.css';

export default function PostQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ title: '', content: '', category: '', tags: '' });
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories/').then(({ data }) => setCategories(data.results || data));
    if (isEdit) {
      api.get(`/questions/${id}/`).then(({ data }) => {
        setForm({
          title: data.title,
          content: data.content,
          category: data.category?.id || '',
          tags: data.tags?.map(t => t.name).join(', ') || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      fd.append('category', form.category);
      if (form.tags) {
        form.tags.split(',').forEach(t => t.trim() && fd.append('tags', t.trim()));
      }
      if (image) fd.append('image', image);

      if (isEdit) {
        await api.patch(`/questions/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Question updated!');
        navigate(`/question/${id}`);
      } else {
        const { data } = await api.post('/questions/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Question posted!');
        navigate(`/question/${data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="form-page-container fade-up">
      <div className="form-card">
        <h1 className="form-title">{isEdit ? 'Edit Question' : 'Ask a Question'}</h1>
        <p className="form-subtitle">
          {isEdit ? 'Update your question details below.' : 'Share your question with the community. Be specific and clear!'}
        </p>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input
              type="text"
              placeholder="What's your question? Be specific."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Details <span className="required">*</span></label>
            <textarea
              placeholder="Provide all the context someone would need to answer your question..."
              rows={8}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="python, django, react"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
              <span className="form-hint">Comma-separated</span>
            </div>
          </div>

          <div className="form-group">
            <label>Image (optional)</label>
            <div className="file-input-wrap">
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])}
                style={{ display: 'none' }}
                id="q-image"
              />
              <label htmlFor="q-image" className="file-label">
                {image ? `📎 ${image.name}` : '+ Attach an image'}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Question' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}