const getRandomNumberOf = (total) => Math.floor(Math.random() * total);
let i = getRandomNumberOf(10);

$(document).ready(function () {
    getWiseSy();
    Clock()


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
    if (date.getHours() == 0 && date.getMinutes() == 0 & date.getSeconds() == 0) {
        let yesterday_study_time = (hour + minute + seconds)
        setCookie('yesterday_study_time', yesterday_study_time, 1)
    }
}

// 1초(1000)마다 Clock함수를 재실행 한다
setInterval(function () {
    Clock();
    record_time();
}, 1000);


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
            let _icon = `https://openweathermap.org/img/wn/${icon}@2x.png`


            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append(`<img src="${_icon}">`);


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
            let _icon = `https://openweathermap.org/img/wn/${icon}@2x.png`

            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append(`<img src="${_icon}">`);

            alert('위치정보가서울로설정되었습니다')
        });
};

navigator.geolocation.getCurrentPosition(handleGeoSucc, handleGeoErr, options);

// 페이지 오디오 다음트랙 재생
var index = 1;
$('#play-next').click(function () {
    index++;
    if (index > $('#myaudio source').length) index = 2;


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


// 내가 끝을 누르기 전까지 공부시간 체크(스톱워치)
let hour = 0;
let minute = 0;
let seconds = 0;
let pauseTime = null;
let start = [...document.cookie.matchAll(/([^;=]+)=([^;=]+)(;|$)/g)].filter(x => x[1].trim() == 'timer').map(x => Number(x[2].trim()))[0];
if (start != null) {
    if (start > 0) start = new Date(start);
    else if (start < 0) {
        pauseTime = -start;
        start = new Date(Date.now() + start); //+- = -
    } else start = null;
} else start = null;
let intervalId = null;


function startTimer() {
    let totalSeconds;
    if (pauseTime) {
        start = new Date(Date.now() - pauseTime);
        totalSeconds = pauseTime;
        return;
    } else {
        totalSeconds = Math.floor((Date.now() - start.getTime()) / 1000);
    }
    hour = Math.floor(totalSeconds / 3600);
    minute = Math.floor((totalSeconds - hour * 3600) / 60);
    seconds = totalSeconds - (hour * 3600 + minute * 60);

    hour = (hour < 10 ? "0" + hour : hour)
    minute = (minute < 10 ? "0" + minute : minute)
    seconds = (seconds < 10 ? "0" + seconds : seconds);

    document.getElementById("hour").innerHTML = hour + ":";
    document.getElementById("minute").innerHTML = minute + ":";
    document.getElementById("seconds").innerHTML = seconds;
}

if (start) intervalId = setInterval(startTimer, 1000);

document.getElementById('start-btn').addEventListener('click', () => {
    if (pauseTime) {
        pauseTime = null;
    } else {
        if (start) return;
        start = new Date();
        intervalId = setInterval(startTimer, 1000);
    }
    document.cookie = "timer=" + String(start.getTime());
})

document.getElementById('stop-btn').addEventListener('click', () => {
    pauseTime = Date.now() - start.getTime();
    document.cookie = "timer=" + String(-pauseTime);
});


document.getElementById('reset-btn').addEventListener('click', () => {
    start = null;
    document.cookie = "timer=null";
    if (intervalId) clearInterval(intervalId);
    document.getElementById("hour").innerHTML = '00:';
    document.getElementById("minute").innerHTML = '00:';
    document.getElementById("seconds").innerHTML = '00';

});

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
    let study_time = (hour + minute + seconds)


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

// 00시 기준 공부를 전날에 시작해 다음날 끝날때의 함수
function midnight() {
    let study_time = (hour + minute + seconds)
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
