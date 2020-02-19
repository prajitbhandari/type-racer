var countCharacters=0;
var word_error_count = 0;
var userKeyPressCount=0;
var startTime;
var start = 10;
var sec = 0;
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
        var current_user_id = $(".current_user")[0].id;
        // var wpm = $("#checkWpm"+current_user_id).val();

        userKeyPressCount++;
        giveColorFeedback(text, template_text);
        updateProgressBar(text, template_text, current_user_id);
        var  error_count = checkWordErrorCount(text, template_text);
        var post_wpm = updateWPM(current_user_id, template_text, error_count);


        if (isGameOver(text, template_text) == true){
             var accuracy = handleGameOver(current_user_id, text_id, text);
        }

        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy},
            success: function (data, status) {
               console.log("The success is"+status);
            },
            error: function (error) {
                console.log("The error is "+error);
            }
        });
    });

    function poll(){
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text =  $("#template_text").val();
        var current_page_user_id = $(".current_user")[0].id;

        $.ajax({
            type: "GET",
            cache: false,
            url: "http://localhost:3000/type_races/poll/"+text_id,
            success:function(response)
            {
                gameStatus(response);
                var error_count = checkWordErrorCount(text, template_text);
                var post_wpm = updateWPM(current_page_user_id, template_text, error_count);
                if (isGameOver(text, template_text) == true){
                    var accuracy = handleGameOver(current_page_user_id, text_id, text);
                }else{
                    accuracy = 0;
                }

                $.ajax({
                    url: "http://localhost:3000/type_races/"+text_id,
                    type: "PUT",
                    dataType: "json",
                    data :{"text_area": template_text, "wpm": post_wpm, "accuracy": accuracy},
                    success: function (data, status) {
                        console.log("The success is"+status);
                    },
                    error: function (error) {
                        console.log("The error is "+error);
                    }
                });

                for(let i = 0; i< response.stat.length; i++){
                    var current_template_text = response.stat[i]["text_area"];
                    var current_user_id = response.stat[i]["user_id"];
                    var current_wpm = response.stat[i]["wpm"];
                    var current_accuracy = response.stat[i]["accuracy"];
                    current_template_text == null ?  current_template_text = "" : current_template_text = response.stat[i]["text_area"];
                    current_wpm == null ?  current_wpm = 0 : current_wpm = response.stat[i]["wpm"];
                    current_accuracy == null ?  current_accuracy = 0 : current_accuracy = response.stat[i]["accuracy"];
                    updateProgressBar(text, current_template_text, current_user_id);
                    pollWPM(current_user_id, current_wpm);
                    if (isGameOver(text, current_template_text) == true){
                        pollAccuracy(current_user_id, current_accuracy);
                    }
                }
                //Send another request in 10 seconds.
                setTimeout(function(){
                    if ($("body").data("action") == "show" && $("body").data("controller") == "type_races"){
                        poll();
                    }
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
        var wpmInterval = setInterval( function(){
           ++sec;
        }, 1000);
        if(startTime == undefined){
            startTime = new Date($.now())/1000;
        }
        poll();
    }

    function gameStatus(data){
        if (data.stat.length >1){
            var statusInterval = setInterval( function(){
                --start;
                if (start <= 0){
                    $("#gameTimer").html("");
                    clearInterval(statusInterval);
                    var timeInterval= setInterval(function () {
                        var get_minutes = parseInt(timer/ 60, 10);
                        var get_seconds = parseInt(timer% 60, 10);
                        get_minutes = get_minutes < 10 ? "0" + get_minutes : get_minutes;
                        get_seconds = get_seconds < 10 ? "0" + get_seconds : get_seconds;
                        $("span#minutes").html(get_minutes.toString() + ":");
                        $("span#seconds").html(get_seconds.toString());
                        if (--timer <= 0) {
                            $("span#minutes").html("00:");
                            $("span#seconds").html("00");
                            clearInterval(timeInterval);
                            clearInterval(wpmInterval);
                        }
                    }, 5000);
                }else{
                    $("#gameTimer").html("Wating For "+start);
                }
            }, 5000);

        }else{
            $("#gameTimer").html("Looking For Competitors");
        }

    }

});// end of DOM

function  initialGameStatus(){
    var statcount = parseInt($('#stat_count').text());
    if (statcount >1){
        $("#gameTimer").html("Ready For Race");
    }else{
        $("#gameTimer").html("Looking For Competitor");
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
    var wpm = 0;
    if (word_error_count > wordsWritten){
        wpm = 0;
    }else{
        wpm = (wordsWritten-word_error_count)/timeInMins;
    }

    var get_wpm = parseInt(wpm,10);
    $('#checkWpm'+ current_user_id).text(get_wpm);
    return get_wpm;
}

function pollWPM(current_user_id, wpm){
    $('#checkWpm'+ current_user_id).text(wpm);
}

function pollAccuracy(current_user_id, accuracy){

    $('.showAccuracy').show("fast");
    $('#accuracy'+current_user_id).text(accuracy);
}

function updateProgressBar(text, template_text, current_user_id){
    var percentage = 4 + getProgress(text, template_text);
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
    // debugger;
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
    // return ($('#text').text()===$('#template_text').val());
}

function handleGameOver(current_user_id, text_id, text) {
    var accuracy = displayAccuracy(current_user_id, text);
    $.ajax({
        url: "http://localhost:3000/type_races/"+text_id,
        type: "GET",
        success: function (response) {
          var len = response.length;
          for(var i= 0; i<len; i++){
              var desc = response[i];
              // console.log("The description is "+desc);
          }
        },
        error: function (data) {
            console.log("The error is "+data)
        }
    });
    disableInput();
    return accuracy;
}

function displayAccuracy(current_user_id, text) {
    // var textCharLen= $('#text').text().length;
    var textCharLen= text.length;
    var userKeyPressInputCharLen= userKeyPressCount;
    var accuracy = ( textCharLen/userKeyPressInputCharLen )*100;
    accuracy=Math.round( accuracy );
    $('.showAccuracy').show("fast");
    $('#accuracy'+current_user_id).text(accuracy);
    return accuracy;
}

function disableInput() {
    $('#template_text').prop('disabled', true);
}

var quotes = ["Hello there", "Genius is one percent inspiration and ninety-nine percent perspiration.", "You can observe a lot just by watching.","A house divided against itself cannot stand.",
    "Difficulties increase the nearer we get to the goal.","Fate is in your hands and no one elses",
    "Be the chief but never the lord.","Nothing happens unless first we dream.","Well begun is half done.", "Life is a learning experience, only if you learn."
    ,"Self-complacency is fatal to progress.","Peace comes from within. Do not seek it without.","What you give is what you get.",
    "We can only learn to love by loving.","Life is change. Growth is optional. Choose wisely.","You'll see it when you believe it."
    ,"Today is the tomorrow we worried about yesterday.","It's easier to see the mistakes on someone else's paper."
    , "Every man dies. Not every man really lives.","To lead people walk behind them.","Having nothing, nothing can he lose."]



