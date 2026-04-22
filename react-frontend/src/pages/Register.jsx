import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors ? Object.values(errors).flat().join(' ') : 'Registration failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container fade-up">
      <div className="auth-card">
        <div className="auth-logo">⬡</div>
        <h1 className="auth-title">Join CampusHub</h1>
        <p className="auth-sub">Create your account and start connecting</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input placeholder="Username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <input type="password" placeholder="Password (min 8 chars)" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <input type="password" placeholder="Confirm password" value={form.password_confirm}
            onChange={e => setForm(f => ({ ...f, password_confirm: e.target.value }))} required />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}