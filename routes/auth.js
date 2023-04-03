const router = require('express').Router();
const User = require('../models/User');
const passport = require("passport");

const req_not_login = (req,res,next) => {
    if (!res.locals.loggedIn) {
        next()
    }
    else res.redirect('/')
}

router.use(['/login', '/signup'], req_not_login);

router.get('/login', (req, res) => {
    res.locals.error = req.flash('error');
    res.render("forms/formContainer", {form: "loginForm"});
});

router.post('/login', passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Incorrect login.",
    successRedirect: "/",
}));

router.get('/signup', (req, res) => {
    res.locals.error = req.flash('error');
    res.render("forms/formContainer", {form: "signupForm"});
});

router.post('/signup', (req, res) => {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
        req.flash("error", "Please fill out all fields.");
        res.redirect("/signup");
        return;
    }
    const newUser = {
        username: username,
        email: email,
    };
    User.register(newUser, password, (error, user) => {
        if (user) {
          req.flash(
            "success",
            `${user.username}'s account created successfully!`
          );
          res.redirect("/");
        } else {
          req.flash(
            "error",
            `Failed to create user account because: ${error.message}.`
          );
          res.redirect("/login");
        }
      });
});

module.exports = router;
