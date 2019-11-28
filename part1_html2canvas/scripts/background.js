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
                    // SCROLL BAR IS 17px
                    tabDataStore['tab_' + id].img = dataURL;
                    console.log("snapshot of tab_" + id);
                    console.table(tabDataStore);
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
                // THIS IS WHERE RESEMBLE COMES IN AND COMPARES THE OLD SCREENSHOT WITH THIS NEW ONE


                // TAKE THE ARRAY OF COORDS WHERE WE DETECT CHANGE AND SEND A MESSAGE TO CONTENT SCRIPT TO BUILD AND APPLY OVERLAY TO PAGE
                console.log("sending message to content script from " + tabId);
                var testcoords = [ [5, 3], [5, 4], [5, 5],
                                    [6, 3], [6, 4], [6, 5],
                                    [7, 3], [7, 4], [7, 5] ];
                chrome.tabs.sendMessage(tabId, {coords: testcoords}, function(response) {
                    console.log("Content script response: ", response.handshake);
                });

            })
        }
    }
});

// WHEN A TAB IS REMOVED, WE REMOVE IT FROM tabDataStore
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    delete tabDataStore['tab_' + tabId];
});