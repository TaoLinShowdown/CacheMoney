/****************************************************************************************
 * tabDataStore: stores tab's id and the tab's most recent snapshot
 * interval: how often a snapshot is taken in ms
 */
var tabDataStore = {};
var interval = 2000;

/****************************************************************************************
 * Sets a timer to run code every few seconds
 * Queries for active and completely loaded tabs (includes multiple windows)
 * For each tab:
 *      - if the tab does not have an entry on tabDataStore, create one with img: undefined
 *      - take a snapshot of the tab using chrome.tabs.captureVisibleTab()
 *        stores the snapshot in tabDataStore
 */
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

/****************************************************************************************
 * When a tab gains focus, we check if an entry of the tab exists and if there is a previous existing snapshot of the tab
 * We capture the tab as it gains focus, and send a message to screenshot.js with the 2 dataurls 
 */
chrome.tabs.onActivated.addListener(function(activeInfo) {
    var { tabId } = activeInfo;
    // CHECK IF THERE IS ALREADY A SCREENSHOT FOR THAT TAB, IF NOT DO NOTHING
    if(tabDataStore['tab_' + tabId] !== undefined) {
        if(tabDataStore['tab_' + tabId].img !== undefined) {
            chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
                var oldImg = tabDataStore['tab_' + tabId].img;
                var newImg = dataURL;
                if(oldImg !== newImg) {
                    console.log("MAKING COMPARISON...")
                    chrome.tabs.sendMessage(tabId, {message: "RESEMBLE", img1: newImg, img2: oldImg}, function(response) {
                        console.log(response.handshake);
                    });
                }
            })
        }
    }
});

/****************************************************************************************
 * When a tab is removed, remove the entry of the tab from tabDataStore
 */
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    delete tabDataStore['tab_' + tabId];
});

/****************************************************************************************
 * On message received from screenshot.js
 * Request has url to be reported and logged in MongoDB
 * Make HTTP request to send url using XMLHttpRequest()
 */
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

/**************************************************************************************** */