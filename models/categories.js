let conn = require('../db');
let urlGen = require('../libs/urlGen');


function insertCategory(d) {
    return new Promise(function (resolve, reject) {

        if (d.caption == null) {
            d.caption = '';
        }
        if (d.img == null) {
            d.img = '';
        }
        if (d.description == null) {
            d.description = '';
        }

        let sql = "INSERT INTO categories (`caption`, `img`, `description`, `url`) " +
            " VALUES (?, ?, ?, ?)";
        conn.query(sql, [d.caption, d.img, d.description, ''], function (data, err) {
            if (!err) {
                updateCategoryUrl(data.insertId, urlGen(data.insertId.toString() + '-' + d.caption)).then((status) => {
                    resolve(data.insertId);
                });
            } else {
                console.log('Ошибка вставки');
                reject(err);
            }
        });
    });
}


function getCategory(categoryId) {
    return new Promise(function (resolve, reject) {

        let sql = "select * from categories where (id = ?) and (deleted = 0)";
        conn.query(sql, [categoryId], function (data, err) {
            if (!err) {
                data = JSON.parse(JSON.stringify(data));
                if (data.length > 0) {
                    resolve(data[0]);
                } else {
                    resolve(false);
                }

            } else {
                reject(err);
            }
        });
    });
}

function getCategoryByUrl(url) {
    return new Promise(function (resolve, reject) {

        let sql = "select * from categories where (url = ?) and (deleted = 0)";
        conn.query(sql, [url], function (data, err) {
            if (!err) {
                data = JSON.parse(JSON.stringify(data));
                if (data.length > 0) {
                    resolve(data[0]);
                } else {
                    resolve(false);
                }

            } else {
                reject(err);
            }
        });
    });
}

function getCategories() {
    return new Promise(function (resolve, reject) {
        let sql = "select * from categories where (deleted = 0) order by caption";
        conn.query(sql, [], function (data, err) {
            if (!err) {
                data = JSON.parse(JSON.stringify(data));
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
}

function updateCategory(categoryId, arg) {
    return new Promise(function (resolve, reject) {

        var sql = "UPDATE categories " +
            " set caption = ? " +
            ",img = ? " +
            ",url = ? " +
            ",description = ? " +
            " where id = ? ";
        conn.query(sql, [arg.caption, arg.img, arg.url, arg.description, categoryId], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}


function updateCategoryUrl(categoryId, url) {
    return new Promise(function (resolve, reject) {

        var sql = "UPDATE categories " +
            " set url = ? " +
            " where id = ? ";
        conn.query(sql, [url, categoryId], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}

function getProducts(categoryUrl){
    return new Promise(function (resolve, reject) {
        let sql = "select " +
        'p.* '+
        'from products p ' +

        'join product_categories pc ' +
        'on pc.product_id = p.id ' +        

        'join categories c ' +
        'on c.id = pc.category_id  ' +
        'where '+

        '(c.url = ?) '+
        'and(p.deleted = 0) ';
        console.log(sql);

        conn.query(sql, [categoryUrl], function (data, err) {
            if (!err) {
                data = JSON.parse(JSON.stringify(data));
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
}




if (module.parent) {
    module.exports = {
        insertCategory: insertCategory
        ,getCategories: getCategories
        ,getCategory: getCategory
        ,updateCategory: updateCategory
        ,getCategoryByUrl: getCategoryByUrl
        ,getProducts: getProducts
    }
} else {

    getCategories().then((val) => {
        console.info(val);
    })

}