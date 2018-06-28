jQuery(document).ready(function($) {
    let pathname = window.location.pathname;
    let sep = pathname.lastIndexOf('/');
    // get product id
    let id = pathname.slice(sep + 1, pathname.length + 1);

    var cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");
    // display cart product list at header when loading page
    getHeaderCartProductListHTML(cart_product_list);
                
    $("#add-to-cart").on('click', function(event) {
        console.log("Hello")
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
                    // update quantity immediately
                    let j = cart_product_list.length - i;
                    $(".option-cart-item li:nth-child(" + j + ") #qty-num").html(quantity + 1);
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
        console.log(list)
        var arr = [];
        arr.push(list);
        document.cookie = "list=" + arr;
        window.location = "./shopping-cart";
    });

    $(".qty-minus").on('click', function(event) {
        event.preventDefault();
        let productId = $(this)[0].id;

        changeQuantity(productId, '-');
    });

    $(".qty-plus").on('click', function(event) {
        event.preventDefault();
        let productId = $(this)[0].id;

        changeQuantity(productId, '+');
    });

    $(".remove-cart-product").on('click', function(event) {
        event.preventDefault();
        let productId = $(this)[0].id;
        cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");

        for (var i = 0; i < cart_product_list.length; i++) {               
            if (JSON.parse(cart_product_list[i]).id === productId) {

                // remove this cart product view at header and in shopping cart page
                let j = cart_product_list.length - i; 
                $(".option-cart-item li:nth-child(" + j + ")").remove();
                $("#content-cart tr:nth-child(" + j + ")").remove();
                
                let cart_product = JSON.parse(cart_product_list[i]);
                // total money of all cart products
                let totalMoney = cart_product.price * cart_product.qty;
                let total_price = $(".total").text();
                let new_price = parseInt(convertLocaleString(total_price)) - totalMoney;
                // quantity of all cart products
                var qty = $(".cart_no").text();
                if (qty === "") {
                    qty = "0";
                }
                qty = parseInt(qty);
                qty -= cart_product.qty;
                // update total money at header immediately            
                $(".total strong").text(new_price.toLocaleString('vi') + '₫');
                // update total money in shopping cart page immediately
                $("#total-money p").text(new_price.toLocaleString('vi') + '₫');
                // display quantity of all cart products
                $(".cart_no").html(qty);

                cart_product_list.splice(i, 1);
                localStorage.setItem("cart_product_list", JSON.stringify(cart_product_list));
                break;
            }
        }
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

    function changeQuantity(productId, signal) {
        var cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");

        for (var i = 0; i < cart_product_list.length; i++) {               
            if (JSON.parse(cart_product_list[i]).id === productId) {
                // get same cart product
                let cart_product = JSON.parse(cart_product_list.splice(i, 1)[0]);
                                                  
                var quantity = cart_product.qty;
                let total_price = $(".total").text();
                let new_price;
                
                // quantity of all cart products
                var qty = $(".cart_no").text();
                if (qty === "") {
                    qty = "0";
                }
                qty = parseInt(qty);

                // '-' : minus quantity button
                // '+' : plus quantity button
                if (signal === '-') {
                    if (quantity === 1) {
                        alert("Can't decrease quantity to 0");
                        return;
                    }

                    qty--;
                    quantity--;
                    new_price = parseInt(convertLocaleString(total_price)) - cart_product.price;
                }
                else if (signal === '+') {
                    qty++;
                    quantity++;
                    new_price = parseInt(convertLocaleString(total_price)) + cart_product.price;
                }

                // update quantity                
                cart_product.qty = quantity;                 
                cart_product_list.splice(i, 0, JSON.stringify(cart_product));                         
                // update this product quantity view and total money at header immediately
                let j = cart_product_list.length - i;
                $(".option-cart-item li:nth-child(" + j + ") #qty-num").html(quantity);
                $(".total strong").text(new_price.toLocaleString('vi') + '₫');
                // update this product quantity view and total money in shopping cart page immediately
                $("input[name=\'" + productId + "\']").val(quantity);
                $("#total-money p").text(new_price.toLocaleString('vi') + '₫');
                // display quantity of all cart products               
                $(".cart_no").html(qty);               
                              
                localStorage.setItem("cart_product_list", JSON.stringify(cart_product_list)); 
                break;
            }
        }
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
              <img class="remove-cart-product" id="' + id + '" src="../images/remove.png" alt="remove">\
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