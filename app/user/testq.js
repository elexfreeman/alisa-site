var conn = require('../../db');

/*https://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling*/
/*https://www.youtube.com/watch?v=hGZX_SA7lYg*/
var testq = function (callback) {
    //conn.connection.query("SELECT * FROM `table` WHERE `id` = ? ", row_id)
    conn.connection.query("select * From users u limit 10")
        .on('result', function (row) {
            callback(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err});
    });
};

if (module.parent) {
    exports.testq = testq;
} else {

    testq(function (row) {
        console.info(row);
    });

}

