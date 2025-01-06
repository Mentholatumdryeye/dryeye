let step = 0;

let interval = 10;

let blinkAnimCount;
let blinkAnimImage = new Array(5);

let blinkPrevTime;
let blinkMaxTime;

let oldLeftEye = new Array(2);
let oldRightEye = new Array(2);
let oldNose = new Array(2);

let oldPosition = new Array(71);
let oldTime;
let oldDiff = new Array(71);
let count;
let blinkCount2 = 0;

let startTime;


let videoTrack = null;
let video = null;

let videoCanvas     = null;
let videoCanvasCtx = null;
let clippedCanvas     = null;
let clippedCanvasCtx = null;
let dummyCanvas     = null;
let dummyCanvasCtx = null;

let ctracker = null;

const VIDEO_CONSTRAINTS_FOR_FRONT = {video: {facingMode : {exact : "user"}}};
const VIDEO_CONSTRAINTS_FOR_REAR  = {video: {facingMode : {exact : "environment"}}};

let cameraWidth;
let cameraHeight;
let cameraAspect;

let contentBoxWidth;

let timeBarRate;

let clippedImageWidth;
let clippedImageHeight;

$(document).ready(function(){

  $("#step"+step+"-box").show();

  ctracker = new clm.tracker();

  video    = $('#camera');
  video[0].width  = $(".content-box").width();
  video[0].height = $(".content-box").height();

  videoCanvas     = $('#fromVideo')[0];
  videoCanvasCtx = videoCanvas.getContext('2d');

  const paddingTop = parseInt($('.content-box').css('padding-top'), 10);
  const paddingBottom = parseInt($('.content-box').css('padding-bottom'), 10);
  const paddingLeft = parseInt($('.content-box').css('padding-top'), 10);
  const paddingRight = parseInt($('.content-box').css('padding-bottom'), 10);

  contentBoxWidth = $(".content-box").width();
  videoCanvas.width   = $(".content-box").width();
  videoCanvas.height  = $(".content-box").height();

  clippedCanvas = $('#clipped')[0];
  clippedCanvasCtx = clippedCanvas.getContext('2d');

  clippedCanvas.width   = parseInt($('#clipped').css('width'), 10);
  clippedCanvas.height  = parseInt($('#clipped').css('height'), 10);

  clippedImageWidth = $('.clipped-image-area').width();
  clippedImageHeight = $('.clipped-image-area').height();

  blinkAnimCount = 0;
  blinkAnimImage[0] = new Image();
  blinkAnimImage[0].src = "./images/blink/star0.png";
  blinkAnimImage[1] = new Image();
  blinkAnimImage[1].src = "./images/blink/star1.png";
  blinkAnimImage[2] = new Image();
  blinkAnimImage[2].src = "./images/blink/star2.png";
  blinkAnimImage[3] = new Image();
  blinkAnimImage[3].src = "./images/blink/star3.png";
  blinkAnimImage[4] = new Image();
  blinkAnimImage[4].src = "./images/blink/star4.png";

  timeBarRate = $('.time-bar-back').width() / 1000;

  swithScaleX();

  navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS_FOR_FRONT)
  .then(callBackLoadSuccess)
  .catch(callBackLoadError);

  video.on('playing', function() {
    adjustProportions();
    initCtracker();
    drawLoop();
  });

	$('body').on('click', '.retry-button' , function() {
    window.scrollTo(0, 0);
    
    $('.result-box').hide();
    $("#step-result-box").css("display", "none");
    
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

  // click next button
	$('body').on('click', '.next-button' , function() {
    if ($(this).hasClass("active"))
    {
      window.scrollTo(0, 0);
      
      $("#step"+step+"-box").hide();
      step ++;

      switch (step)
      {
        case 1:
          adjustScreens();
          $("#step"+step+"-box").show();
          break;

        // 準備開始
        case 2: 
          prepareBlinkCheck();
          $("#step"+step+"-box").show();
          break;

        // 結果表示
        case 5:
          if ($(this).hasClass("retry"))
          {
            step = 2;
            prepareBlinkCheck();
          } else if($(this).hasClass("result")) {
    
            if (blinkMaxTime == 0) {
              blinkMaxTime = 10000;
            }
            const resultTime = Math.floor(blinkMaxTime/1000);
            const left = $('.time-circle').width() / 2;

            $('#time-point').text(resultTime);
            $('#time-circle').css('left',((blinkMaxTime*timeBarRate)/10-left)+"px");
            $('#time-circle').show();
            $('#time-bar-result').css('width',(blinkMaxTime*timeBarRate)/10+"px");

            $("#step2-box").hide();
            $("#step-result-box").css("display", "flex");

            $(".result0-box").hide();
            if (blinkMaxTime >= 10000) {
              $("#result0-box").css("display", "flex");
            } else if (blinkMaxTime >= 5000) {
              $("#result1-box").css("display", "flex");
            } else {
              $("#result2-box").css("display", "flex");
            }
          }
          break;

        default:
          $("#step"+step+"-box").show();
          break;
      }
    }
	});
});

function callLoadSuccess(stream)
{
  $('#start-button').addClass("active");

  videoTrack = stream.getVideoTracks()[0];
  if (isiPhone()) {
    cameraWidth = parseInt(videoTrack.getSettings().height);
    cameraHeight = parseInt(videoTrack.getSettings().width);
  } else {
    cameraWidth = parseInt(videoTrack.getSettings().width);
    cameraHeight = parseInt(videoTrack.getSettings().height);
  }
  cameraAspect = cameraHeight / cameraWidth;

  // カメラ映像の比率にあわせて描画サイズを調整(横基準)
  videoCanvas.height   = videoCanvas.width * cameraAspect;

  video[0].srcObject = stream;

  // autoplayが聞かない場合があるのでここで再生
  document.querySelector('video').play();
}

function callLoadError(err) {
  alert(err);
}

function swithScaleX() {
  videoCanvas.style.transform  = `scaleX(${-1})`;
  clippedCanvas.style.transform = `scaleX(${-1})`;
}

function drawLoop() {
  requestAnimationFrame(drawLoop);

  videoCanvasCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoCanvasCtx.drawImage(video[0], 0, 0, videoCanvas.width, videoCanvas.height);

  positions = ctracker.getCurrentPosition();

  if(positions)
  {
    var leftEye = positions[27];
    var rightEye = positions[32];
    var nose = positions[37];

    var dxLE = leftEye[0] - oldLeftEye[0];
    var dyLE = leftEye[1] - oldLeftEye[1];
    var dLE = Math.sqrt(dxLE*dxLE+dyLE*dyLE);

    var dxRE = rightEye[0] - oldRightEye[0];
    var dyRE = rightEye[1] - oldRightEye[1];
    var dRE = Math.sqrt(dxRE*dxRE+dyRE*dyRE);

    var dxN = nose[0] - oldNose[0];
    var dyN = nose[1] - oldNose[1];
    var dN = Math.sqrt(dxN*dxN+dyN*dyN);

    oldPosition = positions;

    oldLeftEye[0] = leftEye[0];
    oldLeftEye[1] = leftEye[1];
    oldRightEye[0] = rightEye[0];
    oldRightEye[1] = rightEye[1];
    oldNose[0] = nose[0];
    oldNose[1] = nose[1];

    clipReadyEyes(positions)

    ctracker.draw(videoCanvas);

    var nose2 = positions[33];
    var nose3 = positions[62];
    var rad = Math.atan2(nose2[1] - nose3[1], nose2[0] - nose3[0]);
    var deg = Math.abs(rad * (180/Math.PI));
  } else {
    clippedCanvasCtx.fillStyle = `rgb(0,0,0)`;
    clippedCanvasCtx.fillRect(0,0,clippedImageWidth,clippedImageHeight);
  }


  switch (step) 
  {
    // 準備中
    case 2:
      let readyDate = new Date();
      let readyTime = readyDate.getTime();
      let readyCount = 3000 - (readyTime - startTime);
      
      let viewTime = Math.ceil(readyCount/1000);
      if (viewTime > 0)
      {
        $('#ready-num-text').text(viewTime);
      } else {
        $('#ready-text-box').hide();
        startTime = readyDate.getTime();
        blinkPrevTime = readyDate.getTime();
        step ++;
      }
      break;

    // 判定中
    case 3:
      let blinkDate = new Date();
      let blinkTime = blinkDate.getTime();
      let blinkCount = blinkTime - startTime;
      blinkCount = blinkCount/10;

      checkBlink(dyLE, dLE, dN, blinkTime);

      if (blinkCount < 1000)
      {
        $('#time-bar-front').css('width',(blinkCount*timeBarRate)+"px");
      } else {
        blinkCount = 1000;
        $('#time-bar-front').css('width',(blinkCount*timeBarRate)+"px");

        setMaxTime(blinkTime);
        
        $('#step3-next-buttons').show();
        step ++;
      }
      break;
  }
}

function adjustScreens()
{
  // 表示領域の大きさ調整
  $('#fromVideo').css("width",videoCanvas.width + "px");
  $('#fromVideo').css("height",videoCanvas.height + "px");
  $('.content-prepare-box').css("min-height",videoCanvas.height + "px");

  // 表示領域の位置調整
  const left = (contentBoxWidth-videoCanvas.width)/2;
  $('#fromVideo').css("left",left + "px");

  $('.image-face-frame').css("height",videoCanvas.height + "px");
  const frameWidth = 4200/2280 * videoCanvas.height;
  const frameLeft = (contentBoxWidth - frameWidth)/2;
  console.log(frameLeft);
  $('#image-face-frame').css("left",frameLeft + "px");
}

function adjustProportions(1) {
  video[0].width = videoCanvas.width;
  video[0].height = videoCanvas.height;
}

function initCtracker(1) {
  ctracker.init();
  ctracker.start(video[0]);
}

function clipReadyEyes(pos)
{   
    let left = pos[27];
    let right = pos[32];

    let distance = right[0]-left[0];
    let marginLeft = distance/2;
    let rate = clippedImageHeight/clippedImageWidth;
    let marginTop = (distance*2*rate)/2;

    const x = left[0]-marginLeft;
    const y = left[1]-marginTop;
    const w = distance*2;
    const h = marginTop*2;

    clippedCanvasCtx.clearRect(0,0,clippedImageWidth,clippedImageHeight);
    clippedCanvasCtx.drawImage(videoCanvas, x, y, w, h, 0,0,clippedImageWidth,clippedImageHeight);
    
    if (blinkAnimCount > 0)
    {       
        let anim1 = 10 - blinkAnimCount;
        let anim2 = Math.floor(anim1 /2);

        clippedCanvasCtx.drawImage(blinkAnimImage[anim2], 0, 0, clippedImageWidth,clippedImageHeight);
        blinkAnimCount --;
    }
}

function prepareBlinkCheck()
{
  blinkAnimCount = 0;
  blinkMaxTime = 0;
  
  let date = new Date();
  startTime = date.getTime();

  $('#step3-next-buttons').hide();
  $('#time-circle').hide();
  $('#ready-text-box').show();
  $('#ready-num-text').text("3");
  $('#time-bar-front').css('width',"0px");
}

function checkBlink(dyLEL, dLE, dN, blinkTime)
{

  // まばたき判定
  let blink = false;
  if (interval < 0)
  {
    if (dyLE > 0.8)
    {
      if (dLE - dN > 0.8)
      {
          blink = true;
          interval = 10;
      }
    }
  }

  interval --;

      // まばたきを検知
  if (blink)
  {
    blinkAnimCount = 10;
    setMaxTime(blinkTime)
  }
}

function setMaxTime(blinkTime)
{
  // ガマンできた時間を取得
  let patienceTime = blinkTime - blinkPrevTime;

  // 前回よりガマンした時間が長ければ更新
  if (patienceTime > blinkMaxTime)
  {
      blinkMaxTime = patienceTime;
  }
  // まばたき時間を更新
  blinkPrevTime = blinkTime;
}


function isiPhone()
{
	const ua = navigator.userAgent;
	if (ua.indexOf('iPhone') > 0){
		return true;
	}
}