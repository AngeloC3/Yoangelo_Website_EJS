const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");

const system_name = "Yoangelo Website"

router.get("/", async (req, res) => {
    const user = req.session.user;
    const notifs = []
    await Notification.find({recipientId: user._id}).then(async (notifications) => {
        for (const notif of notifications) {
            let senderName = system_name;
            if (notif.senderId){
                const sender = await User.findById(notif.senderId);
                senderName = sender.username;
            }
            const {message, viewRoute, deleteRoute} = notif.getTypeInfo()
            const notifObj = {
                senderName: senderName,
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

router.get("/delete/:notifId", checkParamId("notifId"), async (req, res) => {
    await Notification.findByIdAndRemove(req.params.notifId);
    res.redirect("/notifications");
})

module.exports = router;