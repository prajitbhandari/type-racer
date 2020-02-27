var userKeyPressCount=0;
var startTime;
var result_array =["First", "Second", "Third", "Fourth", "Fifth"];
var game_user= [];
var data = {};
var count = 0;
var xcount =0;
var game_start_time;
var game_timer;
var poll_typerace;
var status;

$(document).on("turbolinks:load", function(){
    arrayOfText();
    $("button").on("click",function () {
        $('#template_text').focus();
        $('#template_text').val("");
    });

    $("#template_text").keyup(function(){
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text = $("#template_text").val();
        var current_page_user_id = $(".current_user")[0].id;

        userKeyPressCount++;
        giveColorFeedback(text, template_text);
        updateProgressBar(text, template_text, current_page_user_id);

        var  error_count = checkWordErrorCount(text, template_text);
        var post_wpm = updateWPM(current_page_user_id, template_text, error_count);

        if (isGameOver(text, template_text) == true){
            var accuracy = handleGameOver(current_page_user_id, text_id, error_count);
        }

        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            cache: false,
            data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy}
        });
    });

    // function  checkWPM() {
    //     var text = $("#text").text();
    //     var text_id = $("#text_id").val();
    //     var template_text =  $("#template_text").val();
    //     var current_page_user_id = $(".current_user")[0].id;
    //
    //     var error_count = checkWordErrorCount(text, template_text);
    //     var post_wpm = updateWPM(current_page_user_id, template_text, error_count);
    //     if (isGameOver(text, template_text) == true){
    //         var accuracy = handleGameOver(current_page_user_id, text_id, text, error_count);
    //     }else{
    //         accuracy = 0;
    //     }
    //
    //     $.ajax({
    //         url: "http://localhost:3000/type_races/"+text_id,
    //         type: "PUT",
    //         dataType: "json",
    //         cache: false,
    //         data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy}
    //     });
    //
    //     wpm_interval = setTimeout( function(){
    //         checkWPM();
    //     }, 1000);
    // }

    function poll(){
        var text = $("#text").text();
        var text_id = $("#text_id").val();

        $.ajax({
            type: "GET",
            cache: false,
            url: "http://localhost:3000/type_races/poll/"+text_id,
            success:function(response)
            {
                gameStatus(response);
                for(let i = 0; i< response.stat.length; i++){
                    var current_template_text = response.stat[i]["text_area"];
                    var current_user_id = response.stat[i]["user_id"];
                    var current_wpm = response.stat[i]["wpm"];
                    var current_accuracy = response.stat[i]["accuracy"];

                    current_template_text == null ?  current_template_text = "" : current_template_text = response.stat[i]["text_area"];
                    current_wpm == null ?  current_wpm = 0 : current_wpm = response.stat[i]["wpm"];
                    current_accuracy == null ?  current_accuracy = 0 : current_accuracy = response.stat[i]["accuracy"];

                    updateProgressBar(text, current_template_text, current_user_id);
                    var get_poll_wpm = pollWPM(current_user_id, current_wpm);
                    if (isGameOver(text, current_template_text) == true){
                        status = "completed";
                        if(game_user.includes(current_user_id)){
                            $('#result'+current_user_id).text(data[current_user_id]);

                        }else{
                            var type_race_stat = result_array.shift();
                            data[current_user_id] = type_race_stat;
                            game_user.push(current_user_id);
                            $('#result'+current_user_id).text(data[current_user_id]);
                        }
                        pollAccuracy(current_user_id, current_accuracy);
                    }else{
                        status = "cancel";
                    }
                }


                //Send another request in 10 seconds.
                poll_typerace = setTimeout(function(){
                    poll();
                }, 1000);
            },
            error: function (error) {
                alert("The error is "+ error);
            }
        });
    }

    if ($("body").data("action") == "show" && $("body").data("controller") == "type_races"){
        disableInput();
        poll();
    }
});// end of DOM

function gameStatus(response){
    if (response.stat.length >1){
        var text_id = $("#text_id").val();
        var response_countdown = response.game_stat["countdown"];
        var response_start_time = response.game_stat["start_time"];

        // count++;
        // if(count == 1){
        //     $("#gameTimer").html("Ready For Race");
        // }
        // debugger;
        if (--response_countdown <= 0){
            status = "ongoing";
            $("#gameTimer").html("");
            var text = $("#text").text();
            var template_text = $("#template_text").val();
            if (isGameOver(text, template_text)){
                disableInput();
            }else {
                response_start_time == null ? game_start_time = enableInput() : game_start_time = response_start_time
            }
            if (response_start_time != null){
                if ((new Date($.now())/1000 - response_start_time) <160){
                    if (isGameOver(text, template_text)){
                        status = "completed";
                        disableInput();
                    }else {
                        status = "ongoing";
                        enableInput();
                    }
                    var get_minutes = parseInt((new Date($.now())/1000 - response_start_time)/ 60, 10);
                    var get_seconds = parseInt((new Date($.now())/1000 - response_start_time)% 60, 10);

                    get_minutes = get_minutes < 10 ? "0" + get_minutes.toString() : get_minutes.toString();
                    get_seconds = get_seconds < 10 ? "0" + get_seconds.toString() : get_seconds.toString();

                    $("span#minutes").html(get_minutes + ":");
                    $("span#seconds").html(get_seconds);
                } else if ((new Date($.now())/1000 - response_start_time) >=160){
                    $("span#minutes").html("<p style='color:darkblue;'>The race has ended</p>");
                    $("span#seconds").html("");

                    if (isGameOver(text, template_text) == false){
                        status = "cancel";
                    }
                    disableInput();
                    clearTimeout(poll_typerace);
                }
            }

        }else{
            status = "pending";
            $("#gameTimer").html("Wating For "+response_countdown);
        }
        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            cache: false,
            data: {"status": status, "countdown": response_countdown,"start_time": game_start_time}
        });
    }else{
        $("#gameTimer").html("Looking For Competitors");
    }

}

