/* Posted April 4th, 2018 by @semperrabbit */
/*
 * require('util.inject.RoomTracker');
 *
 * Allows for the retrieval of rooms currently being viewed in the client from in-game code.
 *
 * injectRoomTracker() will be called on each global reload. To manually inject into a client after a global reset, or upon opening an additional tab,
 *   call forceInjectRoomTracker().
 *     
 * Use `getViewedRooms()` each tick to retrieve any viewed rooms. It returns an array or rooms.
 */
global.injectRoomTracker = function(){//*
    if(!global.RoomTrackerInjected) {
        global.RoomTrackerInjected = true;
        var output = `<SPAN>Trying to inject RoomTracker code!</SPAN> 
<SCRIPT>
(function(){
    if(window.RoomTrackerHook)return;
    let Api = angular.element($('section.game')).injector().get('Api');  
    let Connection = angular.element($('body')).injector().get('Connection');
    let roomScope = angular.element(document.getElementsByClassName("room ng-scope")).scope();
    Connection.onRoomUpdate(roomScope, function()
    {
		let roomName = roomScope.Room.roomName;
		let tick = roomScope.Room.gameTime;
        Api.post('user/console',{
            /*global.roomsViewed = global.roomsViewed || {}; global.roomsViewed.push({tick: 12345, roomName: 'E1S1'; roomsViewed = _.filter(roomsViewed, (v)=>v.tick>=12345);''*/
              expression: "global.roomsViewed = global.roomsViewed || []; global.roomsViewed.push({tick: "+tick+", roomName: '"+roomName+"'}); global.roomsViewed = _.filter(global.roomsViewed, (v)=>v.tick>="+tick+");''",
              shard: roomScope.Room.shardName,
              hidden: true
        });
    });
    window.RoomTrackerHook = true;
})()
</SCRIPT>`
	    console.log(output.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, ''));
    }
//*/
}

global.forceInjectRoomTracker = ()=>{global.RoomTrackerInjected = false; injectRoomTracker();}

injectRoomTracker();

global.getViewedRooms = function getViewedRooms(){
	global.roomsViewed = global.roomsViewed ? _.filter(global.roomsViewed, (v)=>v.tick>=Game.time-1) : [];
	return roomsViewed = global.roomsViewed.map(v=>v.roomName);
}