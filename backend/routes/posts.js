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


router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;


router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

   
    const isLiked = post.likes.includes(req.userId);

    if (isLiked) {
     
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
    } else {
     
      post.likes.push(req.userId);
    }

    const updatedPost = await post.save();
   
    const populatedPost = await updatedPost.populate('user', 'username');

    res.status(200).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});