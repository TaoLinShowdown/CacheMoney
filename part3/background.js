var xhr;
var temp;
var jsonentry;
var values;
var parsedJSON;
var lastEventTime;

//On installation, mongodb entries are send to chrome.storage

chrome.runtime.onInstalled.addListener(function(){
	xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:3000/url", true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			chrome.storage.sync.set({"dbstorage": xhr.responseText}, function(){
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

chrome.alarms.create("5min", {
	delayInMinutes: 5,
	periodInMinutes:5
});

//Updates chrome.storage with entries from mongodb every 5 minutes

chrome.alarms.onAlarm.addListener(function(alarm){
	if(alarm.name === "5min"){
		xhr = new XMLHttpRequest();
		xhr.open("GET", "http://localhost:3000/url", true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				chrome.storage.sync.set({"dbstorage": xhr.responseText}, function(){
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

//Listener for when page is updated, then grabs URL and compares it to DB

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status == 'complete'){
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs){
			var url = tabs[0].url;
			chrome.storage.sync.get("dbstorage", function(data){
				if(!chrome.runtime.error){
					temp = data.dbstorage;
					if(temp.search(url) > 0){
						alert(url + " was reported as a malicious website.");
					}
				}
			});
		});
	}
});

