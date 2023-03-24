const router = require('express').Router();

router.get('/:todolist', (req, res) => {
    res.render("blank");
})

router.use('/todos', router);

module.exports = router;

