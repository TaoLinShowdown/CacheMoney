var tabDataStore = {};

// WHEN A TAB IS REMOVED, WE REMOVE IT FROM tabDataStore
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    delete tabDataStore['tab_' + tabId];
    // console.table(tabDataStore);
});

// WHEN A TAB GAINS FOCUS, A MANUAL SCREENSHOT IS TAKEN
// chrome.tabs.onActivated.addListener(function(activeInfo) {
//     if(tabDataStore['tab_' + activeInfo.tabId].img !== undefined) {
//         chrome.tabs.captureVisibleTab(null, {}, function(dataURL) {
//             tabDataStore['tab_' + activeInfo.tabId].newImg = dataURL;
//             // console.table(tabDataStore);
//         });
//     }
// });

var t = setInterval(function() {
    chrome.tabs.query({active: true, status: "complete"}, function(tabs) {
        // LOOPING THROUGH EVERY ACTIVE AND COMPLETELY LOADED TAB
        tabs.forEach((tab) => {
            var { id, url } = tab;
            // console.table(tab, ['url'])
            // console.log(/^http(s?)/.test(url));
            if(/http(s?):*/.test(url)) {
                // console.log(id, url);

                // IF WE DONT HAVE AN ENTRY OF IT, WE CREATE ONE
                if(tabDataStore['tab_' + id] === undefined) {
                    tabDataStore['tab_' + id] = {
                        img: undefined
                    }
                    // console.log("made entry of tab " + id);
                    // console.table(tabDataStore);
                }
                
                // TAKE A SCREENSHOT AND STORE IT IN THE CORRECT TAB'S ENTRY
                chrome.tabs.captureVisibleTab(null, {}, function(dataURL) {
                    tabDataStore['tab_' + id].img = dataURL;
                    console.log("snapshot of tab_" + id);
                    console.table(tabDataStore);
                });

            }
        });
    });
}, 1000);