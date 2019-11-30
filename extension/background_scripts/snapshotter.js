var tabDataStore = {};
var interval = 2000;

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

                console.log("WORKING ON COMPARISON...");
                var testcoords = compareImages(oldImg, newImg);
                // var testcoords = [[30, 34], [31, 34], [32, 34], [33, 34], [34, 34], [35, 34], [30, 35]];
                if(testcoords.length > 0){
                    console.log("SENDING MESSAGE...");
                    // TAKE THE ARRAY OF COORDS WHERE WE DETECT CHANGE AND SEND A MESSAGE TO CONTENT SCRIPT TO BUILD AND APPLY OVERLAY TO PAGE
                    chrome.tabs.sendMessage(tabId, {coords: testcoords}, function(response) {
                        console.log("Content script response: ", response.handshake);
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

// RESEMBLE CODE 
var compareImages = (img1, img2) => {
    var image = new Image();
    var image2 = new Image();
    var differentTiles = []
    image2.onload = function() {
        var tiles = splitImage(image)
        var tiles2 = splitImage(image2)
        for (let i = 0; i < tiles.length; i++) {
            var diff = resemble(tiles[i][0])
            .compareTo(tiles2[i][0])
            .ignoreColors()
            .onComplete(function(data) {
                if (data['misMatchPercentage'] > 0) {
                    differentTiles.push([tiles[i][1], tiles[i][2]])
                }
                if (i == tiles.length - 1) {
                    console.log(differentTiles)
                }
            });
        }
    }
    image.src = img1
    image2.src = img2
    return differentTiles
}

var splitImage = (image) => {
    var tiles = []
    for (let i = 0; i < image.width - 17; i += 10) {
            for (let j = 0; j < image.height; j += 10) {
                    var canvas = document.createElement('canvas');
                    canvas.width = 10;
                    canvas.height = 10;
                    var context = canvas.getContext('2d');
                    context.drawImage(image, i, j, 10, 10, 0, 0, canvas.width, canvas.height);
                    tiles.push([canvas.toDataURL(), j/10, i/10]);
            }
    }
    return tiles;
}