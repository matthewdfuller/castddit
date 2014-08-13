$('#reddit-start-button').click(function(){
    // Get the subreddit from the textbox
    var subreddit = $('#subreddit').val();
    
    // Send user to the right page
    window.location.replace('/r/' + subreddit);
    
});