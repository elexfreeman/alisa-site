var express = require('express');
var u = require('../user/userInfo');
var router = express.Router();

var userInfo = new u();


router.post('/', function (req, res) {
    res.send('POST request to the homepage');
});

router.get('/get10Users', function (req, res) {
    userInfo.get10Users(function (err, users) {
        res.json(users);
    })
});

/*инфа об юзере по api_key*/
router.post('/getUserInfo', function (req, res, next) {
    var resp = {};
    console.info(req.body);
    /*проверяем вх параментры*/
    if (req.body.apiKey != undefined) {
        /*получаем наш */
        resp.error = 0;
        userInfo.getUserInfo(req.body.apiKey, function (err, response) {
            console.info(response);
            if (response==null){
                resp.error = 1;
                res.json(resp);
            } else {
                resp.error = 0;
                resp.user = response;
                res.json(resp);
            }
        });
    } else {
        resp.error = 1;
        res.json(resp);
    }

});


/*выдает api_key по телефону и однр паролю из смс*/
router.post('/getApiKeyBySms', function (req, res, next) {
    /*проверяем вх параментры*/
    if ((req.body.userPhone != null) & (req.body.userSms != null)) {
        /*получаем наш api_key*/
        userInfo.getApiKeyBySms(req.body.userPhone, req.body.userSms, function (err, resp) {
            console.info(resp);
            res.json({'error': 0, 'api_key': resp});
        });
    } else {
        res.json({'error': 1});
    }
});


/*выдает одноразовый пароль для телефона*/
router.post('/GetUserSmsPass', function (req, res, next) {
    console.info(req.body);
    /*проверяем вх параментры*/
    if (req.body.userPhone != undefined) {
        /*получаем наш api_key*/
        userInfo.getNewSmsPassword(req.body.userPhone, function (err, rndPass) {
            /*на деплое пароль не посылать*/
            res.json({'error': 0, 'rndPass': rndPass});
        });
    } else {
        res.json({'error': 1});
    }
});

/*выдает одноразовый пароль для телефона*/
router.get('/telegramAuth', function (req, res, next) {
    console.info(req.body);
    /*проверяем вх параментры*/
    if (req.body.userPhone != undefined) {
        /*получаем наш api_key*/
        userInfo.getNewSmsPassword(req.body.userPhone, function (err, rndPass) {
            /*на деплое пароль не посылать*/
            res.json({'error': 0, 'rndPass': rndPass});
        });
    } else {
        res.json({'error': 1});
    }
});


module.exports = router;