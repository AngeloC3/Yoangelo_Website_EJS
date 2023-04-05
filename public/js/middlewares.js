const Notification = require('../../models/Notification')
const User = require('../../models/User')
const ObjectId = require('mongoose').Types.ObjectId;
const isValidMongooseId = ObjectId.isValid;
const { makeNextError } = require('./utils');

devMode = false;

// sets local that are needed constantly
const set_locals = async (req,res,next) => {
    if (devMode && !req.user) {
        const user = await User.findOne({email: "user1@fake.com"});
        if (user) req.user = user._id;
    }
    res.locals.loggedIn = req.isAuthenticated();
    if (req.user) {
        req.user = new ObjectId(req.user); // session saves as a string this converts back
        // get # of notifs and unread notifs --> error if there are none
        try{
            const notifs = await Notification.aggregate(getReadVsUnreadPipeline(req.user));
            const {notifTotal, notifUnreadTotal} = notifs[0];
            res.locals.notifNums = {
                notifTotal: notifTotal,
                notifUnreadTotal: notifUnreadTotal
            }
        } catch (error) {
            res.locals.notifNums = {
                notifTotal: 0,
                notifUnreadTotal: 0
            }
        }
        res.locals.hasPair = req.session.hasPair;
    } else {
        res.locals.notifNums = {}
    }
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
};

// requires that the user is logged in
const req_login = (req,res,next) => {
    if (res.locals.loggedIn) {
        next()
    }
    else res.redirect('/auth/login')
}

// checks that the paramId is a valid Mongoose Id, and if not --> error
const checkParamId = (paramName) => {
    return (req, res, next) => {
        const paramVal = req.params[paramName];
        if (!isValidMongooseId(paramVal)){
            return makeNextError('Invalid ID in Route', 400, next);
        }
        next();
    }
}

// checks if the todoType is valid
const checkTodoType = async (req, res, next) => {
    const user = await User.findById(req.user);
    const todoType = req.params.todoType;
    if (!user.todoTypes.includes(todoType)){
        return makeNextError(`This Todo List (${todoType}) Does not Exist`, 400, next);
    }
    next();
}

// checks for the viewnotif query and marks it as viewed if it exists and changes the local unread val
const checkForNotifAndDelete = async (req, res, next) => {
    const notifId = req.query.viewNotifId;
    if (notifId){
        const relatedNotif = await Notification.findByIdAndUpdate(notifId, {viewed: true}, {new: false});
        if (relatedNotif && !relatedNotif.viewed){
            res.locals.notifNums.notifUnreadTotal -= 1;
        }
    }
    next();
}

module.exports = {
    set_locals,
    req_login,
    checkParamId,
    checkTodoType,
    checkForNotifAndDelete, 
}

// helpers

const getReadVsUnreadPipeline = (userId) => {
    return [
        {
          $match: { recipientId: userId },
        },
        {
          $group:
            {
              _id: null,
              notifTotal: {
                $sum: 1
              },
              notifUnreadTotal: {
                $sum: {
                  $cond: [ {$eq: ["$viewed", false] }, 1, 0]
                },
              },
            },
        },
      ]
}