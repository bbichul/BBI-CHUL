$('#login_password_eye').on("mousedown", function(){
    $('#login_password').attr('type',"text");
}).on('mouseup mouseleave', function() {
    $('#login_password').attr('type',"password");
});

$('#signup_password_eye').on("mousedown", function(){
    $('#signup_password').attr('type',"text");
}).on('mouseup mouseleave', function() {
    $('#signup_password').attr('type',"password");
});