const User = require('../../models/User');
const Notification = require('../../models/Notification');

const findUserByIdAndUpdateReqSession = async (id, req) => {
    const user = await User.findById(id);
    req.session.hasPartner = user.partnerId !== null;
    return user;
}

const checkForNotifAndDelete = async (notifId, res) => {
    if (notifId){
        const relatedNotif = await Notification.findByIdAndUpdate(notifId, {viewed: true}, {new: false});
        if (relatedNotif && !relatedNotif.viewed){
            res.locals.notifNums.notifUnreadTotal -= 1;
        }
    }
}

module.exports = {
    findUserByIdAndUpdateReqSession,
    checkForNotifAndDelete,
}