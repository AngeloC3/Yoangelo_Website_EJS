const router = require('express').Router();
const User = require('../models/User')
const Notification = require('../models/Notification')
const bcrypt = require("bcrypt");

// middleware
router.use(async (req,res,next) => {
    if (req.session.username) {
        res.locals.loggedIn = true;
        res.locals.username = req.session.username;
        res.locals.user = req.session.user;
        res.locals.hasPartner = req.session.user.partnerId !== null;
        res.locals.notifNum = await Notification.countDocuments({userId: req.session.user.id})
    } else {
        res.locals.loggedIn = false;
        res.locals.username = null;
        res.locals.user = null;
    }
    next();
  });

// self auth

router.get('/login', (req, res) => {
    if (req.query.incorrect_login == 'true'){
        res.locals.incorrect_login = true
      }
    res.render("forms/formTemplate", {form: "loginForm"});
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email:email})
    let isMatch = false;
    if (user !== null){
        isMatch = await bcrypt.compare(password, user.password);
    }
    if (isMatch) {
        req.session.username = user.username
        req.session.email = email
        req.session.user = user
        res.redirect('/')
      } else {
        req.session.username = null
        req.session.emnail = null
        req.session.user = null
        res.redirect('login' + '/?incorrect_login=' + true)
      }
})

router.get('/signup', (req, res) => {
    if (req.query.unavailable_email == 'true'){
        res.locals.unavailable_email = true
      }
    res.render("forms/formTemplate", {form: "signupForm"});
})

router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const found = await User.findOne({ email: email })
    if (found) {
        res.redirect('/signup' + '/?unavailable_email=' + true)
    } else {
        const user = new User(
            {
                username: username,
                email: email,
                password: hashedPassword,
                partnerId: null,
            })
        await user.save()
        req.session.username = user.username
        req.session.email = user.email
        req.session.user = user
        res.redirect('/')
    }
})


// partner auth

router.get('/set_partner', (req, res) => {
    
})

module.exports = router;
