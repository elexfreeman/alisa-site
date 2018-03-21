let express = require('express');
let router = express.Router();
let Categories = require('../../models/categories');


/* GET home page. */
router.get('/', function (req, res, next) {

    let Url = req.baseUrl.replace('\\', '');
    Url = Url.replace('/', '');
    Url = Url.split('/');
    Url = Url[1];

    let categories = [];
    let category = {};

    Categories.getCategories().then((c) => {
        categories = c;
        //получаем категории
        return Categories.getCategoryByUrl(Url);
    }).then((c) => {
        category = c;
        // получчаем продукты категории
        return Categories.getProducts(Url);
    }).then((categoryProducts) => {
        /*seo*/

        let title = 'Rouse.One - ' + category.caption;
        let description = 'Rouse.One - Интернет магазин экологичекий косметики';
        let keywords = '';
        category.products = categoryProducts;

        res.render('category', {
            title: title
            , description: description
            , keywords: keywords
            , category: category
            , categories: categories
            , Url: Url
        });
    });
});

module.exports = router;
