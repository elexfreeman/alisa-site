var conn = require('../../db');
var base64url = require('base64url');
var isTelegramLogin = require('../lib/telegram');
var crypto = require('crypto');


/*токен для бота телеграма*/
var BOT_TOKEN = '';


/*модуль логина/регистрации юзера в систему*/
/*построен на промисах*/


/*генерирует рандомную строку*/
function randomStringAsBase64Url(size) {
    return base64url(crypto.randomBytes(size));
}

function generateApiKey() {
    return randomStringAsBase64Url(48);
}

function insertUserApiKey(userId, promiseData) {
    return new Promise(function (resolve, reject) {
        var sql = "INSERT INTO user_apikey (`date`, `user_id`, `apiKey`) " +
            " VALUES (now(), ?, ?)";
        var apiKey = generateApiKey();
        conn.query(sql, [userId, apiKey], function (data, err) {
            if (!err) {
                console.info('insert user_apikey with ID '+data.insertId);
                resolve({
                    userId: userId
                    , status: true
                    , id: data.insertId
                    , apiKey: apiKey
                    , promiseData: promiseData
                });
            } else {
                reject(err);
            }
        });
    });
}

/*стандартизирует номер телефона*/
function phoneFormat(phone) {
    return phone;
}

function insertUser(arr) {
    return new Promise(function (resolve, reject) {
        var user = [arr.phone, arr.name, arr.surname, arr.patronymic, arr.email, arr.birthday, arr.avatar];
        var sql = "INSERT INTO users (`create_date`, `phone`, `name`, `surname`, `patronymic`, `email`, `birthday`, `avatar`) " +
            " VALUES (now(), ?, ?, ?, ?, ?, ?, ?)";
        conn.query(sql, user, function (resp, err) {
            if (!err) {
                resolve({
                    userId: resp.insertId
                    , arr: arr
                });
            } else {
                reject(err);
            }
        });
    });
}

function registerUser(arr) {
    return new Promise(function (resolve, reject) {
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
            if (arr.avatar == undefined) {
                arr.avatar = null;
            }
            insertUser(arr).then(function (data) {
                var user = arr;
                user.id = data.userId;
                return insertUserApiKey(user.id, user);
               /* return {
                    user: user
                    , apiKeyData: insertUserApiKey(user.id)
                };*/
            }).then(function (userPromise) {
                var user = userPromise.promiseData;
                user.apiKey = userPromise.apiKey;
                user.promiseStatus = 'newUser';
                resolve(user);
            })
        } else {
            resolve(false);
        }
    });
}

function getUserById(userId) {
    return new Promise(function (resolve, reject) {
        /*получем такую строчку*/
        conn.query("select * from users u where u.id = ? ", userId, function (data, err) {
            if (!err) {
                if (data.length > 0) {
                    resolve({
                        userId: userId
                        , status: true
                        , user: JSON.parse(JSON.stringify(data))
                    });
                } else {
                    resolve({
                        userId: userId
                        , status: false
                        , user: null
                    });
                }
            } else {
                reject(err);
            }
        });
    });
}


function isUserTelegramData(userId) {
    return new Promise(function (resolve, reject) {
        /*получем такую строчку*/
        conn.query("select id from user_telegram_data ut where ut.user_id = ? ", userId, function (resp, err) {
            if (!err) {
                if (resp.length > 0) {
                    resolve({
                        userId: userId,
                        status: true
                    });
                } else {
                    resolve({
                        userId: userId,
                        status: false
                    });
                }
            } else {
                reject(err);
            }
        });
    });
}

function updateUserTelegramData(userId, arr, promiseData) {
    return new Promise(function (resolve, reject) {
        /*получем такую строчку*/
        conn.query("UPDATE `user_telegram_data` SET " +
            " `hash`= ? " +
            " ,`first_name`= ? " +
            " ,`last_name`= ? " +
            " ,`photo_url`= ? " +
            " ,`username`= ? " +
            " ,`auth_date`= ? " +
            " ,`id_telegram`= ? " +
            "WHERE  user_id = ? ", [arr.hash, arr.first_name, arr.last_name, arr.photo_url, arr.username, arr.auth_date, arr.id, userId], function (resp, err) {
            /*преобразуем в json и выдаем*/
            if (!err) {
                resolve({
                    userId: userId
                    ,status: true
                    ,promiseData: promiseData
                });
            } else {
                reject(resolve({
                    userId: userId
                    ,status: false
                    ,promiseData: promiseData
                }));
            }
        });
    });
}

