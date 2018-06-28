const DOMParser = require('xmldom').DOMParser;
function getHTMLProduct(productsList, product, producer, name, url) {
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
function getHTMLRowTable(productsList) {
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
function getAccountHTMLRowTable(accountsList) {
  var html_string = '';
  for (var i = 0; i < accountsList.length; i++) {
      html_string += '<tr ondblclick="editOrDeleteAccount(\''
      + accountsList[i].username + '\',\''
      + accountsList[i].email + '\',\''
      + accountsList[i].firstname + '\',\''
      + accountsList[i].lastname + '\',\''
      + accountsList[i].phone + '\',\''
      + accountsList[i].address + '\',\''
      + accountsList[i].role + '\',\''
      + '\')">';

      html_string += '<td>' + accountsList[i].username + '</td>';
      html_string += '<td>' + accountsList[i].email + '</td>';
      html_string += '<td>' + accountsList[i].role + '</td>';      
      
      html_string += '</tr>';
  }
  
  return new DOMParser().parseFromString(html_string);
}
function getTypeMenu(productsList) {
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

function getCommentListStr(productsList, productId, num) {
  var html_object = '';
  for (let i = 0; i < productsList.length; i++) {
    if (productsList[i].productId === productId) {
      let startIndex = (num - 1) * 5;
      let startPos = productsList[i].comment.length - 1 - startIndex;
      let endPos = startPos - 5;
      if (endPos < 0) {
        endPos = -1;
      }   

      for (let j = startPos; j > endPos; j--) {
        html_object += '\
          <p style="font-size: 15px; font-weight: bold;">' + productsList[i].comment[j].username + '</p>\
          <p style="font-size: 13px; color: #9b9b9b;">' + productsList[i].comment[j].date.getDate() 
          + '/' + (productsList[i].comment[j].date.getMonth() + 1)
          + '/' + productsList[i].comment[j].date.getFullYear() 
          + ' ' + productsList[i].comment[j].date.getHours() 
          + ':' + productsList[i].comment[j].date.getMinutes() + '</p>\
          <p style="font-size: 14px">' + productsList[i].comment[j].content + '</p>\
          <hr>\
        ';
      }

      break;
    }
  }

  return html_object;
}

function getPageItems(productsList, productId) {
  var html_object = '';
  var count = 0;
  for (var i = 0; i < productsList.length; i++) {
    if (productsList[i].productId === productId) {
      count = Math.ceil(productsList[i].comment.length / 5);
      break;
    }
  }

  if (count > 1) {
    var j = 1;
    while (j <= count) {
      html_object += '\
        <li class="page-item"><a class="page-link">' + j + '</a></li>\
      ';
      j++;
    }
  }

  return new DOMParser().parseFromString(html_object);
}

function getCommentList(productsList, productId, num) {
  return new DOMParser().parseFromString(getCommentListStr(productsList, productId, num));
}

function getCartProduct(productsList, productId) {
  var result;
  for (var i = 0; i < productsList.length; i++) {
    if (productsList[i].productId === productId) {
      result = {
        "id": productsList[i].productId,
        "name": productsList[i].productName,
        "price": productsList[i].unitPrice,
        "qty": 1
      };
    }
  }

  return result;
}

function getCartProductHTML(id, name, price, qty) {
  var html_object = '';
  
      html_object = '<tr>\
        <td>\
          <img src="../images/' + id + '_1.jpg" alt="">\
        </td>\
        <td>\
          <div class="shop-details">\
            <div class="productname">' + name + '</div>\
          </div>\
        </td>\
        <td>\
          <h5>' + price.toLocaleString('vi') + '₫</h5>\
        </td>\
        <td>\
          <div class="qty">\
            <span id="' + id + '" class="qty-minus">-</span>\
            <input style="width:50px" class="qty-num" name="' + id + '" type="text" value="' + qty + '">\
            <span id="' + id + '" class="qty-plus">+</span>\
          </div>\
        </td>\
        <td>\
          <img class="remove-cart-product" id="' + id + '" src="../images/remove.png" alt="">\
        </td>\
      </tr>';

  return html_object;
}

function getCartProductListHTML(cartProductList) {
  let cart_product_list = JSON.parse(cartProductList);
  var html_object = '';
  var total_money = 0;
  for (var i = cart_product_list.length - 1; i >= 0; i--) {
    let cart_product = JSON.parse(cart_product_list[i]);
    total_money += cart_product.price * cart_product.qty;
    html_object += getCartProductHTML(cart_product.id, cart_product.name, cart_product.price, cart_product.qty);
  }

  let result = {
    'html_object': html_object,
    'total_money': total_money
  };

  return result;
}

function getOrderRowTableHTML(billsList) {
  var html_string = '';
  for (var i = 0; i < billsList.length; i++) {
      html_string += '<tr ondblclick="viewDetailOrder(' + "'" + billsList[i]._id + "'" + ')">'
      html_string += '<td>' + billsList[i]._id + '</td>';
      html_string += '<td>' + billsList[i].date.getDate() + '/' + (billsList[i].date.getMonth() + 1) + '/' + billsList[i].date.getFullYear() + ' ' + billsList[i].date.getHours() + ':' + billsList[i].date.getMinutes() + '</td>'
      html_string += '<td>' + billsList[i].total_count + '</td>';   
      html_string += '<td>' + billsList[i].total_price.toLocaleString('vi') + '₫</td>';
      var s1 = '', s2 = '', s3 = ''
      switch(billsList[i].state) {
        case 'Not delivered':
        s1 = 'selected'
        break
        case 'Delivering':
        s2 = 'selected'
        break
        case 'Delivered':
        s3 = 'selected'
      }
      html_string += '<td><select name="state" onchange="updateBill(' + i + ')">\
                        <option ' + s1 + ' value="Not Delivered">Not Delivered</option>\
                        <option ' + s2 + ' value="Delivering">Delivering</option>\
                        <option ' + s3 + ' value="Delivered">Delivered</option>\
                      </select></td>';
      html_string += '</tr>';
  }
  
  return new DOMParser().parseFromString(html_string);
}

function getProducerRowTableHTML(producersList) {
  var html_string = '';
  for (var i = 0; i < producersList.length; i++) {
      html_string += '<tr ondblclick="deleteProducer(\''
      + producersList[i].name + '\',\''
      + '\')">';
      html_string += '<td>' + producersList[i].name + '</td>'; 
      html_string += '</tr>';
  }
  return new DOMParser().parseFromString(html_string);
}

module.exports.getHTMLProduct = getHTMLProduct;
module.exports.getHTMLRowTable = getHTMLRowTable;
module.exports.getTypeMenu = getTypeMenu;
module.exports.getAccountHTMLRowTable = getAccountHTMLRowTable;
module.exports.getCommentListStr = getCommentListStr;
module.exports.getCommentList = getCommentList;
module.exports.getPageItems = getPageItems;
module.exports.getCartProduct = getCartProduct;
module.exports.getCartProductListHTML = getCartProductListHTML;
module.exports.getOrderRowTableHTML = getOrderRowTableHTML;
module.exports.getProducerRowTableHTML = getProducerRowTableHTML;