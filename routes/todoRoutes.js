const router = require('express').Router();

router.get(`/todo/:todolist`, (req, res) => {
    res.render("blank");
})

module.exports = router;

