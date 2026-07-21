useEffect(() => {
  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let userData = null;

      if (userId) {
        const userRes = await axios.get(`http://localhost:8000/api/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        userData = userRes.data.user;
      } else {
        const meRes = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        userData = meRes.data.user;
      }

      if (!userData) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      setUser(userData);

      if (userData.followers && userData.followers.includes(currentUserId)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      const postsRes = await axios.get('http://localhost:8000/api/posts/feed');
      const userPosts = postsRes.data.filter(p => p.user && p.user._id === userData._id);
      setPosts(userPosts);

    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('User not found.');
    } finally {
      setLoading(false);
    }
  };

  fetchProfileData();
}, [userId, token, currentUserId]);