/* Posted December 3rd, 2018 by @semperrabbit*/

// Note: excessive use of client's API connection may cause devs to lock it down
global.injectRoomViewNotifier = function(){//* remove one / before this comment if things break...
    if(!global.RoomViewNotifierInjected) {
        global.RoomViewNotifierInjected = true;
        var output = `<SPAN>Trying to inject RoomViewNotifier code!</SPAN>
<SCRIPT>
if(!window.viewNotifierInstalled) {
	window.viewNotifierInstalled = true;
	window.addEventListener("hashchange", function(){
		const [,page,shardName,roomName] = window.location.hash.split('/')
		if(page == "room") { /* ensure we are in room view... */
			if(window.viewNotifierShardName !== shardName || window.viewNotifierRoomName !== roomName) {
				
				console.log("Pushing data from viewNotifier: shard: " + shardName + " roomName: " + roomName);
				window.viewNotifierShardName = shardName;
				window.viewNotifierRoomName  = roomName;
				angular.element($('body')).injector().get('Connection').sendConsoleCommand(
					"Memory.roomViews = Memory.roomViews || []; Memory.roomViews.push({shard: '" + shardName + "', room: '" + roomName + "'})");
			}
		} else {
			console.log("not in room view");
		}
	}, false);
}
</SCRIPT>`
	    console.log(output.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, ''));
    }
//*/
}

global.forceInjectRoomViewNotifier = ()=>{global.RoomViewNotifierInjected = false; injectRoomViewNotifier();}

injectRoomViewNotifier();