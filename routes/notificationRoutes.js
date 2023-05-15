const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");
const { flashAndRedirect } = require("../public/js/utils");

const system_name = "Yoangelo Website"

router.get("/", async (req, res) => {
    const notifs = []
    await Notification.find({recipientId: req.user}).sort({createdAt: -1}).then(async (notifications) => {
        for (const notif of notifications) {
            let senderName = system_name;
            if (notif.senderId){
                const sender = await User.findById(notif.senderId);
                senderName = sender.username;
            }
            const {message, viewRoute, deleteId} = notif.getTypeInfo()
            const notifObj = {
                senderName: senderName,
                message: message,
                viewRoute: viewRoute,
                createdAt: notif.createdAt,
                deleteId: deleteId,
                viewed: notif.viewed
            }
            notifs.push(notifObj);
        }
    });
    res.render("notifications", {notifs: notifs});
});

router.delete("/delete/all", async (req, res) => {
    try {
      const { user, params } = req;
      const { type } = params;
  
      const notifQuery = { recipientId: user };
      let readOnly = false;
  
      if (req.query.readOnly === "true") {
        notifQuery.viewed = true;
        readOnly = true;
      }
  
      // Delete notifications based on the condition
      await Notification.deleteMany(notifQuery);
  
      // Set the appropriate success message based on the type
      const successMessage = readOnly ? "All read notifications successfully deleted" : "All notifications successfully deleted";
  
      // Flash success message and redirect
      flashAndRedirect(req, res, "success", successMessage, "/notifications");
    } catch (error) {
      // Flash error message and redirect
      const failureMessage = req.query.readOnly === "true" ? "Read notifications failed to delete" : "Notifications failed to delete";
      flashAndRedirect(req, res, "error", failureMessage, "/notifications");
    }
  });

// does not need to redirect because the delete request is done in js not ejs
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