let conn = require('../db');
let urlGen = require('../libs/urlGen');


function insert(d) {
    return new Promise(function (resolve, reject) {

        if (d.caption == null) {
            d.caption = '';
        }

        if (d.description == null) {
            d.description = '';
        }
        if (d.main_img == null) {
            d.main_img = '';
        }
        if (d.img1 == null) {
            d.img1 = '';
        }
        if (d.img2 == null) {
            d.img2 = '';
        }
        if (d.img3 == null) {
            d.img3 = '';
        }
        if (d.img4 == null) {
            d.img4 = '';
        }


        let sql = "INSERT INTO products (`caption`, `description`, `main_img`, `img1`, `img2`, `img3`, `img4`) " +
            " VALUES (?, ?, ?, ?, ?, ?, ? )";
        conn.query(sql, [d.caption, d.description, d.main_img, d.img1, d.img2, d.img3, d.img4], function (data, err) {
            if (!err) {
                updateUrl(data.insertId, urlGen(data.insertId.toString() + '-' + d.caption)).then((status) => {
                    resolve(data.insertId);
                });
            } else {
                console.log('Ошибка вставки');
                reject(err);
            }
        });
    });
}


function get(id) {
    return new Promise(function (resolve, reject) {

        let sql = "select * from products where (id = ?) and (deleted = 0)";
        conn.query(sql, [id], function (data, err) {
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

function getByUrl(url) {
    return new Promise(function (resolve, reject) {

        let sql = "select * from products where (url = ?) and (deleted = 0)";
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

function getList() {
    return new Promise(function (resolve, reject) {

        let sql = "select * from products where (deleted = 0) order by caption";
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

function update(id, arg) {
    return new Promise(function (resolve, reject) {

        let sql = "UPDATE products " +
            " set caption = ? " +
            ",url = ? " +
            ",main_img = ? " +
            ",description = ? " +
            ",img1 = ? " +
            ",img2 = ? " +
            ",img3 = ? " +
            ",img4 = ? " +
            " where id = ? ";
        conn.query(sql, [arg.caption, arg.url, arg.main_img, arg.description, arg.img1, arg.img2, arg.img3, arg.img4, id], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}


function updateUrl(id, url) {
    return new Promise(function (resolve, reject) {

        let sql = "UPDATE products " +
            " set url = ? " +
            " where id = ? ";
        conn.query(sql, [url, id], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}

function deleted(id) {
    return new Promise(function (resolve, reject) {

        let sql = "UPDATE products " +
            " set deleted = 1 " +
            " where id = ? ";
        conn.query(sql, [id], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}

/*удаляет все проставленные категории продукта*/
function deleteCategories(id) {
    return new Promise(function (resolve, reject) {

        let sql = "delete from product_categories where product_id = ? ";
        conn.query(sql, [id], function (resp, err) {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
}

function updateCategories(id, categories) {
    return new Promise(function (resolve, reject) {
        /*удаляем все категории*/
        deleteCategories(id).then((r) => {
            for (key in categories) {
                if ((categories[key].checked === 1) || (categories[key].checked === true)) {
                    conn.query("INSERT INTO product_categories (`product_id`, `category_id`) " +
                        " VALUES (?, ? )", [id, categories[key].id], function (data, err) {
                        });
                }
            }
            resolve(true);
        });
    });
}


function getCategories(productId) {
    return new Promise(function (resolve, reject) {

        let sql = "select  " +
            "g.id, g.caption " +
            ", IF (pg.id is null, false, true) checked " +
            "from categories g " +
            " " +
            "left join (select * from product_categories pc where pc.product_id = ? ) pg " +
            "on pg.category_id = g.id " +
            " ";
        conn.query(sql, [productId], function (data, err) {
            if (!err) {
                data = JSON.parse(JSON.stringify(data));
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
}


function getPopular() {
    return new Promise(function (resolve, reject) {
        let sql = "select * from products where (deleted = 0)and(popular=1) order by caption";
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



if (module.parent) {
    module.exports = {
        insert: insert
        , get: get
        , getList: getList
        , updateUrl: updateUrl
        , update: update
        , getCategories: getCategories
        , updateCategories: updateCategories
        , deleted: deleted
        ,getPopular: getPopular
        ,getByUrl: getByUrl

    }
} else {

}