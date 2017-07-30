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
        var codeSnip = editor.getValue();
        // console.error(codeSnip);
        const codeId = $("#codeId").val();
        const isPrivate = $("#private").prop( 'checked' );
        $.ajax({
            type: "POST",
            url: "/editsnip/"+codeId,
            cache: false,
            crossDomain: true,
            headers: { 'Content-Type' : 'application/json',
                'Authorization': "Bearer "+getCookie("Authorization")
            },
            data: JSON.stringify(
                {
                    "codeSnip":codeSnip,
                    "isPrivate": isPrivate
                }
                ),
            beforeSend: function() {
                $('#save').html("<img src='/img/hour.svg' width='40px' height='25px'/>");
            },
            error : function(err){
                console.error(err);
                // console.log(data);
            },
            success: function (data, textStatus, jqXHR) {
                setTimeout(function () {
                    if (typeof data.redirect === 'string')
                        window.location.replace(window.location.protocol + "//" + window.location.host + data.redirect);
                }, 2000);
            }
        });
    });

});