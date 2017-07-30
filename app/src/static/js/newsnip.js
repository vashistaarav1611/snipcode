$(document).ready(function(){

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function updateTextArea() {
        editor.save();
        $("#demotext").innerHTML(editor.getValue());
    }

    // $("#demotext").on("change", updateTextArea);
    //
    // $("#save").on("click", function () {
    //
    //     $("#demotext").on("change", updateTextArea);
    //     // console.error(editor.getValue());
    //     var codeSnip = $("#demotext").val();
    //     console.log(codeSnip);
    // })

    $("#save").on('click',function(){
        console.error("clicked");
        $(this).prop('disabled',true);
        $("#demotext").on('change', updateTextArea);
        // var ssusrid = $(this).data('usrsid');
        // var codeSnip = $("#demotext").val();
        const codeSnip = editor.getValue();
        const heading = $("#title").val();
        // console.error(codeSnip);
        const isPrivate = $("#private").prop( 'checked' );
        const lang = $('#langOption').find(":selected").attr('value');
        const userId = getCookie('userId');

        if (codeSnip){
            if (heading){
                $.ajax({
                    type: "POST",
                    url: "http://data.c100.hasura.me/v1/query",
                    cache: false,
                    crossDomain: true,
                    headers: { 'Content-Type' : 'application/json',
                        'Authorization': "Bearer "+getCookie("Authorization")
                    },
                    data: JSON.stringify({
                        "type": "insert",
                        "args":{
                            "table": "code",
                            "objects": [
                                {
                                    "code_text": codeSnip,
                                    "private": isPrivate,
                                    "heading": heading,
                                    "user_id": userId,
                                    "lang": lang
                                }
                            ]
                        }
                    }),
                    beforeSend: function() {
                        $('#save').html("<img src='/img/hour.svg' width='40px' height='25px'/>");
                    },
                    error : function(err){
                        console.error(err);
                        // console.log(data);
                    },
                    success: function (data, textStatus, jqXHR) {
                        setTimeout(function () {
                            window.location.href="/editprofile";
                        }, 3000);

                    }
                });
            }
            else {
                $('#title').notify("heading required", "error", {position:"right"});
                $(this).prop('disabled',false);
            }
        }
        else{
            $('#demotext').notify("Add your code first :P", "error", {position:"right"});
            $(this).prop('disabled',false);
        }


    });

});