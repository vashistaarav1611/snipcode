$(document).ready(function () {

    var notif = function(notif_type,notif_text,glyph,pos,anim_in,anim_out) {
        if(!glyph){
            glyph = "glyphicon glyphicon-asterisk";
        }
        if(!pos){
            pos = "top";
        }
        if(!anim_in && !anim_out){
            anim_in = 'animated bounceInDown';
            anim_out = 'animated bounceOutUp';
        }
        $.notify({
            //options
            icon: glyph,
            title: '<strong> Notification: </strong>',
            message: notif_text
        },{
            //settings
            type: notif_type,
            allow_dismiss: true,
            delay: 4000,
            animate: {
                enter: anim_in,
                exit: anim_out
            },
            placement: {
                from: pos,
                align: "right"
            }
        });
    };

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


    $("#update").on('click',function(){
        $(this).prop('disabled',true);
        var id = getCookie('userId');
        var token = getCookie('Authorization');
        var fullName = $("#fullName").val();
        var bio = $("#bio").val();
        var website = $("#portfolio").val();
        $.ajax({
            type: "POST",
            url: "http://data.c100.hasura.me/v1/query",
            crossDomain: true,
            dataType: 'json',
            headers: { 'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+ token
            },
            data: JSON.stringify({
                "type": "update",
                "args":{
                    "table": "user_info",
                    "$set": {
                        "full_name":fullName,
                        "bio":bio,
                        "website":website
                    },
                    "where": {"user_id":id}
                }
            }),
            beforeSend: function() {
                $('#update').html("<img src='/img/hour.svg' width='40px' height='25px'/>");
            },
            error : function(err){
                console.log(err);
            },
            success: function (data) {
                //console.log(data);
                setTimeout(function() {
                    $('#load').empty();
                    location.reload();
                },3000);
            }
        });
    });
});