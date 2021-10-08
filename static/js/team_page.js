$(document).ready(function () {
    team_check()
});

// 팀 소속 여부 확인
function team_check() {
    $.ajax({
        type: "GET",
        url: "/team",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {},
        success: function (response) {
            let user_data = response['user_data']
            let team_name = user_data[0]['team']
            console.log(team_name)
            if(user_data != null) {
                $('#team-alert').hide()
                $('#team-check-btn').hide()
                console.log('not null')
                let team_name = `${response}`
                $('#team-name').append(team_name)
            }
            else {
                $('#not-exist').hide()
                // $('#team-check-btn').hide()
                console.log('null')
                let temp_html = `<p>아직 소속된 팀이 없습니다.</p>`
                $('#team-alert').append(temp_html)
            }
        }
    })
}

// 팀 만들기 기능
// function create_team() {
//     let team_name = $('#create_teamname').val()
//
//     $.ajax({
//         type: "POST",
//         url: "/create-team",
//         data: {
//             team_name: team_name
//         },
//         success: function (response) {
//             if (response["msg"] == '저장완료') {
//                 alert(response["msg"]);
//                 $('#signup_close').click()
//             }else if (response["msg"] == '중복된 팀명') {
//                 alert(response["msg"]);
//             }
//         }
//     })
// }
//
// // 팀 만들기 시 팀명 중복확인 기능
// function teamname_check() {
//     let team_name = $('#create_teamname').val()
//
//     $.ajax({
//         type: "POST",
//         url: "/team-name",
//         data: {
//             nick_name: nick_name
//         },
//         success: function (response) {
//             if (response['msg'] == "사용할 수 있는 팀명입니다.") {
//                 $("#cant-using").hide()
//                 $("#can-using").show()
//             } else if (response['msg'] == "중복되는 팀명입니다. 다시 입력해주세요.") {
//                 $("#can-using").hide()
//                 $("#cant-using").show()
//             }
//         }
//     });
// }

/*to do list*/

// 추가
function addList() {
}
// 전체삭제
function delAllEle() {
}
// 마지막 항목 삭제
function delLastEle() {
}
// 선택 삭제
function delSelected() {
}
