import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function PostDetails() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyText, setReplyText] = useState('');     
  
  const { id } = useParams();

  const fetchPostDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(response.data);
      setLoading(false);
    } catch (err) {
      setError('Could not load post details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const handleSendReply = async (postId, commentId) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8000/api/posts/${postId}/comment/${commentId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      setPost(prev => ({ ...prev, comments: response.data }));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

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

          
          <div style={{ marginTop: '20px' }}>
            <h3>Comments</h3>
            {post.comments && post.comments.map((comment) => (
              <div key={comment._id} style={{ margin: '15px 0', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.user?.username}</p>
                <p style={{ fontSize: '14px' }}>{comment.text}</p>
                
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} 
                  style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  Reply
                </button>

               
                {comment.replies && comment.replies.map((reply) => (
                  <div key={reply._id} style={{ marginLeft: '20px', marginTop: '8px', padding: '6px', background: '#fff', borderLeft: '2px solid #007bff' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{reply.user?.username}</p>
                    <p style={{ fontSize: '13px' }}>{reply.text}</p>
                  </div>
                ))}

                
                {replyingTo === comment._id && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    <input 
                      type="text" 
                      placeholder="Write a reply..."
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ flex: 1, padding: '5px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button 
                      onClick={() => handleSendReply(post._id, comment._id)}
                      style={{ padding: '5px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetails;