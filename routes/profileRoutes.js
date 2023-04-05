const router = require('express').Router();
const User = require('../models/User');
const { findUserByIdAndUpdateReqSession } = require("../public/js/utils");

router.get('/settings', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    res.locals.username = user.username;
    res.locals.email = user.email;
    res.render('settings');
});

router.post('/change/unessentials', async (req, res) => {
    const changedUsername = req.body.changedUsername;
    const redirectRoute = '/profile/settings';
    await User.findByIdAndUpdate(req.user, {username: changedUsername}).then(() => {
        req.flash('success', `Username changed to ${changedUsername}!`);
        res.redirect(redirectRoute);
    }).catch(() => {
        req.flash('error', "Error changing username.");
        res.redirect(redirectRoute);
    }); 
});

router.post('/change/email', async (req, res) => {
    const changedEmail = req.body.changedEmail;
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const redirectRoute = '/profile/settings?startingTab=account';
    if (!user || user.google.id){
        req.flash('error', "Cannot change the email of a google account");
        res.redirect(redirectRoute);
        return;
    }
    user.email = changedEmail;
    await user.save().then(() => {
        req.flash('success', `Email changed to ${changedEmail}!`);
        res.redirect(redirectRoute);
    }).catch(() => {
        req.flash('error', "Error changing email.");
        res.redirect(redirectRoute);
    });
});


router.get('/delete/account', (req, res) => {
    res.locals.username = req.user.username;
    res.render('forms/formContainer', {form: 'confirmProfileDeleteForm'})
});

router.post('/delete/account', async (req, res) => {
    const enteredEmail = req.body.email;
    const redirectRoute = '/profile/settings?startingTab=account';
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    if (!user || enteredEmail !== user.email){
        req.flash('error', "Email did not match");
        res.redirect(redirectRoute);
        return;
    }
    const deleteId = user._id;
    // delete user
    await user.deleteOne();
    // delete all items pertaining to the user
    // unlink their pair from them
});

module.exports = router;