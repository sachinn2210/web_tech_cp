import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './PostQuestion.css';

const TYPES = [
  { value: 'hackathon', label: '💻 Hackathon' },
  { value: 'competition', label: '🏆 Competition' },
  { value: 'award', label: '🎖 Award' },
  { value: 'other', label: '⭐ Other' },
];

export default function PostAchievement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', achievement_type: '', date_achieved: '' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/achievements/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Achievement shared! 🎉');
      navigate('/achievements');
    } catch { toast.error('Failed to post achievement'); }
    setSubmitting(false);
  };

  return (
    <div className="form-page-container fade-up">
      <div className="form-card">
        <h1 className="form-title">Share an Achievement</h1>
        <p className="form-subtitle">Celebrate your success with the campus community!</p>
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input placeholder="e.g. Won 1st place at XYZ Hackathon"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description <span className="required">*</span></label>
            <textarea rows={5} placeholder="Tell us about this achievement..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type <span className="required">*</span></label>
              <select value={form.achievement_type} onChange={e => setForm(f => ({ ...f, achievement_type: e.target.value }))} required>
                <option value="">Select type</option>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date Achieved <span className="required">*</span></label>
              <input type="date" value={form.date_achieved}
                onChange={e => setForm(f => ({ ...f, date_achieved: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Image (optional)</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
              style={{ display: 'none' }} id="ach-image" />
            <label htmlFor="ach-image" className="file-label">
              {image ? `📎 ${image.name}` : '+ Upload a photo'}
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Share Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}