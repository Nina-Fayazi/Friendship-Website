import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentUserId, setCurrentUserId] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const meRes = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ` + token }
        });
        const currentUser = meRes.data.user || meRes.data;
        const myId = currentUser._id || currentUser.id;
        setCurrentUserId(myId);

        if (userId) {
          try {
            const uRes = await axios.get(`http://localhost:8000/api/auth/user/${userId}`, {
              headers: { Authorization: `Bearer ` + token }
            });
            const targetUser = uRes.data.user || uRes.data;
            setUserProfile(targetUser);

            if (currentUser.following && currentUser.following.includes(userId)) {
              setIsFollowing(true);
            } else {
              setIsFollowing(false);
            }
          } catch (e) {
            const postsRes = await axios.get(`http://localhost:8000/api/posts/user/${userId}`, {
              headers: { Authorization: `Bearer ` + token }
            });
            setPosts(postsRes.data);
            if (postsRes.data.length > 0 && postsRes.data[0].user) {
              setUserProfile(postsRes.data[0].user);
            } else {
              setUserProfile({ username: 'User' });
            }
          }

          const postsRes = await axios.get(`http://localhost:8000/api/posts/user/${userId}`, {
            headers: { Authorization: `Bearer ` + token }
          });
          setPosts(postsRes.data);

        } else {
          setUserProfile(currentUser);

          const postsRes = await axios.get(`http://localhost:8000/api/posts/user/${myId}`, {
            headers: { Authorization: `Bearer ` + token }
          });
          setPosts(postsRes.data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, token]);

  const handleFollowToggle = async () => {
    if (!userId || userId === currentUserId) return;

    const endpoint = isFollowing ? 'unfollow' : 'follow';

    try {
      await axios.put(
        `http://localhost:8000/api/users/${userId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ` + token } }
      );

      setIsFollowing(!isFollowing);
      setUserProfile((prev) => {
        const prevFollowers = prev.followers || [];
        const updated = isFollowing
          ? prevFollowers.filter((id) => id !== currentUserId)
          : [...prevFollowers, currentUserId];
        return { ...prev, followers: updated };
      });
    } catch (err) {
      alert('Failed to update follow status');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>{error}</div>;

  const isOwnProfile = !userId || userId === currentUserId;

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {userProfile && (
        <div style={{ padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
          
          
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 15px', overflow: 'hidden' }}>
            {userProfile.avatar ? (
              <img 
                src={`http://localhost:8000${userProfile.avatar}`} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              userProfile.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          <h2 style={{ margin: '5px 0' }}>@{userProfile.username}</h2>
          {userProfile.email && <p style={{ color: '#666', margin: '5px 0' }}>{userProfile.email}</p>}
          <p style={{ fontWeight: 'bold', color: '#007bff', marginTop: '10px' }}>
            Total Posts: {posts.length}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
            <div>
              <strong>{userProfile.followers?.length || 0}</strong>
              <p style={{ margin: 0 }}>Followers</p>
            </div>

            <div>
              <strong>{userProfile.following?.length || 0}</strong>
              <p style={{ margin: 0 }}>Following</p>
            </div>
          </div>
          
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              style={{
                marginTop: '15px',
                padding: '8px 25px',
                borderRadius: '6px',
                border: isFollowing ? '1px solid #ccc' : 'none',
                backgroundColor: isFollowing ? '#e4e6eb' : '#007bff',
                color: isFollowing ? '#000' : '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
          
          {isOwnProfile && (
            <button
              onClick={() => navigate('/edit-profile')}
              style={{
                marginTop: '15px',
                padding: '8px 20px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      )}

      <h3>Posts</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#888' }}>No posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
              {post.content && <p style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>{post.content}</p>}
              
              {post.image && (
                <img 
                  src={`http://localhost:8000${post.image}`} 
                  alt="Post attachment" 
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '6px', objectFit: 'cover', marginBottom: '10px' }} 
                />
              )}

              <span style={{ fontSize: '13px', color: '#888' }}>❤️ {post.likes ? post.likes.length : 0} Likes</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;