const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');


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
    
    
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

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

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

   
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

module.exports = router;