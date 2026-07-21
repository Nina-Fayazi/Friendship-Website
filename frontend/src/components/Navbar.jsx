import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/auth/search?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (token) searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token]);

  const handleUserClick = (userId) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#1a1a1a', color: 'white', alignItems: 'center', position: 'relative' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        Friendship App
      </Link>

      {token && (
        <div ref={searchRef} style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid #444',
              backgroundColor: '#2a2a2a',
              color: 'white',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {loading ? (
                <div style={{ padding: '10px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Searching...</div>
              ) : results.length > 0 ? (
                results.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #333',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <img
                      src={user.avatar || 'https://via.placeholder.com/32'}
                      alt={user.username}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>@{user.username}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '10px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No users found</div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {token ? (
          <>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home Feed</Link>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>
            <button 
              onClick={handleLogout} 
              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}


export default Navbar;