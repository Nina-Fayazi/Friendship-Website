const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already exists" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await User.create(newUser);
    
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
   
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    res.status(200).json({
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// دریافت اطلاعات یک کاربر مشخص بر اساس ID (برای صفحه پروفایل)
router.get('/user/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ویرایش پروفایل کاربر (Username و Bio)
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    // پیدا کردن کاربر با استفاده از آیدی موجود در توکن (req.userId یا req.user)
    const userId = req.userId || req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // اگر یوزرنیم جدیدی وارد شده بود، بررسی کنیم تکراری نباشد
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;