const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");

const system_name = "Yoangelo Website"

router.get("/", async (req, res) => {
    const notifs = []
    await Notification.find({recipientId: req.session.userId}).sort({createdAt: -1}).then(async (notifications) => {
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
                createdAt: notif.createdAt.toLocaleString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).replace('at', '-'),
                deleteIdRoute: deleteRoute,
                viewed: notif.viewed
            }
            notifs.push(notifObj);
        }
    });
    res.render("notifications", {notifs: notifs});
});

router.delete("/delete/:notifId", checkParamId("notifId"), async (req, res) => {
    try{
        await Notification.findByIdAndRemove(req.params.notifId)
        .then(() =>{
            res.status(200).send("Notification successfully deleted");
        });
    } catch (err) {
        res.status(500).send("Notification failed to delete");
    }
})

module.exports = router;