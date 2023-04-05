const router = require('express').Router();
const User = require('../models/User');
const { findUserByIdAndUpdateReqSession, deleteAllUsersCreations, sendSystemNotif, removeAllPairActions } = require("../public/js/utils");

router.get('/settings', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    res.locals.username = user.username;
    res.locals.email = user.email;
    const pair = await User.findById(user.pairId);
    pair? res.locals.pairName = pair.username : res.locals.pairName = "";
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
    res.locals.code = Math.floor(100000 + Math.random() * 900000);
    res.render('forms/formContainer', {form: 'confirmAccounDeleteForm'})
});

router.post('/delete/account', async (req, res) => {
    const { enteredEmail, enteredCode, actualCode } = req.body;
    const redirectRoute = '/profile/settings?startingTab=account';
    if (enteredCode !== actualCode){
        req.flash('error', "Code did not match");
        res.redirect(redirectRoute);
        return;
    }
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    if (!user || enteredEmail !== user.email){
        req.flash('error', "Email did not match");
        res.redirect(redirectRoute);
        return;
    }
    const deleteId = user._id;
    const pairId = user.pairId;
    const username = user.username;
    // delete user
    await user.deleteOne();
    // delete all items pertaining to the user
    await deleteAllUsersCreations(deleteId).then(async() => {
        // inside so that the created notif doesnt get deleted
        const msg = `${username} has unpaired with you!`;
        await sendSystemNotif(pairId, msg);
    });
    // unlink their pair from them
    const pair = await User.findByIdAndUpdate(pairId);
    pair.pairId = undefined;
    await pair.save();
    req.flash('success', "Account deleted. Thank you for using this website!");
    res.redirect("/");
});

router.post('/delete/pair', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const redirectRoute = '/profile/settings?startingTab=account';
    if (!user || !user.pairId) {
            req.flash('error', "Error finding pair to remove.");
            res.redirect(redirectRoute);
            return;
    }
    const userId = user._id;
    const pairId = user.pairId;
    await removeAllPairActions(userId, pairId).then(async() => {
        // inside so that the created notif doesnt get deleted
        const msg = `${user.username} has unpaired with you!`;
        await sendSystemNotif(pairId, msg);
    });
    const pair = await User.findById(pairId);
    user.pairId = undefined;
    await user.save();
    pair.pairId = undefined;
    await pair.save();
    req.session.hasPair = false;
    req.flash('success', "Successfully Unpaired");
    res.redirect(redirectRoute);
});

module.exports = router;