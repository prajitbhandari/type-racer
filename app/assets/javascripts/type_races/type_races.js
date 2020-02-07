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

    $("#template_text").keyup(function(){
        var text = $("#text").text();
        var text_id = $("#text_id").val();
        var template_text =  $("#template_text").val();
        var current_user_id = $(".current_user")[0].id;
        $.ajax({
            url: "http://localhost:3000/type_races/"+text_id,
            type: "PUT",
            dataType: "json",
            data :{"text_area": template_text, "current_user_id": current_user_id},
            success: function (data, status) {
                console.log("Template text is "+template_text);
                console.log("data is :"+ data.text["current_user_id"] + " "+ "Status is "+ status);
                giveColorFeedback(text, template_text);
                updateProgressBar(text, template_text, current_user_id);
                updateWPM(current_user_id);
                if (isGameOver() == true){
                    handleGameOver(current_user_id, text_id);
                }
            },
            error: function (error) {
                alert("The error is "+ error);
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
            url: "http://localhost:3000/type_races/poll/"+text_id,
            success:function(data)
            {
                console.log("Poll Data is" + data.text["current_user_id"] );
                var  current_user_id = data.text["current_user_id"];
                var  current_template_text = data.text["text_area"];
                current_template_text == null ?  current_template_text = "" : current_template_text = data.text["text_area"];
                console.log("c text "+current_template_text);
                // debugger;
                updateProgressBar(text, current_template_text, current_user_id);
                updateWPM(current_user_id);
                if (isGameOver() == true){
                    handleGameOver(current_page_user_id, text_id);
                }
                //Send another request in 10 seconds.
                setTimeout(function(){
                    if ($("body").data("action") == "show" && $("body").data("controller") == "type_races"){
                        poll();
                    }
                }, 10000);
            },
            error: function (error) {
                alert("The error is "+ error);
                console.log("The error is "+error);
            }
        });
    }


    if ($("body").data("action") == "show" && $("body").data("controller") == "type_races"){
        poll();
    }
    //Call our function

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
        textTemplateCharArray[spanCount] = '<span id= "a'+spanCount +'">' + textTemplateCharArray[spanCount] + '</span>';
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
    $('#checkWpm'+ current_user_id).text(wpm);
}


function updateProgressBar(text, template_text, current_user_id){
    debugger;
    console.log("Template text is:"+template_text);
    console.log("Template_text length is"+template_text.length);
    var percentage = 3 + getProgress();
    var progressBarSelector = $("#newBar"+current_user_id);
    var progressBar = $(progressBarSelector);
    var currentCharIndex = template_text.length-1;
    console.log(currentCharIndex);
    // debugger;
    for(var i = 0; i <template_text.length; i++) {
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

function isGameOver(){
    return ($('#text').text()===$('#template_text').val());
}

function handleGameOver(current_user_id, text_id) {
    displayAccuracy(current_user_id);
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

function displayAccuracy(current_user_id) {
    var textCharLen= $('#text').text().length;
    var userKeyPressInputCharLen=userKeyPressCount;
    var accuracy = ( textCharLen/userKeyPressInputCharLen )*100;
    accuracy=Math.round( accuracy );
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
