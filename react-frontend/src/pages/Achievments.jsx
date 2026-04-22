import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Achievements.css';

const TYPE_ICONS = { hackathon: '💻', competition: '🏆', award: '🎖', other: '⭐' };

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/achievements/').then(({ data }) => setAchievements(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    await api.delete(`/achievements/${id}/`);
    setAchievements(prev => prev.filter(a => a.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <div>
          <h1 className="page-title">Achievements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Celebrating student excellence</p>
        </div>
        {user && <Link to="/post-achievement" className="btn-ask">+ Share Achievement</Link>}
      </div>

      {loading ? (
        <div className="ach-grid">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="ach-skeleton skeleton" style={{ height: 200 }} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No achievements yet</h3>
          <p>Share your first achievement!</p>
        </div>
      ) : (
        <div className="ach-grid">
          {achievements.map((a, i) => (
            <div key={a.id} className="ach-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              {a.image && <img src={a.image} alt={a.title} className="ach-image" />}
              <div className="ach-content">
                <div className="ach-type-row">
                  <span className="ach-type-badge">
                    {TYPE_ICONS[a.achievement_type]} {a.achievement_type_display}
                  </span>
                  <span className="ach-date">
                    {new Date(a.date_achieved).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="ach-title">{a.title}</h3>
                <p className="ach-desc">{a.description.slice(0, 120)}{a.description.length > 120 ? '...' : ''}</p>
                <div className="ach-footer">
                  <Link to={`/user/${a.student?.username}`} className="ach-student">
                    <div className="ach-avatar">{a.student?.username?.[0]?.toUpperCase()}</div>
                    {a.student?.username}
                  </Link>
                  {user?.username === a.student?.username && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/achievement/${a.id}/edit`} className="action-btn edit">Edit</Link>
                      <button className="action-btn delete" onClick={() => handleDelete(a.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}