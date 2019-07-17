/* Posted Jan 14th, 2017 by @semperrabbit*/
/* This code will provide the ability to toString() Creep, Structure, StructureSpawn and Flag objects to the console with a link that will take you to the room, select the creep and add the temporary Memory watch to the Memory tab. (highlighting Flag object currently does not work, but it will still take you to the room and add the Memory watch)*/

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

Creep.prototype.toString = function (htmlLink = true){
    return `[${(this.name ? this.name : this.id)} ${this.pos.toString(htmlLink, this.id, 'creeps.'+this.name)}]`;
}

Structure.prototype.toString = function (htmlLink = true){
    return `[structure (${this.structureType}) #${this.id} ${this.pos.toString(htmlLink, this.id, 'structures.' + this.id)}]`;
}

StructureSpawn.prototype.toString = function (htmlLink = true){
    return `[structure (${this.structureType}) #${this.id} ${this.pos.toString(htmlLink, this.id, 'spawns.' + this.name)}]`;
}

Flag.prototype.toString = function (htmlLink = true){
    return `[flag ${this.name} ${this.pos.toString(htmlLink, this.name, 'flags.'+this.name)}]`;
}