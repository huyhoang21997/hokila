jQuery(document).ready(function($) {
    let pathname = window.location.pathname;
    let sep = pathname.lastIndexOf('/');
    // get product id
    let id = pathname.slice(sep + 1, pathname.length + 1);

    var cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");
    // display cart product list at header when loading page
    getHeaderCartProductListHTML(cart_product_list);
                
    $("#add-to-cart").on('click', function(event) {
        event.preventDefault();

        // display quantity of all cart products
        var qty = $(".cart_no").text();
        if (qty === "") {
            qty = "0";
        }
        qty = parseInt(qty);
        qty++;

        // display total money of all cart products
        let product_price = $(".new_price").text()
        let total_price = $(".total").text();
        let new_price = parseInt(convertLocaleString(total_price)) + parseInt(convertLocaleString(product_price));
        
        $.ajax({
            type: 'post',
            url: '/shopping-cart/' + id
        })
        .done(function(data) {
            // isn't added product in cart product list?
            var same = false;

            cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");

            for (var i = 0; i < cart_product_list.length; i++) {               
                if (JSON.parse(cart_product_list[i]).id === id) {
                    // get same cart product
                    let cart_product = JSON.parse(cart_product_list.splice(i, 1)[0]);
                    // update quantity                  
                    var quantity = cart_product.qty;                 
                    cart_product.qty = quantity + 1;                 
                    cart_product_list.splice(i, 0, JSON.stringify(cart_product));  

                    same = true;
                    
                    // get index (cart product at header is prepended) to update quantity immediately
                    let reverse_arr = cart_product_list.reverse();
                    for (var j = 0; j < reverse_arr.length; j++) {              
                        if (JSON.parse(reverse_arr[j]).id === id) {
                            break;
                        }
                    }
                    $(".option-cart-item li:nth-child(" + j+1 + ") #qty-num").html(quantity + 1);
                    break;
                }
            }

            if (same === false) {
                cart_product_list.push(JSON.stringify(data));
                $(".option-cart-item").prepend(getHeaderCartProductHTML(data.id, data.name, data.price, 1));    
            }
            
            $(".cart_no").html(qty);               
            $(".total strong").text(new_price.toLocaleString('vi') + '₫');              
            localStorage.setItem("cart_product_list", JSON.stringify(cart_product_list));
            console.log('done');          
        })
        .fail(function(data) {
            console.log('fail');
        });
    });

    $(".cart-icon").on('click', function(event) {
        event.preventDefault();
        let list = localStorage.getItem("cart_product_list") || "[]";
        var arr = [];
        arr.push(list);
        document.cookie = "list=" + arr;
        window.location = "./shopping-cart";
    });

    function getHeaderCartProductListHTML(cartProductList) {
        var totalMoney = 0;
        var quantity = 0;
    
        for (var i = 0; i < cartProductList.length; i++) {
            let cart_product = JSON.parse(cartProductList[i]);
            totalMoney += cart_product.price * cart_product.qty;
            quantity += cart_product.qty;
    
            $(".option-cart-item").prepend(getHeaderCartProductHTML(cart_product.id, cart_product.name, cart_product.price, cart_product.qty));
        }
    
        $(".cart_no").html(quantity);
        $(".total strong").text(totalMoney.toLocaleString('vi') + '₫');
    }
});
  
  function getHeaderCartProductHTML(id, name, price, qty) {
    var html_object = '';
    
        html_object = '<li>\
        <div class="cart-item">\
          <div class="image">\
            <img src="../images/' + id + '_1.jpg" alt="">\
          </div>\
          <div class="item-description">\
            <p class="name">' + name + '</p>\
            <p>\
              <span class="light-red price">' + price.toLocaleString('vi') + '₫</span>\
              <br>\
              Quantity:<span class="light-red" id="qty-num">' + qty + '</span>\
            </p>\
          </div>\
          <div class="right">\
            <a href="#" class="remove">\
              <img id="remove-cart-product" src="../images/remove.png" alt="remove">\
            </a>\
          </div>\
        </div>\
      </li>\
      ';
  
    return html_object;
  }



// convert from price (locale string) to price (int)
function convertLocaleString(price) {
    let res = '';
    for (let i = 0; i < price.length; i++) {
        if (price[i] >= "0" && price[i] <= "9") {
            res += price[i];
        }
    }
    if (res === '') {
        res = "0";
    }
    return res;
}