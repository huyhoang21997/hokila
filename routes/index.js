const express = require('express');
const router = express.Router();
// view
const getHTMLProduct = require('../views/views').getHTMLProduct;
const getHTMLRowTable = require('../views/views').getHTMLRowTable;
const getTypeMenu = require('../views/views').getTypeMenu;
const getAccountHTMLRowTable = require('../views/views').getAccountHTMLRowTable;
const getCommentList = require('../views/views').getCommentList;
const getCommentListStr = require('../views/views').getCommentListStr;
const getPageItems = require('../views/views').getPageItems;
const getCartProduct = require('../views/views').getCartProduct;
// bussiness
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('../business/passport');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({secret: 'mySecret'}));
router.use(passport.initialize());
router.use(passport.session());
// connection and models
const db = require('../models/connection');
const productSchema = require('../models/product');
const accountSchema = require('../models/account');
productSchema.find({}).exec(function(err, productsList) {
  if (!err) {
    console.log('Da tao xong server');
    var content_cart_icon = '';
    var qty = '';
    var total = '';
    // controller
    router.get('/', function(req, res) {
      var name = '', href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        if (req.user.role !== 'Khachhang') {
          res.render('admin-home', {
            layout: 'admin-layout',
            title: "Home",
            name: req.user.username,
          });
        }
        else {
          res.render('index', {title: 'All Products', 
            name: req.user.username,
            href: '/logout',
            action: action,
            state: ' - Log out',
            producer: 'All',
            items: getHTMLProduct(productsList, null, null, null, '../images/'),
            content_cart_icon: content_cart_icon,
            qty: qty,
            total: total,
            smartphone_menu: getTypeMenu(productsList)
          });
        }
      }
      else {
        res.render('index', {title: 'All Products', 
          href: '#',
          action: "document.getElementById('id01').style.display='block'",
          state: 'Log in',
          producer: 'All',
          items: getHTMLProduct(productsList, null, null, null, '../images/'),
          content_cart_icon: content_cart_icon,
          qty: qty,
          total: total,
          smartphone_menu: getTypeMenu(productsList)
        });
      }
    });
    router.get('/manage-products', function(req, res) {
      var href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        res.render('admin-product', {
          layout: 'admin-layout',
          title: "Manage Products",
          name: req.user.username,
          items: getHTMLRowTable(productsList)
        });
      }
      else {
        res.render(err);
      }
    });

    accountSchema.find({}).exec(function(err, accountsList) {
      if (!err) {
        router.get('/manage-accounts', function(req, res) {
          var href = '', state = '', action = '';
          if (req.isAuthenticated()) {
            res.render('admin-account', {
              layout: 'admin-layout',
              title: "Manage Accounts",
              name: req.user.username,
              items: getAccountHTMLRowTable(accountsList)
            });
          }
          else {
            res.render(err);
          }
        });
        router.post('/add-account', function(req, res) {
          if(req.isAuthenticated()) {
            var account = {
              username: req.body.username,
              password: req.body.password,
              role: req.body.role
            };
            var new_account = new accountSchema(account);
            new_account.save(function(err) {
              if (err) {
                console.log(err);
              }
              else {
                accountsList.push(account);
              }
            });
            res.redirect('/');
          }
        });
        router.post('/edit-account', function(req, res) {
          if(req.isAuthenticated()) {
            var account = {
              username: req.body.username,
              password: req.body.password,
              role: req.body.role,
            };
            accountSchema.updateOne(
              {username: req.body.username},
              {
                $set: {
                  password: req.body.password,
                  role: req.body.role
                }
              }, function(err) {
              if (err) {
                console.log(err);
              }
              else {
                for (var i = 0; i < accountsList.length; i++) {
                  if (accountsList[i].username === req.body.username) {
                    accountsList[i] = account;
                    break;
                  }
                }          
              }}
            );
            res.redirect('/');
          }
        });
        router.post('/delete-account', function(req, res) {
          if(req.isAuthenticated()) {
            accountSchema.deleteOne({username: req.body.username}, function(err) {
              if (err) {
                console.log(err);
              }
              else {
                for (var i = 0; i < accountsList.length; i++) {
                  if (accountsList[i].username === req.body.username) {
                    accountSchema.splice(i, 1);
                    break;
                  }
                }
              }
            });
            res.redirect('/');
          }
        });
      }});
    
    router.post('/add', function(req, res) {
      if(req.isAuthenticated()) {
        var product = {
          productName: req.body.product_name,
          productId: req.body.product_id,
          producer: req.body.producer,
          unitPrice: req.body.price,
          count: req.body.count,
          describe: req.body.describe,
          configuration: {
            screen: req.body.screen,
            camera: req.body.camera,
            pin: req.body.pin,
            ram: req.body.ram,
            cpu: req.body.cpu,
            os: req.body.os
          }
        };
        var new_product = new productSchema(product);
        new_product.save(function(err) {
          if (err) {
            console.log(err);
          }
          else {
            productsList.push(product);
          }
        });
        res.redirect('/');
      }
    });
    router.post('/edit', function(req, res) {
      if(req.isAuthenticated()) {
        var product = {
          productName: req.body.product_name,
          productId: req.body.product_id,
          producer: req.body.producer,
          unitPrice: req.body.price,
          count: req.body.count,
          describe: req.body.describe,
          configuration: {
            screen: req.body.screen,
            camera: req.body.camera,
            pin: req.body.pin,
            ram: req.body.ram,
            cpu: req.body.cpu,
            os: req.body.os
          }
        };
        productSchema.updateOne(
          {productId: req.body.product_id},
          {
            $set: {
              productName: req.body.product_name,
              producer: req.body.producer,
              unitPrice: req.body.price,
              count: req.body.count,
              describe: req.body.describe,
              configuration: {
                screen: req.body.screen,
                camera: req.body.camera,
                pin: req.body.pin,
                ram: req.body.ram,
                cpu: req.body.cpu,
                os: req.body.os
            }
          }
        }, function(err) {
          if (err) {
            console.log(err);
          }
          else {
            for (var i = 0; i < productsList.length; i++) {
              if (productsList[i].productId === req.body.product_id) {
                productsList[i] = product;
                break;
              }
            }          }
        });
        res.redirect('/');
      }
    });
    router.post('/delete', function(req, res) {
      if(req.isAuthenticated()) {
        productSchema.deleteOne({productId: req.body.product_id}, function(err) {
          if (err) {
            console.log(err);
          }
          else {
            for (var i = 0; i < productsList.length; i++) {
              if (productsList[i].productId === req.body.product_id) {
                productsList.splice(i, 1);
                break;
              }
            }
          }
        });
        res.redirect('/');
      }
    });
    router.post('/login', passport.authenticate('local', {
      failureRedirect: '/',
      successRedirect: '/'
    }));
    router.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });
    router.get('/details/:productId', function(req, res) {
      var name = '', href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        name = req.user.username;
        href = '/logout';
        state = ' - Log out';
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
          name: name,
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
          comment_list: getCommentList(productsList, product.productId, 1),
          page_list: getPageItems(productsList, product.productId),
          items: getHTMLProduct(productsList, product, null, null, '../images/'),
          content_cart_icon: content_cart_icon,
          qty: qty,
          total: total,
          smartphone_menu: getTypeMenu(productsList)
        });
      }
      else {
        res.render('error', {});
      }
    });
    router.get('/smartphone/:producer', function(req, res) {
      var name = '', href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        name = req.user.username;
        href = '/logout';
        state = ' - Log out';
      }
      else {
        href = '#';
        state = 'Log in';
        action = "document.getElementById('id01').style.display='block'";
      }
    
      res.render('index', {title: req.params.producer + ' Products',
        name: name,
        href: href,
        action: action,
        state: state,
        producer: req.params.producer,
        items: getHTMLProduct(productsList, null, req.params.producer, null, '../images/'),
        content_cart_icon: content_cart_icon,
        qty: qty,
        total: total,
        smartphone_menu: getTypeMenu(productsList)
      });
    });
    router.get('/search', function(req, res) {
      var name = '', href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        name = req.user.username;
        href = '/logout';
        state = ' - Log out';
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
        items: getHTMLProduct(productsList, null, null, req.query.name.toLowerCase(), '../images/'),
        content_cart_icon: content_cart_icon,
        qty: qty,
        total: total,
        smartphone_menu: getTypeMenu(productsList)
      });
    });

    router.post('/comment/:id', function(req, res) {
      var comment = {
        "username": req.body.username,
        "content": req.body.content,
        "date": req.body.date
      }
      productSchema.updateOne({productId: req.params.id}, {
        $push: {comment: comment}}, function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
      });
      res.send("success");
    });

    router.get('/comment/:id/:num', function(req, res) {
      res.send(getCommentListStr(productsList, req.params.id, req.params.num));
    });

    var content_cart = '';
    router.get('/shopping-cart', function(req, res) {
      var name = '', href = '', state = '', action = '';
      if (req.isAuthenticated()) {
        name = req.user.username;
        href = '/logout';
        state = ' - Log out';
      }
      else {
        href = '#';
        state = 'Log in';
        action = "document.getElementById('id01').style.display='block'";
      }

      res.render('cart', {title: 'Your Shopping Cart',
        name: name,
        href: href,
        action: action,
        state: state,
        content_cart: content_cart,
        content_cart_icon: content_cart_icon,
        qty: qty,
        total: total,
        smartphone_menu: getTypeMenu(productsList)
      });
    });

    router.post('/shopping-cart/:id', function(req, res) {
      res.send(getCartProduct(productsList, req.params.id));
    });
  }
});
module.exports = router;