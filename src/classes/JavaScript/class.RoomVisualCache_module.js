/* Posted April 2nd, 2017 by @semperrabbit*/
/*
 * require('class.RoomVisualCache');
 *
 * Include this module *after* you defined your custom RoomVisual prototypes.
 * Caching changes RoomObjects to RoomPositions automatically. On commit(),
 *   your custom prototypes may break if they do not expect RoomPositions.
 *
 * Example:
var rvc = new RoomVisualCache(Game.rooms[roomName].visual);
rvc.loadString(Memory.rooms[roomName].visCache);

rvc.text(10, 10, "this is addition to anything saved"); // stores the text command and parameters to its cache
rvc.commit(); // displays visual from cached data

Memory.rooms[roomName].visCache = rvc.saveString(); // saves any changes back to memory

 */

// Used with JSON.parse to ensure any RoomPosition gets properly initialized as
//    a RoomObject, not a raw object
global.ROOM_OBJECT_REVIVER = function(name, val) {
    if( typeof val == 'object' && val.x !== undefined  &&
        val.y !== undefined && val.roomName !== undefined) {
        return new RoomPosition(val.x, val.y, val.roomName);
    }
    return val;
}

var RoomVisualCache = function(rv) {
    this.visual = rv;
    this.cache = [];
}

RoomVisualCache.prototype.register = function(func, ...args){
    var name = func.name || func; // allow for passing a function object or name
    this.cache.push({name, args});
}

RoomVisualCache.prototype.saveString = function() {
    return JSON.stringify(this.cache);
}

RoomVisualCache.prototype.loadString = function(str) {
    if(!str) {
        this.cache = [];
        return;
    }
    this.cache = JSON.parse(str, ROOM_OBJECT_REVIVER);
}

RoomVisualCache.prototype.commit = function() {
    var i;
    for(i in this.cache) {
        var {name, args} = this.cache[i];
        RoomVisual.prototype[name].apply(this.visual, args);
    }
}

RoomVisualCache.prototype.getSize = function() {
    return this.rv.getSize();
}

RoomVisualCache.prototype.clear = function() {
    this.cache = [];
    this.rv.clear();
}

RoomVisualCache.registerPrototype = function() {
    var excludes = ['constructor', 'getSize', 'clear'];
    var funcList = _.filter(Object.keys(RoomVisual.prototype), f=>excludes.indexOf(f) === -1);
    for(let funcName of funcList) {
        RoomVisualCache.prototype[funcName] = function(...args) {
            var i, test, callArgs = [];
            for(i in args) { // change all RoomObjects into their corresponding RoomPositions
                test = args[i];
                if(test.pos) { callArgs.push(test.pos);
                } else {       callArgs.push(test);
                }
            }
            RoomVisualCache.prototype.register.apply(this, [funcName].concat(callArgs));
        }
    }
}
RoomVisualCache.registerPrototype();


RoomVisualCache.test = function(roomName){
    var rv = Game.rooms[roomName] ? Game.rooms[roomName].visual : undefined;
    var rvc = new RoomVisualCache(rv);
    var rvc2 = new RoomVisualCache(rv);
    rvc2.text(('CPU: '+Game.cpu.getUsed()), _.sample(Game.creeps));
    rvc2.text('Total Creeps: ' + Object.keys(Game.creeps).length, 10, 2);

    rvc.loadString(Memory.testRoomVisualCache || rvc2.saveString());
    rvc.circle(25, 25, {radius: 5});
    rvc.commit();

    Memory.testRoomVisualCache = rvc2.saveString();

}

module.exports = global.RoomVisualCache = RoomVisualCache;