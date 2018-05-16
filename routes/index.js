const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const UserDetail = require('../models/account');
const mongoose = require('mongoose');
const mongoDB = 'mongodb://hokilashop:hokilashop@ds149329.mlab.com:49329/hokilashop';
//Set up mongoose connection
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// get data
var productSchema = require('../models/product');
var productsList = [];
function getProductsList() {
  productSchema.find({})
  .exec(function(err, sp) {
    if (err) {
      console.log("error");
    }
    else {
      productsList = sp;
    }
  });
}
getProductsList();
// get HTML object
function getHTMLDetail(i, s) {
  var oldPrice = '', newPrice = '', offer = '';
  if (productsList[i].other != null) {
    //offer = '<div class="offer"> - ' + productsList[i].other*100 + '% </div>';
    //oldPrice = '<span class="old_price">' + productsList[i].unitPrice + '<sup> $ </sup> </span>';
    newPrice = '<span class="new_price">' + parseInt(productsList[i].unitPrice*(1 - productsList[i].other)) + '<sup> ₫ </sup> </span>';
  }
  else {
    if (productsList[i].count == 0) {
      offer = 'div class="offer">' + 'Limited' + '</div>';
    }
    newPrice = '<span class="new_price">' + productsList[i].unitPrice + '<sup> ₫ </sup> </span>';
  }
  var html_object = new DOMParser().parseFromString('\
        <a href="/details/' + productsList[i].productId + '">'
          + offer + '\
          <div class="thumbnail">\
            <img src="' + s + productsList[i].productId + '_1.jpg" alt="Product Name">\
          </div>\
          <div class="product-list-description">\
            <div class="productname">' + productsList[i].productName + '</div>\
            <p>' + productsList[i].describe + '</p>\
            <div class="list_bottom">\
              <div class="price">' + newPrice + oldPrice + '</div>\
            </div>\
          </div>\
        </a>\
  ');
  return html_object;
}
// function getHTMLListitem(i, s) {
//   var price, offer = '';
//   if (productsList[i].other != null) {
//     //offer = '<div class="offer"> - ' + productsList[i].other*100 + '% </div>';
//     price = parseInt(productsList[i].unitPrice*(1 - productsList[i].other));
//   }
//   else {
//     if (productsList[i].count == 0) {
//       offer = 'div class="offer">' + 'Limited' + '</div>';
//     }
//     price = productsList[i].unitPrice;
//   }
//   var html_object = new DOMParser().parseFromString('\
//         <a href="/details/' + productsList[i].productId + '">'
//           + offer + '\
//           <div class="thumbnail">\
//             <img src="' + s + productsList[i].productId + '_1.jpg" alt="Product Name">\
//           </div>\
//           <div class="productname">' + productsList[i].productName + '</div>\
//           <h4 class="price"> ₫ ' + price.toLocaleString('vi') + '</h4>\
//         </a>\
//   ');
//   return html_object;
// }

function getHTMLListitem(id, s) {
  var html_object = '', col = 0, html_child = '';
  for (let i = 0; i < productsList.length; i++) {
    if (productsList[i].productId !== id)
    {
      var price, offer = '';
      if (productsList[i].other != null) {
        //offer = '<div class="offer"> - ' + productsList[i].other*100 + '% </div>';
        price = parseInt(productsList[i].unitPrice*(1 - productsList[i].other));
      }
      else {
        if (productsList[i].count == 0) {
          offer = 'div class="offer">' + 'Limited' + '</div>';
        }
        price = productsList[i].unitPrice;
      }
      html_child += '\
        <div class="col-md-3 col-sm-3">\
          <div class="products">\
            <a href="/details/' + productsList[i].productId + '">'
              + offer + '\
              <div class="thumbnail">\
                <img src="' + s + productsList[i].productId + '_1.jpg" alt="Product Name">\
              </div>\
              <div class="productname">' + productsList[i].productName + '</div>\
              <h4 class="price"> ₫ ' + price.toLocaleString('vi') + '</h4>\
            </a>\
          </div>\
        </div>\
      ';

      col++;

      if (col === 4) {
        html_child = '\
          <li>\
            <div class="row">' 
              + html_child + 
            '</div>\
          </li>\
        ';

        html_object += html_child;
        html_child = '';
        col = 0;
      }
    }
  }

  if (col !== 0) {
    html_child = '\
      <li>\
        <div class="row">' 
          + html_child + 
        '</div>\
      </li>\
    ';
    html_object += html_child;
  }
  
  return new DOMParser().parseFromString(html_object);
}

// set up authentication
router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({secret: 'mySecret'}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(
  function(username, password, done) {
    UserDetail.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  UserDetail.findById(id, function(err, user) {
    if (user) {
      return done(null, user);
    }
    else {
      return done(null, false);
    }
  });
});
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  successRedirect: '/'
}))
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
/* Get details page. */
router.get('/details/:productId', function(req, res, next) {
  var href = '', state = '', action = '';
  if (req.isAuthenticated()) {
    href = '/logout';
    state = req.user.username + ' - Log out';
  }
  else {
    href = '#';
    state = 'Log in';
    action = "document.getElementById('id01').style.display='block'";
  }
  var product = productsList.filter(product => product.productId == req.params.productId);
  if (product != null) {
    var other = '', main_new_price = product[0].unitPrice;
    if (product[0].other != null) {
      //other = '- ' + product[0].other*100 + '%';
      main_new_price = main_new_price*(1 - product[0].other);
    }
    else {
      if (product[0].count == 0) {
        other = 'Limited';
      }
    }
    res.render('details', {
      title: product[0].productName,
      href: href,
      action: action,
      state: state,
      main_offer: other,
      main_src: '../images/' + product[0].productId, 
      main_name: product[0].productName,
      main_describe: product[0].describe,
      main_new_price: main_new_price.toLocaleString("vi"),
      main_screen: product[0].configuration.screen,
      main_camera: product[0].configuration.camera,
      main_pin: product[0].configuration.pin,
      main_ram: product[0].configuration.ram,
      main_cpu: product[0].configuration.cpu,
      main_os: product[0].configuration.os,
      items: getHTMLListitem(product[0].productId, '../images/'),
      title_header: 'Products Details',
      //main_old_price: product[0].unitPrice.toLocaleString("vi"),
      // item0: getHTMLListitem(0, '../images/'), 
      // item1: getHTMLListitem(1, '../images/'), 
      // item2: getHTMLListitem(2, '../images/')
    });
  }
  else {
    res.render('error', {});
  }
});
/* GET home page. */
router.get('/', function(req, res, next) {
  var href = '', state = '', action = '';
  if (req.isAuthenticated()) {
    href = '/logout';
    state = req.user.username + ' - Log out';
  }
  else {
    href = '#';
    state = 'Log in';
    action = "document.getElementById('id01').style.display='block'";
  }
  res.render('index', {title: 'Product list', 
    href: href,
    action: action,
    state: state,
    items: getHTMLListitem(-1, '../images/'),
    // item0: getHTMLDetail(0, 'images/'), 
    // item1: getHTMLDetail(1, 'images/'), 
    // item2: getHTMLDetail(2, 'images/'),
    title_header: 'Products'
  });
});
module.exports = router;