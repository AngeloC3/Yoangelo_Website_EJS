const router = require('express').Router();
const TodoItem = require('../models/TodoItem');
const User = require('../models/User');

router.get('/:todoType', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    res.locals.item_list = await TodoItem.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType });
    res.locals.list_name = "bucket list"
    res.locals.addRoute = "/bucketlist/add"
    res.locals.setCompletedRoute = '/bucketlist/setCompleted/REPLACE-ELEM/true'
    res.locals.setUncompletedRoute = '/bucketlist/setCompleted/REPLACE-ELEM/false'
    res.locals.deleteRoute = '/bucketlist/delete/REPLACE-ELEM'
    res.render("todo");
})

module.exports = router;

