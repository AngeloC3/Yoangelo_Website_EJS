const router = require('express').Router();
const TodoItem = require('../models/TodoItem');
const User = require('../models/User');

router.get('/:todoType', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    res.locals.todos = await TodoItem.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType });
    res.render("todo");
})

module.exports = router;

