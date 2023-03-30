const router = require('express').Router({ mergeParams: true }); // allows /todos/:todoType to be the prefix of all these routes -- made in server.js
const TodoItem = require('../models/TodoItem');
const User = require('../models/User');
const { checkParamId } = require("../public/js/middlewares");
const ObjectId = require('mongoose').Types.ObjectId;
const isValidMongooseId = ObjectId.isValid;

// Every route has param todoType that specifies which type of todo list it is

router.get('/', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const userId = user._id;
    const partnerId = user.partnerId;
    if (req.query.sortByRating == "true") {
        const todos = await TodoItem.find({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType})
        res.locals.todos = todos.sort((a, b) => {
            if (a.completed && !b.completed){
                return 1;
            }
            if (b.completed && !a.completed){
                return -1;
            }
            return b.getAvgRating() - a.getAvgRating();
        });
    } else {
        res.locals.todos = await TodoItem.find({
            'creatorInfo.creatorId': {$in: [userId, partnerId]}, 
            todoType: req.params.todoType 
          }).sort({completed: 1});
    }
    res.locals.page_title = todoTypeToTitle(req.params.todoType);
    res.locals.todoType = req.params.todoType;
    res.render("todo");
});

router.put('/change_completed/:todoId', checkParamId("todoId"), async (req, res) => {
    try {
        const todo = await TodoItem.findById(req.params.todoId);
        todo.completed = !todo.completed;
        await todo.save()
        .then(() =>{
            res.status(200).send("Todo item successfully changed completion");
        });
      } catch (err) {
        res.status(500).send("Todo item failed to change completion");
      }
});

router.delete('/delete/:todoId', checkParamId("todoId"), async (req, res) => {
    try{
        await TodoItem.findByIdAndRemove(req.params.todoId)
        .then(() =>{
            res.status(200).send("Todo item successfully deleted");
        });
    } catch (err) {
        res.status(500).send("Todo item failed to delete");
    }
});

module.exports = router;


// helpers

const todoTypeToTitle = (type) => {
    const words = type.split("_");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(" ");
  };