const router = require('express').Router();

router.get('/settings', (req, res) => {
    res.render('settings');
});

module.exports = router;