const Notification = require('../../models/Notification')
const User = require('../../models/User')
const isValidMongooseId = require('mongoose').Types.ObjectId.isValid;

devMode = true;

// sets local that are needed constantly
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

// requires that the user is logged in
const req_login = (req,res,next) => {
    if (res.locals.loggedIn) {
        next()
    }
    else res.redirect('/login')
}

// cchecks that the paramId is a valid Mongoose Id, and if not --> error
const checkParamId = (paramName) => {
    return (req, res, next) => {
        const paramVal = req.params[paramName];
        if (!isValidMongooseId(paramVal)){
            const error = new Error(`Invalid ID in Route`);
            error.status = 400;
            return next(error);
        }
        next();
    }
}

module.exports = {
    set_locals,
    req_login,
    checkParamId,
}