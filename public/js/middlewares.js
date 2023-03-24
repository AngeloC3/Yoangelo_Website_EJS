const Notification = require('../../models/Notification')
const User = require('../../models/User')

devMode = true;

// middleware
const set_locals = async (req,res,next) => {
    if (devMode && !req.username) {
        req.session.user = await User.findOne({email: "user1@fake.com"})
        req.session.username = req.session.user.username;
    }
    if (req.session.username) {
        res.locals.loggedIn = true;
        res.locals.username = req.session.username;
        res.locals.user = req.session.user;
        res.locals.hasPartner = req.session.user.partnerId !== null;
        res.locals.notifNum = await Notification.countDocuments({recipientId: req.session.user._id})
    } else {
        res.locals.loggedIn = false;
        res.locals.username = null;
        res.locals.user = null;
    }
    next();
};

const req_login = (req,res,next) => {
    if (res.locals.loggedIn) {
        next()
    }
    else res.redirect('/login')
}

module.exports = {
    set_locals,
    req_login,
}