jQuery(document).ready(function($) {
    // hide textfield for inputing username
    $("#cmt-name").hide();

    let pathname = window.location.pathname;
    let sep = pathname.lastIndexOf('/');
    // get product id
    let id = pathname.slice(sep + 1, pathname.length + 1);

    $("#cmt-sm").on('click', function(event) {
        event.preventDefault();

        let username = $("#log-name").html();
        let cmt_name = $("#cmt-name").val();
        if (cmt_name === "" && $("#cmt-name").is(":visible") === true) {
            alert('Please input your name');
            return;
        }
        if (username === "" && cmt_name === "") {
            // show textfield for inputing username if customers don't want to log in
            $("#cmt-name").show();
            return;
        }
        // if customers don't log in, we will use name that they input 
        if (username === "") {
            username = cmt_name;
        }

        let content = $("#cmt-txt").val();
        if (content.length === 0) {
            alert('Please don\'t let your comment be empty');
            return;
        }

        let date = new Date();
        var formData = {      
            'username': username,     
            'content': content,
            'date': date
        };
        
        $.ajax({
            type: 'post',
            url: '/comment/' + id,
            data: formData
        })
        .done(function(data) {
            // insert comment at the beginning of comment list
            $(".cmt-list").prepend('\
            <p style="font-size: 15px; font-weight: bold;">' + formData.username + '</p>\
            <p style="font-size: 13px; color: #9b9b9b;">' + formData.date.getDate() + '/' + formData.date.getMonth() + '/' + formData.date.getFullYear() + ' ' + formData.date.getHours() + ':' + formData.date.getMinutes() + '</p>\
            <p style="font-size: 14px">' + formData.content + '</p>\
            <hr>\
            ');
            
            $("#cmt-txt").val('');
            $("#cmt-name").val('');
            $("#cmt-name").hide();

            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });

    $(".page-link").on('click', function(event) {
        let page_num = $(this).text();
        $.ajax({
            type: 'get',
            url: '/comment/' + id + '/' + page_num,
            dataType: 'html'
        })
        .done(function(data) {
            $(".cmt-list").html(data);
            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });

    $("#add-to-cart").on('click', function(event) {
        var qty = $(".cart_no").text();
        if (qty === "") {
            qty = "0";
        }
        qty = parseInt(qty);
        qty++;

        let product_price = $(".new_price").text()
        let total_price = $(".total").text();
        let new_price = parseInt(convertLocaleString(total_price)) + parseInt(convertLocaleString(product_price));

        $.ajax({
            type: 'post',
            url: '/shopping-cart/' + id,
            dataType: 'html',
            data: {
                'qty': qty,
                'total': new_price.toLocaleString('vi') + '₫'
            }
        })
        .done(function(data) {
            $(".cart_no").text(qty);
            $(".option-cart-item").prepend(data);
            $(".total strong").text(new_price.toLocaleString('vi') + '₫');
            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });
});

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