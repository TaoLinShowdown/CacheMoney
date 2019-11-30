/**************************************************************************************** */
var xhr;
var temp;
var jsonentry;
var values;
var parsedJSON;
var lastEventTime;
var url = "http://54.234.84.123:3000";

/****************************************************************************************
 * On extension installed, make HTTP request to get list of previously reported URLs from MongoDB
 * Stores list of URLs in chrome.storage.local
 */
chrome.runtime.onInstalled.addListener(function(){
	xhr = new XMLHttpRequest();
	xhr.open("GET", url + "/url", true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			chrome.storage.local.set({"dbstorage": xhr.responseText}, function(){
					if(chrome.runtime.error){
						console.log("Runtime error");
					}
					else{
						console.log("Storage updated.");
					}
				});
		}
	};
	xhr.send();
});

/**************************************************************************************** 
 * Creates a 5 minute alarm that fires 5 minutes from now and in every 5 minutes 
*/
chrome.alarms.create("5min", {
	delayInMinutes: 5,
	periodInMinutes:5
});

/****************************************************************************************
 * On alarm fired, make HTTP request to get update list of previously reported URLs from MongoDB
 * Stores list of URLs in chrome.storage.local
 */
chrome.alarms.onAlarm.addListener(function(alarm){
	if(alarm.name === "5min"){
		xhr = new XMLHttpRequest();
		xhr.open("GET", url + "/url", true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				chrome.storage.local.set({"dbstorage": xhr.responseText}, function(){
					if(chrome.runtime.error){
						console.log("Runtime error");
					}
					else{
						console.log("Storage updated.");
					}
				});
			}
		};
		xhr.send();
	}
});

/****************************************************************************************
 * On tab update, query for active and lastFocusedWindow, grab its URL and compares it to
 * 	list of previously reported URLs in chrome.storage.local
 * If a match is found, we fire an alert to warn users that the current website was previously reported
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status == 'complete'){
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs){
			var url = tabs[0].url;
			chrome.storage.local.get("dbstorage", function(data){
				if(!chrome.runtime.error && data.dbstorage){
					temp = data.dbstorage;
					if(temp.search(url) > 0){
						alert(url + " was reported as a malicious website. Proceed with caution.");
					}
				}
			});
		});
	}
});

/**************************************************************************************** */