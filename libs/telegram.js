const crypto = require('crypto');
/*секретный ключ*/
function getSecretKey(BOT_TOKEN) {
    return crypto.createHash('sha256').update(BOT_TOKEN).digest();
}

/*выдает строку для сравнния */
function genChkString(data_check) {
    /*передаются в алфавитном порядке*/

    var res = '';
    res += 'auth_date=' + data_check['auth_date'] + '\n';
    if ((data_check['first_name'] != null) && (data_check['first_name'].length > 0)) res += 'first_name=' + data_check['first_name'] + '\n';
    res += 'id=' + data_check['id'] + '\n';
    if ((data_check['last_name'] != null) && (data_check['last_name'].length > 0)) res += 'last_name=' + data_check['last_name'] + '\n';
    if ((data_check['photo_url'] != null) && (data_check['photo_url'].length > 0)) res += 'photo_url=' + data_check['photo_url'] + '\n';
    res += 'username=' + data_check['username'];
    return res;
}

/*выдает хэш бот токена*/
function getHash(string, secret_key) {
    return crypto.createHmac("sha256", secret_key).update(string).digest("hex");
}


/*вход на сайт через телеграмм*/

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
function login(BOT_TOKEN, arr) {
    /*чекаем валидность авторизации*/
    var chk_string = genChkString(arr);
    var chk_hash = getHash(chk_string, getSecretKey(BOT_TOKEN));

    if (chk_hash === arr.hash) {
        return true;
    } else {
        return false;
    }
}


if (module.parent) {
    module.exports = login;
} else {


    var chk_arr = {
        auth_date: '1518767435'
        , first_name: 'Oberon'
        , id: '398015313'
        , last_name: 'J'
        , photo_url: 'https://t.me/i/userpic/320/ElexShepard.jpg'
        , username: 'ElexShepard'

    };



    var t = new telegram();

    chk_string = t.genChkString(chk_arr);

    chk_hash = t.getHash(chk_string);

    console.info(chk_string);
    console.info(chk_hash);


}