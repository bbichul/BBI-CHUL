$(document).ready(function () {
    my_info()
    console.log('fefe')
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