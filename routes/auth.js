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
    res.render("forms/formContainer", {form: "loginForm"});
});

router.post('/login', passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Incorrect login.",
    successRedirect: "/",
}));

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out!");
    res.redirect("/")
  });
});

router.get('/signup', (req, res) => {
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
            'Account created successfully!'
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
