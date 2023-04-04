const router = require('express').Router();
const User = require('../models/User');
const passport = require("passport");

const req_not_login = (req,res,next) => {
    if (!res.locals.loggedIn) {
        next()
    }
    else res.redirect('/')
}

router.use(['/login', '/signup', '/auth'], req_not_login);

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
          // authenticates if account is created
          passport.authenticate('local')(req, res, () => {
            res.redirect('/');
          });
        } else {
          req.flash(
            "error",
            `Failed to create user account because: ${error.message}.`
          );
          res.redirect("/login");
        }
      });
});

// google auth
router.get("/auth/google", passport.authenticate("google", 
  { scope: ["email", "profile"] }
));
// Retrieve user data using the access token received</em> 
router.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: "Google login failed",
    successRedirect: "/",
  }
));

module.exports = router;
