const Notification = require('../../models/Notification')
const User = require('../../models/User')
const ObjectId = require('mongoose').Types.ObjectId;
const isValidMongooseId = ObjectId.isValid;

devMode = true;

// sets local that are needed constantly
const set_locals = async (req,res,next) => {
    if (devMode && !req.session.userId) {
        const user = await User.findOne({email: "user1@fake.com"});
        req.session.userId = user._id;
    }
    if (req.session.userId) {
        res.locals.loggedIn = true;
        req.session.userId = new ObjectId(req.session.userId); // session saves as a string this converts back
        // get # of notifs and unread notifs --> error if there are none
        try{
            const notifs = await Notification.aggregate(getReadVsUnreadPipeline(req.session.userId));
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
        res.locals.hasPartner = req.session.hasPartner;
    } else {
        res.locals.loggedIn = false;
        res.locals.notifNums = {}
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

// checks that the paramId is a valid Mongoose Id, and if not --> error
const checkParamId = (paramName) => {
    return (req, res, next) => {
        const paramVal = req.params[paramName];
        if (!isValidMongooseId(paramVal)){
            const error = new Error('Invalid ID in Route');
            error.status = 400;
            return next(error);
        }
        next();
    }
}

// checks if the todoType is valid
const checkTodoType = async (req, res, next) => {
    const user = await User.findById(req.session.userId);
    const todoType = req.params.todoType;
    if (!user.todoTypes.includes(todoType)){
        const error = new Error(`This Todo List (${todoType}) Does not Exist`);
        error.status = 400;
        return next(error);
    }
    next();
}

module.exports = {
    set_locals,
    req_login,
    checkParamId,
    checkTodoType,
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