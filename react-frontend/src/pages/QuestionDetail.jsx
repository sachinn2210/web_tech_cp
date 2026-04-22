import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VoteButton from '../components/VoteButton';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './QuestionDetail.css';

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/questions/${id}/`)
      .then(({ data }) => setQuestion(data))
      .catch(() => toast.error('Question not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/questions/${id}/`);
    toast.success('Question deleted');
    navigate('/');
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/answers/', { question: parseInt(id), content: answerContent });
      setQuestion(prev => ({ ...prev, answers: [...(prev.answers || []), data] }));
      setAnswerContent('');
      toast.success('Answer posted!');
    } catch { toast.error('Failed to post answer'); }
    setSubmitting(false);
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    await api.delete(`/answers/${answerId}/`);
    setQuestion(prev => ({ ...prev, answers: prev.answers.filter(a => a.id !== answerId) }));
    toast.success('Answer deleted');
  };

  const handleMarkBest = async (answerId) => {
    await api.post(`/answers/${answerId}/mark_best/`);
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(a => ({ ...a, is_best: a.id === answerId }))
    }));
    toast.success('Best answer marked! 🎉');
  };

  if (loading) return (
    <div className="detail-container">
      <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 80 }} />
    </div>
  );

  if (!question) return <div className="detail-container"><p>Question not found.</p></div>;

  const answers = question.answers || [];
  const bestAnswers = answers.filter(a => a.is_best);
  const otherAnswers = answers.filter(a => !a.is_best);

  return (
    <div className="detail-container">
      {/* Question */}
      <div className="question-full fade-up">
        <div className="question-vote-col">
          <VoteButton
            type="question"
            id={question.id}
            initialScore={question.vote_score}
            userUpvoted={false}
            userDownvoted={false}
          />
        </div>
        <div className="question-content">
          <div className="question-header-row">
            <div>
              <div className="question-meta-top">
                <span className="meta-category-badge">{question.category?.name}</span>
                {question.tags?.map(t => <span key={t.id} className="tag">{t.name}</span>)}
              </div>
              <h1 className="question-title">{question.title}</h1>
              <div className="question-byline">
                Asked by{' '}
                <Link to={`/user/${question.author?.username}`} className="author-link">
                  {question.author?.username}
                </Link>
                <span className="dot">·</span>
                <span>{question.time_since}</span>
              </div>
            </div>
            {user?.username === question.author?.username && (
              <div className="question-actions">
                <Link to={`/question/${id}/edit`} className="action-btn edit">Edit</Link>
                <button className="action-btn delete" onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>

          {question.image && (
            <div className="question-image-wrap">
              <img src={question.image} alt="Question" />
            </div>
          )}

          <div className="question-body">{question.content}</div>
        </div>
      </div>

      {/* Answers */}
      <div className="answers-section">
        <h2 className="answers-heading">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {[...bestAnswers, ...otherAnswers].map((answer, i) => (
          <div
            key={answer.id}
            className={`answer-card ${answer.is_best ? 'best' : ''} fade-up`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {answer.is_best && (
              <div className="best-badge">✓ Best Answer</div>
            )}
            <div className="answer-layout">
              <div className="answer-vote-col">
                <VoteButton
                  type="answer"
                  id={answer.id}
                  initialScore={answer.vote_score}
                  userUpvoted={false}
                  userDownvoted={false}
                />
                {user?.username === question.author?.username && !answer.is_best && (
                  <button
                    className="mark-best-btn"
                    onClick={() => handleMarkBest(answer.id)}
                    title="Mark as best answer"
                  >✓</button>
                )}
              </div>
              <div className="answer-body-col">
                <div className="answer-text">{answer.content}</div>
                <div className="answer-footer">
                  <span>
                    <Link to={`/user/${answer.author?.username}`} className="author-link">
                      {answer.author?.username}
                    </Link>
                    <span className="dot">·</span>
                    {answer.time_since}
                  </span>
                  {user?.username === answer.author?.username && (
                    <div className="answer-actions">
                      <Link to={`/answer/${answer.id}/edit`} className="action-btn edit">Edit</Link>
                      <button className="action-btn delete" onClick={() => handleDeleteAnswer(answer.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {answers.length === 0 && (
          <div className="no-answers">
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <p>No answers yet. Be the first to help!</p>
          </div>
        )}
      </div>

      {/* Post Answer */}
      {user ? (
        <div className="post-answer-section fade-up">
          <h3 className="post-answer-title">Your Answer</h3>
          <form onSubmit={handleAnswer}>
            <textarea
              value={answerContent}
              onChange={e => setAnswerContent(e.target.value)}
              placeholder="Write a detailed, helpful answer..."
              rows={6}
              required
            />
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <Link to="/login">Login</Link> to post an answer.
        </div>
      )}
    </div>
  );
}