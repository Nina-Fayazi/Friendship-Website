import React, { useState } from 'react';

function Home() {
  
  const [posts, setPosts] = useState([
    { id: 1, user: 'Omid', content: 'Hello everyone! Excited to be here.', likes: 5 },
    { id: 2, user: 'Sara', content: 'Beautiful day to write some React code! 💻', likes: 12 },
    { id: 3, user: 'Alex', content: 'Just joined the Friendship App. Looking for new connections!', likes: 3 }
  ]);

  const [newPost, setNewPost] = useState('');

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const postData = {
      id: posts.length + 1,
      user: 'You', 
      content: newPost,
      likes: 0
    };

    setPosts([postData, ...posts]);
    setNewPost('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Home Feed</h2>
      
     
      <form onSubmit={handleCreatePost} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          rows="3"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none' }}
        />
        <button 
          type="submit" 
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Post
        </button>
      </form>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <strong style={{ color: '#333' }}>@{post.user}</strong>
            <p style={{ margin: '10px 0', color: '#555' }}>{post.content}</p>
            <span style={{ fontSize: '14px', color: '#888' }}>❤️ {post.likes} Likes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;