const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));

// Routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter); 

const postRouter = require('./routes/posts'); 
app.use('/api/posts', postRouter);

// 🌟 ثبت روت کاربران در جای درست (قبل از listen)
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Root Route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start Server (همیشه باید انتهای فایل باشد)
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});