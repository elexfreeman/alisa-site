let express = require('express');
let router = express.Router();

let Categories = require('../../models/categories');
let Products = require('../../models/products');

/* GET home page. */
router.get('/', function (req, res, next) {

  let categories = [];
   /*seo*/
    let title = 'Rouse.One - О нас';
    let description = 'Rouse.One - Интернет магазин экологичекий косметики';
   let keywords = '';

  Categories.getCategories().then((c) => {
    categories = c;
    res.render('about', {
      title: title
      , description: description
      , keywords: keywords
      , categories: categories     
    });
  });

});

module.exports = router;
