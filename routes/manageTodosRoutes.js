const router = require('express').Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const TodoItem = require('../models/TodoItem');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession, todoTypeToTitle } = require("../public/js/utils");

router.get('/', async(req, res) =>{
    user = await findUserByIdAndUpdateReqSession(req.session.userId, req);
    res.locals.todoTypes = user.todoTypes.sort();
    res.locals.page_title = 'Todo Lists';
    res.locals.addRoute = '/manage-todos/create';
    res.locals.success = req.flash('success');
    res.render('lists/listContainer', {innerList: 'goals'});
});

router.get('/delete/:todoType', async(req, res) => {
    res.locals.todoTitle = todoTypeToTitle(req.params.todoType);
    const user = await findUserByIdAndUpdateReqSession(req.session.userId, req);
    const userId = user._id;
    const partnerId = user.partnerId;
    const numDocuments = await TodoItem.countDocuments({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType});
    let numPhrase = numDocuments + " item";
    if (numDocuments !== 1) numPhrase += "s";
    res.locals.numPhrase = numPhrase;
    res.locals.userId = userId;
    res.locals.partnerId = partnerId;
    res.render('forms/formContainer', {form: 'confirmTodoListDeleteForm'});
});

router.post('/delete/:todoType', async(req, res) => {
    if (!req.body.shouldDelete){
        res.redirect("/manage-todos")
    }
    const user = await findUserByIdAndUpdateReqSession(req.session.userId, req);
    const userId = user._id;
    const pair = await User.findById(user.partnerId);
    const partnerId = pair._id;
    await TodoItem.deleteMany({'creatorInfo.creatorId': {$in: [userId, partnerId]}, todoType: req.params.todoType});
    deleteTodoTypeAndSave(user, req.params.todoType);
    deleteTodoTypeAndSave(pair, req.params.todoType);
    res.redirect('/manage-todos')
});

router.get('/create', async(req, res) => {
    res.render('forms/formContainer', {form: 'addTodoListForm'});
});

router.post('/create', async(req, res) => {
    const title = req.body.title;
    if (!title) {
        const error = new Error('Tried to make a todo list without a title');
        error.status = 400;
        return next(error);
    }
    const todoType = title.split(' ').join('_').toLowerCase() + "_list";
    const user = await findUserByIdAndUpdateReqSession(req.session.userId, req);
    if (user.todoTypes.includes(todoType)) {
        const error = new Error('Todo list with that title already exists');
        error.status = 400;
        return next(error);
    }
    const pair = await User.findById(user.partnerId);
    addTodoTypeAndSave(user, todoType);
    addTodoTypeAndSave(pair, todoType);
    if (user.partnerId){
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