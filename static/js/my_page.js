//처음들어왔을때 select-box가 현재 년,월로 찍히게 하기
$("#year").val(2021);
$("#month").val(10);


$(document).ready(function () {
    my_info()
    post_study_time_graph()
    post_weekly_avg_graph()
});

//select-box에서 월이 바뀌면 날짜에 맞는 그래프를 다시불러옴
$("select[name=month]").change(function(){
    $("select[name=year]").val();
    $(this).val();
    post_study_time_graph()
    post_weekly_avg_graph()
});

function my_info() {
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
            $('#my-page').append(temp_html)
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

// let weekly_avg_graph = document.getElementById('weekly_avg_graph').getContext('2d');
// let barChart = new Chart(weekly_avg_graph, {
//     type: 'bar', //pie, line,
//     data: {
//         labels: ['월', '화', '수', '목', '금', '토', '일'],
//         datasets: [{
//             label: "요일별 평균 공부시간",
//             data: [11,7,14,21,6,14, 20],
//             backgroundColor: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'],
//             // borderColor: 'rgb(255, 99, 132)',
//             // borderWidth: 5,
//             // hoverBorderWidth: 10,
//             // fill: false,
//             // lineTension: 0.1,
//         }]
//     },
//     options: {
//         // title: {
//         //     display: true,
//         //     text: '요일별 평균 공부시간',
//         //     fontSize: 30,
//         //     fontColor: 'green'
//         //     },
//         legend: {
//             // display:true,
//             align: top
//         },
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     callback: function(label, index, labels) {
//                         return parseInt(label/3600) +'h';
//                         },
//                     // scaleLabel: {
//                     //     display: true,
//                     //     labelString: '1h = 1000'
//                     // },
//                     beginAtZero: true,
//                     stepSize: 3600,
//                     // max: 7200,
//                 }
//             }]
//         }
//     }
// });


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