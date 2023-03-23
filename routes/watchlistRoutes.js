const router = require('express').Router();

router.get("/watchlist", (req, res) => {
    res.render("blank");
})

module.exports = router;