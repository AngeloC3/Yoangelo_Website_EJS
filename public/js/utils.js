const Countdown = require('../../models/Countdown');
const Notification = require('../../models/Notification');
const TodoItem = require('../../models/TodoItem');
const User = require('../../models/User');
const Wishlist = require('../../models/Wishlist');

const findUserByIdAndUpdateReqSession = async (id, req) => {
    const user = await User.findByIdAndUpdate(id);
    req.session.hasPair = user.pairId !== undefined;
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
    await Notification.deleteMany({
        $or: [
          { recipientId: id },
          { senderId: id }
        ]
      })
      
    await TodoItem.deleteMany({'creatorInfo.creatorId': id});
    await Wishlist.deleteMany({'creatorInfo.creatorId': id});
}

const removeAllPairActions = async(userId, pairId) => {
    await Notification.deleteMany({
        $and: [
          { sender_id: { $in: [userId, pairId] } },
          { recipient_id: { $in: [userId, pairId] } }
        ]
    });
    await TodoItem.updateMany(
        { "creatorInfo.creatorId": { $in: [userId, pairId] } },
        { $unset: { pairRate: "" } }
    );
}

const sendSystemNotif = async(id, msg) => {
    await Notification.create({
        recipientId: id,
        notifDetails: {
            notifType: "system",
            notifMessage: msg
        }
    });
}

const flashAndRedirect = (req, res, status, msg, redirectRoute) => {
    req.flash(status, msg);
    res.redirect(redirectRoute);
    return;
}

module.exports = {
    findUserByIdAndUpdateReqSession,
    todoTypeToTitle,
    makeNextError,
    deleteAllUsersCreations,
    removeAllPairActions,
    sendSystemNotif,
    flashAndRedirect,
}