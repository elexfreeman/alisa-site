let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
        res.sendFile('public/admin/index.html');
    });

module.exports = router;


