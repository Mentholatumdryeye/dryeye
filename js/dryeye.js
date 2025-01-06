let step = 0;

$(document).ready(function(){

  $("#step"+step+"-box").show();

  // click next button
	$('body').on('click', '.next-button' , function() {
    if ($(this).hasClass("active"))
    {
      window.scrollTo(0, 0);
      $("#step"+step+"-box").hide();
      step ++;
      
      if (step == 4)
      {
        drawScoreBar(calcValue());
        $("#step"+step+"-box").show();
      } else if (step >=5)
      {
        
      } else {
        $("#step"+step+"-box").show();
      }
    }
	});
  
	$('body').on('click', '.back-button' , function() {
    window.scrollTo(0, 0);
    $("#step"+step+"-box").hide();
    step --;
    $("#step"+step+"-box").show();
  });
  
	$('body').on('click', '.retry-button' , function() {
    window.scrollTo(0, 0);
    for (let i=0; i<12; i++)
    {
      $('input[name="question'+i+'"]').prop("checked", false);
    }
    $('#step1-button').removeClass("active");
    $('#step2-button').removeClass("active");
    $('#step3-button').removeClass("active");
    $('.result-box').hide();

    $("#step"+step+"-box").hide();
    step = 0;
    $("#step"+step+"-box").show();
  });
  
	$('body').on('click', '.buy-button' , function() {
    window.open(url_buy, '_blank');
  });
  
	$('body').on('click', '.findoutmore-button' , function() {
    window.location.href = url_findMore;
  });

  $('input').change(function () {
    if (checkValue(step)) {
      $('#step'+step+'-button').addClass("active");
    } else {
      $('#step'+step+'-button').removeClass("active");
    }
  });
});

function checkValue1(step)
{
  let result = true;

  if (step == 1)
  {
    for(let i=0; i<=4; i++)  
    {
      if (!$('input[name="question'+i+'"]:checked').val())
      {
        result = false;
      }
    }
  }
  else if (step == 2)
  {
    for(let i=5; i<=8; i++)  
    {
      if (!$('input[name="question'+i+'"]:checked').val())
      {
        result = false;
      }
    }
  }
  else if (step == 3)
  {
    for(let i=9; i<=11; i++)  
    {
      if (!$('input[name="question'+i+'"]:checked').val())
      {
        result = false;
      }
    }
  }

  return result;
}


function calcValue1()
{
  let result = 0;
  for (let i=0; i<12; i++)
  {
    result += parseInt($('input[name="question'+i+'"]:checked').val());
  }

  result *= 25;
  result /= 12;

  return result;
}

function drawScoreBars (score)
{
  score = Math.round(score);

  if (score <= 12){
    $('#result0-box').css("display", "flex");
  } else if (score <= 22){
    $('#result1-box').css("display", "flex");
  } else if (score <= 32){
    $('#result2-box').css("display", "flex");
  } else {
    $('#result3-box').css("display", "flex");
  }

  let rate = $('.score-bar-back').width() / 100;
  let left = $('.score-circle').width() / 2;
  
  $('#score-point').text(score);

  $('#score-circle').css('left',((score*rate)-left)+"px");

  $('#score-bar-front').css('width',(score*rate)+"px");
}