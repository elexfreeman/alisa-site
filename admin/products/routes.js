let express = require('express');
let router = express.Router();

let products = require('../../models/products');

router.get('/getList', function (req, res, next) {
    products.getList().then((val) => {
        res.json(val);
    });
});

router.post('/add', function (req, res, next) {
    let product_id = 0;
    products.insert(req.body).then((val) => {
        product_id = val;
        return products.updateCategories(product_id, req.body.categories);
    }).then((val) => {
        res.json({'id': product_id});
    });
});

router.post('/update', function (req, res, next) {
    products.update(req.body.id, req.body).then((val) => {
        return products.updateCategories(req.body.id, req.body.categories);
    }).then((val) => {
        res.json({'status': val});
    });
});


router.post('/deleted', function (req, res, next) {
    products.deleted(req.body.id).then((val) => {
        res.json({'status': val});
    });
});

router.post('/get', function (req, res, next) {
    let product = {};
    products.get(req.body.id).then((val) => {
        product = val;
        return products.getCategories(req.body.id);
    }).then((categories) => {
        product.categories = categories;
        res.json(product);
    });
});

router.post('/getCategories', function (req, res, next) {
    products.getCategories(req.body.id).then((categories) => {
        res.json(categories);
    });
});


module.exports = router;