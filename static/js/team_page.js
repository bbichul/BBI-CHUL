let my_team = ""
$(document).ready(function () {
    team_check();
    $("input[name=checked-team]").val('')
    /*    pieChartDraw();*/
    $('.progress-value > span').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1500,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });


});

//progress bar
function get_progressbar() {
    $.ajax({
        type: "POST",
        url: "/get-progressbar",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {},
        success: function (response) {
            let percent = response['percent']
            let done_count = response['done_count']

            $('.progress-value').css('font-size', `25px`);
            $('.progress-value').css('line-height', `44px`);
            $('.progress-value').append(`${percent}%`)

            $('#percent-bar').css('width', `${percent}%`);
            $('#percent-bar').css('font-size', `18px`);
            $('#percent-bar').append(`${done_count}개`)
        }
    })
}

// 팀 소속 여부 확인
function team_check() {
    $.ajax({
        type: "GET",
        url: "/team",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {},
        success: function (response) {
            let user_data = response['user_data']
            my_team = user_data[0]['team']
            if (my_team != null) {
                $('.not-exist').hide()
                let team = `${my_team}`
                $('#team').append(team)
                checkstatus();
                show_task(my_team)
            } else {
                $('.team-exist').hide()
                let temp_html = `<h1>아직 소속된 팀이 없습니다.</h1>`
                $('#team-alert').append(temp_html)
            }
        }
    })
}

function hide_teamname() {
    $("#can-using").hide()
    $("#cant-using").hide()
    $("#double-check").hide()
}

// 팀 만들기 기능
function create_team() {
    my_team = $('#team-name').val()

        // hidden input의 value로 중복확인 버튼을 눌렀는지 안눌렀는지 확인
    if ($("input[name=checked-team]").val() != 'y') {
        alert("중복확인을 통과한 경우만 만들 수 있습니다.")
        $("#team-name").val(null);
    } else {
        $.ajax({
            type: "POST",
            url: "/create-team",
            headers: {
                Authorization: getCookie('access_token')
            },
            data: {
                team: my_team
            },
            success: function (response) {
                if (response["msg"] == '팀 만들기 완료') {
                    alert(response["팀을 만들었습니다."]);
                    $('#create-team-close').click()
                    $('.not-exist').hide()
                    $('.team-exist').show()
                    let team = `${my_team}`
                    $('#team').append(team)
                    checkstatus();
                    show_task(my_team)
                } else {
                    alert(response["서버 오류"]);
                }
            }
        })
    }
}

function invite_team() {
    let str_space = /\s/;
    invite_name = $('#invite-name').val()

    if (!invite_name || str_space.exec(invite_name)) {
        alert("팀 이름에 공백을 사용할 수 없습니다.")
        $("#invite-name").val(null);
    } else {
        $.ajax({
            type: "POST",
            url: "/invite-team",
            headers: {
                Authorization: getCookie('access_token')
            },
            data: {
                team: invite_name
            },
            success: function (response) {
                if (response["msg"] == '초대받은 팀에 가입되었습니다.') {
                    alert(response["msg"]);
                    $('#create-team-close').click()
                    $('.not-exist').hide()
                    $('.team-exist').show()
                    let team = `${invite_name}`
                    $('#team').append(team)
                    checkstatus();
                    show_task(my_team)
                } else if (response["msg"] == '존재하지 않는 팀입니다. 팀 이름을 확인해주세요.') {
                    alert(response["msg"]);
                }
            }
        })
    }
}

