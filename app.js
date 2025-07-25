// Core Module
const path = require('path');

// External Module
const express = require('express');
const multer = require('multer')

const MONGO_DB_URL = "mongodb+srv://ganesh:ganesh2450@ganeshdatabase.nskudfr.mongodb.net/airbnb?retryWrites=true&w=majority&appName=GaneshDatabase";

//Local Module
const userRouter = require("./routes/userRouter")
const { hostRouter } = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new mongodbStore({
  uri: MONGO_DB_URL,
  collection: 'sessions'
});

function randomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "_" + file.originalname);
  }
})

app.use(express.urlencoded());
app.use(multer({ storage }).single('photo'));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))
// app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')))


app.use(session({
  secret: 'ganesh website',
  resave: false,
  saveUninitialized: true,
  store: store
}))
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
})
app.use(userRouter);
app.use("/host", hostRouter);

app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect('/auth/login');
  }
});

app.use(authRouter);


const storeController = require('./controllers/storeController');
const { default: mongoose } = require('mongoose');

app.use(storeController.get404);

const PORT = 3000;
mongoose.connect(MONGO_DB_URL, { ssl: true }).then(() => {
  console.log("Database connected successfully");
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

