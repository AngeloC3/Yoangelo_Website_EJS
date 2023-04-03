const router = require('express').Router();
const Countdown = require('../models/Countdown');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession, checkForNotifAndDelete } = require("../public/js/utils");

router.get('/', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const userId = user._id;
    const partnerId = user.partnerId;
    await Countdown.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}})
    .then((countdowns) => {
        res.locals.countdowns = countdowns.sort((a, b) => {
            if (a.isInPast() && !b.isInPast()){
                return 1;
            }
            if (b.isInPast() && !a.isInPast()){
                return -1;
            }
            return new Date(a.endsAt) - new Date(b.endsAt);
        });
    }).catch((err) => {
        console.log(err);
        res.locals.countdowns = [];
    });
    
    res.locals.page_title = "Countdowns";
    res.locals.addRoute = "countdowns/add";
    res.locals.success = req.flash('success');
    await checkForNotifAndDelete(req.query.viewNotifId, res);
    res.render('lists/listContainer', {innerList: "countdowns"});
});

router.get('/add', (req, res) =>{
    res.render("forms/formContainer", {form: "addCountdownForm"})
});

router.post('/add', async (req, res) => {
    const {title, date} = req.body;
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const new_countdown_item = await Countdown.create({
        creatorInfo: {
            creatorId: user._id,
            creatorName: user.username
        },
        title: title,
        endsAt: date
    });
    if (user.partnerId){
        await User.findById(user.partnerId).then(async (pair) => {
            await Notification.create({
                recipientId: pair._id,
                senderId: user._id,
                notifDetails: {
                    notifType: "new-countdown",
                },
                related: {
                    relatedSchema: 'Countdown',
                    relatedId: new_countdown_item._id
                }
            });
        });
    }
    req.flash("success", `${title} successfully added!`);
    res.redirect(req.baseUrl);
});

router.delete('/delete/:countdownId', checkParamId("countdownId"), async (req, res) => {
    try{
        await Countdown.findByIdAndRemove(req.params.countdownId)
        .then(async () =>{
            await Notification.findOneAndDelete({'related.relatedId': req.params.countdownId}).then(() => {
                res.status(200).send("Countdown successfully deleted");
            });
        });
    } catch (err) {
        res.status(500).send("Countdown item failed to delete");
    }
});

module.exports = router;