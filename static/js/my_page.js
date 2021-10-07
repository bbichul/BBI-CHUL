$(document).ready(function () {
    my_info()
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
            let today_study_time = response["today_study_time"]
            let avg_study_time = response["avg_study_time"]
            // let today_start_time = response["today_start_time"]
            // let today_start_time = response["today_start_time"]
            // let today_start_time = response["today_start_time"]
            let temp_html = `<div>${today_study_time}</div>
                            <div>${avg_study_time}</div>`
            $('#my-page').append(temp_html)


        }
    })
}

function post_study_time_graph() {
    // let year =
    // let month =
    $.ajax({
        type: "POST",
        url: "/graph",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
            year: year,
            month: month,
        },
        success: function (response) {
            let today_study_time = response["today_study_time"]
            let avg_study_time = response["avg_study_time"]
            // let today_start_time = response["today_start_time"]
            // let today_start_time = response["today_start_time"]
            // let today_start_time = response["today_start_time"]
            let temp_html = `<div>${today_study_time}</div>
                            <div>${avg_study_time}</div>`
            $('#my-page').append(temp_html)


        }
    })
}

// var ctx = document.getElementById('myChart').getContext('2d');
//     var chart = new Chart(ctx, {
//         // type : 'bar' = 막대차트를 의미합니다.
//         type: 'bar', //
//         data: {
//             labels: ['감','오렌지','사과'],
//             datasets: [{
//                 label: '과일 판매량',
//                 backgroundColor: 'rgb(255, 99, 132)',
//                 borderColor: 'rgb(255, 99, 132)',
//                 data: [2 ,10, 5,] }] }, });



let myChartOne = document.getElementById('myChartOne').getContext('2d');
let barChart = new Chart(myChartOne, {
    type: 'bar', //pie, line,
    data: {
        labels: ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '최대환'],
        datasets: [{
            label: "날짜",
            data: [5,7,14,21,6,14, 24],
            backgroundColor: ['white','rgb(255, 99, 132)','rgb(255, 9, 1)','yellow', 'green'],
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 5,
            hoverBorderWidth: 10,
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
            }
        // legend: {
        //     display:false,
        //     aligin: top;
        // }
    }
});