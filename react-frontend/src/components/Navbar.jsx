import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Campus<em>Hub</em></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Questions</Link>
          <Link to="/achievements" className={`nav-link ${isActive('/achievements') ? 'active' : ''}`}>Achievements</Link>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/post-question" className="btn-post">
                <span>+</span> Ask
              </Link>
              <div className="avatar-menu" ref={menuRef}>
                <button className="avatar-btn" onClick={() => setMenuOpen(v => !v)}>
                  <div className="avatar">{user.username[0].toUpperCase()}</div>
                  <span className="username-label">{user.username}</span>
                  <span className="rep-badge">{user.reputation ?? 0}</span>
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <Link to={`/user/${user.username}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <span>👤</span> Profile
                    </Link>
                    <Link to="/post-achievement" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <span>🏆</span> Post Achievement
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <span>↩</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}