var countCharacters=0;
var startTime;
var userKeyPressCount=0;

$(document).on("turbolinks:load", function () {

    //Our custom function.
    arrayOfText();
    $("button").on("click",function () {
        $('#template_text').focus();
        $('#template_text').val("");
    });

    $("#template_text").keyup(function () {
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text =  $("#template_text").val();
        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            // dataType: 'json',
            data :{"text_area": template_text },
            success: function (data,status,jqXHR) {
                console.log("data is :"+ data.text + " "+ "Status is "+ status)
                giveColorFeedback(text,template_text);
                updateProgressBar(text,template_text);
                updateWPM();

                if (isGameOver() == true){
                    handleGameOver();
                }
            },
            error: function (error) {
                console.log("The error is "+error)
            }
        });
    });


    $("#template_text").on("input",function(event){
        if (startTime === undefined) {
            startTime = new Date($.now());
        }

        var modifierKeyKeyCodes = [16,17,18,20,27,37,38,39,40,46];
        if (modifierKeyKeyCodes.includes(event.keyCode) == false) {
            userKeyPressCount++;
        }


    });
});

function arrayOfText() {
    var textTemplate=$("#text").text();
    var textTemplateCharArray = textTemplate.split("");
    for(var spanCount=0; spanCount < textTemplateCharArray.length; spanCount++) {
        textTemplateCharArray[spanCount] = '<span id= "'+spanCount +'">' + textTemplateCharArray[spanCount] + '</span>';
    }
    var textTemplateSpanified = textTemplateCharArray.join("");
    $("#text").html(textTemplateSpanified);
}


function updateWPM(current_user_id){
    countCharacters += 1;
    var currentTime=new Date($.now());
    var timeInSecs = (currentTime-startTime)/1000;
    var timeInMins = timeInSecs/60;
    var wordsWritten = countCharacters/5;
    var wpm = wordsWritten/timeInMins;
    wpm = parseInt(wpm,10);
    $('#checkWpm').text(wpm);

}
function updateProgressBar(text,template_text){
    var current_user_id = $(".current_user")[0].id;
    var percentage = 3 + getProgress();
    var progressBarSelector = $("#newBar"+current_user_id);
    var progressBar = $(progressBarSelector);
    // var text = $('#text').text();
    // var template_text = $('#template_text').val();
    var currentCharIndex = template_text.length - 1;
    for(var i = currentCharIndex; i <= text.length - 1 ; i++) {
        if (template_text[currentCharIndex] === text[currentCharIndex]) {
            $(progressBar).css("width", percentage + "%" );
        }
    }
}
function getProgress(){
    var template_text_length = $("#template_text").val().length;
    var quote_length = $("#text").text().length;
    return ((template_text_length / quote_length) * 100);
}

function giveColorFeedback(text,template_text){
    for(let i = 0; i < text.length; i++){
        $("span #" + i).removeClass("match unmatch");
    }
    for (let i= 0; i<template_text.length; i++){
        if (template_text[i] == text[i]){
            $("span #" + i).addClass("match").removeClass("unmatch");
        } else {
            $("span #"  + i).removeClass("match").addClass("unmatch");
        }
    }

}

function isGameOver(){
    return ($('#text').text()===$('#template_text').val());
}

function handleGameOver() {
    displayAccuracy();
    $.ajax({
        url: "http://localhost:3000/type_races/"+text_id,
        type: "GET",
        success: function (response) {
          var len = response.length;
          for(var i= 0; i<len; i++){
              var desc = response[i];
              console.log("The description is "+desc);
          }
        },
        error: function (data) {
            console.log("The error is "+data)
        }
    });
    disableInput();
}

function displayAccuracy() {
    var textCharLen= $('#text').text().length;
    var userKeyPressInputCharLen=userKeyPressCount;
    var accuracy = ( textCharLen/userKeyPressInputCharLen )*100;
    accuracy=Math.round( accuracy );
    $('#showAccuracy').removeClass("hidden");
    $('#accuracy').text(accuracy);
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
