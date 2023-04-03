const router = require('express').Router();
const User = require('../models/User');
const { req_login, checkParamId } = require("../public/js/middlewares");

router.get("/request_reset", (req, res) => {
    res.send("eike");
})

module.exports = router;