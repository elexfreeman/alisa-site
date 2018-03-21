let express = require('express');
let router = express.Router();
let Categories = require('../../models/categories');
let Products = require('../../models/products');


/*seo*/
let title = 'Rouse.One - Интернет магазин экологичекий косметики';
let description = 'Rouse.One - Интернет магазин экологичекий косметики';
let keywords = '';


/* GET home page. */
router.get('/', function (req, res, next) {

  let categories = [];

  Categories.getCategories().then((c) => {
    categories = c;
    return Products.getPopular();

  }).then((popProducts) => {
    res.render('main_page', {
      title: title
      , description: description
      , keywords: keywords
      , categories: categories
      , popProducts: popProducts
    });
  });

});

module.exports = router;
