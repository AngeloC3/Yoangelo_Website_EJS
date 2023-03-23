const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

// setting up mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/yoangelo_website', { useNewUrlParser: true });



app.get("/", (req, res) => {
    res.send("Home Page: unfinished");
})
app.get("/test", (req, res) => {
    res.send("TEST");
})


app.listen(port, () => {console.log(`Server started on port ${port}`)})