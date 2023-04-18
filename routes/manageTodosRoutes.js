const router = require('express').Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const TodoItem = require('../models/TodoItem');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession, todoTypeToTitle, makeNextError } = require("../public/js/utils");

router.get('/', async(req, res) =>{
    user = await findUserByIdAndUpdateReqSession(req.user, req);
    res.locals.todoTypes = user.todoTypes.sort();
    res.locals.page_title = 'Todo Lists';
    res.locals.addRoute = '/manage_todos/create';
    res.render('lists/listContainer', {innerList: 'goals'});
});

router.get('/delete/:todoType', async(req, res) => {
    res.locals.todoTitle = todoTypeToTitle(req.params.todoType);
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const userId = user._id;
    const pairId = user.pairId;
    const numDocuments = await TodoItem.countDocuments({'creatorInfo.creatorId': {$in: [userId, pairId]}, todoType: req.params.todoType});
    let numPhrase = numDocuments + " item";
    if (numDocuments !== 1) numPhrase += "s";
    res.locals.numPhrase = numPhrase;
    res.locals.userId = userId;
    res.locals.pairId = pairId;
    res.render('forms/formContainer', {form: 'confirmTodoListDeleteForm'});
});

router.post('/delete/:todoType', async(req, res) => {
    if (!req.body.shouldDelete){
        res.redirect("/manage_todos")
    }
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const userId = user._id;
    const pair = await User.findById(user.pairId);
    const pairId = pair._id;
    await TodoItem.deleteMany({'creatorInfo.creatorId': {$in: [userId, pairId]}, todoType: req.params.todoType});
    deleteTodoTypeAndSave(user, req.params.todoType);
    deleteTodoTypeAndSave(pair, req.params.todoType);
    await Notification.findOneAndDelete({'related.relatedParam': req.params.todoType, senderId: { $in: [userId, pairId] }, recipientId: { $in: [userId, pairId] }});
    res.redirect('/manage_todos')
});

router.get('/create', async(req, res) => {
    res.render('forms/formContainer', {form: 'addTodoListForm'});
});

router.post('/create', async(req, res) => {
    const title = req.body.title;
    if (!title) {
        return makeNextError('Tried to make a todo list without a title', 400, next);
    }
    const todoType = title.split(' ').join('_').toLowerCase() + "_list";
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    if (user.todoTypes.includes(todoType)) {
        req.flash("error", `Todo list with title - ${title} - already exists`);
        res.redirect("/manage_todos");
        return;
    }
    addTodoTypeAndSave(user, todoType);
    if (user.pairId){
        const pair = await User.findById(user.pairId);
        addTodoTypeAndSave(pair, todoType);
        await Notification.create({
            recipientId: pair._id,
            senderId: user._id,
            notifDetails: {
                notifType: "new-todo-list",
                notifMessage: `A new todo list called ${toTitleCase(title)} List has been created!`,
            },
            related: {
                relatedParam: todoType
            }
        });
    }
    req.flash("success", `${title} successfully created!`)
    res.redirect('/todos/' + todoType);
});

module.exports = router;

// helpers
const deleteTodoTypeAndSave = async(user, type) => {
    let types = user.todoTypes;
    const index = types.indexOf(type);
    if (index > -1) { 
        types.splice(index, 1);
        user.todoTypes = types;
        await user.save();
    }
};

const addTodoTypeAndSave = async(user, type) => {
    user.todoTypes.push(type);
    await user.save();
};

const toTitleCase = (str) =>{
    let words = str.toLowerCase().split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(" ");
}