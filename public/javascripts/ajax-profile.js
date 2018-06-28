jQuery(document).ready(function($) {
    // $("#birthday").hide();
    // $("#gender").hide();
    $("#save_profile").hide();

    $("#change").on('click', function(event) {
        event.preventDefault();

        //$("#birthday_view").hide();
        //$("#gender_view").hide();
        $("#change_profile").hide();
        $("#email_profile").hide();
        $("#username_profile").hide();
        //$("#birthday").show();
        //$("#gender").show();
        $("#save_profile").show();
    })

    $("#cancel").on('click', function(event) {
        event.preventDefault();

        //$("#birthday_view").show();
        //$("#gender_view").show();
        $("#change_profile").show();
        $("#email_profile").show();
        $("#username_profile").show();
        //$("#birthday").hide();
        //$("#gender").hide();
        $("#save_profile").hide();
    })

    $("#save").on('click', function(event) {
        event.preventDefault();

        //let username = $("#log-name").text();
        let phone = $("#phone").val();
        for (var j = 0; j < phone.length; j++) {
            if (phone[j] < '0' || phone[j] > '9') {
                alert('Your phone has special character');
                return;
            }
        }

        let formData = {
            'username': $("#username").val(),
            'firstname': $("#firstname").val(),
            'lastname': $("#lastname").val(),
            'phone': phone,
            'address': $("#address").val()
            //'birthday': $("#birthday").val(),
            //'gender': $("#gender").val()   
        }

        $.ajax({
            type: 'post',
            url: '/edit-profile',
            data: formData
        })
        .done(function(data) {
            $("#firstname").val(formData.firstname);
            $("#lastname").val(formData.lastname);
            $("#phone").val(formData.phone);
            $("#address").val(formData.address);
            //$("#birthday_view").val(formData.birthday);
            //$("#gender_view").val(formData.gender);
            //$("#birthday_view").show();
            //$("#gender_view").show();
            $("#change_profile").show();
            $("#email_profile").show();
            $("#username_profile").show();
            //$("#birthday").hide();
            //$("#gender").hide();
            $("#save_profile").hide();
            console.log('done');
        })
        .fail(function(data) {
            console.log('fail');
        });
    })
})