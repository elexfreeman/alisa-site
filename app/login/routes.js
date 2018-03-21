var express = require('express');
var u = require('../user/userInfo');
var login = require('../login/login');
var router = express.Router();
const url = require('url');
var userInfo = new u();


router.post('/', function (req, res) {
    res.send('POST request to the homepage');
});


/*выдает одноразовый пароль для телефона*/
router.get('/telegramAuth', function (req, res, next) {

    login.telegramLogin(url.parse(req.url, true).query).then(function (user) {
        if (user === false) {
            res.json({'error': 1, 'user': user});
        } else {
            res.json({'error': 0, 'user': user});
        }
    });

});


module.exports = router;