var globSession;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('sessionselect.html', {
    singleton: true,
    id: "StudioBridge-Listener",
    bounds: {
     'width': 667,
     'height': 295
    }
    //frame: none
  });
});
