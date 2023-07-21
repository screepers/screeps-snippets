// Modified warinternals old roomObject submission to fall under pos as that just made more sense continuinty wise.

/**
 * warinternal's Original Code --
 * Shorthand for lookForAtArea around a room position modified by Shibdib from a roomObject to roomPosition
 *
 * @param {string} lookFor - LOOK_* constant
 * @param {boolean} asArray - Return as array bool
 * @param {number} range - Range to look
 * @returns {object} Returns an object/array of the results
 */
RoomPosition.prototype.lookForNearby = function (lookFor, asArray = true, range = 1) {
    return Game.rooms[this.roomName].lookForAtArea(
        lookFor,
        Math.max(0, this.y - range),
        Math.max(0, this.x - range),
        Math.min(49, this.y + range),
        Math.min(49, this.x + range),
        asArray
    );
};

/**
 * warinternal's Original Code --
 * Shorthand for lookAtArea around a room position modified by Shibdib from a roomObject to roomPosition
 *
 * @param {boolean} asArray - Return as array bool
 * @param {number} range - Range to look
 * @returns {object} Returns an object/array of the results
 */
RoomPosition.prototype.lookNearby = function (asArray, range = 1) {
    return Game.rooms[this.roomName].lookAtArea(
        Math.max(0, this.y - range),
        Math.max(0, this.x - range),
        Math.min(49, this.y + range),
        Math.min(49, this.x + range),
        asArray
    );
};
