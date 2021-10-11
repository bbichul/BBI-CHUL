let my_team = ""
$(document).ready(function () {
    team_check()
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

// function chartdata () {
//     $.ajax({
//         type: "GET",
//         url: "/chartdata",
//         headers: {
//             Authorization: getCookie('access_token')
//         },
//         data: {},
//         success: function (response) {
//             let user_data = response['user_data']
//             my_team = user_data[0]['team']
//
//             if (my_team != null) {
//
//             } else {
//
//             }
//         }
//     })
// }
//
// let pieChartData = {
//     labels: ['foo', 'bar', 'baz', 'fie', 'foe', 'fee'],
//     datasets: [{
//         data: [95, 12, 13, 7, 13, 10],
//         backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)']
//     }]
// };
//
// let pieChartDraw = function () {
//     let ctx = document.getElementById('pieChartCanvas').getContext('2d');
//
//     window.pieChart=new Chart(ctx, {
//         type:'pie',
//         data: pieChartData,
//         options: {
//             responsive: false
//         }
//     });
// }

//progress bar
function get_progressbar(lists) {
    let tasklist = lists
    let doing_count = 0
    let done_count = 0
    for (let i = 0; i < tasklist.length; i++){
        if (tasklist[i]['done'] == "false"){
            doing_count++
        } else {
            done_count++
        }
    }
    let total = doing_count+done_count
    let temp_html = `<p style="float: right">(${done_count}/${total}개 완료)</p>`
    $('.progress-title').append(temp_html)

    let percent = Math.round((done_count / total) * 100)
    $('.progress-value').css('font-size', `25px`);
    $('.progress-value').css('line-height', `44px`);
    $('.progress-value').append(`${percent}%`)

    $('#percent-bar').css('width', `${percent}%`);
    $('#percent-bar').css('font-size', `18px`);
    $('#percent-bar').append(`${done_count}개`)
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
                show_task(my_team)
                checkstatus(my_team)
            } else {
                $('.team-exist').hide()
                let temp_html = `<p>아직 소속된 팀이 없습니다.</p>`
                $('#team-alert').append(temp_html)
            }
        }
    })
}

function hide_teamname() {
    $("#can-using").hide()
    $("#cant-using").hide()
}

// 팀 만들기 기능
function create_team() {
    my_team = $('#team-name').val()

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
                alert(response["msg"]);
                $('#create-team-close').click()
                $('.not-exist').hide()
                $('.team-exist').show()
                let team = `${my_team}`
                $('#team').append(team)
            } else if (response["msg"] == '중복된 팀이름') {
                alert(response["msg"]);
            }
        }
    })
}

// 팀 만들기 시 팀명 중복확인 기능
function teamname_check() {
    my_team = $('#team-name').val()

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
                $("#cant-using").hide()
                $("#can-using").show()
            } else if (response['msg'] == "중복되는 팀 이름입니다. 다시 입력해주세요.") {
                $("#can-using").hide()
                $("#cant-using").show()
            }
        }
    });
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
        data: {team: team},
        success: function (response) {
            let lists = response["tasks"];
            get_progressbar(lists)
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
        let tempHtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i><i class='bi bi-check-lg' onclick="donetask('${team}','${task}','${done}')"></i></div>`;
        $(".notdone").append(tempHtml);
    } else { //할 일이 완료 상태면
        let tempHtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i></div>`;
        $(".done").append(tempHtml);
    }
}

//내가 속한 팀 찾아 할일 저장하기
function findteam() {
    //입력창이 비어있지 않고 엔터를 치면 실행
    if (window.event.keyCode == 13 && $(".txt").val() != "") {
        $.ajax({
            type: "GET",
            url: "/team-name",
            headers: {
                Authorization: getCookie('access_token')
            },
            data: {},
            success: function (response) {
                let user_data = response['user_data']
                my_team = user_data[0]['team']
                addlist(my_team)
            }
        });
    }
}

//db에 할일 저장
function addlist(my_team) {
    let team = my_team
    let task = $(".txt").val();
    let temphtml = `<div class='task'>${task}<i class='bi bi-trash-fill' onclick="deletetask('${team}','${task}')"></i><i class='bi bi-check-lg' onclick="donetask('${team}','${task}')"></i></div>`
    $(".notdone").append(temphtml);

    $.ajax({
        type: "POST",
        url: "/team-todo",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            team: team, task: task
        },
        success: function (response) {
            alert(response['msg']);
        }
    });

    // //삭제 버튼
    // let del = $("<i class='bi bi-trash'></i>").click(function deletetask() {
    //     let p = $(this).parent();
    //     console.log(p)
    //     // let child_element = p[0]
    //     // console.log(child_element)
    //     p.fadeOut(function () {
    //         p.remove();
    //     })
    // });
    // //
    // //체크 버튼
    // let check = $("<i class='bi bi-check'></i>").click(function () {
    //     let p = $(this).parent();
    //     p.fadeOut(function () {
    //         $(".done").append(p);
    //         p.fadeIn();
    //     })
    //     $(this).remove();
    // });
    //
    // //Task에 삭제 & 체크 버튼 추가하기
    // task.append(del, check)
    //
    // // //할일 목록에 추가
    // $('.notdone').append(task);

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
            team: team, task: task
        },
        success: function (response) { // 성공하면
            if (response["result"] == "success") {
                alert("삭제 성공!");
                window.location.reload();
            } else {
                alert("서버 오류!");
            }
        }
    })
}

// 할 일 목록 중 완료 버튼 누른 경우
function donetask(team, task) {
    let done = true
    $.ajax({
        type: "POST",
        url: `/task-done`,
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            team: team, task: task, done: done
        },
        success: function (response) { // 성공하면
            if (response["result"] == "success") {
                alert("체크 완료!");
                window.location.reload();
            } else {
                alert("서버 오류!");
            }
        }
    })
}

//팀원들의 출결 상태 불러오기
function checkstatus(team) {
    $.ajax({
        type: "GET",
        url: "/check-status",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {team: team},
        success: function (response) {
            let user_data = response['user_data']
            for (let i = 0; i < user_data.length; i++) {
                let nick_name = user_data[i]['nick_name']
                let status = user_data[i]['status']
                let temphtml = `<tr>
                                <th>${nick_name}</th>
                                <th>${status}</th>
                                </tr>`
                $(".table").append(temphtml);
            }
        }
    });
}