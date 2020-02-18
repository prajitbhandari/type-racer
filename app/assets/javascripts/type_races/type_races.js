var countCharacters=0;
var word_error_count = 0;
var userKeyPressCount=0;
var start = 10;
var sec = 0;
var get_sec = 30;
var get_min = 1;
$(document).on("turbolinks:load", function () {
    arrayOfText();
    $("button").on("click",function () {
        $('#template_text').focus();
        $('#template_text').val("");
    });

    $("#template_text").keyup(function(){
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text =  $("#template_text").val();
        var current_user_id = $(".current_user")[0].id;
        var wpm = $("#checkWpm"+current_user_id).val();
        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            cache: false,
            data :{"text_area": template_text, "wpm": wpm},
            success: function (data, status) {
                // console.log("The data is"+ data.text["current_user"]);
                // console.log("Template text is "+template_text);
                giveColorFeedback(text, template_text);
                updateProgressBar(text, template_text, current_user_id);
                let  error_count = checkWordErrorCount(text, template_text);
                updateWPM(current_user_id, template_text, error_count);
                userKeyPressCount++;
                if (isGameOver(text, template_text) == true){
                    handleGameOver(current_user_id, text_id, text);
                }
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
            success:function(data)
            {
                gameStatus(data);
                for(let i = 0; i< data.stat.length; i++){
                    var current_template_text = data.stat[i]["text_area"];
                    var current_user_id = data.stat[i]["user_id"];
                    var current_wpm = $("#checkWpm"+current_user_id).val();
                    current_template_text == null ?  current_template_text = "" : current_template_text = data.stat[i]["text_area"];
                    updateProgressBar(text, current_template_text, current_user_id);
                    // pollWPM(current_user_id, current_template_text, current_wpm);
                }
                if (isGameOver(text, current_template_text) == true){
                    handleGameOver(current_user_id, text_id, text);
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
        setInterval( function(){
           ++sec;
        }, 1000);
       poll();
    }

    function gameStatus(data){
        if (data.stat.length >1){
            var statusInterval = setInterval( function(){
                --start;
                if (start <= 0){
                    $("#gameTimer").html("");
                    if (get_min ==0 && get_sec ==0){
                        $("span#minutes").html("00");
                        $("span#seconds").html("00");
                    }else{
                        $("span#minutes").html(get_min);
                        $("span#seconds").html(get_sec);
                    }
                    clearInterval(statusInterval);
                    function pad ( val ) { return val > 9 ? val : "0" + val; }
                    var timerInterval = setInterval( function(){
                            if(get_sec <=0 && get_min <=0){
                                $("span#minutes").html(pad(parseInt(get_min)));
                                $("span#seconds").html(pad(parseInt(get_sec)));
                                clearInterval(timerInterval);
                            }else if(get_sec >=1){
                                $("span#seconds").html(pad(parseInt(--get_sec)));
                            }else{
                                $("span#minutes").html(pad(parseInt(--get_min)));
                            }
                        }, 5000);

                }else{
                    $("#gameTimer").html("Wating For"+ start);
                }
            }, 5000);

        }else{
            $("#gameTimer").html("Looking For Competitor");
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
    debugger;
    countCharacters += 1;
    var currentTime = new Date().getTime()/1000;
    console.log("Current Time is "+ currentTime);
    var timeInSecs = currentTime-sec;
    var timeInMins = timeInSecs/60;
    var wordsWritten = countCharacters/5;
    var wpm = wordsWritten-word_error_count/timeInMins;
    console.log("WPM"+wpm);
    wpm = parseInt(wpm,10);
    console.log("WPM AFTER"+wpm);
    $('#checkWpm'+ current_user_id).text(wpm);

}


function updateProgressBar(text, template_text, current_user_id){
    var percentage = 3 + getProgress(text, template_text);
    var progressBarSelector = $("#newBar"+current_user_id);
    var progressBar = $(progressBarSelector);
    var currentCharIndex = template_text.length-1;
    console.log(currentCharIndex);
    for(var i = 0; i <template_text.length; i++) {
        if (template_text[currentCharIndex] === text[currentCharIndex]) {
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
    // return ($('#text').text()===$('#template_text').val());
}

function handleGameOver(current_user_id, text_id, text) {
    displayAccuracy(current_user_id, text);
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
}

function displayAccuracy(current_user_id, text) {
    // var textCharLen= $('#text').text().length;
    var textCharLen= text.length;
    var userKeyPressInputCharLen= userKeyPressCount;
    var accuracy = ( textCharLen/userKeyPressInputCharLen )*100;
    accuracy=Math.round( accuracy );
    $('.showAccuracy').show("fast");
    $('#accuracy'+current_user_id).text(accuracy);
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



