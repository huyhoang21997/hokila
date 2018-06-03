jQuery(document).ready(function($) {
    $("#cmt-sm").on('click', function(event) {
        event.preventDefault();

        let date = new Date();
        let pathname = window.location.pathname;
        let sep = pathname.lastIndexOf('/');
        // get product id
        let id = pathname.slice(sep + 1, pathname.length + 1);
        var formData = {           
            'content': $("#cmt-txt").val(),
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
            <p>' + formData.date + '</p>\
            <p>' + formData.content + '</p>\
            <hr>\
            ');
            
            $("#cmt-txt").val('');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });
});