const router = require('express').Router();
const User = require('../models/User');
const { findUserByIdAndUpdateReqSession, deleteAllUsersCreations, sendSystemNotif, removeAllPairActions, flashAndRedirect } = require("../public/js/utils");

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
        return flashAndRedirect(req, res, 'success', `Username changed to ${changedUsername}!`, redirectRoute);
    }).catch(() => {
        return flashAndRedirect(req, res, 'error', "Error changing username.", redirectRoute);
    }); 
});

router.post('/change/email', async (req, res) => {
    const changedEmail = req.body.changedEmail;
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const redirectRoute = '/profile/settings?startingTab=account';
    if (!user){
        return next(err);
    }
    if (user.isExternalAccount()){
        return flashAndRedirect(req, res, 'error', "Cannot change the email of an external account", redirectRoute);
    }
    user.email = changedEmail;
    await user.save().then(() => {
        return flashAndRedirect(req, res, 'success', `Email changed to ${changedEmail}!`, redirectRoute);
    }).catch(() => {
        return flashAndRedirect(req, res, 'error', "Error changing email.", redirectRoute);
    });
});


router.get('/delete/account', (req, res) => {
    res.render('forms/formContainer', {form: 'confirmAccounDeleteForm'})
});

router.post('/delete/account', async (req, res) => {
    const { email, password } = req.body;
    const redirectRoute = '/profile/settings?startingTab=account';
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    if (!user || email !== user.email){
        return flashAndRedirect(req, res, 'error', 'Account details did not match', redirectRoute);
    }
    const auth_result = await user.authenticate(password);
    if (!auth_result.user){
        return flashAndRedirect(req, res, 'error', 'Account details did not match', redirectRoute);
    }
    const deleteId = user._id;
    const pairId = user.pairId;
    const username = user.username;
    // delete user
    await user.deleteOne();
    // delete all items pertaining to the user
    await deleteAllUsersCreations(deleteId).then(async() => {
        // inside so that the created notif doesnt get deleted
        const msg = `${username} has unpaired with you via account deletion.`;
        await sendSystemNotif(pairId, msg);
    });
    // unlink their pair from them
    const pair = await User.findByIdAndUpdate(pairId);
    pair.pairId = undefined;
    await pair.save();
    return flashAndRedirect(req, res, 'success', "Account deleted. Thank you for using this website!", "/");
});

router.post('/delete/pair', async (req, res) => {
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    const redirectRoute = '/profile/settings?startingTab=account';
    if (!user || !user.pairId) {
            return flashAndRedirect(req, res, 'error', "Error finding pair to remove.", redirectRoute);
    }
    const userId = user._id;
    const pairId = user.pairId;
    await removeAllPairActions(userId, pairId).then(async() => {
        // inside so that the created notif doesnt get deleted
        const msg = `${user.username} has unpaired with you.`;
        await sendSystemNotif(pairId, msg);
    });
    const pair = await User.findById(pairId);
    user.pairId = undefined;
    await user.save();
    pair.pairId = undefined;
    await pair.save();
    req.session.hasPair = false;
    return flashAndRedirect(req, res, 'success', "Successfully Unpaired", redirectRoute);
});

router.post('/change/password', async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword} = req.body;
    const redirectRoute = '/profile/settings?startingTab=security';
    if (newPassword !== confirmPassword) {
        return flashAndRedirect(req, res, 'error', "Passwords did not match", redirectRoute);
    }
    if (newPassword === oldPassword) {
        return flashAndRedirect(req, res, 'error', "Can't change password to old password", redirectRoute);
    }
    const user = await findUserByIdAndUpdateReqSession(req.user, req);
    if (!user){
        return next(err);
    }
    if (user.isExternalAccount()){
        return flashAndRedirect(req, res, 'error', "Cannot change the password of an external account", redirectRoute);
    }
    const auth_result = await user.authenticate(oldPassword);
    if (!auth_result.user){
        return flashAndRedirect(req, res, 'error', 'Incorrect password', redirectRoute);
    }
    return user.setPassword(newPassword, async (err) => {
        if (err) {
            return next(err);
        } else {
            await user.save();
            req.logout(function (err) {
                if (err) {
                  return next(err);
                }
                return flashAndRedirect(req, res, 'success', "Password successfully changed", '/auth/login');
            });
        }
    });
});

module.exports = router;