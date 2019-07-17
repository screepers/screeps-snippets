// helam 1 February 2017 at 08:34
/**
 * Defines a .mineral property for rooms that caches and gives you the mineral object for a room
 * Author: Helam
 */
Object.defineProperty(Room.prototype, "mineral", {
  get: function() {
    if (this == Room.prototype || this == undefined) return undefined;
    if (!this._mineral) {
      if (this.memory.mineralId === undefined) {
        let [mineral] = this.find(FIND_MINERALS);
        if (!mineral) {
          return (this.memory.mineralId = null);
        }
        this._mineral = mineral;
        this.memory.mineralId = mineral.id;
      } else {
        this._mineral = Game.getObjectById(this.memory.mineralId);
      }
    }
    return this._mineral;
  },
  enumerable: false,
  configurable: true
});
