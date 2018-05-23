var express = require('express');
var router = express.Router();

const DOMParser = require('xmldom').DOMParser;
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

function getHTMLRowTable() {
    var html_string = '';
    var configuration = '';
    var describe;
    for (var i = 0; i < productsList.length; i++) {
        html_string += '<tr ondblclick="editOrDelete(\''
        + productsList[i].productName + '\',\''
        + productsList[i].productId + '\',\''
        + productsList[i].producer + '\',\''
        + productsList[i].unitPrice + '\',\''
        + productsList[i].count + '\',\''
        + productsList[i].describe + '\',\''
        + productsList[i].configuration.screen + '\',\''
        + productsList[i].configuration.camera + '\',\''
        + productsList[i].configuration.pin + '\',\''
        + productsList[i].configuration.ram + '\',\''
        + productsList[i].configuration.cpu + '\',\''
        + productsList[i].configuration.os + '\',\''
        + '\')">';

        html_string += '<td>' + productsList[i].productName + '</td>';
        html_string += '<td>' + productsList[i].productId + '</td>';
        html_string += '<td>' + productsList[i].producer + '</td>';      
        html_string += '<td>' + productsList[i].unitPrice.toLocaleString('vi') + '₫</td>';
        html_string += '<td>' + productsList[i].count + '</td>';

        configuration += 'Screen: ' + productsList[i].configuration.screen;
        configuration += '\nCamera: ' + productsList[i].configuration.camera;
        configuration += '\nPin: ' + productsList[i].configuration.pin;
        configuration += '\nRam: ' + productsList[i].configuration.ram;
        configuration += '\nCPU:' + productsList[i].configuration.cpu;
        configuration += '\nOS: ' + productsList[i].configuration.os;

        html_string += '<td><span class="view" title=\'' + configuration + '\' onclick="viewConfiguration(\''
        + productsList[i].productName + '\',\''
        + productsList[i].configuration.screen + '\',\''
        + productsList[i].configuration.camera + '\',\''
        + productsList[i].configuration.pin + '\',\''
        + productsList[i].configuration.ram + '\',\''
        + productsList[i].configuration.cpu + '\',\''
        + productsList[i].configuration.os + '\',\''
        + '\')"><i class="fa fa-eye view" aria-hidden="true"></i></span></td>';

        configuration = '';
        describe = productsList[i].describe;
        html_string += '<td><span class="view" title=\'' + describe + 
        '\' onclick="viewDescribe(\'' + productsList[i].productName + '\',\'' + describe + 
        '\')"><i class="fa fa-eye view" aria-hidden="true"></i></span></td>';
        html_string += '</tr>';
    }
    
    return new DOMParser().parseFromString(html_string);
}

/* GET users listing. */
router.get('/', function(req, res) {  
      res.render('admin-product', {
        layout: 'admin-layout',
        title: "Manage Products",
        items: getHTMLRowTable()
      });
});

router.post('/', function(req, res) {
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
  });

  productsList.push(product);

  res.redirect('/admin');
});

router.post('/edit', function(req, res) {
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
  });

  for (var i = 0; i < productsList.length; i++) {
    if (productsList[i].productId === req.body.product_id) {
      productsList.splice(i, 1);
      break;
    }
  }

  productsList.splice(i, 0, product);

  res.redirect('/admin');
});

router.post('/delete', function(req, res) {
  productSchema.deleteOne({productId: req.body.product_id}, function(err) {
    if (err) {
      console.log(err);
    }
  });

  for (var i = 0; i < productsList.length; i++) {
    if (productsList[i].productId === req.body.product_id) {
      productsList.splice(i, 1);
      break;
    }
  }

  res.redirect('/admin');
});

module.exports = router;