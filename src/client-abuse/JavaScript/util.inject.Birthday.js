/* Posted July 5th, 2019 by @semperrabbit */

// v1.4
// special thanks to ags131, Robalian, and QGazQ for the assists
// Author: SemperRabbit
// 20190705

global.injectBirthday = function(){//*
    if(!global.BirthdayInjected) {
        global.BirthdayInjected = true;
        var output = `<SPAN>Trying to inject Birthday code!</SPAN>
<SCRIPT>
if(!window.injectScriptTag) {
	window.injectScriptTag =  function injectScriptTag(name, url){
		if(document.getElementById(name)) return;
		return new Promise(function(good, bad){
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					let src=document.createElement('script');
					src.lang='javascript';
					src.innerHTML=xhr.responseText;
					src.id=name;
					document.head.appendChild(src);
					console.log('resp',xhr.responseText);
					good({status: this.status, responseText: xhr.responseText});
				} else {
					bad({ status: this.status, statusText: xhr.statusText });
				}
			};
			xhr.onerror = function () {
				bad({ status: this.status, statusText: xhr.statusText });
			};
			xhr.send();
		});
	};
};

if(!window.showBirthDate) window.showBirthDate = function(event){
	var formatDate = function formatDate(d){
		return ("0" + d.getUTCHours()).slice(-2)+":"+("0" + d.getUTCMinutes()).slice(-2)+":"+("0" + d.getUTCSeconds()).slice(-2) + " " +
		("0" + (d.getUTCMonth()+1)).slice(-2)+"/"+("0" + d.getUTCDate()).slice(-2)+"/"+d.getUTCFullYear() + " UTC";
	};
	var showBdayInternal = function(){
		let gameEl = angular.element($('section.game'));
		let roomEl = angular.element($('section.room'));
		let $rootScope = gameEl.injector().get('$rootScope');
		let $compile = gameEl.injector().get('$compile');
		let target = $('.object-properties .aside-block-content')[0];
		let elem = $('<div class="ng-binding ng-scope"><label>BirthDate: </label>' + formatDate(new Date(parseInt(roomEl.scope().Room.selectedObject._id.substr(0,8), 16)*1000)) + '</div>');
		$compile(elem)($rootScope);
		if(target.children.length > 1) {
			elem.insertBefore(target.children[2]);
		} else {
			elem.insertBefore(target.children[0].children[2]);
		};
	};

	setTimeout(()=>{
		if(event == 'view' && $('.object-properties .aside-block-content')[0]) {
			showBdayInternal();
		}
	}, 100);
};

if (!document.getElementById("ScreepAdapter") || !window.ScreepAdapter){
	window.injectScriptTag('ScreepAdapter', 'https://raw.githubusercontent.com/Esryok/screeps-browser-ext/master/screeps-browser-core.js').then(()=>{
		if(!angular.element(document.body).scope().viewChangeCallbacks || !_.find(angular.element(document.body).scope().viewChangeCallbacks, o => o==window.showBirthDate))
			ScreepsAdapter.onViewChange(window.showBirthDate);
	});
} else if(window.ScreepsAdapter){
	if(!angular.element(document.body).scope().viewChangeCallbacks || !_.find(angular.element(document.body).scope().viewChangeCallbacks, o => o==window.showBirthDate))
		ScreepsAdapter.onViewChange(window.showBirthDate);
}

</SCRIPT>`
	    console.log(output.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, ''));
    }
//*/
}

global.forceInjectBirthday = ()=>{global.BirthdayInjected = false; injectBirthday();}

injectBirthday();