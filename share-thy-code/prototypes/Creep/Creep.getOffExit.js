// engineeryo 7 February 2017 at 04:46

global.DIRECTIONS = {
  // [x, y] adders
  1: [0, -1],
  2: [1, -1],
  3: [1, 0],
  4: [1, 1],
  5: [0, 1],
  6: [-1, 1],
  7: [-1, 0],
  8: [-1, -1]
};

RoomPosition.prototype.fromDirection = function(direction) {
  // returns a RoomPosition given a RoomPosition and a direction
  return new RoomPosition(
    this.x + DIRECTIONS[direction][0],
    this.y + DIRECTIONS[direction][1],
    this.roomName
  );
};

Creep.prototype.getOffExit = function() {
  let directionsFromExit = {
    // Legal directions from a given exit
    x: {
      49: [7, 8, 6],
      0: [3, 4, 2]
    },
    y: {
      49: [1, 8, 2],
      0: [5, 6, 4]
    }
  };

  if (directionsFromExit["x"][this.pos.x]) {
    // Are we on the left / right exits?
    var allowedDirections = directionsFromExit.x[this.pos.x];
  } else if (directionsFromExit["y"][this.pos.y]) {
    // or are we on the top / bottom exits?
    var allowedDirections = directionsFromExit.y[this.pos.y];
  }

  if (!allowedDirections) {
    // Not on an exit tile
    console.log(this.name + " isnt on an exit tile");
    return false;
  }

  for (let direction of allowedDirections) {
    let stuff = this.pos.fromDirection(direction).look(); // collection of things at our potential target
    if (
      _.findIndex(
        stuff,
        p =>
          p.type == "creep" ||
          (p.structure && OBSTACLE_OBJECT_TYPES[p.structure.structureType]) ||
          p.terrain == "wall"
      ) == -1
    ) {
      // longhand for 'is there an obstacle there?'
      this.move(direction);
      break; // save that CPU, yo
    }
  }
};
