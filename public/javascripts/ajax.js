jQuery(document).ready(function($) {

    let pathname = window.location.pathname;
    let sep = pathname.lastIndexOf('/');
    // get product id
    let id = pathname.slice(sep + 1, pathname.length + 1);

    $("#cmt-sm").on('click', function(event) {
        event.preventDefault();

        let username = $("#cmt-name").val();

        let content = $("#cmt-txt").val();
        if (content.length === 0) {
            alert('Please don\'t let your comment be empty');
            return;
        }
        if (username.length === 0) {
            alert('Please don\'t let your name be empty')
            return
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
            <p style="font-size: 13px; color: #9b9b9b;">' + formData.date.getDate() + '/' + (formData.date.getMonth() + 1) + '/' + formData.date.getFullYear() + ' ' + formData.date.getHours() + ':' + formData.date.getMinutes() + '</p>\
            <p style="font-size: 14px">' + formData.content + '</p>\
            <hr>\
            ');

            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });

    $(".page-link").on('click', function(event) {
        event.preventDefault();

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
});