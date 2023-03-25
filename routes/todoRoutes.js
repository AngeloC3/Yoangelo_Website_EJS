const router = require('express').Router();

router.get('/:todolist', (req, res) => {
    res.render("blank");
})

module.exports = router;

