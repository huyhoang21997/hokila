jQuery(document).ready(function($) {
    $(".checkout").on('click', function(event) {
        event.preventDefault();

        let username = $("#log-name").text();

        if (username.length == 0) {
            alert('Please log in');
            return;
        }

        let fullname = $("input[name='fullname']").val();
        if (fullname === "") {
            alert('Please input your fullname');
            return;
        }

        let phone = $("input[name='phone']").val();
        if (phone === "") {
            alert('Please input your phone');
            return;
        }
        for (var j = 0; j < phone.length; j++) {
            if (phone[j] < '0' || phone[j] > '9') {
                alert('Your phone has special character');
                return;
            }
        }

        let address = $("input[name='address']").val();
        if (address === "") {
            alert('Please input your address');
            return;
        }

        let cart_product_list = JSON.parse(localStorage.getItem("cart_product_list") || "[]");
        var list = [];
        var total_count = 0;
        var total_price = 0;

        for (var i = 0; i < cart_product_list.length; i++) {
            let cart_product = JSON.parse(cart_product_list[i]);
            total_count += cart_product.qty;
            let total_unit_price = cart_product.qty * cart_product.price;
            total_price += total_unit_price;

            list.push({
                'productId': cart_product.id,
                'productName': cart_product.name,
                'unitPrice': cart_product.price,
                'count': cart_product.qty,
                'total_unit_price': total_unit_price
            });
        }
        
        $.ajax({
            type: 'post',
            url: '/checkout/' + username,
            data: {
                'list': JSON.stringify(list),
                'date': new Date(),
                'fullname': fullname,
                'phone': phone,
                'address': address,
                'total_count': total_count,
                'total_price': total_price
            }
        })
        .done(function(data) {
            for (var i = 0; i < cart_product_list.length; i++) {
                $(".option-cart-item li:nth-child(1)").remove();
            }
            $("#content-cart").remove();
            localStorage.clear();
            $("input[name='fullname']").val('');
            $("input[name='phone']").val('');
            $("input[name='address']").val('');
            $(".cart_no").html('');               
            $(".total strong").text('');
            $("#total-money p").text('');
            console.log('done');
        })
        .fail(function(data) {
            alert('Please login before checking out')
        });
    });
});