function insertUserTelegramData(arr, promiseData) {
    /*вставляем данные*/
    return new Promise(function (resolve, reject) {
        conn.query("INSERT INTO user_telegram_data " +
            "(`user_id`, `hash`, `first_name`, `last_name`, `photo_url`, `username`, `auth_date`, `id_telegram`)" +
            " VALUES" +
            " (?, ?, ?, ?, ?, ?, ?, ?)", [arr.userId, arr.hash, arr.first_name, arr.last_name, arr.photo_url, arr.username, arr.auth_date, arr.id], function (resp, err) {
            if (!err) {
                resolve({
                    userId: arr.userId,
                    status: true,
                    ut_us: resp.insertId
                    ,promiseData: promiseData
                });
            } else {
                reject(false);
            }
        });
    });
}


/*выадет юзера по его id телеграмма*/
function getUserByTId(tId) {
    return new Promise(function (resolve, reject) {
        var sql = "select " +
            "u.`*` " +
            ",ut.id ut_id " +
            ",ut.id_telegram " +
            ",ut.auth_date ut_auth_date " +
            ",ut.first_name ut_first_name " +
            ",ut.last_name ut_last_name " +
            ",ut.`hash` ut_hash " +
            ",ut.id_telegram ut_id_telegram " +
            ",ut.photo_url ut_photo_url " +
            ",ut.username ut_username " +
            ",apk.apiKey apiKey " +
            "from users u " +
            "join user_telegram_data ut " +
            "on ut.user_id= u.id " +

            "join user_apikey apk " +
            "on apk.user_id=u.id " +

            "where ut.id_telegram = ? ";

        conn.query(sql, tId, function (resp, err) {
            if (!err) {
                if (resp.length > 0) {
                    var user = JSON.parse(JSON.stringify(resp));
                    user = user[0];
                    resolve({
                        user: user,
                        tId: tId,
                        status: true
                    });
                } else {
                    resolve({
                        tId: tId,
                        status: false
                    });
                }
            } else {
                reject(err);
            }
        });
    });
}

/*логинит через телеграмм*/

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
function telegramLogin1(arr) {
    return new Promise(function (resolve, reject) {
        if (true) {
            resolve(true);
        } else {
            reject(false);
        }
    });
}

/*прикреплет к зареганному юзеру данные по телеграму*/
/*todo setUserTelegramData*/
function setUserTelegramData() {
    isUserTelegramData(userID).then(function (res) {
        return res;
    }).then(function (isUser) {
        /*если есть такой юзер */
        if (isUser.status) {
            /*обновляем данные*/
            return updateUserTelegramData(isUser.userId, arg);
        } else {
            /*вставляем новые*/
            arg.userId = isUser.userId;
            return insertUserTelegramData(arg);
        }
    }).then(function (res) {
        //console.info(res);
    });
}

/*регистриует юзера из данных телеграма*/

/*telegramData = {
   hash:hash - пришел от телегрма через get
   first_name:str
   id:int
   last_name:str
   photo_url:str
   username:str
   auth_date:int
}
* */

/*мой первый говнокод в промисах*/
/*вроде все оттестил*/
/*поступают данные от телеграма*/
/* var arg = {
        hash: '1ad0620a7b9c675d220a4636883997ee1e75111ef90162147581a935a522f502',
        first_name: 'Oberon',
        id: 398015313,
        last_name: 'J',
        photo_url: 'https://t.me/i/userpic/320/ElexShepard.jpg',
        username: 'ElexShepard',
        auth_date: 1518807888
    };
*/


function telegramLogin(telegramData) {
    return new Promise(function (resolve, reject) {
        /*проверяем корректность логина через телеграм*/
        if (isTelegramLogin(BOT_TOKEN, telegramData)) {
            /*ещм такого юзера в базе оп телеграмID*/
            getUserByTId(telegramData.id).then(function (userPromise) {
                if (userPromise.status) {
                    userPromise.user.promiseStatus = 'oldUser';
                    return userPromise.user
                } else {
                    /*такого юзера нету создаем его*/
                    var arr = {
                        phone: ''
                        , name: telegramData.first_name
                        , surname: telegramData.last_name
                        , patronymic: ''
                        , email: ''
                        , avatar: telegramData.photo_url
                    };
                    return registerUser(arr);
                }
            }).then(function (userPromise) {
                console.info(userPromise);
                /*проверяем корректность регистрацииы*/
                if (userPromise.promiseStatus === 'oldUser') {
                    /*если уже был такой юзер*/
                    /*обновляем данные телеграма*/
                    return updateUserTelegramData(userPromise.id, telegramData, userPromise);
                } else {
                    /*если создали новго*/
                    telegramData.userId = userPromise.id;
                    return insertUserTelegramData(telegramData, userPromise)
                }
            }).then(function (userPromise) {
                resolve(userPromise.promiseData);
            });
        } else {
            resolve(false);
        }
    });
}


if (module.parent) {
    module.exports = {
        telegramLogin: telegramLogin
    }
} else {


}