//처음들어왔을때 select-box가 현재 년,월로 찍히게 하기
$("#year").val(2021);
$("#month").val(10);


$(document).ready(function () {
    my_info()
    post_study_time_graph()
    post_weekly_avg_graph()
    get_goal_modal()
});

//select-box에서 월이 바뀌면 날짜에 맞는 그래프를 다시불러옴
$("select[name=month]").change(function(){
    $("select[name=year]").val();
    $(this).val();
    post_study_time_graph()
    post_weekly_avg_graph()
});

//목표시간설정-시작일 설정
function post_goal_modal() {
    let start_date = new Date($("input[name=start-date]").val())
    let end_date = new Date($("input[name=end-date]").val())
    let difference= end_date-start_date;
    let days = difference/(1000 * 3600 * 24)

    //문자열로 전환
    let start_year = start_date.getFullYear();
    let start_month = ('0' + (start_date.getMonth() + 1)).slice(-2);
    let start_day = ('0' + start_date.getDate()).slice(-2);
    let end_year = end_date.getFullYear();
    let end_month = ('0' + (end_date.getMonth() + 1)).slice(-2);
    let end_day = ('0' + end_date.getDate()).slice(-2);

    let string_start_date = start_year + '-' + start_month  + '-' + start_day;
    let string_end_date = end_year + '-' + end_month  + '-' + end_day;

    if (days >= 0) {
            $.ajax({
                type: "POST",
                url: "/goal",
                headers: {
                    Authorization:  getCookie('access_token')
                },
                data: {
                    string_start_date: string_start_date,
                    string_end_date: string_end_date,
                    goal_hour: $("input[name=goal_hour]").val()
                },
                success: function (response) {
                    window.location.reload();
                }
            })
    }else{
        alert('시작일 종료일 설정을 다시 해주세요')
}}

function get_goal_modal() {
    $.ajax({
        type: "GET",
        url: "/goal",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
        },
        success: function (response) {
            let string_start_date = response['string_start_date']
            let string_end_date = response['string_end_date']
            let goal_hour = response['goal_hour']
            let done_hour = response['done_hour']

            let temp_html = `<p style="float: right">(${done_hour}/${goal_hour}시간)</p>`
            $('.progress-title').append(temp_html)

            $('.start-date-box').append(`${string_start_date}`)
            $('.end-date-box').append(`${string_end_date}`)
            $('.d-day-box').append(`D-8`)

            let percent = Math.round((done_hour / goal_hour) * 100)
            $('.progress-value').css('font-size', `25px`);
            $('.progress-value').css('line-height', `44px`);
            $('.progress-value').append(`${percent}%`)

            $('#percent-bar').css('width', `${percent}%`);
            $('#percent-bar').css('font-size', `18px`);
            $('#percent-bar').append(`${done_hour}h`)
        }
    })
}

// 진행바
$(document).ready(function(){
    $('.progress-value > span').each(function(){
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        },{
            duration: 1500,
            easing: 'swing',
            step: function (now){
                $(this).text(Math.ceil(now));
            }
        });
    });
});

function my_info() {
    let goal_hour = $("select[name=year]").val()
    $.ajax({
        type: "GET",
        url: "/my-info",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
        },
        success: function (response) {
            // let today_study_time = response["today_study_time"]
            let avg_study_time = response["avg_study_time"]

            let temp_html = `<div>${avg_study_time}</div>`
            $('#avg-container').append(temp_html)
            console.log(avg_study_time)


        }
    })
}



function post_study_time_graph() {
    $.ajax({
        type: "POST",
        url: "/line-graph",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
            year: $("select[name=year]").val(),
            month: $("select[name=month]").val()
        },
        success: function (response) {
            let day_list = response['day_list']
            let day_time_list = response['day_time_list']

            let study_time_graph = document.getElementById('study_time_graph').getContext('2d');
            let barChart = new Chart(study_time_graph, {
                type: 'line',
                data: {
                    labels: day_list,
                    datasets: [{
                        label: "초",
                        data: day_time_list,
                        backgroundColor: 'skyblue',
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: '월별 공부시간',
                        fontSize: 30,
                        fontColor: 'green'
                        },
                    legend: {
                        display: false,
                        align: top
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: function(label, index, labels) {
                                    return parseInt(label/3600) +'h';
                                    },
                                beginAtZero: true,
                                stepSize: 3600,
                            }
                        }]
                    }
                }
            });

        }
    })
}

function post_weekly_avg_graph() {
    $.ajax({
        type: "POST",
        url: "/bar-graph",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
            year: $("select[name=year]").val(),
            month: $("select[name=month]").val()
        },
        success: function (response) {
            let monday = response['monday']
            let tuesday = response['tuesday']
            let wednesday = response['wednesday']
            let thursday = response['thursday']
            let friday = response['friday']
            let saturday = response['saturday']
            let sunday = response['sunday']


            let weekly_avg_graph = document.getElementById('weekly_avg_graph').getContext('2d');
            let barChart = new Chart(weekly_avg_graph, {
                type: 'bar',
                data: {
                    labels: ['월', '화', '수', '목', '금', '토', '일'],
                    datasets: [{
                        label: "요일별 평균 공부시간",
                        data: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
                        backgroundColor: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'],
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        align: top
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: function(label, index, labels) {
                                    return parseInt(label/3600) +'h';
                                    },
                                beginAtZero: true,
                                stepSize: 3600,
                            }
                        }]
                    }
                }
            });

        }
    })
}