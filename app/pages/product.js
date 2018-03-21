let express = require('express');
let router = express.Router();

let Categories = require('../../models/categories');
let Products = require('../../models/products');


/* GET home page. */
router.get('/', function (req, res, next) {

    let Url = req.baseUrl.replace('\\', '');
    Url = Url.replace('/', '');
    Url = Url.split('/');
    Url = Url[1];

    let categories = [];
    let product = {};

    Categories.getCategories().then((c) => {
        categories = c;
        //получаем товар
        return Products.getByUrl(Url);
    }).then((c) => {
        product = c;
        /*seo*/
        let title = 'Rouse.One - ' + product.caption;
        let description = 'Rouse.One - Интернет магазин экологичекий косметики';
        let keywords = '';

        product.description = product.description.replace(/\r\n|\r|\n/g,"<br />");

        res.render('product', {
            title: title
            , description: description
            , keywords: keywords
            , product: product
            , categories: categories
            , Url: Url
        });
    });
});

module.exports = router;
