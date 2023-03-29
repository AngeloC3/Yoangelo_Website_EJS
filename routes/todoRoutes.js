const router = require('express').Router({ mergeParams: true }); // allows /todos/:todoType to be the prefix of all these routes -- made in server.js
const TodoItem = require('../models/TodoItem');
const User = require('../models/User');

// Every route has param todoType that specifies which type of todo list it is

router.get('/', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    res.locals.todos = await TodoItem.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType });
    res.locals.page_title = todoTypeToTitle(req.params.todoType);
    res.render("todo");
})

module.exports = router;


// helpers

const todoTypeToTitle = (type) => {
    const words = type.split("_");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(" ");
  }