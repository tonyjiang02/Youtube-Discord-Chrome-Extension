
document.addEventListener('DOMContentLoaded',function() {
	var button = document.getElementById('btn');
	button.addEventListener('click', function() {
		processData();
	})
})
function processData() {
	console.log("processing data");
	var onlyMusic;
	var token = document.getElementById('discord-token');
	var checkboxes = document.getElementsByClassName('selector-checkbox');
	if(checkboxes[0].checked==checkboxes[1].checked||token.value=='') {
		document.getElementById('error').textContent = "invalid input";
	}else{
		if(checkboxes[0].checked) {
			onlyMusic=true;
		}if(checkboxes[1].checked) {
			onlyMusic=false;
		}
		var sendData = {
			t: token.value,
			o:onlyMusic
		}
		chrome.runtime.sendMessage(sendData);
		console.log("sent to background page");
		console.log(token.value);
		// var xhr = new XMLHttpRequest();
		// xhr.onreadystatechange = function() {
		// 	if(this.readyState ==4 && this.status ==200) {
		// 		console.log("success");
		// 		var response = responseText;
		// 		console.log(response);
		// 		var key = 'discord-token';
		// 		chrome.storage.local.set({key:response}, function() {
		// 			console.log("set token to " + response);
		// 		})
		// 		chrome.storage.local.get(key, function(result) {
		// 			console.log(JSON.stringify(result));
		// 		})
		// 	}else {
		// 		console.log(this.statusText);
		// 	}
		// }
		// xhr.open('POST', 'http://localhost:3000/token', true);
		// xhr.setRequestHeader('Content-type', 'application/json');
		// xhr.send(JSON.stringify(sendToken));
	}
}