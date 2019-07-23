/**
 * Posted 24 February 2018 by @tigga
 */
let isActive = OwnedStructure.prototype.isActive;
OwnedStructure.prototype.isActive = function() {
    if (this.room.memory && this.room.memory.maxRCL && this.room.memory.maxRCL == (this.room.controller.level || 0)) {
        return true;
    }

    return isActive.call(this);
}