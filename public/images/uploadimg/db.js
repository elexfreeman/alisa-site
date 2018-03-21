/*модуль подкл к базе*/
var mysql = require('mysql');

/*строка подключения*/
conn_params = {
    connectionLimit : 100,
    host: 'localhost',
    user: 'root',
    password: 'hfgrtTGF54',
    database: 'alisashop'
};
/*сам коннект*/
var pool = mysql.createPool(conn_params);

/*
conn.connect(function (err) {
    if (err) throw err;
    console.log('You are now connected to db: ' + conn_params.database);
});
*/



if(module.parent){
    var DB = (function () {

        function _query(query, params, callback) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    callback(null, err);
                    throw err;
                }

                connection.query(query, params, function (err, rows) {
                    connection.release();
                    if (!err) {
                        callback(rows);
                    }
                    else {
                        callback(null, err);
                    }

                });

                connection.on('error', function (err) {
                    connection.release();
                    callback(null, err);
                    throw err;
                });
            });
        };

        return {
            query: _query
        };
    })();

    module.exports = DB;
} else {

}



/*экспортируем конект*/


/*еесть в каждом модуле*/
//console.log(module);