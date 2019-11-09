console.log(document.body);
console.log("it works");

chrome.storage.sync.set({"message": "what's up"}, function() {
    console.log("saved");
    chrome.runtime.sendMessage({screenshotTaken: "We have taken the screenshot"}, function(response) {
        console.log(response);
    });
});