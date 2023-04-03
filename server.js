// basic imports, uses, and sets
const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
app.use(layouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
require('dotenv').config(); // so the env variables work 
const port = process.env.PORT || 5000;

// setting up mongoose
const mongoose = require('mongoose');
const dbName = 'yoangelo_website_db';
const mongodb_URI = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

// setting up session
const session = require("express-session"); // to handle sessions
const MongoDBStore = require('connect-mongodb-session')(session);
let store;
const storedCookies = false;
if (storedCookies){
  store = new MongoDBStore({
    uri: mongodb_URI + dbName,
    collection: 'sessions'
  });
  // Catch errors
  store.on('error', function(error) {
    console.log(error);
  });
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisismysecrctekeyfhrgfgrfrty84fwir767",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false
  })
);
const cookieParser = require("cookie-parser"); // to handle cookies
app.use(cookieParser());

// setting up passport
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
const User = require('./models/User')
passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  done(null, id);
});
passport.deserializeUser(User.deserializeUser());

// fully accessible routes and middleware
app.use(require('connect-flash')());
app.use(require("./public/js/middlewares").set_locals);
app.use(require("./routes/auth"));
app.use("/password", require('./routes/passwordResetRoutes'))
app.get("/", (req, res,) => {
  res.render("home");
});

// log in only routes
app.use(require("./public/js/middlewares").req_login);
app.use("/pair", require("./routes/pairRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));
app.use("/manage-todos", require('./routes/manageTodosRoutes'))
app.use("/todos/:todoType", require("./public/js/middlewares").checkTodoType, require('./routes/todoRoutes'));
app.use("/countdowns", require('./routes/countdownRoutes'));
app.use("/wishlist", require('./routes/wishlistRoutes'))

// errors
const errorController = require('./controllers/errorController');
app.use(errorController.respondInternalError);
app.use(errorController.respondRouteNotFound);

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Listening on ${url}`);
  });