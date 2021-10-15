const getRandomNumberOf = (total) => Math.floor(Math.random() * total);
let i = getRandomNumberOf(10);

$(document).ready(function () {
    getWiseSy();
    Clock()
    buttonEvt();
    // <!--    이미지 클릭할때마다 바뀌는기능-->


    });

// 명언 가져와서 뿌려주기
function getWiseSy() {
    $.ajax({
        type: "GET",
        url: "/wise",
        data: {},
        success: function (response) {
            let wise_sy = response;
            let name = wise_sy[i]['sy_name']
            let wise = wise_sy[i]['wise_sy']
            let temp_html = `<p>${wise}</p>
                             <p>${name}</p>`
            $('#wise-box').append(temp_html)
        }
    })
}

// 현재시간 및 날짜
let date_list = $("#Clockday").text().split(' ')
let year = date_list[0]
let month = date_list[1]
let day = date_list[2]
let week = date_list[3]

// 공부시작 눌렀을시
function check_in() {
    let present_time = $("#Clock").text()

    $.ajax({
        type: "POST",
        url: "/check-in",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            start_time: present_time,
            status: "출근",

        },
        success: function (response) {


        }
    })
}

// 공부 종료 눌렀을시
function check_out() {
    let present_time = $("#Clock").text()
    let date_list = $("#Clockday").text().split(' ')
    let year = date_list[0]
    let month = date_list[1]
    let day = date_list[2]
    let week = date_list[3]
    let study_time = $("#time").text()

    $.ajax({
        type: "POST",
        url: "/check-out",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            stop_time: present_time,
            status: "퇴근",
            study_time: study_time,
            year: year,
            month: month,
            day: day,
            week: week,

        },

        success: function (response) {

            alert(response["msg"]);

        }
    })

}


// 실시간 시계
function Clock() {
    let date = new Date();
    let YYYY = String(date.getFullYear())
    let MM = String(date.getMonth() + 1)
    let DD = Zero(date.getDate());
    let hh = Zero(date.getHours());
    let mm = Zero(date.getMinutes());
    let ss = Zero(date.getSeconds());
    let Week = Weekday();
    Write(YYYY, MM, DD, hh, mm, ss, Week);

    //시계에 1의자리수가 나올때 0을 넣어주는 함수 (ex : 1초 -> 01초)
    function Zero(num) {
        //삼항 연산자
        return (num < 10 ? '0' + num : '' + num);
    }

    //요일을 추가해주는 함수
    function Weekday() {
        let Week = ['일', '월', '화', '수', '목', '금', '토'];
        let Weekday = date.getDay();
        return Week[Weekday];
    }

    //시계부분을 써주는 함수
    function Write(YYYY, MM, DD, hh, mm, ss, Week) {
        let Clockday = document.getElementById("Clockday");
        let Clock = document.getElementById("Clock");
        Clockday.innerText = YYYY + '년 ' + MM + '월 ' + DD + '일 ' + Week + '요일';
        Clock.innerText = hh + ':' + mm + ':' + ss;
    }
}

// 00시 기준으로 시간 자동저장
// setInterval(Clock, 1000);
function record_time() {
    let date = new Date()
    if (date.getHours() == 10 && date.getMinutes() == 31 & date.getSeconds() == 0) {
        let yesterday_study_time = $('#time').text()
        setCookie('yesterday_study_time', yesterday_study_time, 1)
    }
}

// 1초(1000)마다 Clock함수를 재실행 한다
setInterval(function () {
    Clock();
    record_time();
}, 1000);

//타이머
let time = 0;
let starFlag = true;

function init() {
    document.getElementById("time").innerHTML = "00:00:00";
}

