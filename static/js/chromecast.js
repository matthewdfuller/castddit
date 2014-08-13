/**
 * global variables
 */
var currentMedia = null;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;

var timer = null;

function initializeCastApi() {
        var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                sessionListener,
                receiverListener);
        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function receiverListener(e) {
        if( e === 'available' ) {
                appendMessage("Chromecast was found on the network.");
                launchApp();
        }
        else {
                appendMessage("There are no Chromecasts available.");
        }
}

function launchApp() {
        appendMessage("Launching the Chromecast App...");
        chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}

function onRequestSessionSuccess(e) {
        appendMessage("Successfully created session: " + e.sessionId);
        session = e;
        session.addUpdateListener(sessionUpdateListener.bind(this));
        
        if (session.media.length != 0) {
                onMediaDiscovered('onRequestSession', session.media[0]);
        }
        
        session.addMediaListener(
        onMediaDiscovered.bind(this, 'addMediaListener'));
        session.addUpdateListener(sessionUpdateListener.bind(this));
        
        // Start the Reddit loop
        loopThroughPics();
}

function sessionListener(e) {
        appendMessage('New session ID:' + e.sessionId);
        session = e;
        
        if (session.media.length != 0) {
                appendMessage(
                        'Found ' + session.media.length + ' existing media sessions.');
                onMediaDiscovered('sessionListener', session.media[0]);
        }
        
        session.addMediaListener(
        onMediaDiscovered.bind(this, 'addMediaListener'));
        //session.addUpdateListener(sessionUpdateListener.bind(this));
        loopThroughPics();
}

function sessionUpdateListener(isAlive) {
        var message = isAlive ? 'Session Updated' : 'Session Removed';
        message += ': ' + session.sessionId;
        appendMessage(message);
        
        if (!isAlive) {
                session = null;
        
                if( timer ) {
                        clearInterval(timer);
                } else {
                        timer = setInterval(updateCurrentTime.bind(this), 1000);
                }
        }
};

function stopApp() {
        session.stop(onStopAppSuccess, onError);
        if( timer ) {
              clearInterval(timer);
        }
}

function loadMedia(mediaURL, type, title, callback) {
  if (!session) {
    appendMessage("no session");
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

  session.loadMedia(request,
    onMediaDiscovered.bind(this, 'loadMedia'),
    onMediaError);

    callback();
}

/**
 * callback on success for loading media
 * @param {Object} e A non-null media object
 */
function onMediaDiscovered(how, media) {
  appendMessage("new media session ID:" + media.mediaSessionId + ' (' + how + ')');
  currentMedia = media;
  currentMedia.addUpdateListener(onMediaStatusUpdate);
  mediaCurrentTime = currentMedia.currentTime;
  if( !timer ) {
    //timer = setInterval(updateCurrentTime.bind(this), 1000);
  }
}


/**
 * callback for media status event
 * @param {Object} e A non-null media object
 */
function onMediaStatusUpdate(isAlive) {
  if( progressFlag ) {
    
  }
}



// ERRORS AND SUCCESS MESSAGES //
function onInitSuccess() {
        appendMessage("init success");
}

function onError() {
        appendMessage("error");
}

function onSuccess(message) {
        appendMessage(message);
}

function onStopAppSuccess() {
        appendMessage('Session stopped');
}

function mediaCommandSuccessCallback(info) {
        appendMessage(info);
}

function onMediaError(e) {
        appendMessage("media error" + e);
}

function onLaunchError() {
        appendMessage("Error connecting to the Chromecast. Select your device from extension popup.");
}

function appendMessage(message) {
        $('#output').append('<p>' + message + '</p>');
        console.log(JSON.stringify(message));
};


