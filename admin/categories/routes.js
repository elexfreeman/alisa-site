let express = require('express');
let router = express.Router();

let categories = require('../../models/categories');

router.get('/getAll', function (req, res, next) {
    categories.getCategories().then((val) => {
        res.json(val);
    });
});

router.post('/add', function (req, res, next) {
    categories.insertCategory(req.body).then((val) => {
        res.json({'id': val});
    });
});

router.post('/update', function (req, res, next) {
    categories.updateCategory(req.body.id, req.body).then((val) => {
        res.json({'status': val});
    });
});

router.post('/get', function (req, res, next) {
    categories.getCategory(req.body.id).then((val) => {
        res.json(val);
    });
});




module.exports = router;