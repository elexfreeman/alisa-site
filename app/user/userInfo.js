/*async.waterfall([
    function(callback){
        callback(null, 'один', 'два');
  , }
    function(arg1, arg2, callback){
        // Тут arg1 равен "один"
        // , а arg2 равен "два"
        // что соответствует второму и третьему параметру текщего колбека
        // , а первый конечно же мы не забыли - это err но в этом случае
        // ошибок нет поэтому null
        callback(null, 'три');
  , }
    function(arg1, callback){
        // Здесь же arg1 будет равен уже "три"
        callback(null, 'Готово');
    }
], function (err, result) {
   // Сейчас результат будет равен 'Готово'
});*/


var async = require('async');
var conn = require('../../db');
var sms = require('../lib/sms.js');
var path = require('path');
/*https://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling*/
/*https://www.youtube.com/watch?v=hGZX_SA7lYg*/
var crypto = require('crypto');
var base64url = require('base64url');


/*генерирует рандомную строку*/
function randomStringAsBase64Url(size) {
    return base64url(crypto.randomBytes(size));
}


var userInfo = function () {

    /*путь к кратинке*/
    var avatarPath = path.join(__dirname, '../../public') + '/images/avatars/';
    var avatarSrc = '/images/avatars/';
    var avatarDefault = 'profle-512.png';

    function generateApiKey() {
        //str.replace(new RegExp("тест",'g'),"прошел");
        return randomStringAsBase64Url(48);
    }


    /*конвртит аватар в base64*/

    /*callback(imgBase64);*/
    function convertUserAvatar(avatar, callback) {
        /*todo положить аватар в memcache*/
        if (avatar == null) {
            base64Img.base64(avatarPath + avatarDefault, function (err, imgBase64) {
                callback(imgBase64);
            })
        } else {
            base64Img.base64(avatarPath + avatar, function (err, imgBase64) {
                callback(imgBase64);
            });
        }
    }


    /*выдает аватар по id*/

    /* callback(err, img);*/
    function getUserAvatar(userId, callback) {
        conn.query("select u.avatar from users u " +
            "where u.id = ? " +
            "  limit 1", userId, function (data, err) {
            var response = JSON.stringify(data);
            /*преобразуем в json и выдаем*/
            response = JSON.parse(response);
            if (response != null) {
                response = response[0];
                /*достаем аватар*/
                convertUserAvatar(response.avatar, function (imgBase64) {
                    callback(err, imgBase64);
                });

            } else {
                callback(1, null);
            }
        });
    }





    /*выдает инфу об юзере по ключу*/

    /*callback(err, userInfo{});*/
    function getUserInfo(api_key, callback) {
        conn.query("select u.`*`, upk.apiKey from users u " +
            "join user_apikey upk " +
            "on upk.user_id=u.id " +
            "where upk.apiKey = ? " +
            "order by upk.`date` desc limit 1", api_key, function (data, err) {
            var response = JSON.stringify(data);
            /*преобразуем в json и выдаем*/
            response = JSON.parse(response);
            if (response != null) {
                response = response[0];
                if (response != null) {
                    if (response.avatar == null) {
                        response.avatar = avatarSrc + avatarDefault;
                    } else {
                        response.avatar = response.avatar;
                    }
                    callback(err, response);
                } else {
                    callback(1, null);
                }

            } else {
                callback(1, null);
            }
        });
    }


    /*выдает инфу об юзере по телефону*/
    function getUserInfoByPhone(phone, callback) {
        if (phone == '') {
            callback(1, null);
        } else {
            /*ищем юзера*/
            conn.query("SELECT * FROM users u WHERE u.phone = ? limit 1", phone, function (data, err) {
                var response = JSON.stringify(data);
                /*преобразуем в json и выдаем*/
                response = JSON.parse(response);
                /*если такой есть*/
                if (response != null) {
                    callback(err, response[0]);
                } else {
                    callback(err, null);
                }
            });
        }
    }


    /*получает api_key по номеру телефона и однаразовым паролем из смс*/

    /* callback(err, apiKey);*/
    function getApiKeyBySms(user_phone, sms_pass, callback) {
        var sql = "SELECT *" +
            " FROM (" +
            " SELECT u.*, apk.apiKey, apk.`date`, " +
            " (" +
            " SELECT usl.code" +
            " FROM user_sms_login_data usl" +
            " WHERE " +
            " (usl.user_id=u.id) AND" +
            " (usl.s_date> DATE_SUB(NOW(), INTERVAL 10 MINUTE))" +
            " ORDER BY usl.s_date DESC" +
            " LIMIT 1" +
            " ) sms" +
            " FROM users u" +
            " JOIN user_apikey apk ON apk.user_id=u.id" +
            " WHERE " +
            " (u.phone = ?)" +
            " ORDER BY apk.`date` DESC" +
            " LIMIT 1" +
            ") a" +
            " HAVING sms = ?";


        conn.query(sql, [user_phone, sms_pass], function (data, err) {

            var response = JSON.stringify(data);
            response = JSON.parse(response);
            if (response != null) {
                response = response[0];
                if (response != null) {
                    callback(err, response.apiKey);
                } else {
                    callback(err, null);
                }
            } else {
                callback(err, null);
            }
        });
    }

    /*выдает новый смс пароль для юзера*/
    /*записывает инфу в базу*/

    /*callback(err, rndPass)*/

    function getNewSmsPassword(phone, callback) {
        /*получаем юзера по телефону*/
        getUserInfoByPhone(phone, function (err, user) {
            /*если есть такой юзер*/
            if (user != null) {
                /*получаем последний смс*/
                sms.getLastSmsPass(user.id, function (err, p) {
                    if (p != null) {
                        /*если ест в базе смс код*/
                        callback(err, p.code);
                    } else {
                        /*если нету в базе*/
                        /*получаем смс*/
                        sms.getSmsPass(user.phone, function (rndPass) {
                            /*записываем в базу смс*/
                            var sql = "INSERT INTO user_sms_login_data (`s_date`, `user_id`, `code`) VALUES (now(), ?, ?)";
                            conn.query(sql, [user.id, rndPass], function (resp, err) {
                                callback(err, rndPass);
                            });
                        });
                    }
                });

            } else {
                /*если такого нету*/
                registerUser({phone: phone}, function (err, user_id) {
                    /*получаем смс*/
                    sms.getSmsPass(phone, function (rndPass) {
                        /*записываем в базу смс*/
                        var sql = "INSERT INTO user_sms_login_data (`s_date`, `user_id`, `code`) VALUES (now(), ?, ?)";
                        conn.query(sql, [user_id, rndPass], function (resp, err) {
                            callback(err, rndPass);
                        });
                    });
                });

            }
        });
    }


    /*выдает инфу об юзере по телефону*/
    function get10Users(callback) {
        conn.query("SELECT * FROM users u  limit 10 ", function (resp, err) {

            var response = JSON.stringify(resp);
            /*преобразуем в json и выдаем*/
            response = JSON.parse(response);
            if (response != null) {
                callback(err, response);
            } else {
                callback(err, null);
            }
        });
    }


    /*регистрирует юзера*/

    /*callback(err, insertId);*/
    function registerUser(arr, callback) {
        /*форматируем телефон*/
        arr.phone = phoneFormat(arr.phone);
        /*если есть телефон*/
        if (arr.phone != undefined) {

            if (arr.name == undefined) {
                arr.name = '';
            }

            if (arr.surname == undefined) {
                arr.surname = '';
            }

            if (arr.patronymic == undefined) {
                arr.patronymic = '';
            }

            if (arr.email == undefined) {
                arr.email = '';
            }

            if (arr.birthday == undefined) {
                arr.birthday = null;
            }

            var user = [arr.phone, arr.name, arr.surname, arr.patronymic, arr.email, arr.birthday];
            console.info(user);
            var sql = "INSERT INTO users (`create_date`, `phone`, `name`, `surname`, `patronymic`, `email`, `birthday`) " +
                " VALUES (now(), ?, ?, ?, ?, ?, ?)";
            conn.query(sql, user, function (resp, err) {
                if (err) {
                    /*ошибка вставки записи*/
                    callback(err, 0);
                } else {
                    /*генерим apiKey*/
                    var sql = "INSERT INTO user_apikey (`date`, `user_id`, `apiKey`) " +
                        " VALUES (now(), ?, ?)";
                    var userId = resp.insertId;
                    conn.query(sql, [userId, generateApiKey()], function (resp, err) {
                        if (err) {
                            /*ошибка в генерировании ключа апи*/
                            callback(err, 0);
                        } else {
                            callback(err, userId);
                        }
                    });
                }
            });
        } else {
            callback(1, 0);
        }
    }

    /*стандартизирует номер телефона*/
    function phoneFormat(phone) {
        return phone;
    }
    
    function loginFromTelegram() {

    }

    /*arr = {
       hash:hash - пришел от телегрма через get
       first_name:str
       id:int
       last_name:str
       photo_url:str
       username:str
       auth_date:int
   }
   * */


    return {
        generateApiKey: generateApiKey
        , avatarPath: avatarPath
        , avatarSrc: avatarSrc
        , avatarDefault: avatarDefault
        , convertUserAvatar: convertUserAvatar
        , getUserAvatar: getUserAvatar
        , getUserInfo: getUserInfo
        , getUserInfoByPhone: getUserInfoByPhone
        , getApiKeyBySms: getApiKeyBySms
        , getNewSmsPassword: getNewSmsPassword
        , phoneFormat: phoneFormat

    }
};

if (module.parent) {
    module.exports = userInfo;
} else {
    var u = new userInfo();

    u.updateUserTelegramData(8, {
        hash: 'hash',
        first_name: 'str',
        id: 123,
        last_name: 'last_456name',
        photo_url: 'photo_url',
        username: 'username',
        auth_date: 234234
    }, function (err, f) {
        console.info(err, f)
    })
}

