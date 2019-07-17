// warinternal 25 November 2016 at 19:30
RoomObject.prototype.lookForNear = function(lookFor, asArray, range = 1) {
  let { x, y } = this.pos;
  return this.room.lookForAtArea(
    lookFor,
    Math.max(0, y - range),
    Math.max(0, x - range),
    Math.min(49, y + range),
    Math.min(49, x + range),
    asArray
  );
};
