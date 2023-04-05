// basic imports, uses, and sets
const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
app.use(layouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static( __dirname + '/public'));
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");
if (process.env.NODE_ENV === 'development') require('dotenv').config(); // so the env variables work 
const port = process.env.PORT

// setting up mongoose
const mongoose = require('mongoose');
const dbName = 'yoangelo_website_db';
const mongodb_URI = process.env.MONGODB_URI
mongoose.connect(mongodb_URI, {
    dbName: dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

// setting up session
const session = require("express-session"); // to handle sessions
// const MongoDBStore = require('connect-mongodb-session')(session);
// store = new MongoDBStore({
//   uri: mongodb_URI + dbName,
//   collection: 'user_sessions'
// });
// // Catch errors
// store.on('error', function(error) {
//   console.log(error);
// });
// create session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
    },
    //store: store,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
  })
);
const cookieParser = require("cookie-parser"); // to handle cookies
app.use(cookieParser());

// setting up passport
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
const {setUpGooglePassport, setUpLocalPassport, setUpPassportSerializers} = require("./config/passport-config")
// local strategy
setUpLocalPassport(passport);
// google
setUpGooglePassport(passport);
// serializers
setUpPassportSerializers(passport);

// get middleware
const { set_locals, req_login, checkTodoType, checkForNotifAndDelete} = require("./public/js/middlewares");

// fully accessible routes and middleware
app.use(require('connect-flash')());
app.use(set_locals);
app.use(checkForNotifAndDelete);
app.use('/auth', require("./routes/auth"));
app.get("/", (req, res) => {
  res.render("home");
});

// log in only routes
app.use("/pair", req_login, require("./routes/pairRoutes"));
app.use("/notifications", req_login, require("./routes/notificationRoutes"));
app.use("/manage-todos", req_login, require('./routes/manageTodosRoutes'))
app.use("/todos/:todoType", req_login, checkTodoType, require('./routes/todoRoutes'));
app.use("/countdowns", req_login, require('./routes/countdownRoutes'));
app.use("/wishlist", req_login, require('./routes/wishlistRoutes'))
app.use("/profile", req_login, require('./routes/profileRoutes'))

// errors
const errorController = require('./controllers/errorController');
app.use(errorController.respondInternalError);
app.use(errorController.respondRouteNotFound);

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });