// basic imports, uses, and sets
const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
app.use(layouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const port = process.env.PORT || 5000;

// setting up session
const session = require("express-session"); // to handle sessions using cookies
app.use(
    session({
      secret: process.env.session_secret || "thisismysecrctekeyfhrgfgrfrty84fwir767",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
      resave: false,
      saveUninitialized: false
    })
  );

// setting up mongoose
const mongoose = require('mongoose');
const mongodb_URI = 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'yoangelo_website_db',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

// fully accessible routes and middleware
app.use(require("./public/js/middlewares").set_locals)
app.use(require("./routes/auth"));
app.get("/", (req, res,) => {
  res.render("blank");
});

// log in only routes
app.use(require("./public/js/middlewares").req_login);
app.use("/pair", require("./routes/pairRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));
app.use("/todos", require('./routes/todoRoutes'));

// errors
const errorController = require('./controllers/errorController');
app.use(errorController.respondInternalError);
app.use(errorController.respondRouteNotFound);

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Listening on ${url}`);
  });