const router = require('express').Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');


router.post('/create', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const newPost = new Post({
      content,
      user: req.userId 
    });

    const savedPost = await newPost.save();
    
    
    const populatedPost = await savedPost.populate('user', 'username email');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get('/feed', async (req, res) => {
  try {
    
    const posts = await Post.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;