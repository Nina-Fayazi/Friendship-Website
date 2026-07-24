const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if ((!req.body.content || !req.body.content.trim()) && !req.file) {
      return res.status(400).json({ message: 'Post content or image cannot be empty' });
    }

    const newPostData = {
      content: req.body.content || '',
      user: req.user.id
    };

    if (req.file) {
      newPostData.image = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post(newPostData);
    const savedPost = await newPost.save();
    await savedPost.populate('user', 'username');
    res.json(savedPost);
  } catch (err) {
    console.log("CREATE POST ERROR:", err); 
    res.status(500).json({ error: err.message });
  }
});


router.get('/feed', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = { user: req.user.id, text: req.body.text };
    post.comments.push(newComment);
    await post.save();
    await post.populate('comments.user', 'username');
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    comment.text = req.body.text;
    await post.save();
    await post.populate('comments.user', 'username');
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments = post.comments.filter((c) => c._id.toString() !== req.params.commentId);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    post.content = req.body.content;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;