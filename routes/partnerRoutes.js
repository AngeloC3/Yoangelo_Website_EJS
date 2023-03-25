const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

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
        res.redirect('/request_pair' + '/?invalid_pair=' + true);
    } else {
        await Notification.deleteOne({senderId: req.session.user._id, notifType: "pair request"}).then(() => {
            Notification.create({
                recipientId: pair._id,
                senderId: req.session.user._id,
                notifType: "pair request"
            });
            res.redirect("/request_pair" + '/?pair_username=' + pair.username);
        })
        
    }
});

// partner related views

router.get("/notifications", async (req, res) => {
    const user = req.session.user;
    const notifs = []
    await Notification.find({recipientId: user._id}).then(async (notifications) => {
        for (const notif of notifications) {
            const sender = await User.findById(notif.senderId);
            const {message, viewRoute, deleteRoute} = notif.getTypeInfo()
            const notifObj = {
                senderName: sender.username,
                message: message,
                viewRoute: viewRoute,
                createdAt: notif.createdAt.toLocaleString(),
                deleteIdRoute: deleteRoute
            }
            notifs.push(notifObj);
        }
    });
    res.render("notifications", {notifs: notifs});
});

router.get('/notifications/respond_pair_request', async (req, res) => {
    const pair_request = await Notification.findOne({recipientId: req.session.user._id, notifType: "pair request"})
    res.render("forms/formTemplate", {form: "respondPairRequestForm"});
});

router.post('/notifications/respond_pair_request', (req, res) => {
    const choice = req.body.yesno
    if (choice === "accept"){
        console.log("YAY")
    } else {
        console.log("NAY")
    }
    res.redirect('/notifications/respond_pair_request');
}); 

module.exports = router;
