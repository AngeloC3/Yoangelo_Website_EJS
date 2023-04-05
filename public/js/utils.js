const Countdown = require('../../models/Countdown');
const Notification = require('../../models/Notification');
const TodoItem = require('../../models/TodoItem');
const User = require('../../models/User');
const Wishlist = require('../../models/Wishlist');


const findUserByIdAndUpdateReqSession = async (id, req) => {
    const user = await User.findByIdAndUpdate(id);
    req.session.hasPair = user.pairId !== null;
    return user;
}

const todoTypeToTitle = (type) => {
    const words = type.split("_");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(" ");
  };

const makeNextError = (msg, code, next) => {
    const error = new Error(msg);
    error.status = code;
    return next(error);
}

// countdown notif todo wishlist
const deleteAllUsersCreations = async(id) => {
    await Countdown.deleteMany({'creatorInfo.creatorId': id});
    // delete where id is sender or recipient
    await TodoItem.deleteMany({'creatorInfo.creatorId': id});
    await Wishlist.deleteMany({'creatorInfo.creatorId': id});
}

module.exports = {
    findUserByIdAndUpdateReqSession,
    todoTypeToTitle,
    makeNextError,
}