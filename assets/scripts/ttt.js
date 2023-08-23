const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE5LCJleHAiOjE2OTMyMzczNTQsImlhdCI6MTY5MjYzMjU1NH0.pWEfMU6TiCmC0nO7JBn2kEHL0ybsDDFaaKioOJQtLeQ";
const ukey = "398361b3-0f5f-4c75-8986-af9ad40704a6";

const paymentsUrl = "https://api.cryptocards.ws/payments";
const myHeaders = {
    'X-Token': token,
    'X-Ukey': ukey
};


const params = {
    "id": null,
    "active": true,
    "bank": null,
    "canceled": false,
    "card": null,
    "page": 1,
    "success": false
};

function getInfo() {
    $.ajax({
        url: "https://api.cryptocards.ws/payments",
        type: "POST",
        headers: myHeaders,
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify(params),
        success: function (response) {
            let payments = response.payments;
            let containter = $('#test1');
            containter.html("");
            payments.forEach(function (element) {
                if (element.substatus == 0) {
                    let stavka = Math.round(1e4 * element.income / element.amount_in_cur) / 100;
                    containter.append(`
                    <tr>
                        <td>${element.id}</td>
                        <td>${element.label}</td>
                        <td>${element.props}</td>
                        <td>${element.amount}</td>
                        <td>${stavka}%</td>
                        <td>${Date.parse(element.created_at)}</td>
                    </tr>
                    `);
                }
            });
        }
    });
}

function getPercentage() {
    $('#percentage').html("Получение процента...");
    $.ajax({
        url: "https://api.cryptocards.ws/rates",
        type: "GET",
        headers: {
            'X-Token': token,
            'X-Ukey': ukey
        },
        contentType: "application/json",
        dataType: "JSON",
        success: function (response) {
            $('#percentage').html(`Текущий процент: ${response[0].myRate}`)
        }
    });
}

function changePercentage(val) {
    $.ajax({
        url: "https://api.cryptocards.ws/rate/ru",
        type: "POST",
        headers: {
            'X-Token': token,
            'X-Ukey': ukey
        },
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({ rate: '' + val }),
        success: getPercentage
    });
}


function turboGet() {
    $.ajax({
        url: paymentsUrl,
        type: "POST",
        headers: myHeaders,
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify(params),
        success: function (response) {
            let payments = response.payments;
            if (response.payments.length > 0){
                myId = payments[0].id;
            }
        }
    });
}


$(document).ready(function () {
    $('.spinner-border').hide();
    $('#monitoring').on('click', function () {
        let val = $(this).val();
        switch (val) {
            case 'off': {
                $(this).val('on');
                $(this).html("Отключить");
                $('#monitoring_status').html("Включен");
                $('#monitoring_spinner').show();
                setInterval(getInfo, 1000);
                break;
            }
            case 'on': {
                location.reload();
                break;
            }
        }
    });

    $('#change').on('click', function () {
        let val = $(this).data('val')
        switch (val) {
            case 1: {
                changePercentage(0.1);
                $(this).data('val', 2);
                break;
            }
            case 2: {
                changePercentage(2);
                $(this).data('val', 1);
                break;
            }
        }
    })


    let timerId;
    let endInterval = 120, myInterval = 0;

    $('#turbo').on('click', function () {
        let val = $(this).data('val');

        switch (val) {
            case 1: {
                $(this).data('val', 2);
                $(this).html("Turbo ON");
                $('#turbo_status').show();

                timerId = setInterval(() => {
                    turboGet();
                    if (myInterval == endInterval) {
                        myInterval = 0;
                    }
                    myInterval++;
                }, 1000);

                // console.log(123);
                break;
            }
            case 2: {
                $(this).data('val', 1);

                clearInterval(timerId);

                $(this).html("Turbo OFF");
                $('#turbo_status').hide();
                // console.log(456);
                break;
            }
        }


    })




    getInfo();
    getPercentage();
    // setInterval(getInfo, 500);
});


