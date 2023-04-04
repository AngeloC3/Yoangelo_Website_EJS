const router = require('express').Router({ mergeParams: true }); // allows /todos/:todoType to be the prefix of all these routes -- made in server.js
const TodoItem = require('../models/TodoItem');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession, todoTypeToTitle } = require("../public/js/utils");

// Every route has param todoType that specifies which type of todo list it is

router.get('/', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const userId = user._id;
    const pairId = user.pairId;
    if (req.query.sortByRating == "true") {
        const todos = await TodoItem.find({'creatorInfo.creatorId': {$in: [userId, pairId]}, todoType: req.params.todoType})
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
            'creatorInfo.creatorId': {$in: [userId, pairId]}, 
            todoType: req.params.todoType 
          }).sort({completed: 1, createdAt: -1});
    }
    res.locals.page_title = todoTypeToTitle(req.params.todoType);
    res.locals.todoType = req.params.todoType;
    res.locals.userId = userId;
    res.locals.addRoute = req.params.todoType + "/add";
    res.render("lists/listContainer", {innerList: "todoList"});
});

router.patch('/change_completed/:todoId', checkParamId("todoId"), async (req, res) => {
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
        .then(async () =>{
            await Notification.findOneAndDelete({'related.relatedId': req.params.todoId}).then(() => {
                res.status(200).send("Todo item successfully deleted");
            });
        });
    } catch (err) {
        res.status(500).send("Todo item failed to delete");
    }
});

router.get('/add', (req, res) => {
    res.locals.todoType = req.params.todoType;
    res.locals.postAction = `/todos/${req.params.todoType}/add`;
    res.locals.page_title = todoTypeToTitle(req.params.todoType);
    res.locals.buttonText = "Add";
    res.locals.titleVal = undefined;
    res.locals.descVal = undefined;
    res.locals.ratingVal = 0;
    res.locals.rateOnly = false;
    res.render("forms/formContainer", {form: "add-modifyTodoForm"});
});

router.post('/add', async (req, res) => {
    const {title, rating} = req.body;
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const description = req.body.description || undefined;
    const new_todo_item = await TodoItem.create({
        creatorInfo: {
            creatorId: req.user,
            creatorName: user.username
        },
        todoType: req.params.todoType,
        title: title,
        description: description,
        creatorRate: rating,
    });
    if (user.pairId){
        await User.findById(user.pairId).then(async (pair) => {
            await Notification.create({
                recipientId: pair._id,
                senderId: user._id,
                notifDetails: {
                    notifType: "new-todo-item",
                    notifMessage: `A new item has been added to your ${todoTypeToSplit(req.params.todoType)}!`,
                },
                related: {
                    relatedSchema: req.params.todoType,
                    relatedId: new_todo_item._id
                }
            });
        });
    }
    req.flash("success", `${title} successfully added!`)
    res.redirect(req.baseUrl)
});

router.get('/modify/:todoId', checkParamId("todoId"), async (req, res, next) => {
    res.locals.todoType = req.params.todoType;
    res.locals.postAction = `/todos/${req.params.todoType}/modify/${req.params.todoId}`;
    res.locals.page_title = todoTypeToTitle(req.params.todoType);
    const todo_item = await TodoItem.findById(req.params.todoId);
    if (!todo_item) {
        const error = new Error('Todo Item Not Found');
        error.status = 400;
        return next(error);
    }
    res.locals.buttonText = "Modify";
    res.locals.titleVal = todo_item.title;
    res.locals.descVal = todo_item.description;
    const userId = req.user;
    if (todo_item.didRate(userId)){
        if (userId.equals(todo_item.creatorInfo.creatorId)){
            res.locals.ratingVal = todo_item.creatorRate;
        } else {
            res.locals.ratingVal = todo_item.pairRate;
        }
    } else {
        res.locals.ratingVal = 0;
    }
    if (req.query.rateOnly === 'true'){
        res.locals.rateOnly = true;
        res.locals.buttonText = "Rate";
    } else {
        res.locals.rateOnly = false;
    }
    res.render("forms/formContainer", {form: "add-modifyTodoForm"});
});

router.post('/modify/:todoId', checkParamId("todoId"), async (req, res) => {
    const {title, rating, description} = req.body;
    const toModify = await TodoItem.findById(req.params.todoId);
    if (!toModify) {
        const error = new Error(`Todo Item Not Found`);
        error.status = 400;
        return next(error);
    }
    if (title) toModify.title = title;
    if (description || toModify.description) toModify.description = description;
    if (req.user.equals(toModify.creatorInfo.creatorId)){
        toModify.creatorRate = rating;
    } else {
        toModify.pairRate = rating;
    }
    await toModify.save();
    req.flash("success", `${title} successfully modified!`)
    res.redirect(req.baseUrl)
});

module.exports = router;


// helpers

const todoTypeToSplit = (type) => {
    return type.split("_").join(" ");
}