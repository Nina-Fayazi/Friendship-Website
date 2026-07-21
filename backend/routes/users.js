const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// میدل‌ور تشخیص کاربر لاگین‌شده
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

// 1. فالو کردن
router.put('/:id/follow', auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.includes(req.params.id)) {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);

      await currentUser.save();
      await userToFollow.save();
    }

    res.json({ message: 'User followed', following: currentUser.following });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. انفالو کردن
router.put('/:id/unfollow', auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot unfollow yourself' });
  }

  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed', following: currentUser.following });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;