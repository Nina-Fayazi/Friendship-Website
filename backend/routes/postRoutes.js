const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getFeed,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  likeComment,
  deleteComment,
  updateComment,
} = require('../controllers/postController');


router.get('/feed', getFeed);


router.post('/create', protect, createPost);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);
router.put('/:postId/like', protect, likePost);


router.post('/:postId/comment', protect, addComment);
router.put('/:postId/comment/:commentId/like', protect, likeComment);
router.put('/:postId/comment/:commentId', protect, updateComment);
router.delete('/:postId/comment/:commentId', protect, deleteComment);

module.exports = router;