const router = require('express').Router();
const Countdown = require('../models/Countdown');
const User = require('../models/User');

router.get('/', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    res.locals.todos = await Countdown.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}})
        .sort({endsAt: 1});
    console.log(res.locals.todos);
    res.render('countdowns');
});

module.exports = router;