function arrayOfText() {
    var textTemplate=$("#text").text();
    var textTemplateCharArray = textTemplate.split("");
    for(var spanCount=0; spanCount < textTemplateCharArray.length; spanCount++) {
        textTemplateCharArray[spanCount] = '<span id= "a'+spanCount +'">' + textTemplateCharArray[spanCount] + '</span>';
    }
    var textTemplateSpanified = textTemplateCharArray.join("");
    $("#text").html(textTemplateSpanified);
}

function checkWordErrorCount(text, template_text){
    var  word_error_count = 0;
    for(let i= 0; i< template_text.length; i++){
        if (text[i] != template_text[i]){
            word_error_count += 1
        }
    }
    return word_error_count;
}

function updateWPM(current_user_id, current_template_text, word_error_count){
    var currentTime = new Date($.now())/1000;
    if(isNaN(startTime)){
        startTime = new Date($.now())/1000;
    }
    var timeInSecs = currentTime-startTime;
    var timeInMins = timeInSecs/60;
    var wordsWritten = current_template_text.length/5;
    if (word_error_count > wordsWritten){
        var wpm = 0;
    }else{
        wpm = (wordsWritten-word_error_count)/timeInMins;
    }
    var get_wpm = parseInt(wpm,10);
    $('#checkWpm'+ current_user_id).text(get_wpm);
    return get_wpm;
}

function pollWPM(current_user_id, wpm){
    $('#checkWpm'+ current_user_id).text(wpm);
    return [current_user_id, wpm];
}

function updateProgressBar(text, template_text, current_user_id){
    var percentage = 5 + getProgress(text, template_text);
    var progressBarSelector = $("#newBar"+current_user_id);
    var progressBar = $(progressBarSelector);
    var currentCharIndex = template_text.length-1;
    for(var i = 0; i <template_text.length; i++) {
        if (template_text[currentCharIndex] == text[currentCharIndex]) {
            $(progressBar).css("width", percentage + "%" );
        }
    }
}

function getProgress(text, template_text){
    var template_text_length = template_text.length;
    var quote_length = text.length;
    return ((template_text_length / quote_length) * 100);
}

function giveColorFeedback(text,template_text){
    for(let i = 0; i < text.length; i++){
        $("span #a" + i).removeClass("match unmatch");
    }
    for (let i= 0; i<template_text.length; i++){
        if (template_text[i] === text[i]){
            $("span #a" + i).addClass("match").removeClass("unmatch");
        } else {
            $("span #a"  + i).removeClass("match").addClass("unmatch");
        }
    }
}

function isGameOver(text, template_text){
    return (text === template_text);
}

function handleGameOver(current_user_id, text_id, error_count) {
    // clearTimeout(wpm_interval);
    var accuracy = displayAccuracy(current_user_id, error_count);
    $.ajax({
        url: "http://localhost:3000/type_races/"+text_id,
        type: "GET",
        cache: false,
        success: function (response) {
            var len = response.length;
            for(var i= 0; i<len; i++){
                var desc = response[i];
            }
        },
        error: function (data) {
            console.log("The error is "+data);
        }
    });
    disableInput();
    return accuracy;
}

function displayAccuracy(current_user_id, error_count) {
    var userKeyPressInputCharLen= userKeyPressCount;
    var accuracy = ((userKeyPressInputCharLen-error_count)/userKeyPressInputCharLen)*100;
    accuracy=Math.round( accuracy );
    $('.showAccuracy').show("fast");
    $('#accuracy'+current_user_id).text(accuracy);
    return accuracy;
}

function pollAccuracy(current_user_id, accuracy){
    $('.showAccuracy').show("fast");
    $('#accuracy'+current_user_id).text(accuracy);
}

function disableInput() {
    $('#template_text').prop('disabled', true);
}

function enableInput() {
    $('#template_text').prop('disabled', false);
    $('#template_text').focus();
    if(startTime === undefined){
        startTime = new Date($.now())/1000;
    }
    return startTime;
}

