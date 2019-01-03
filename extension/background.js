//callback returns tabId, changeInfo, and tab object
var list = [];
var currentVideoId = 0;
var lastRequest = -1;
var firstRequest = true;
var idLength = 11;
var usertoken;
var onlyMusic;
// var nodeURL = "http://localhost:5000/"
var nodeURL = "https://youtubediscordextension.herokuapp.com/";
//send ajax request for encryption in background page
chrome.runtime.onStartup.addListener(function () {
	initValues();
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	$.ajax({
		type: "POST",
		url: nodeURL + "token",
		contentType: "application/json",
		data: JSON.stringify(request),
		dataType: "json",
		success: function (res, status, xhr) {
			console.log(xhr);
			console.log("success");
			var response = res.response;
			setValues(response, request);
		},
		error: function (xhr, status, error) {
			console.log("error");
		}
	})
});
chrome.webNavigation.onCompleted.addListener(function (details) {
	console.log("webnavigation");
	console.log(details.url);
	if (details.url.includes("youtube.com/watch")) {
		console.log("is Youtube");
		checkTiming(details);
	}
})
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
	console.log("historystateupdated");
	console.log(details.url);
	if (details.url.includes("youtube.com/watch")) {
		console.log("is youtube");
		checkTiming(details);

	}
})

function initValues() {
	chrome.storage.local.get('token', function (result) {
		usertoken = result.token;
		console.log(usertoken);
	})
	chrome.storage.local.get('option', function (result) {
		onlyMusic = result.option;
		console.log(onlyMusic);
	})
}

function setValues(res, req) {
	var token = res;
	var option = req.o;
	console.log(token);
	console.log(option);
	chrome.storage.local.set({
		'token': token
	}, function () {
		console.log("set token to " + token);
		usertoken = token;
	});
	chrome.storage.local.set({
		'option': option
	}, function () {
		console.log("set music option to " + option);
		onlyMusic = option;
	})
	chrome.storage.local.get('token', function (result) {
		console.log("current value is " + result.token);
	});

	console.log("saved to storage");
}

function process(details) {
	console.log(details.url);
	if (list.length > 0) {
		if (list.includes(details.tabId)) {
			if (details.url.includes("youtube.com/watch")) {
				console.log("calling setPresence")
				setPresence()
			} else {
				list.splice(list.indexOf(details.tabId));
				console.log("calling setPresence")
				setPresence();
			}
		} else {
			if (details.url.includes("youtube.com/watch")) {
				list.push(details.tabId);
				console.log("calling setPresence")
				setPresence();
			}
		}
	} else {
		if (details.url.includes("youtube.com/watch")) {
			list.push(details.tabId);
			console.log("calling setPresence")
			setPresence();
		}
	}

}
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	console.log("removed");
	if (list.includes(tabId)) {
		list.splice(list.indexOf(tabId));
		console.log("calling setPresence")
		setPresence();
	}
})
chrome.tabs.onCreated.addListener(function (tab) {
	console.log("created");
	console.log(tab.url);
	if (tab.url.includes("youtube.com/watch")) {
		if (!list.contains(tab.id)) {
			list.push(tab.id);
			console.log("calling setPresence")
			setPresence();
		}
	}
})

function checkTiming(details) {
	console.log('checking timing');
	if (firstRequest) {
		lastRequest = Date.now();
		firstRequest = false;
		process(details)
	} else {
		console.log("checking interval");
		var interval = Date.now() - lastRequest;
		if (interval >= 10000) {
			lastRequest = Date.now();
			process(details);
		} else {
			setTimeout(function () {
				console.log("interval waited");
				lastRequest = Date.now();
				process(details);
			}, interval);
		}
	}
}

function setPresence() {
	console.log(usertoken);
	if (usertoken == undefined) {
		initValues();
		sendRequest();
	} else {
		sendRequest();
	}
}

function sendRequest() {
	console.log("sending request");
	console.log(list.length);
	if (list.length > 0) {
		chrome.tabs.get(list[0], function (tab) {
			var data = {};
			var URL = tab.url;
			data.videoID = URL.substring(32, 32 + idLength);
			data.token = usertoken;
			data.option = onlyMusic;
			if (usertoken == undefined) {
				alert("you need to enter a usertoken to have youtube status in discord")
			}
			console.log(tab.title);
			console.log(data.videoID);
			data.title = tab.title;
			currentVideoId = data.videoID;
			$.ajax({
				type: "POST",
				url: nodeURL + "status",
				contentType: 'application/json',
				data: JSON.stringify(data),
				dataType: "json",
				success: function (res, status, xhr) {
					console.log(xhr);
					console.log("success");
					var response = res.response;
					setValues(response, request);
				},
				error: function (xhr, status, error) {
					console.log(error);
					console.log("error");
				}
			})

		})
	}
}