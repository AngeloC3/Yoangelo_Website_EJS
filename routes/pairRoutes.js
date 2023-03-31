const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession } = require("../public/js/utils");

// partner auth

router.get('/request_pair', (req, res) => {
    const error = req.flash('error');
    const success = req.flash('success');
    res.render("forms/formTemplate", {form: "requestPairForm", error, success});
});

router.post('/request_pair', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.session.userId, req)
    const pair_email = req.body.email;
    let pair = false;
    if (pair_email !== user.email){
        pair = await User.findOne({ email: pair_email })
    }
    if (!pair) {
        req.flash('error', "The given email does not exist");
        res.redirect('request_pair');
        return;
    }
    await Notification.deleteOne({senderId: user._id, 'notifDetails.notifType': "pair-request"}).then(() => {
        Notification.create({
            recipientId: pair._id,
            senderId: user._id,
            notifDetails: {
                notifType: "pair-request",
            }
        });
    req.flash('success', `Your pair request was successfully sent to ${pair.username}!`);
    res.redirect("request_pair");
    })       
});

// partner related views

router.get('/respond_pair_request/:notifId', checkParamId('notifId'), async (req, res) => {
    // returns the non-updated pair request
    const pair_request = await Notification.findByIdAndUpdate(req.params.notifId, {viewed: true}, { new: false}); 
    if (!pair_request){
        res.render("forms/formTemplate", {form: "respondPairRequestForm"});
        return;
    }
    // if the pair request wasn't viewed prior to this, decrement the amount of unread notifs
    if (!pair_request.viewed){
        res.locals.notifNums.notifUnreadTotal -= 1;
    }
    pair = await User.findById(pair_request.senderId);
    pair_username = pair.username;
    pair_email = pair.email;
    res.render("forms/formTemplate", {form: "respondPairRequestForm", pair_username: pair_username, pair_email: pair_email, pair_request: true});
});

router.post('/respond_pair_request/:notifId', checkParamId('notifId'), async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.session.userId, req)
    const choice = req.body.yesno
    if (choice === "accept"){
        // find the one that you are recipient
        const userId = user._id;
        const pair_request = await Notification.findById(req.params.notifId);
        const partnerId = pair_request.senderId
        // delete all pair requests involving you or the partner
        await Notification.deleteMany({ 
            $and: [
              { 'notifDetails.notifType': 'pair-request' },
              { $or: [ { recipientId: partnerId }, { recipientId: userId }, { senderId: partnerId }, {senderId: userId} ] }
            ]
          });
        // if you have a current partner -- make their current partner null, and yours will change
        if (user.partnerId){
            const ex = await User.findByIdAndUpdate(user.partnerId, { partnerId: null});
        }
        // connect pairs
        const pair = await User.findByIdAndUpdate(partnerId, { partnerId: userId });
        await User.findByIdAndUpdate(userId, { partnerId: partnerId });
        req.session.hasPartner = true;
        // send notification saying that it was successfull
        await sendSuccessfulPairAlert(userId, pair.username);
        await sendSuccessfulPairAlert(partnerId, user.username)
    } else {
        await Notification.findByIdAndDelete(req.params.notifId);
    }
    res.redirect("/notifications");
}); 

// pair specific functions

const sendSuccessfulPairAlert = async (recipientId, pair_name) => {
    await Notification.create({
        recipientId: recipientId,
        notifDetails: {
            notifType: "system",
            notifMessage: "You have successfully paired with " + pair_name + "!"
        }
    });
}

module.exports = router;
