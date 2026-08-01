import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null); 
  
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [commentText, setCommentText] = useState({});
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [followingList, setFollowingList] = useState([]);

  const token = localStorage.getItem('token');

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data.user || res.data;
      setCurrentUserId(user._id);
      setFollowingList(user.following || []);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/posts/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(
        'http://localhost:8000/api/posts',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      setContent('');
      setImage(null);
      fetchPosts();
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(
        `http://localhost:8000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      await axios.post(
        `http://localhost:8000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText({ ...commentText, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleSendReply = async (postId, commentId) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;

    try {
      await axios.post(
        `http://localhost:8000/api/posts/${postId}/comment/${commentId}/reply`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyTextMap({ ...replyTextMap, [commentId]: '' });
      setReplyingToCommentId(null);
      fetchPosts();
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const handleSaveEditComment = async (postId, commentId) => {
    if (!editCommentText.trim()) return;
    try {
      await axios.put(
        `http://localhost:8000/api/posts/${postId}/comment/${commentId}`,
        { text: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleSaveEdit = async (postId) => {
    try {
      await axios.put(
        `http://localhost:8000/api/posts/${postId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      fetchPosts();
    } catch (err) {
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleFollowToggle = async (userId) => {
    const isFollowing = followingList.includes(userId);
    const endpoint = isFollowing ? 'unfollow' : 'follow';

    try {
      const res = await axios.put(
        `http://localhost:8000/api/users/${userId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowingList(res.data.following);
    } catch (err) {
      alert('Failed to update follow status');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 10px', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>Create a Post</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div style={{ marginTop: '10px' }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ fontSize: '14px' }}
            />
          </div>

          <button type="submit" style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Post
          </button>
        </form>
      </div>

      <h2>Home Feed</h2>
      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && posts.length === 0 && <p>No posts to display yet.</p>}

      {posts.map((post) => {
        const isPostOwner = post.user?._id === currentUserId;

        return (
          <div key={post._id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>{post.user?.username || 'User'}</p>
                
                {!isPostOwner && post.user?._id && (
                  <button
                    onClick={() => handleFollowToggle(post.user._id)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid #007bff',
                      background: followingList.includes(post.user._id) ? '#fff' : '#007bff',
                      color: followingList.includes(post.user._id) ? '#007bff' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {followingList.includes(post.user._id) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>

              {isPostOwner && (
                <div>
                  <button 
                    onClick={() => { setEditingPostId(post._id); setEditContent(post.content); }}
                    style={{ marginRight: '5px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', padding: '3px 8px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post._id)}
                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '3px 8px' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingPostId === post._id ? (
              <div style={{ margin: '15px 0' }}>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ width: '70%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button onClick={() => handleSaveEdit(post._id)} style={{ marginLeft: '5px', padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingPostId(null)} style={{ marginLeft: '5px', padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ margin: '15px 0' }}>
                <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {post.content && <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>{post.content}</p>}
                  
                  {post.image && (
                    <img 
                      src={`http://localhost:8000${post.image}`} 
                      alt="Post attachment" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '6px', objectFit: 'cover' }} 
                    />
                  )}
                </Link>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <button 
                onClick={() => handleLike(post._id)} 
                style={{ background: '#f8f9fa', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer' }}
              >
                ❤️ {post.likes?.length || 0} Likes
              </button>
            </div>

            <hr style={{ border: '0.5px solid #eee' }} />

            <div style={{ marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>Comments</h4>
              
              {post.comments?.map((comment) => {
                const isCommentOwner = comment.user?._id === currentUserId;

                return (
                  <div key={comment._id} style={{ background: '#f8f9fa', padding: '10px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {editingCommentId === comment._id ? (
                        <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                          <input
                            type="text"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                          <button onClick={() => handleSaveEditComment(post._id, comment._id)} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' }}>Save</button>
                          <button onClick={() => setEditingCommentId(null)} style={{ background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong style={{ color: '#007bff' }}>{comment.user?.username || 'User'}: </strong>
                            <span>{comment.text}</span>
                          </div>

                          {isCommentOwner && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                onClick={() => { setEditingCommentId(comment._id); setEditCommentText(comment.text); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                title="Edit comment"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px' }}
                                title="Delete comment"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id)}
                      style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px', padding: 0, marginTop: '5px' }}
                    >
                      Reply
                    </button>

                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply._id} style={{ marginLeft: '15px', marginTop: '6px', padding: '6px', background: '#fff', borderLeft: '2px solid #007bff', borderRadius: '4px' }}>
                        <strong style={{ fontSize: '12px', color: '#333' }}>{reply.user?.username || 'User'}: </strong>
                        <span style={{ fontSize: '13px' }}>{reply.text}</span>
                      </div>
                    ))}

                    {replyingToCommentId === comment._id && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '8px', marginLeft: '15px' }}>
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyTextMap[comment._id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [comment._id]: e.target.value })}
                          style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                        />
                        <button 
                          onClick={() => handleSendReply(post._id, comment._id)}
                          style={{ padding: '4px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Send
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => handleAddComment(post._id)} 
                  style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Comment
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default Home;