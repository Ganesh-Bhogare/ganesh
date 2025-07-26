// Core Modules
const path = require('path');

// External Modules
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// MongoDB connection URI
const MONGO_DB_URL = "mongodb+srv://ganesh:ganesh2450@ganeshdatabase.nskudfr.mongodb.net/airbnb?retryWrites=true&w=majority&appName=GaneshDatabase";

// Local Modules
const rootDir = require('./utils/pathUtil');
const userRouter = require('./routes/userRouter');
const { hostRouter } = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const storeController = require('./controllers/storeController');

const app = express();

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Session Store
const store = new MongoDBStore({
  uri: MONGO_DB_URL,
  collection: 'sessions'
});

// Random string generator for file names
function randomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "_" + file.originalname);
  }
});


// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage }).single('photo'));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(rootDir, 'uploads')));
// app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')));
// app.use("/user/uploads", express.static(path.join(rootDir, 'uploads')));


// Session Middleware
app.use(session({
  secret: 'ganesh website',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Pass login status to all views
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// Routes
app.use(userRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}, hostRouter);
app.use(authRouter);

// 404 Controller
app.use(storeController.get404);

// Start Server
const PORT = process.env.PORT || 3000;
mongoose.connect(MONGO_DB_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });
