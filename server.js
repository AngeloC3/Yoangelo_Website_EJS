const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
app.use(layouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const port = process.env.PORT || 5000;

// setting up mongoose
const mongoose = require('mongoose');
const mongodb_URI = 'mongodb://localhost/yoangelo_website'
//mongoose.connect(mongodb_URI, { useNewUrlParser: true });



app.get("/", (req, res) => {
    res.render('blank');
})

// route imports
app.use(require('./routes/watchlistRoutes'))

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Listening on ${url}`);
  });