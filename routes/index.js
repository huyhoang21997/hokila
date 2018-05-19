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
// Lấy danh sách sản phẩm tương tự (cùng hãng)
// url: đường dẫn chứa file hình ảnh
function getHTMLProduct(product, producer, name, url) {
  var html_object = '', col = 0, html_child = '';
  var list = [];
  // lay ds san pham
  for (var i = 0; i < productsList.length; i++)
  {
    if (product != null) {
      if (productsList[i] != product && productsList[i].producer == product.producer) {
        list.push(productsList[i]);
      }
    }
    else if (producer != null) {
      if (productsList[i].producer == producer) {
        list.push(productsList[i]);
      }
    }
    else if (name != null) {
      if (productsList[i].productName.toLowerCase().includes(name)) {
        list.push(productsList[i]);
      }
    }
    else {
      list.push(productsList[i]);
    }
  }
  // hien thi danh sach san pham tuong tu
  for (var i = 0; i < list.length; i++) {
    var price, offer = '';
    if (list[i].other != null) // co khuyen mai
    {
      offer = 'div class="offer"> - ' + parseFloat(list[i].other)*100 + '% </div>';
      price = parseInt(productsList[i].unitPrice*(1 - productsList[i].other));
    }
    else {
      price = list[i].unitPrice;
      if (list[i].count == 0) // het hang
      {
        offer = 'div class="offer">' + 'Limited' + '</div>';
      }
    }
    html_child += '\
        <div class="col-md-3 col-sm-3">\
          <div class="products">\
            <a href="/details/' + list[i].productId + '">'
              + offer + '\
              <div class="thumbnail">\
                <img src="' + url + list[i].productId + '_1.jpg" alt="Product Name">\
              </div>\
              <div class="productname">' + list[i].productName + '</div>\
              <h4 class="price"> ' + price.toLocaleString('vi') + ' ₫ </h4>\
            </a>\
          </div>\
        </div>\
      ';
    col++;
    // Nếu số sản phẩm trong 1 list đầy (4) hoac het list thì sẽ tạo 1 list mới
    if (col === 4 || i == list.length - 1) {
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
  return new DOMParser().parseFromString(html_object);
}
function getHTMLRowTable() {
  var html_string = '';
  for (var i = 0; i < productsList.length; i++) {
    html_string += '<tr>';
    html_string += '<td class="tg-yw4l">' + productsList[i].productId + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].productName + '</td>';
    html_string += '<td class="tg-yw4l">' + productsList[i].describe + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].producer + '</td>';
    html_string += '<td class="tg-yw4l">' + productsList[i].unitPrice + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].count + '</td>';
    html_string += '<td class="tg-yw4l">' + productsList[i].configuration.screen + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].configuration.camera + '</td>';
    html_string += '<td class="tg-yw4l">' + productsList[i].configuration.pin + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].configuration.ram + '</td>';
    html_string += '<td class="tg-yw4l">' + productsList[i].configuration.cpu + '</td>';
    html_string += '<td class="tg-6k2t">' + productsList[i].configuration.os + '</td>';
    html_string += '</tr>';
  }
  return new DOMParser().parseFromString(html_string);
}
// Lấy tên các hãng smartphone để add vào smartphone menu
function getTypeMenu() {
  var html_object = '';
  for (let i = 0; i < productsList.length; i++) {
    if (html_object.search(productsList[i].producer) === -1) {
      html_object += '\
        <li>\
          <a href="/smartphone/' + productsList[i].producer + '">' + productsList[i].producer + '</a>\
        </li>\
      ';
    }
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
}));
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
/* GET home page. */
router.get('/', function(req, res, next) {
  var href = '', state = '', action = '';
  if (req.isAuthenticated()) {
    res.render('manager', {title: 'Manager', 
      href: '/logout',
      state: req.user.username + ' - Log out',
      items: getHTMLRowTable(),
      smartphone_menu: getTypeMenu()
    });
  }
  else {
    res.render('index', {title: 'All Products', 
      href: '#',
      action: "document.getElementById('id01').style.display='block'",
      state: 'Log in',
      producer: 'All',
      items: getHTMLProduct(null, null, null, '../images/'),
      smartphone_menu: getTypeMenu()
    });
  }
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

  var product = productsList.find(product => product.productId == req.params.productId);

  if (product != null) {
    var other = '', main_new_price = product.unitPrice;

    if (product.other != null) {
      //other = '- ' + product[0].other*100 + '%';
      main_new_price = main_new_price*(1 - product.other);
    }
    else {
      if (product.count == 0) {
        other = 'Limited';
      }
    }

    res.render('details', {
      title: product.productName,
      href: href,
      action: action,
      state: state,
      main_offer: other,
      main_src: '../images/' + product.productId, 
      main_name: product.productName,
      main_describe: product.describe,
      main_new_price: main_new_price.toLocaleString("vi"),
      main_screen: product.configuration.screen,
      main_camera: product.configuration.camera,
      main_pin: product.configuration.pin,
      main_ram: product.configuration.ram,
      main_cpu: product.configuration.cpu,
      main_os: product.configuration.os,
      items: getHTMLProduct(product, null, null, '../images/'),
      smartphone_menu: getTypeMenu()
    });
  }
  else {
    res.render('error', {});
  }
});
/* GET products list by producer*/
router.get('/smartphone/:producer', function(req, res, next) {
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

  res.render('index', {title: req.params.producer + ' Products', 
    href: href,
    action: action,
    state: state,
    producer: req.params.producer,
    items: getHTMLProduct(null, req.params.producer, null, '../images/'),
    smartphone_menu: getTypeMenu()
  });
});
/* GET products list by name*/
router.get('/search', function(req, res) {
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

  res.render('index', {title: req.query.name.toLowerCase() + ' Products', 
    href: href,
    action: action,
    state: state,
    producer: req.query.name.toLowerCase(),
    items: getHTMLProduct(null, null, req.query.name.toLowerCase(), '../images/'),
    smartphone_menu: getTypeMenu()
  });
});
module.exports = router;