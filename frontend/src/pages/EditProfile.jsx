import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditProfile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = res.data.user || res.data;
        setUsername(currentUser.username || '');
        setBio(currentUser.bio || '');
      } catch (err) {
        console.error('Failed to load user data', err);
      }
    };
    fetchUserData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }

      const res = await axios.put(
        'http://localhost:8000/api/auth/update-profile',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/profile'); 
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Arial, sans-serif' }}>
      <h2>Edit Profile</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ style: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
            style={{ fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', height: '80px', boxSizing: 'border-box' }}
            placeholder="Tell something about yourself..."
          />
        </div>

        <button
          type="submit"
          style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;