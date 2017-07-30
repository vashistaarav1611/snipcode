$(document).ready(function () {

   $("#submit").on("click", function () {
       var pass = $("#password").val;
       var cpass = $("#cpassword").val;
       if(pass!==cpass){
           $('#cpassword').notify("Password doesn't matched", "error", {position:"right"});
       }
   });

   $("")
});