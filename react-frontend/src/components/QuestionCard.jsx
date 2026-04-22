import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionCard.css';

export default function QuestionCard({ question, index = 0 }) {
  return (
    <div
      className="question-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="qcard-stats">
        <div className="stat">
          <span className="stat-num">{question.vote_score}</span>
          <span className="stat-label">votes</span>
        </div>
        <div className={`stat answers-stat ${question.answer_count > 0 ? 'has-answers' : ''}`}>
          <span className="stat-num">{question.answer_count}</span>
          <span className="stat-label">answers</span>
        </div>
      </div>

      <div className="qcard-body">
        <Link to={`/question/${question.id}`} className="qcard-title">
          {question.title}
        </Link>
        <p className="qcard-excerpt">
          {question.content?.replace(/<[^>]*>/g, '').slice(0, 140)}
          {question.content?.length > 140 ? '...' : ''}
        </p>

        <div className="qcard-footer">
          <div className="qcard-tags">
            {question.tags?.slice(0, 4).map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
          <div className="qcard-meta">
            {question.category && (
              <span className="meta-category">{question.category.name}</span>
            )}
            <span className="meta-sep">·</span>
            <Link to={`/user/${question.author?.username}`} className="meta-author">
              {question.author?.username}
            </Link>
            <span className="meta-sep">·</span>
            <span className="meta-time">{question.time_since}</span>
          </div>
        </div>
      </div>
    </div>
  );
}