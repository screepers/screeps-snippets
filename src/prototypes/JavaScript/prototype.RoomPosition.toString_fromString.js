/* Posted December 25th, 2016 by @semperrabbit */

// Special thanks to @helam for finding the client selection code
RoomPosition.prototype.toString = function (htmlLink = true, id = undefined, memWatch = undefined) {
    if(htmlLink){
        var onClick = '';
        if(id)       onClick += `angular.element('body').injector().get('RoomViewPendingSelector').set('${id}');`;
        if(memWatch) onClick += `angular.element($('section.memory')).scope().Memory.addWatch('${memWatch}');angular.element($('section.memory')).scope().Memory.selectedObjectWatch='${memWatch}';`
        return `<a href="#!/room/${this.roomName}" onClick="${onClick}">[${ this.roomName } ${ this.x },${ this.y }]</a>`;
    }
    return `[${ this.roomName } ${ this.x },${ this.y }]`;
};

RoomPosition.fromString = function(str, dontThrowError = false){
    let temp = str.split(/[\[\] ,]/);
    if(Game.rooms.sim && temp.length == 7) // sometimes sim's pos.toString() gives wierd
        temp = ['', temp[2], temp[4], temp[5], '']; // stuff like "[room sim pos 25,25]"

    if(dontThrowError){
        if(temp.length !== 5)                                      return ERR_INVALID_ARGS;
        if(!/^(W|E)\d+(N|S)\d+$/.test(temp[1]) && temp[1]!=='sim') return ERR_INVALID_ARGS;
        if(!/^\d+$/.test(temp[2]))                                 return ERR_INVALID_ARGS;
        if(!/^\d+$/.test(temp[3]))                                 return ERR_INVALID_ARGS;
    }

    return new RoomPosition(temp[2], temp[3], temp[1]);
}