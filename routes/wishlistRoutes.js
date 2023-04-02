const router = require('express').Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkParamId } = require("../public/js/middlewares");
const { findUserByIdAndUpdateReqSession } = require("../public/js/utils");

router.get("/", (req, res) => {
    res.locals.page_title = "Wishlist"
    res.locals.addRoute = "idkyet wishlist lol"
    const success = req.flash('success')
    res.render("lists/listContainer", {success, innerList: 'wishlist'});
});

module.exports = router;