import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem('token');
   
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h2>Dashboard</h2>
      <p style={{ fontSize: '18px', color: '#28a745' }}>Welcome to your Friendship App Dashboard! 🎉</p>
      <p>You have successfully logged in and accessed this protected area.</p>
      
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