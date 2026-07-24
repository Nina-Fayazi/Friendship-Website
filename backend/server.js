const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));


const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter); 

const postRouter = require('./routes/posts'); 
app.use('/api/posts', postRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);


app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});