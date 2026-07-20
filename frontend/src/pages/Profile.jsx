import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
     
        const userRes = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = userRes.data.user;
        setUser(currentUser);

        
        const postsRes = await axios.get(`http://localhost:8000/api/posts/user/${currentUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPosts(postsRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [token]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 15px' }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <h2 style={{ margin: '5px 0' }}>@{user?.username}</h2>
        <p style={{ color: '#666', margin: '5px 0' }}>{user?.email}</p>
        <p style={{ fontWeight: 'bold', color: '#007bff', marginTop: '10px' }}>
          Total Posts: {userPosts.length}
        </p>
      </div>

      <h3>My Posts</h3>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {userPosts.length === 0 ? (
          <p style={{ color: '#888' }}>You haven't created any posts yet.</p>
        ) : (
          userPosts.map((post) => (
            <div key={post._id} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
              <p style={{ margin: '0 0 10px 0', color: '#333' }}>{post.content}</p>
              <span style={{ fontSize: '13px', color: '#888' }}>❤️ {post.likes ? post.likes.length : 0} Likes</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;