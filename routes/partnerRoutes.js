const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// partner auth

router.get('/request_pair', (req, res) => {
    if (req.query.invalid_pair == 'true'){
        res.locals.invalid_pair = true;
      }
    if (req.query.success == 'true'){
        res.locals.success = true;
    }
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
            })
            pair_username = pair.username;
            res.redirect("/request_pair" + '/?success=' + true);
        })
        
    }
});

// partner related views

router.get("/notifications", (req, res) => {
    res.render("notifications");
});

module.exports = router;
