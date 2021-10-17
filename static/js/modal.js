//새로고침마다 로그인 상태에 따라 로그인/아웃이 바뀜
$(document).ready(function () {
    if(getCookie("access_token") == null){
        $('#login-button').show()
        $('#logout-button').hide()
    } else {
        $('#login-button').hide()
        $('#logout-button').show()
    }
});



// 비밀번호 숨기기/보기 기능
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

//쿠키 저장하기
var setCookie = function(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    };

//쿠키 가져오기
var getCookie = function(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
    };

//쿠키 삭제하기
var deleteCookie = function(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    }


// 메인페이지 진입전 로그인 확인 기능
function main_login_check() {
    if(getCookie("access_token") == null){
        alert('로그인 해주세요')
        location.href ="/";
    } else { location.href = "/main"; }
}


// 회원가입 기능
function sign_up() {
    let nick_name = $('#nickname').val()
    let password = $('#signup_password').val()

    $.ajax({
        type: "POST",
        url: "/sign-up",
        data: {
            nick_name: nick_name,
            password : password
        },
        success: function (response) {
            if (response["msg"] == '저장완료') {
                alert(response["msg"]);
                $('#signup_close').click()
            }else if (response["msg"] == '중복된 닉네임') {
                alert(response["msg"]);
            }else if (response['msg'] == "영어 또는 숫자로 6글자 이상으로 작성해주세요") {
                alert(response["msg"]);
            }
        }
    })
}


// 회원가입 버튼 클릭시 중복 텍스트 숨기기 기능
function hide_nickname() {
    $("#can-using").hide()
    $("#cant-using").hide()
}


// 로그인 기능
function login() {
    let nick_name = $('#login_nickname').val()
    let password = $('#login_password').val()

    $.ajax({
        type: "POST",
        url: "/login",
        data: {
            nick_name: nick_name,
            password: password
        },
        success: function (response) {
            if (response['msg'] == "SUCCESS") {
                alert('로그인에 성공하셨습니다.')
                $('#login_close').click()
                window.location.reload();
                setCookie("access_token", response["access_token"], 1)
            } else if (response['msg'] == "INVALID_NICKNAME") {
                alert("닉네임이 틀렸습니다.")
            } else if (response['msg'] == "INVALID_PASSWORD") {
                alert("비밀번호가 틀렸습니다.")
            }
        }
    });
}


//로그아웃
function log_out() {
        deleteCookie('access_token')
        alert('로그아웃 되었습니다')
        location.href ="/";
    }

// 회원가입시 닉네임 중복확인 기능
function nickname_check() {
    let nick_name = $('#nickname').val()
    console.log(nick_name)
    $.ajax({
        type: "POST",
        url: "/nickname",
        data: {
            nick_name: nick_name
        },
        success: function (response) {
            if (response['msg'] == "사용할 수 있는 닉네임입니다.") {
                $("#cant-using").hide()
                $("#can-using").show()
            } else if (response['msg'] == "중복되는 닉네임입니다. 다시 입력해주세요.") {
                $("#can-using").hide()
                $("#cant-using").show()
            }
        }
    });
}``

