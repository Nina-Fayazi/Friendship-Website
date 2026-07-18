import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [error, setError] = useState('');
  
  
  const token = localStorage.getItem('token');
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.id;
    } catch (e) {
      return null;
    }
  };
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/posts/feed');
        setPosts(response.data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Could not load feed. Please try again.');
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axios.post(
        'http://localhost:8000/api/posts/create',
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to submit post. Please try again.');
    }
  };

  
  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Home Feed</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleCreatePost} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          rows="3"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Post
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => {
            
            const hasLiked = post.likes && post.likes.includes(currentUserId);

            return (
              <div key={post._id} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <strong style={{ color: '#333' }}>@{post.user ? post.user.username : 'Unknown User'}</strong>
                <p style={{ margin: '10px 0', color: '#555' }}>{post.content}</p>
                
               
                <button 
                  onClick={() => handleLike(post._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: hasLiked ? '#e63946' : '#666',
                    fontWeight: hasLiked ? 'bold' : 'normal',
                    padding: '0'
                  }}
                >
                  {hasLiked ? '❤️' : '🤍'} {post.likes ? post.likes.length : 0} Likes
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Home;