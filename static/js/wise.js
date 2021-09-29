const getRandomNumberOf = (total) => Math.floor(Math.random() * total);
let i = getRandomNumberOf(10);

$(document).ready(function () {
    getWiseSy();
});

function getWiseSy() {
    $.ajax({
        type: "GET",
        url: "/api/wise_sy",
        data: {},
        success: function (response) {
            let wise_sy = response;
            console.log(wise_sy)
            let name = wise_sy[i]['sy_name']
            let wise = wise_sy[i]['wise_sy']
            let temp_html = `<tr>
                               <td>${wise}</td>
                               <td>${name}</td>
                             </tr>`
            $('#wise-box').append(temp_html)
            console.log(temp_html)
        }
    })
}