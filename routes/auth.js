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
    if (req.query.incorrect_login == 'true'){
        res.locals.incorrect_login = true;
      }
    res.render("forms/formTemplate", {form: "loginForm"});
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email:email})
    let isMatch = false;
    if (user !== null){
        isMatch = await bcrypt.compare(password, user.password);
    }
    if (isMatch) {
        req.session.username = user.username;
        req.session.user = user;
        res.redirect('/');
      } else {
        req.session.username = null;
        req.session.user = null;
        res.redirect('login' + '/?incorrect_login=' + true)
      }
});

router.get('/signup', (req, res) => {
    if (req.query.unavailable_email == 'true'){
        res.locals.unavailable_email = true;
      }
    res.render("forms/formTemplate", {form: "signupForm"});
});

router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const found = await User.exists({ email: email })
    if (found) {
        res.redirect('/signup' + '/?unavailable_email=' + true);
    } else {
        const user = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
        });
        req.session.username = user.username;
        req.session.user = user;
        res.redirect('/');
    }
});

module.exports = router;
