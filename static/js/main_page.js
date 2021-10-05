const getRandomNumberOf = (total) => Math.floor(Math.random() * total);
let i = getRandomNumberOf(10);


$(document).ready(function () {
    getWiseSy();
    Clock()
    buttonEvt();
    // <!--    이미지 클릭할때마다 바뀌는기능-->

    $('.checkin-box').show(); //페이지를 로드할 때 표시할 요소
    $('.checkout-box').hide(); //페이지를 로드할 때 숨길 요소
    $('.checkin-img').click(function () {
        $('.checkin-box').hide(); //클릭 시 첫 번째 요소 숨김
        $('.checkout-box').show(); //클릭 시 두 번째 요소 표시
        $('.checkout-img').click(function () {
            $('.checkout-box').hide(); //클릭 시 첫 번째 요소 숨김
            $('.checkin-box').show(); //클릭 시 두 번째 요소 표시



            return false;
        });
    });
});



function getWiseSy() {
    $.ajax({
        type: "GET",
        url: "/wise",
        data: {},
        success: function (response) {
            let wise_sy = response;
            console.log(wise_sy)
            let name = wise_sy[i]['sy_name']
            let wise = wise_sy[i]['wise_sy']
            let temp_html = `<p>${wise}</p>
                             <p>${name}</p>`
            $('#wise-box').append(temp_html)
            console.log(temp_html)
        }
    })
}


let date_list = $("#Clockday").text().split(' ')
let year = date_list[0]
let month = date_list[1]
let day = date_list[2]
let week = date_list[3]


function check_in() {
    let present_time = $("#Clock").text()
    let date_list = $("#Clockday").text().split(' ')
    let year = date_list[0]
    let month = date_list[1]
    let day = date_list[2]
    let week = date_list[3]

    $.ajax({
        type: "POST",
        url: "/check-in",
        headers: {
            Authorization:  getCookie('access_token')
        },
        data: {
            start_time: present_time,
            status: "출근",
            year: year,
            month: month,
            day: day,
            week: week,
        },
        success: function (response) {
            // alert(response["msg"]);
            // window.location.reload();
        }
    })
}


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
            Authorization:  getCookie('access_token')
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
            // let present_time =
            // let study_time
            alert(response["msg"]);
            // window.location.reload();
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

setInterval(Clock, 1000);
//1초(1000)마다 Clock함수를 재실행 한다

//타이머
let time = 0;
let starFlag = true;

function init() {
    document.getElementById("time").innerHTML = "00:00:00초 동안 업무중";
}

function buttonEvt() {
    let hour = 0;
    let min = 0;
    let sec = 0;
    let timer;

    // start btn
    $("#startbtn").click(function () {

        if (starFlag) {
            // $(".fa").css("color", "#FAED7D")
            // this.style.color = "#4C4C4C";
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

                let th = hour;
                let tm = min;
                let ts = sec;
                if (th < 10) {
                    th = "0" + hour;
                }
                if (tm < 10) {
                    tm = "0" + min;
                }
                if (ts < 10) {
                    ts = "0" + sec;
                }

                document.getElementById("time").innerHTML = th + ":" + tm + ":" + ts + '초 동안 업무중';
            }, 1000);
        }
    });

    // stop btn
    $("#stopbtn").click(function () {
        if (time != 0) {
            // $(".fa").css("color", "#FAED7D")
            // this.style.color = "#4C4C4C";
            clearInterval(timer);
            starFlag = true;
            time = time
            time = 0;
            init();
        }
    });
}


function getWeather(lat, lon) {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8bd97449cfbe6250092e849b78668814&units=metric`
    )
        .then(function (response) {
            return response.json();

        })
        .then(function (json) {

            console.log(json);
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


            console.log($temp, $place, $humidity, $sky, $wId)

            // $('.place').append($country + )
            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            //  $('.place').append('/'+$country);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append('<img src=" ' + $icon + '.png ">');


        });
}


let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function handleGeoSucc(position) {
    console.log(position);
    const latitude = position.coords.latitude;  // 경도
    const longitude = position.coords.longitude;  // 위도
    const coordsObj = {
        latitude,
        longitude
    }

    getWeather(latitude, longitude);
}

function handleGeoErr() {


    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=seoul&appid=8bd97449cfbe6250092e849b78668814&units=metric`
    )
        .then(function (response) {
            return response.json();

        })
        .then(function (json) {

            console.log(json);
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


            console.log($temp, $place, $humidity, $sky, $wId)


            $('.csky').append($sky);
            $('.temp').append($temp + "°C");
            $('.humidity').append($humidity + "%");
            $('.place').append($place);
            //  $('.place').append('/'+$country);
            $('.temp_max').append($temp_max + "°C");
            $('.temp_min').append($temp_min + "°C");
            $('.icon').append('<img src=" ' + $icon + '.png ">');

 alert('위치정보가서울로설정되었습니다')
        });
};

navigator.geolocation.getCurrentPosition(handleGeoSucc, handleGeoErr, options);

	var index = 1;
	$('#play-next').click(function() {
		index++;
		if(index > $('#myaudio source').length) index=2;
		console.log( index + '번째 소스 재생' );

		$('#myaudio source#main').attr('src',
			$('#myaudio source:nth-child('+index+')').attr('src'));
		$("#myaudio")[0].load();
		$("#myaudio")[0].play();
	});