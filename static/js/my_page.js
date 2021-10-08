$(document).ready(function () {
    my_info()
    $("#month").val(10);
    // $("select[name=year] option:eq(0)").attr("selected", "selected");
    // $("select[name=month] option:eq(9)").attr("selected", "selected");
    post_study_time_graph()
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
    // $("select[name=month]").change(function(){
    //   console.log($(this).val());
    // });
    $.ajax({
        type: "POST",
        url: "/graph",
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

            let myChartOne = document.getElementById('myChartOne').getContext('2d');
            let barChart = new Chart(myChartOne, {
                type: 'bar', //pie, line,
                data: {
                    labels: day_list,
                    datasets: [{
                        label: "초",
                        data: day_time_list,
                        backgroundColor: 'skyblue',
                        // borderColor: 'blue',
                        // borderWidth: 5,
                        // hoverBorderWidth: 10,
                        // fill: false,
                        // lineTension: 0.1,
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
                                // scaleLabel: {
                                //     display: true,
                                //     labelString: '1h = 1000'
                                // },
                                beginAtZero: true,
                                stepSize: 7200,
                                // max: 7200,
                            }
                        }]
                    }
                }
            });

        }
    })
}

// let myChartOne = document.getElementById('myChartOne').getContext('2d');
// let barChart = new Chart(myChartOne, {
//     type: 'bar', //pie, line,
//     data: {
//         labels: ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '최대환'],
//         datasets: [{
//             label: "날짜",
//             data: [5,7,14,21,6,14, 24],
//             backgroundColor: ['white','rgb(255, 99, 132)','rgb(255, 9, 1)','yellow', 'green'],
//             borderColor: 'rgb(255, 99, 132)',
//             borderWidth: 5,
//             hoverBorderWidth: 10,
//             // fill: false,
//             // lineTension: 0.1,
//         }]
//     },
//     options: {
//         title: {
//             display: true,
//             text: '월별 공부시간',
//             fontSize: 30,
//             fontColor: 'green'
//             },
//         legend: {
//             // display:true,
//             align: top
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