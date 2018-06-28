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
const getCartProductListHTML = require('../views/views').getCartProductListHTML;
const getOrderRowTableHTML = require('../views/views').getOrderRowTableHTML;
const getProducerRowTableHTML = require('../views/views').getProducerRowTableHTML;
// bussiness
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('../business/passport');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())
router.use(session({secret: 'mySecret'}));
router.use(passport.initialize());
router.use(passport.session());
const nodemailer = require('nodemailer')
const multer = require('multer')
// connection and models
const db = require('../models/connection');
const productSchema = require('../models/product');
const accountSchema = require('../models/account');
const billSchema = require('../models/bill');
const producerSchema = require('../models/producer');

// upload file
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({storage:storage})

// get database
const async = require('async')
async.parallel([
  function(cb) {
    productSchema.find({}, cb)
  },
  function(cb) {
    accountSchema.find({}, cb)
  },
  function(cb) {
    billSchema.find({}, cb)
  },
  function(cb) {
    producerSchema.find({}, cb)
  }
], function(err, results) {
    if(err == null) {
      console.log("Da doc xong du lieu")
      var productsList = results[0]
      var accountsList = results[1]
      var billsList = results[2]
      var producersList = results[3]
      var listRegister = []
      // controller
      // hien thi san pham
      router.get("/", function(req, res) {
        if(req.isAuthenticated()) {
          if(req.user.role == "Khachhang") {
            res.render("index", {
              display3: "block",
              display4: "block",
              display1: "none",
              display2: "none",
              name: req.user.username,
              producer: "Hot",
              items: getHTMLProduct(productsList, null, null, null, "../images/"),
              smartphone_menu: getTypeMenu(productsList)
            })
          }
          else {
            res.render("admin-home", {
              layout: "admin-layout",
              title: "Home",
              name: req.user.username,
            })
          }
        }
        else {
          res.render("index", {
            display1: "block",
            display2: "block",
            display3: "none",
            display4: "none",
            producer: "All",
            items: getHTMLProduct(productsList, null, null, null, "../images/"),
            smartphone_menu: getTypeMenu(productsList)
          })
        }
      })

      router.get("/details/:productId", function(req, res) {
        var display1, display2, display3, display4, name, role = null, name = null, state = null
        if (!req.isAuthenticated()) {
          display1 = "block"
          display2 = "block"
          display3 = "none"
          display4 = "none"
        }
        else if (req.user.role == "Khachhang") {
          display1 = "none"
          display2 = "none"
          display3 = "block"
          display4 = "block"
          role = "Khachhang"
          name = req.user.username
          state = "disabled"
        }
        else {
          role = "Quanly"
        }
        if (role != "Quanly") {
          var product = productsList.find(product => product.productId == req.params.productId)
          if (product != null) {
            var other = "", price = product.unitPrice
            res.render("details", {
              display1: display1,
              display2: display2,
              display3: display3,
              display4: display4,
              title: product.productName,
              name: name,
              state: state,
              main_offer: other,
              main_src: "../images/" + product.productId, 
              main_name: product.productName,
              main_describe: product.describe,
              main_new_price: price.toLocaleString("vi"),
              main_screen: product.configuration.screen,
              main_camera: product.configuration.camera,
              main_pin: product.configuration.pin,
              main_ram: product.configuration.ram,
              main_cpu: product.configuration.cpu,
              main_os: product.configuration.os,
              comment_list: getCommentList(productsList, product.productId, 1),
              page_list: getPageItems(productsList, product.productId),
              items: getHTMLProduct(productsList, product, null, null, "../images/"),
              smartphone_menu: getTypeMenu(productsList)
            })
          }
          return
        }
        res.render("error")
      })

      router.get("/smartphone/:producer", function(req, res) {
        var display1, display2, display3, display4, name, role = null, name = null
        if (!req.isAuthenticated()) {
          display1 = "block"
          display2 = "block"
          display3 = "none"
          display4 = "none"
        }
        else if (req.user.role == "Khachhang") {
          display1 = "none"
          display2 = "none"
          display3 = "block"
          display4 = "block"
          role = "Khachhang"
          name = req.user.username
        }
        else {
          role = "Quanly"
        }
        if (role != "Quanly") {
          res.render("index", {title: req.params.producer + " Products",
            display1: display1,
            display2: display2,
            display3: display3,
            display4: display4,
            name: name,
            producer: req.params.producer,
            items: getHTMLProduct(productsList, null, req.params.producer, null, "../images/"),
            smartphone_menu: getTypeMenu(productsList)
          })
          return
        }
        res.render("error")
      })

      router.get("/search", function(req, res) {
        var display1, display2, display3, display4, name, role = null, name = null
        if (!req.isAuthenticated()) {
          display1 = "block"
          display2 = "block"
          display3 = "none"
          display4 = "none"
        }
        else if (req.user.role == "Khachhang") {
          display1 = "none"
          display2 = "none"
          display3 = "block"
          display4 = "block"
          role = "Khachhang"
          name = req.user.username
        }
        else {
          role = "Quanly"
        }
        if (role != "Quanly") {
          res.render("index", {title: req.query.name.toLowerCase() + " Products",
            display1: display1,
            display2: display2,
            display3: display3,
            display4: display4,
            name: name,
            producer: req.query.name.toLowerCase(),
            items: getHTMLProduct(productsList, null, null, req.query.name.toLowerCase(), "../images/"),
            smartphone_menu: getTypeMenu(productsList)
          })
          return
        }
        res.render("error")
      })
      
      // binh luan san pham
      router.get("/comment/:id/:num", function(req, res) {
        res.send(getCommentListStr(productsList, req.params.id, req.params.num))
      })

      router.post("/comment/:id", function(req, res) {
        var newcomment = {
          username: req.body.username,
          date: req.body.date,
          content: req.body.content
        }

        var product = productsList.find(function(element) {
          return element.productId == req.params.id
        })

        product.comment.push(newcomment)

        product.save(function(err) {
          res.writeHead(200)
          res.end()
        })
      })

      // dang nhap, dang xuat, dang ky
      router.post("/login", passport.authenticate("local", {
        failureRedirect: "/",
        successRedirect: "/"
      }))

      router.post("/logout", function(req, res){
        req.logout()
        res.redirect("/")
      })

      router.post("/register", function(req, res) {
        if (accountsList.find(element => element.email == req.body.email || element.username == req.body.username) == null) {
          var newuser = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            role: 'Khachhang'
          }

          var link = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) // cap key ngau nhien

          listRegister.push({
            user: newuser,
            link: link
          })
          // gui link kich hoat tai khoan qua email
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "21huyhoang09@gmail.com", // generated ethereal user
                pass: "hokilashop" // generated ethereal password
            }
          });

          // setup email data with unicode symbols
          let mailOptions = {
              from: '"Pham Huy Hoang 👻" <21huyhoang09@gmail.com>', // sender address
              to: newuser.email, // list of receivers
              subject: 'Create your shopping account', // Subject line
              text: 'Please click this link to active your account', // plain text body
              html: '<a href="http://localhost:3000/validate/' + link + '">Your link</a>'// html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
          });
          res.redirect("/?info=validate")
        }
        else {
          res.redirect("/?info=error")
        }
      })

      router.get("/validate/:link", function(req, res) {
        var register = listRegister.find(function(element) { return element.link == req.params.link})
        if (register != null) {
          var newuser = new accountSchema(register.user)
          newuser.save(function(err) {
            if(err) {
              console.log(err)
            }
            else {
              accountsList.push(newuser)
            }
          })
        }
        res.redirect("/")
      })

      router.post("/forgot", function(req, res) {
        var user = accountsList.find(function(element) {
          return element.email == req.body.email
        })
        // gui email goi y mat khau hien tai
        if (user == null) {
          res.redirect("/?info=notexist")
        }
        else {
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "21huyhoang09@gmail.com", // generated ethereal user
                pass: "hokilashop" // generated ethereal password
            }
          });

          // setup email data with unicode symbols
          let mailOptions = {
              from: '"Pham Huy Hoang 👻" <21huyhoang09@gmail.com>', // sender address
              to: user.email, // list of receivers
              subject: 'Forgot password', // Subject line
              text: 'Your password: ' + user.password, // plain text body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
          });
          res.redirect("/?info=exist")
        }
      })

      router.post("/reset", function(req, res) {
        var user = accountsList.find(function(element) {
          return element.username == req.user.username
        })

        if (user.password == req.body.oldpassword) {
          user.password = req.body.newpassword
          user.save (function(err) {
            if(err) {
              console.log(err)
            }
            else {
              console.log('Thay doi mat khau thanh cong')
            }
          })
          res.redirect("/?info=pwupdated")
        }
        else {
          res.redirect("/?info=notcorrect")
        }
      })

      // quan ly san pham
      router.get("/manage-products", function(req, res) {
        if (req.isAuthenticated()) {
          if (req.user.role == "Quanly"){
            res.render("admin-product", {
              layout: "admin-layout",
              title: "Manage Products",
              name: req.user.username,
              items: getHTMLRowTable(productsList)
            })
            return
          }
        }
        res.render("error")
      })

      router.post("/add", function(req, res) {
        if(req.isAuthenticated()) {
          if(req.user.role == "Quanly") {
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
            }
            var new_product = new productSchema(product)
            new_product.save(function(err) {
              if (err) {
                console.log(err)
              }
              else {
                productsList.push(product)
              }
            })
            res.redirect("/manage-products")
            return
          }
        }
        res.render("error")
      })

      router.post("/edit", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
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
            }
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
                console.log(err)
              }
              else {
                for (var i = 0; i < productsList.length; i++) {
                  if (productsList[i].productId === req.body.product_id) {
                    productsList[i] = product
                    break
                  }
                }          
              }
            })
            res.redirect("/manage-products")
            return
          }
        }
        res.render("error")
      })

      router.post("/delete", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            productSchema.deleteOne({productId: req.body.product_id}, function(err) {
              if (err) {
                console.log(err)
              }
              else {
                for (var i = 0; i < productsList.length; i++) {
                  if (productsList[i].productId === req.body.product_id) {
                    productsList.splice(i, 1)
                    break
                  }
                }
              }
            })
            res.redirect("/manage-products")
            return
          }
        }
        res.render("error")
      })

      // quan ly tai khoan
      router.get("/manage-accounts", function(req, res) {
        if (req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            res.render("admin-account", {
              layout: "admin-layout",
              title: "Manage Accounts",
              name: req.user.username,
              items: getAccountHTMLRowTable(accountsList)
            })
            return
          }
        }                    
        res.render("error")
      })

      router.post("/add-account", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            var account = {
              username: req.body.username,
              password: req.body.password,
              email: req.body.email,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              phone: req.body.phone,
              address: req.body.address,
              role: req.body.role
            }
            var new_account = new accountSchema(account)
            new_account.save(function(err) {
              if (err) {
                console.log(err)
              }
              else {
                accountsList.push(account)
              }
            })
          }
          res.redirect("/manage-accounts")
          return
        }
        res.render("error")
      })

      router.post("/edit-account", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            accountSchema.updateOne(
              {username: req.body.username},
              {
                $set: {
                  email: req.body.email,
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  phone: req.body.phone,
                  address: req.body.address,
                  role: req.body.role
                }
              }, function(err) {
              if (err) {
                console.log(err)
              }
              else {
                for (var i = 0; i < accountsList.length; i++) {
                  if (accountsList[i].username === req.body.username) {
                    accountsList[i].email = req.body.email,
                    accountsList[i].firstname = req.body.firstname,
                    accountsList[i].lastname = req.body.lastname,
                    accountsList[i].phone = req.body.phone,
                    accountsList[i].address = req.body.address,
                    accountsList[i].role = req.body.role
                    break
                  }
                }          
              }}
            )
            res.redirect("/manage-accounts")
            return
          }
        }
        res.render("error")
      })

      router.post("/delete-account", function(req, res) {
        if(req.isAuthenticated()) {
          if(req.user.role == "Quanly") {
            accountSchema.deleteOne({username: req.body.username}, function(err) {
              if (err) {
                console.log(err)
              }
              else {
                for (var i = 0; i < accountsList.length; i++) {
                  if (accountsList[i].username === req.body.username) {
                    accountsList.splice(i, 1)
                    break
                  }
                }
              }
            })
            res.redirect("/manage-accounts")
            return
          }
        }
        res.render("error")
      })

      // quan ly gio hang



      router.get('/shopping-cart', function(req, res) {
        var display1, display2, display3, display4, name, role = null, name = null, state = null
          if (!req.isAuthenticated()) {
            display1 = "block"
            display2 = "block"
            display3 = "none"
            display4 = "none"
          }
          else if (req.user.role == "Khachhang") {
            display1 = "none"
            display2 = "none"
            display3 = "block"
            display4 = "block"
            role = "Khachhang"
            name = req.user.username
            state = "disabled"
          }
          else {
            role = "Quanly"
          }
          if (role != "Quanly") {
            let result = getCartProductListHTML(req.cookies.list);
            if (result == null) {
              result = {
                html_object: "",
                total_money: "0"
              }
            }


            res.render('cart', {title: 'Your Shopping Cart',
              display1: display1,
              display2: display2,
              display3: display3,
              display4: display4,
              name: name,
              content_cart: result.html_object,
              total: result.total_money.toLocaleString('vi') + '₫',
              smartphone_menu: getTypeMenu(productsList)
            })
          }
      });

      router.post('/shopping-cart/:id', function(req, res) {
        res.send(getCartProduct(productsList, req.params.id));
      });


      router.post('/checkout/:username', function(req, res) {
        if(req.isAuthenticated()) {
          var bill = {
            customer: req.params.username,
            date: req.body.date,
            state: "Not delivered",
            product: JSON.parse(req.body.list),
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: req.body.address,
            total_count: req.body.total_count,
            total_price: req.body.total_price,
            state: 'Not delivered'
          };         
              
          var new_bill = new billSchema(bill);
          new_bill.save(function(err) {
            if (err) {
              console.log("Fail");
            }
            else {
              console.log("success");
              billsList.push(new_bill)
            }
          });
          res.send('success');
        }
      });

      router.get('/manage-orders', function(req, res) {
        var href = '', state = '', action = '';
        if (req.isAuthenticated()) {
          res.render('admin-order', {
            layout: 'admin-layout',
            title: "Manage Orders",
            name: req.user.username,
            items: getOrderRowTableHTML(billsList)
          });
        }
        else {
          res.render('error');
        }
      });

      router.get('/data/bill/:id', function(req, res) {
        var bill = billsList.find(element => element._id == req.params.id)
        res.writeHead(200, {"Content-Type": "text/JSON"})
        res.write(JSON.stringify(bill))
        res.end()
      })


      router.post('/updateBill', function(req, res) {
        if (req.user.role == "Quanly") {
          billSchema.updateOne(
            {_id: req.body.id},
            {
              $set: {
                state: req.body.state,
              }
            }, function(err) {
            if (err) {
              console.log(err)
            }
            else {
              billsList.find(element => element._id == req.body.id).state = req.body.state          
            }}
          )
          res.end('Success')
        }
        else {
          res.end('Fail')
        }
      })


      router.get('/profile/:username', function(req, res) {
        var display1, display2, display3, display4, name, role = null, name = null, state = null
        if (req.isAuthenticated()) {
           if (req.user.role == "Khachhang") {
            display1 = "none"
            display2 = "none"
            display3 = "block"
            display4 = "block"
            role = "Khachhang"
            name = req.user.username
            state = "disabled"

            var user = accountsList.find(function(element) {
              return element.username == req.params.username
            })

            res.render('profile', {title: 'Your Profile',
              display1: display1,
              display2: display2,
              display3: display3,
              display4: display4,
              name: name,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              phone: user.phone,
              address: user.address,
              //birthday: user.birthday,
              //gender: user.gender,
              smartphone_menu: getTypeMenu(productsList)
            })
          }  
        }
      });


      router.post("/edit-profile", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Khachhang") {
            accountSchema.updateOne(
              {username: req.body.username},
              {
                $set: {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  phone: req.body.phone,
                  address: req.body.address
                  //birthday: req.body.birthday,
                  //gender: req.body.gender
                }
              }, function(err) {
              if (err) {
                console.log(err)
              }
              else {
                for (var i = 0; i < accountsList.length; i++) {
                  if (accountsList[i].username === req.body.username) {
                    accountsList[i].firstname = req.body.firstname
                    accountsList[i].lastname = req.body.lastname
                    accountsList[i].phone = req.body.phone
                    accountsList[i].address = req.body.address
                    break
                  }
                }          
              }
            })
            res.send('success')
          }
        }
      })


      router.post('/upload', upload.single('file'), function(req, res) {
        res.redirect("/manage-products")
      })


      // quan ly nha san xuat
      router.get("/manage-producers", function(req, res) {
        if (req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            res.render("admin-producer", {
              layout: "admin-layout",
              title: "Manage Producers",
              name: req.user.username,
              items: getProducerRowTableHTML(producersList)
            })
            return
          }
        }                    
        res.render("error")
      })

      router.post("/add-producer", function(req, res) {
        if(req.isAuthenticated()) {
          if (req.user.role == "Quanly") {
            var producer = {
              name: req.body.name,
            }
            var new_producer = new producerSchema(producer)
            new_producer.save(function(err) {
              if (err) {
                console.log(err)
              }
              else {
                producersList.push(producer)
              }
            })
          }
          res.redirect("/manage-producers")
          return
        }
        res.render("error")
      })

      router.post("/delete-producer", function(req, res) {
        if(req.isAuthenticated()) {
          if(req.user.role == "Quanly") {
            producerSchema.deleteOne({name: req.body.name}, function(err) {
              if (err) {
                console.log(err)
              }
              else {
                for (var i = 0; i < producersList.length; i++) {
                  if (producersList[i].name === req.body.name) {
                    producersList.splice(i, 1)
                    break
                  }
                }
              }
            })
            res.redirect("/manage-producers")
            return
          }
        }
        res.render("error")
      })
    }
    else {
      console.log(err)
    }
  }
)

module.exports = router
