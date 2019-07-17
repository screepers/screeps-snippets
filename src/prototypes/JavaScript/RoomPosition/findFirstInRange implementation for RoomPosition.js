// proximo 6 December 2016 at 17:15
RoomPosition.prototype.findFirstInRange = function(type, range) {
  const room = this.room;
  if (room === undefined) return undefined;

  const xMin = Math.max(0, this.x - range);
  const xMax = Math.min(49, this.x + range);
  const yMin = Math.max(0, this.y - range);
  const yMax = Math.min(49, this.y + range);

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      if (x === this.x && y === this.y) continue;

      let result = room.lookForAt(LOOK_STRUCTURES, x, y);

      for (let i = 0; i < result.length; i++) {
        if (result[i].structureType === type) {
          return result[i];
        }
      }
    }
  }
  return undefined;
};
