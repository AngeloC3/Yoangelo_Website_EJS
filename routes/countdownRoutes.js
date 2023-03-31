const router = require('express').Router();
const Countdown = require('../models/Countdown');
const User = require('../models/User');

router.get('/', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    res.locals.countdowns = await Countdown.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}})
        .sort({endsAt: 1});
    res.locals.page_title = "Countdowns";
    res.locals.addRoute = "idkyetCountdownAdd";
    const success = req.flash('success');
    res.render('lists/listContainer', {success, innerList: "countdowns"});
});

module.exports = router;