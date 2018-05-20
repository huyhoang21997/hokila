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
module.exports.getHTMLProduct = getHTMLProduct;
module.exports.getHTMLRowTable = getHTMLRowTable;
module.exports.getTypeMenu = getTypeMenu;