function buttonEvt() {
    let hour = 0;
    let min = 0;
    let sec = 0;
    let timer;


    // start btn 공부 시작 눌렀을시 시간 재기
    $("#startbtn").click(function () {

        if (starFlag) {
            starFlag = false;

            if (time == 0) {
                init();
            }

            timer = setInterval(function () {
                time++;

                min = Math.floor(time / 60);
                hour = Math.floor(min / 60);
                sec = time % 60;
                min = min % 60;

                var th = hour;
                var tm = min;
                var ts = sec;
                if (th < 10) {
                    th = "0" + hour;
                }
                if (tm < 10) {
                    tm = "0" + min;
                }
                if (ts < 10) {
                    ts = "0" + sec;
                }

                let Clock = document.getElementById("Clock");
                setCookie('study_time',th + ":" + tm + ":" + ts ,24*60*60*1000)
                document.getElementById("time").innerHTML = getCookie('study_time')
                console.log(Clock)
            }, 1000);
        }
    });

    // stop 눌러서 잠시동안 공부 멈추기
    $("#pausebtn").click(function () {
        if (time != 0) {
            clearInterval(timer);
            starFlag = true;
        }
    });
    // stop btn
    $("#stopbtn").click(function () {
        if (time != 0) {
            clearInterval(timer);
            starFlag = true;
            time = time
            time = 0;
            init();
        }
    });
}

// 오픈api 현재 위치 날씨 뿌려주기
function getWeather(lat, lon) {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8bd97449cfbe6250092e849b78668814&units=metric`
    )
        .then(function (response) {
            return response.json();

        })
        .then(function (json) {

            let $temp = json.main.temp;  //현재온도
            let $place = json.name;   // 사용자 위치
            let $humidity = json.main.humidity; //강수량
            let $sky = json.weather[0].main;
            let $temp_max = json.main.temp_max;//최고온도
            let $temp_min = json.main.temp_min;//최저온도
            let icon = json.weather[0].icon;//날씨아이콘
            let $wId = json.weather[0].id; // 날씨 상태 id 코드
            let $icon = 'http://openweathermap.org/img/w/' + icon


            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append('<img src=" ' + $icon + '.png ">');


        });
}

// 현위치 좌표 가져오기
let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function handleGeoSucc(position) {
    const latitude = position.coords.latitude;  // 경도
    const longitude = position.coords.longitude;  // 위도
    const coordsObj = {
        latitude,
        longitude
    }

    getWeather(latitude, longitude);
}

// 위치 정보를 가져오지 못할시 서울로 가져옴
function handleGeoErr() {


    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=seoul&appid=8bd97449cfbe6250092e849b78668814&units=metric`
    )
        .then(function (response) {
            return response.json();

        })
        .then(function (json) {
            let $country = json.sys.country;
            let $temp = json.main.temp;  //현재온도
            let $place = json.name;   // 사용자 위치
            let $humidity = json.main.humidity; //강수량
            let $sky = json.weather[0].main;
            let $temp_max = json.main.temp_max;//최고온도
            let $temp_min = json.main.temp_min;//최저온도
            let icon = json.weather[0].icon;//날씨아이콘
            let $wId = json.weather[0].id; // 날씨 상태 id 코드
            let $icon = 'http://openweathermap.org/img/w/' + icon

            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append('<img src=" ' + $icon + '.png ">');

            alert('위치정보가서울로설정되었습니다')
        });
};

navigator.geolocation.getCurrentPosition(handleGeoSucc, handleGeoErr, options);

// 페이지 오디오 다음트랙 재생
var index = 1;
$('#play-next').click(function () {
    index++;
    if (index > $('#myaudio source').length) index = 2;
    console.log(index + '번째 소스 재생');

    $('#myaudio source#main').attr('src',
        $('#myaudio source:nth-child(' + index + ')').attr('src'));
    $("#myaudio")[0].load();
    $("#myaudio")[0].play();
});


// 메인페이지 공부 종료 눌렀을때
function checkout_choice() {

    if (getCookie('yesterday_study_time') != undefined) {
        midnight();
    } else {
        check_out();
    }
}

// 00시 기준 공부를 전날에 시작해 다음날 끝날때의 함수
function midnight() {
    let study_time = $("#time").text()
    $.ajax({
        type: "POST",
        url: "/midnight",
        headers: {
            Authorization: getCookie('access_token')
        },
        data: {
            yesterday_study_time: getCookie('yesterday_study_time'),
            total_study_time: study_time,
            status: "퇴근",
        },
        success: function (response) {
            alert(response["msg"]);
            deleteCookie('yesterday_study_time')
        }
    })
}

