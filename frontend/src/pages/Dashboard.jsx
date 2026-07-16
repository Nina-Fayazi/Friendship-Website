import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        
        const response = await axios.get('http://localhost:8000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to load user data.');
        
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!user) return <p style={{ textAlign: 'center' }}>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h2>Dashboard</h2>
     
      
      <p style={{ fontSize: '20px', color: '#007bff', fontWeight: 'bold' }}>
        Welcome, {user.fullName || user.username}! 👋
      </p>
      <p style={{ color: '#555' }}>Username: @{user.username}</p>
      <p style={{ color: '#555' }}>Email: {user.email}</p>
      
      <p style={{ marginTop: '20px', color: '#28a745' }}>You have successfully accessed your secure profile.</p>
      
      <button 
        onClick={handleLogout} 
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;