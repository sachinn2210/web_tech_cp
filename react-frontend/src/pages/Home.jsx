import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const SORTS = [
  { key: 'newest', label: '🕐 Newest' },
  { key: 'votes', label: '⬆ Top Voted' },
  { key: 'answers', label: '💬 Most Answered' },
];

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') || '1';

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (sort === 'answers') params.set('ordering', '-answer_count');
      else if (sort !== 'votes') params.set('ordering', '-created_at');

      const { data } = await api.get(`/questions/?${params}`);
      let results = data.results || data;
      if (sort === 'votes') results = [...results].sort((a, b) => b.vote_score - a.vote_score);
      setQuestions(results);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch {
      setQuestions([]);
    }
    setLoading(false);
  }, [search, category, tag, sort, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  useEffect(() => {
    api.get('/categories/').then(({ data }) => setCategories(data.results || data));
    api.get('/tags/').then(({ data }) => setTags(data.results || data));
  }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const totalPages = pagination.count ? Math.ceil(pagination.count / 10) : 1;
  const currentPage = parseInt(page);

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Sort By</h3>
          <div className="sort-pills">
            {SORTS.map(s => (
              <button
                key={s.key}
                className={`sort-pill ${sort === s.key ? 'active' : ''}`}
                onClick={() => setParam('sort', s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Categories</h3>
          <div className="filter-list">
            <button
              className={`filter-item ${!category ? 'active' : ''}`}
              onClick={() => setParam('category', '')}
            >All Categories</button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`filter-item ${category === String(c.id) ? 'active' : ''}`}
                onClick={() => setParam('category', String(c.id))}
              >{c.name}</button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Popular Tags</h3>
          <div className="tag-cloud">
            {tags.slice(0, 20).map(t => (
              <button
                key={t.id}
                className={`tag-cloud-item ${tag === String(t.id) ? 'active' : ''}`}
                onClick={() => setParam('tag', tag === String(t.id) ? '' : String(t.id))}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="questions-main">
        <div className="questions-header">
          <div>
            <h1 className="page-title">
              {search ? `Results for "${search}"` : 'Questions'}
            </h1>
            {pagination.count !== undefined && (
              <p className="questions-count">{pagination.count} questions</p>
            )}
          </div>
          {user && (
            <Link to="/post-question" className="btn-ask">
              + Ask a Question
            </Link>
          )}
        </div>

        {(search || category || tag) && (
          <div className="active-filters">
            {search && <span className="filter-chip">Search: {search} <button onClick={() => setParam('search', '')}>×</button></span>}
            {category && <span className="filter-chip">Category: {categories.find(c => String(c.id) === category)?.name} <button onClick={() => setParam('category', '')}>×</button></span>}
            {tag && <span className="filter-chip">Tag: #{tags.find(t => String(t.id) === tag)?.name} <button onClick={() => setParam('tag', '')}>×</button></span>}
          </div>
        )}

        <div className="questions-list">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="qcard-skeleton">
                <div className="skeleton" style={{ width: 64, height: 80, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No questions found</h3>
              <p>Be the first to ask!</p>
              {user && <Link to="/post-question" className="btn-ask">Ask a Question</Link>}
            </div>
          ) : (
            questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setParam('page', String(currentPage - 1))}
            >← Prev</button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setParam('page', String(currentPage + 1))}
            >Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}