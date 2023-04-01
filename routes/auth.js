const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require("bcrypt");

const req_not_login = (req,res,next) => {
    if (!res.locals.loggedIn) {
        next()
    }
    else res.redirect('/')
}

router.use(['/login', '/signup'], req_not_login);

// self auth

router.get('/login', (req, res) => {
    const error = req.flash('error');
    res.render("forms/formContainer", {error, form: "loginForm"});
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email:email})
    let isMatch = false;
    if (user !== null){
        isMatch = await bcrypt.compare(password, user.password);
    }
    if (isMatch) {
        req.session.userId = user._id;
        req.session.hasPartner = user.partnerId !== null;
        res.redirect('/');
      } else {
        req.session.userId = null;
        req.flash('error', 'Incorrect Login. Please try again.')
        res.redirect('login')
      }
});

router.get('/signup', (req, res) => {
    const error = req.flash('error');
    res.render("forms/formContainer", {error, form: "signupForm"});
});

router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const found = await User.exists({ email: email })
    if (found) {
        req.flash('error', 'The email address you entered is unavailable. Please try a different email address.')
        res.redirect('/signup');
    } else {
        const user = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
        });
        req.session.userId = user._id;
        req.session.hasPartner = user.partnerId !== null;
        res.redirect('/');
    }
});

module.exports = router;
