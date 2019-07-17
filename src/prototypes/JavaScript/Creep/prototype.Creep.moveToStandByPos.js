/* Posted Jan 8th, 2017 by @semperrabbit*/

/**
 * Move a creep to a stand by location identified via flag or memory location in the room.
 * Returns true if it moved in this command or false if the creep did not move to identify
 *     whether a move may be made elsewhere in the creep's code to prevent double pathfinding
 *     and double intents each tick.
 * Valid flag names are [roomName]_pos_[roleName] and [roomName]_pos_[stateName].
 * Valid memory locations are room.memory.pos[roleName] and room.memory.pos[stateName].
 * Memory locations must be an object in the form of {x, y, roomName}.
 * 
 * @author SemperRabbit
 * @return {boolean}
 */
Creep.prototype.moveToStandByPos = function(){
    var homeRoom = this.memory.homeRoom || this.pos.roomName;
    var roomMem  = Game.rooms[homeRoom].memory;
    var state    = this.memory.state;
    var role     = this.memory.role;
    var pos;//, x, y, roomName;

    if(state !== undefined) {
        if(!pos && Game.flags[homeRoom+'_pos_'+state]){
            pos =  Game.flags[homeRoom+'_pos_'+state].pos;
        }
        if(!pos && roomMem.pos && roomMem.pos[state]) {
            var {x, y, roomName} = roomMem.pos[state];
            pos = new RoomPosition(x, y, roomName);
        }
    }
    if(role !== undefined) {
        if(!pos && Game.flags[homeRoom+'_pos_'+role]){
            pos =  Game.flags[homeRoom+'_pos_'+role].pos;
        }
        if(!pos && roomMem.pos && roomMem.pos[role]) {
            var {x, y, roomName} = roomMem.pos[role];
            pos = new RoomPosition(x, y, roomName);
        }
    }

    if(pos !== undefined) {
        this.moveTo(pos);
        return true;
    } else {
        return false;
    }
}