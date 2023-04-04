const router = require('express').Router();
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession, makeNextError } = require("../public/js/utils");

router.get("/", async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    let [userId, pairId] = [undefined, undefined];
    if (req.query.oneHalf !== 'pair') userId = user._id;
    if (req.query.oneHalf !== 'user') pairId = user.pairId;
    const sortBy = req.query.sortBy || 'createdAt';
    const wishlist = await Wishlist.find({'creatorInfo.creatorId': {$in: [userId, pairId]}})
    .sort({[sortBy]: -1});
    res.locals.wishlist = wishlist;
    res.locals.page_title = "Wishlist";
    res.locals.addRoute = "wishlist/add";
    res.render("lists/listContainer", {innerList: 'wishlist'});
});

router.get('/add', (req, res) => {
    res.locals.postAction = '/wishlist/add';
    res.locals.buttonText = "Add";
    res.locals.titleVal = undefined;
    res.locals.descVal = undefined;
    res.locals.price = undefined;
    res.locals.rating = 0;
    res.locals.url = undefined;
    res.render("forms/formContainer", {form: "add-modifyWishlistForm"});
});

router.post('/add', async (req, res) => {
    const {title, rating} = req.body;
    const description = req.body.description || undefined;
    const price = req.body.price || undefined;
    const url = req.body.url || undefined;
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const new_wishlist_item = await Wishlist.create({
        creatorInfo: {
            creatorId: req.user,
            creatorName: user.username
        },
        todoType: req.params.todoType,
        title: title,
        description: description,
        price: price,
        rating: rating,
        url: url
    });
    if (user.pairId){
        await User.findById(user.pairId).then(async (pair) => {
            await Notification.create({
                recipientId: pair._id,
                senderId: user._id,
                notifDetails: {
                    notifType: "new-wishlist-item",
                },
                related: {
                    relatedSchema: "wishlist",
                    relatedId: new_wishlist_item._id
                }
            });
        });
    }
    req.flash("success", `${title} successfully added!`)
    res.redirect("/wishlist")
});

router.get('/modify/:wishlistItemId', checkParamId("wishlistItemId"), async (req, res) => {
    res.locals.postAction = `/wishlist/modify/${req.params.wishlistItemId}`;
    res.locals.buttonText = "Modify";
    const wishlistItem = await Wishlist.findById(req.params.wishlistItemId);
    res.locals.titleVal = wishlistItem.title;
    res.locals.descVal = wishlistItem.description;
    res.locals.price = wishlistItem.price;
    res.locals.rating = wishlistItem.rating;
    res.locals.url = wishlistItem.url;
    res.render("forms/formContainer", {form: "add-modifyWishlistForm"});
});

router.post('/modify/:wishlistItemId', checkParamId("wishlistItemId"), async (req, res) => {
    const {title, description, price, url, rating} = req.body;
    const toModify = await Wishlist.findById(req.params.wishlistItemId);
    if (!toModify) {
        return makeNextError('Wishlist Item Not Found', 400, next)
    }
    if (title) toModify.title = title;
    if (rating) toModify.rating = rating;
    const optionals = [ ["description", description], ["price", price], ["url", url]];
    for (optional of optionals){
        if (optional[1] || toModify[optional[0]]) toModify[optional[0]] = optional[1];
    }
    await toModify.save();
    req.flash("success", `${title} successfully modified!`)
    res.redirect("/wishlist");
});

router.delete('/delete/:wishlitItemId', checkParamId("wishlitItemId"), async (req, res) => {
    try{
        await Wishlist.findByIdAndRemove(req.params.wishlitItemId)
        .then(async () =>{
            await Notification.findOneAndDelete({'related.relatedId': req.params.wishlitItemId}).then(() => {
                res.status(200).send("Wishlist item successfully deleted");
            });
        });
    } catch (err) {
        res.status(500).send("Wishlist item failed to delete");
    }
});


module.exports = router;