// 팀 만들기 시 팀명 중복확인 기능
function teamname_check() {
    let str_space = /\s/;
    my_team = $('#team-name').val()
    if (!my_team || str_space.exec(my_team)) {
        alert("팀 이름에 공백을 사용할 수 없습니다.")
        $("#team-name").val("");
    } else {
        $.ajax({
            type: "POST",
            url: "/teamname",
            headers: {
                Authorization: getCookie('access_token')
            },
            data: {
                team: my_team
            },
            success: function (response) {
                if (response['msg'] == "사용할 수 있는 팀 이름입니다.") {
                    $("#double-check").hide()
                    $("#cant-using").hide()
                    $("#can-using").show()
                    $("input[name=checked-team]").val('y');
                } else if (response['msg'] == "중복되는 팀 이름입니다. 다시 입력해주세요.") {
                    $("#double-check").hide()
                    $("#can-using").hide()
                    $("#cant-using").show()
                    $("input[name=checked-team]").val('');
                } else if (response['msg'] == "특수문자를 제외하고 작성해주세요"){
                    $("#double-check").show()
                    $("#cant-using").hide()
                    $("#can-using").hide()
                    $("input[name=checked-team]").val('');
                }
            }
        });
    }
}

/*to do list*/
function show_task(my_team) {
    let team = my_team
    $.ajax({
        type: "GET",
        url: "/task-show",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {},
        success: function (response) {
            let lists = response["tasks"];
            get_progressbar()
            for (let i = 0; i < lists.length; i++) {
                let task = lists[i]['task']
                let done = lists[i]['done']
                makeListTask(team, task, done);
            }
        }
    })
}

// 할일 화면에 띄우기
function makeListTask(team, task, done) {
    //할 일이 아직 완료 상태가 아니면
    if (done == "false") {
        let tempHtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i><i class='bi bi-check-lg' onclick="changedone('${team}','${task}','${done}')"></i></div>`;
        $(".notdone").append(tempHtml);
    } else { //할 일이 완료 상태면
        let tempHtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i><i class='bi bi-check-lg' onclick="changedone('${team}','${task}','${done}')"></i></div>`;
        $(".done").append(tempHtml);
    }
}

//내가 속한 팀 찾아 할일 저장하기
function findteam() {
    //입력창이 비어있지 않고 엔터를 치면 실행
    if (window.event.keyCode == 13 && $(".txt").val() != "") {
        $.ajax({
            type: "GET",
            url: "/get-teamname",
            headers: {
                Authorization: getCookie('access_token')
            },
            data: {},
            success: function (response) {
                let user_data = response['user_data']
                my_team = user_data[0]['team']
                window.location.reload();
                addlist(my_team)
            }
        });
    }
}

//db에 할일 저장
function addlist(my_team) {
    let team = my_team
    let task = $(".txt").val();
    let temphtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i><i class='bi bi-check-lg' onclick="changedone('${team}','${task}')"></i></div>`
    $(".notdone").append(temphtml);

    $.ajax({
        type: "POST",
        url: "/team-todo",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            team: team,
            task: task
        },
        success: function (response) {
            //alert(response['msg']);
        }
    });

    //입력 창 비우기
    $(".txt").val("");
}

// to do list 삭제 버튼
function deletetask(team, task) {
    $.ajax({
        type: "POST",
        url: `/task-delete`,
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            team: team,
            task: task
        },
        success: function (response) { // 성공하면
            if (response["result"] == "success") {
                //alert("삭제 성공!");
                window.location.reload();
            } else {
                alert("서버 오류!");
            }
        }
    })
}

// 할 일을 완료했는지 안 했는지 상태 변경 및 저장
function changedone(team, task, done) {
    $.ajax({
        type: "POST",
        url: `/change-done`,
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            team: team,
            task: task,
            done: done
        },
        success: function (response) {
            if (response["result"] == "success") {
                //alert("체크 완료!");
                window.location.reload();
            } else {
                alert("서버 오류!");
            }
        }
    })
}

//팀원들의 출결 상태 불러오기
function checkstatus() {
    $.ajax({
        type: "GET",
        url: "/check-status",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {},
        success: function (response) {
            let user_data = response['user_data']
            for (let i = 0; i < user_data.length; i++) {
                let nick_name = user_data[i]['nick_name']
                let status = user_data[i]['status']
                let temphtml = `<tr>
                                <td>${nick_name}</td>
                                <td>${status}</td>
                                </tr>`;
                $("#status-table").append(temphtml);
            }
        }
    });
}
