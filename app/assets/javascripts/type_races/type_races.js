
var userKeyPressCount=0;
var startTime;
var countdown = 10;
var timer = 60*5;

$(document).on("turbolinks:load", function () {
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
            var accuracy = handleGameOver(current_page_user_id, text_id, text, error_count);
        }

        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            cache: false,
            data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy}
        });
    });


    function  checkWPM() {
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text =  $("#template_text").val();
        var current_page_user_id = $(".current_user")[0].id;

        var error_count = checkWordErrorCount(text, template_text);
        var post_wpm = updateWPM(current_page_user_id, template_text, error_count);
        if (isGameOver(text, template_text) == true){
            var accuracy = handleGameOver(current_page_user_id, text_id, text, error_count);
        }else{
            accuracy = 0;
        }

        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            cache: false,
            data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy}
        });

        wpm_interval = setTimeout( function(){
            checkWPM();
        }, 3000);
    }


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
                var arr =["First", "Second", "Third", "Fourth", "Fifth"];
                var game_user= [];
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
                        game_user.push(current_user_id);
                        var get_final_wpm =  get_poll_wpm;
                        var grade_user = get_poll_wpm.shift();
                        var g_user = game_user.shift();
                        var res = arr.shift();
                        console.log(`Current user ${g_user} is ${res}`);
                        pollAccuracy(current_user_id, current_accuracy);
                    }
                }

                //Send another request in 10 seconds.
                poll_typerace = setTimeout(function(){
                    poll();
                }, 1000);
            },
            error: function (error) {
                alert("The error is "+ error);
                console.log("The error is "+error);
            }
        });
    }

    if ($("body").data("action") == "show" && $("body").data("controller") == "type_races"){
        initialGameStatus();
        checkWPM();
        poll();
    }
});// end of DOM

function  initialGameStatus(){
    disableInput();
    var statcount = parseInt($('#stat_count').text());
    if (statcount >1){
        $("#gameTimer").html("Ready For Race");
    }else{
        $("#gameTimer").html("Looking For Competitor");
    }
}

function gameStatus(response){
    if(response.stat.length > 1){
        var statusInterval = setInterval( function(){
            --countdown;
            if (countdown <= 0){
                $("#gameTimer").html("");
                clearInterval(statusInterval);
                var timeInterval= setInterval(function () {
                    var get_minutes = parseInt(timer/ 60, 10);
                    var get_seconds = parseInt(timer% 60, 10);
                    var text = $("#text").text();
                    var template_text = $("#template_text").val();
                    get_minutes = get_minutes < 10 ? "0" + get_minutes : get_minutes;
                    get_seconds = get_seconds < 10 ? "0" + get_seconds : get_seconds;
                    $("span#minutes").html(get_minutes.toString() + ":");
                    $("span#seconds").html(get_seconds.toString());

                    isGameOver(text, template_text) ? disableInput() : enableInput();
                    if (--timer <= 0) {
                        $("span#minutes").html("00:");
                        $("span#seconds").html("00");
                        clearInterval(timeInterval);
                        clearTimeout(poll_typerace);
                        disableInput();
                    }
                }, 5000);
            }else{
                $("#gameTimer").html("Wating For "+countdown);
            }
        }, 5000);
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
    console.log(currentCharIndex);
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

function handleGameOver(current_user_id, text_id, text, error_count) {
    var accuracy = displayAccuracy(current_user_id, text, error_count);
    clearTimeout(wpm_interval);
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
            console.log("The error is "+data)
        }
    });
    disableInput();
    return accuracy;
}

function displayAccuracy(current_user_id, text, error_count) {
    var textCharLen= text.length;
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
    if(startTime == undefined){
        startTime = new Date($.now())/1000;
    }
}

