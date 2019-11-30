var tabDataStore = {};
var interval = 1000;

// THE MAIN PART WHERE WE TAKE A SNAPSHOT EVERY COUPLE SECONDS AND STORE IT LOCALLY
var t = setInterval(function() {
    chrome.tabs.query({active: true, status: "complete"}, function(tabs) {
        // LOOPING THROUGH EVERY ACTIVE AND COMPLETELY LOADED TAB
        tabs.forEach((tab) => {
            var { id, url } = tab;
            if(/http(s?):*/.test(url)) {

                // IF WE DONT HAVE AN ENTRY OF IT, WE CREATE ONE
                if(tabDataStore['tab_' + id] === undefined) {
                    tabDataStore['tab_' + id] = {
                        img: undefined
                    }
                }
                
                // TAKE A SCREENSHOT AND STORE IT IN THE CORRECT TAB'S ENTRY
                chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
                    tabDataStore['tab_' + id].img = dataURL;
                    console.log("snapshot of tab_" + id);
                    // console.log(tabDataStore);
                });

            }
        });
    });
}, interval);

// WHEN A TAB GAINS FOCUS, A MANUAL SCREENSHOT IS TAKEN AND WE COMPARE IT TO THE CURRENT STORED ONE THROUGH RESEMBLEJS
chrome.tabs.onActivated.addListener(function(activeInfo) {
    var { tabId } = activeInfo;
    // CHECK IF THERE IS ALREADY A SCREENSHOT FOR THAT TAB, IF NOT DO NOTHING
    if(tabDataStore['tab_' + tabId] !== undefined) {
        if(tabDataStore['tab_' + tabId].img !== undefined) {
            chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
                var oldImg = tabDataStore['tab_' + tabId].img;
                var newImg = dataURL;
                if(oldImg !== newImg) {
                    chrome.tabs.sendMessage(tabId, {message: "RESEMBLE", img1: oldImg, img2: newImg}, function(response) {
                        console.log(response.handshake);
                    });
                }
            })
        }
    }
});

// WHEN A TAB IS REMOVED, WE REMOVE IT FROM tabDataStore
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    delete tabDataStore['tab_' + tabId];
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var { url } = request;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://54.234.84.123:3000/url", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200){
            console.log("REPORTED URL:" + url);
        }
    }
    xhr.send("url=" + url);
    sendResponse({response: "HTTP SENT"})
});