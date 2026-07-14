const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');


router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    
    const savedUser = await User.create(newUser);
    
    
    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;