jQuery(document).ready(function($) {
    $("#cmt-sm").on('click', function(event) {
        event.preventDefault();

        let date = new Date();
        let pathname = window.location.pathname;
        let sep = pathname.lastIndexOf('/');
        let id = pathname.slice(sep + 1, pathname.length + 1);
        var formData = {           
            'content': $("#cmt-txt").val(),
            'date': date
        };
        
        $.ajax({
            type: 'post',
            url: '/comment/' + id,
            data: formData,
            success: (d) => {
                console.log(d);
            },
            error: function(err) {
                console.log(err);
            }
        })
        .done(function(data) {
            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    });
});