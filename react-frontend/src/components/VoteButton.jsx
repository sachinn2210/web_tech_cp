import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './VoteButton.css';

export default function VoteButton({ type, id, initialScore, userUpvoted, userDownvoted, onVote }) {
  const [score, setScore] = useState(initialScore);
  const [upvoted, setUpvoted] = useState(userUpvoted);
  const [downvoted, setDownvoted] = useState(userDownvoted);
  const [loading, setLoading] = useState(false);

  const handleVote = async (direction) => {
    if (loading) return;
    const token = localStorage.getItem('access_token');
    if (!token) { toast.error('Login to vote'); return; }

    setLoading(true);
    try {
      const endpoint = `/api/${type}s/${id}/${direction}vote/`;
      const { data } = await api.post(endpoint);
      const newScore = data.vote_score;
      setScore(newScore);
      if (direction === 'up') { setUpvoted(v => !v); setDownvoted(false); }
      else { setDownvoted(v => !v); setUpvoted(false); }
      onVote?.(newScore);
    } catch {
      toast.error('Vote failed');
    }
    setLoading(false);
  };

  return (
    <div className="vote-container">
      <button
        className={`vote-btn up ${upvoted ? 'active' : ''}`}
        onClick={() => handleVote('up')}
        disabled={loading}
        title="Upvote"
      >
        ▲
      </button>
      <span className={`vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}>
        {score}
      </span>
      <button
        className={`vote-btn down ${downvoted ? 'active' : ''}`}
        onClick={() => handleVote('down')}
        disabled={loading}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}