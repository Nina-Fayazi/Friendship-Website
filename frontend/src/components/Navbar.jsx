import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#1a1a1a', color: 'white', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        Friendship App
      </Link>

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