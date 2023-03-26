const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");

// partner auth

router.get('/request_pair', (req, res) => {
    if (req.query.invalid_pair == 'true'){
        res.locals.invalid_pair = true;
      }
    res.locals.pair_username = req.query.pair_username;
    res.render("forms/formTemplate", {form: "requestPairForm"});
});

router.post('/request_pair', async (req, res) => {
    const pair_email = req.body.email;
    let pair = false;
    if (pair_email !== req.session.user.email){
        pair = await User.findOne({ email: pair_email })
    }
    if (!pair) {
        res.redirect('/pair/request_pair' + '/?invalid_pair=' + true);
        return;
    }
    await Notification.deleteOne({senderId: req.session.user._id, 'notifDetails.notifType': "pair-request"}).then(() => {
        Notification.create({
            recipientId: pair._id,
            senderId: req.session.user._id,
            notifDetails: {
                notifType: "pair-request",
            }
        });
        res.redirect("/pair/request_pair" + '/?pair_username=' + pair.username);
    })       
});

// partner related views

router.get('/respond_pair_request/:notifId', checkParamId('notifId'), async (req, res) => {
    const pair_request = await Notification.findById(req.params.notifId);
    if (!pair_request){
        res.render("forms/formTemplate", {form: "respondPairRequestForm"});
        return;
    }
    pair = await User.findById(pair_request.senderId);
    pair_username = pair.username;
    pair_email = pair.email;
    res.render("forms/formTemplate", {form: "respondPairRequestForm", pair_username: pair_username, pair_email: pair_email, pair_request: true});
});

router.post('/respond_pair_request/:notifId', checkParamId('notifId'), async (req, res) => {
    const choice = req.body.yesno
    if (choice === "accept"){
        // find the one that you are recipient
        const userId = req.session.user._id;
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
        if (req.session.user.partnerId){
            const ex = await User.findByIdAndUpdate(req.session.user.partnerId, { partnerId: null});
        }
        // connect pairs
        const pair = await User.findByIdAndUpdate(partnerId, { partnerId: userId });
        req.session.user = await User.findByIdAndUpdate(userId, { partnerId: partnerId });
        // send notification saying that it was successfull
        await sendSuccessfulPairAlert(userId, pair.username);
        await sendSuccessfulPairAlert(partnerId, req.session.user.username)
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
