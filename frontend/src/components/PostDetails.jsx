import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function PostDetails() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const token = localStorage.getItem('token');
       const response = await axios.get(`http://localhost:8000/api/posts/single/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        setError('Could not load post details.');
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Back to Feed</Link>
      
      {post && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ color: '#555' }}>Posted by: {post.user?.username || 'User'}</p>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>{post.content}</p>
          
          {post.image && (
            <img 
              src={`http://localhost:8000${post.image}`} 
              alt="Post content" 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '6px', marginTop: '10px' }} 
            />
          )}

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
            <span>Likes: {post.likes ? post.likes.length : 0}</span> | <span>Comments: {post.comments ? post.comments.length : 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetails;