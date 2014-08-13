var pics = [];
var i = 0;
var stopCastingButton = $('#stop-casting-button');
var session = null;
var LOOPTIMEOUT = 5000;

$( document ).ready(function(){
    getRedditUrls(null, function(){
        // Launch the casting
        attemptToLoadCastSdk();
    });
    $("#incdec input").val(LOOPTIMEOUT / 1000);
});

function attemptToLoadCastSdk() {
    var loadCastInterval = setInterval(function(){
        if (!chrome.cast || !chrome.cast.isAvailable) {
            //appendMessage('Cast SDK not yet available, loading in one second.');
        } else if (chrome.cast.isAvailable) {
            initializeCastApi();
            //appendMessage('Loading Cast SDK.');
            clearInterval(loadCastInterval);
        }
    }, 500);
}

function loopThroughPics() {
    setTimeout(function() {
        var url = pics[i]['url'];
        var type = pics[i]['type'];
        var title = pics[i]['title'];
        
        loadMedia(url, type, title, function() {
            i++;
        
            if (i < pics.length) {
                loopThroughPics();
            } else if (i === pics.length) {
                // Get more Reddit URLs
                // Find the last ID
                var startFrom = pics[i - 1]['id'];
                getRedditUrls(startFrom, function(){
                    //console.log(pics);
                    i = 0;
                    loopThroughPics();
                });
                return;
            }
        });;
    }, LOOPTIMEOUT);
}

function getRedditUrls(startFrom, callback) {
    // Reset pics
    pics = [];
    
    // Get the subreddit from the textbox
    var subreddit = $('#subreddit-val').text();
    
    // Display a loading icon
    if (!startFrom) {
        appendMessage('Loading image URLs from subreddit...');
    }
    
    var parser = document.createElement('a');
    parser.href = window.location;
    var path = parser.pathname;
    var search = parser.search;
    
    if (startFrom && search.length > 0) {
        // startFrom and search provided
        var url = 'http://www.reddit.com' + path + '/.json' + search + '&after=' + startFrom + '&jsonp=?';
    } else if (startFrom && search.length === 0) {
        // startFrom and no search
        var url = 'http://www.reddit.com' + path + '/.json?after=' + startFrom + '&jsonp=?';
    } else if (!startFrom && search.length > 0) {
        // no startFrom but search
        var url = 'http://www.reddit.com' + path + '/.json' + search + '&jsonp=?';
    } else if (!startFrom && search.length === 0) {
        var url = 'http://www.reddit.com' + path + '/.json?jsonp=?';
    }
    
    //alert(url);

    $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json',
        dataType: 'json',
        jsonp: 'jsonp',
        success: function(data) {
            //console.log(data.data.children);
            
            if (!data.data.children) {
                appendMessage('Invalid Reddit response.');
                return;
            }
            
            if (!startFrom) {
                appendMessage('Success!');
            }
            
            $.each(data.data.children, function(i,item){
                var url = item.data.url;
                var title = item.data.title;
                var id = item.data.name;
                
                if (url.substring(url.length - 4) == '.jpg') {
                    var imgobj = {};
                    imgobj.url = url;
                    imgobj.title = title;
                    imgobj.id = id;
                    imgobj.type = 'image/jpg';
                    pics.push(imgobj);
                } else if (url.substring(url.length - 4) == '.png') {
                    var imgobj = {};
                    imgobj.url = url;
                    imgobj.title = title;
                    imgobj.id = id;
                    imgobj.type = 'image/png';
                    pics.push(imgobj);
                } else if (url.substring(url.length - 4) == '.gif') {
                    var imgobj = {};
                    imgobj.url = url;
                    imgobj.title = title;
                    imgobj.id = id;
                    imgobj.type = 'image/gif';
                    pics.push(imgobj);
                } else if (url.substring(url.length - 4) == '.jpeg') {
                    var imgobj = {};
                    imgobj.url = url;
                    imgobj.title = title;
                    imgobj.id = id;
                    imgobj.type = 'image/jpg';
                    pics.push(imgobj);
                }
            });
            
            callback();
        }
    });
}

stopCastingButton.click(function(){
    i = 1000000;
    stopApp();
});


// CHROMECAST //


function initializeCastApi() {
        var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                sessionListener,
                receiverListener);
        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function sessionListener(e) {
        //appendMessage('New session ID:' + e.sessionId);
        session = e;
        
        if (session.media.length != 0) {
                console.log('Found ' + session.media.length + ' existing media sessions.');
        }
        
        loopThroughPics();
}

function receiverListener(e) {
        if( e === 'available' ) {
                //appendMessage("Chromecast was found on the network.");
                launchApp();
        }
        else {
                appendMessage("There are no Chromecasts available.");
        }
}

function launchApp() {
        if (!session) {
            appendMessage("Launching the Chromecast App...");
            chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
        }
}

function onRequestSessionSuccess(e) {
        appendMessage('Success!');
        //appendMessage("Successfully created session: " + e.sessionId);
        session = e;
        
        // Start the Reddit loop
        loopThroughPics();
}

function stopApp() {
        session.stop(onStopAppSuccess, onError);
}

function loadMedia(mediaURL, type, title, callback) {
  if (!session) {
    //appendMessage("no session");
    return;
  }

  var mediaInfo = new chrome.cast.media.MediaInfo(mediaURL);
  
  mediaInfo.metadata = new chrome.cast.media.PhotoMediaMetadata();
  mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.PHOTO;
  mediaInfo.contentType = type;
  mediaInfo.metadata.subtitle = title;
  
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = true;
  request.currentTime = 0;

  session.loadMedia(request, onLoadSuccess, onLoadError);
  changeTitle(title);
  setTimeout(callback(), 1000);
}

function onLoadSuccess() {
        //console.log('Successfully loaded image.');
}

function onLoadError() {
        console.log('Failed to load image.');
}

// ERRORS AND SUCCESS MESSAGES //
function onInitSuccess() {
        //appendMessage("Initialized Chromecast.");
}

function onError() {
        //appendMessage("error");
}

function onSuccess(message) {
        //appendMessage(message);
}

function onStopAppSuccess() {
        //appendMessage('Session stopped');
}

function mediaCommandSuccessCallback(info) {
        //appendMessage(info);
}

function onMediaError(e) {
        //appendMessage("media error" + JSON.stringify(e));
}

function onLaunchError() {
    if (!session) {
        appendMessage("Error connecting to the Chromecast. Select your device from extension popup.");
    }
}

function appendMessage(message) {
        $('#output').append('<p>' + message + '</p>');
        console.log(JSON.stringify(message));
};

function changeTitle(title) {
    $('#nowplaying').text(title);
}

$("#up").on('click',function(){
    if (parseInt($("#incdec input").val()) < 100) {
        var newval = parseInt($("#incdec input").val())+1;
        $("#incdec input").val(newval);
        LOOPTIMEOUT = newval * 1000;
    }
});

$("#down").on('click',function(){
    if (parseInt($("#incdec input").val()) > 2) {
        var newval = parseInt($("#incdec input").val())-1;
        $("#incdec input").val(newval);
        LOOPTIMEOUT = newval * 1000;
    }
});

$('#incdec input').change(function(){
    if (parseInt($("#incdec input").val()) > 100) {
        $("#incdec input").val(10);
        LOOPTIMEOUT = 100 * 1000;
    } else if (parseInt($("#incdec input").val()) < 2) {
        $("#incdec input").val(2);
        LOOPTIMEOUT = 2 * 1000;
    }
});