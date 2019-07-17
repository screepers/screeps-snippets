// daboross 12 December 2016 at 00:28

/**
 * Utility function turning a direction constant into a dx/dy difference.
 */
const directionToDxDy = function(dir) {
  switch (dir) {
    case TOP:
      return [0, -1];
    case TOP_RIGHT:
      return [1, -1];
    case RIGHT:
      return [1, 0];
    case BOTTOM_RIGHT:
      return [1, 1];
    case BOTTOM:
      return [0, 1];
    case BOTTOM_LEFT:
      return [-1, 1];
    case LEFT:
      return [-1, 0];
    case TOP_LEFT:
      return [-1, -1];
    default:
      return null;
  }
};

/**
 * Utility function turning a dx/dy difference into a direction constant.
 *
 * Note: ignores magnitude of arguments, and only looks at sign.
 */
const dxDyToDirection = function(dx, dy) {
  if (dx < 0) {
    if (dy < 0) {
      return TOP_LEFT;
    } else if (dy > 0) {
      return BOTTOM_LEFT;
    } else {
      return LEFT;
    }
  } else if (dx > 0) {
    if (dy < 0) {
      return TOP_RIGHT;
    } else if (dy > 0) {
      return BOTTOM_RIGHT;
    } else {
      return RIGHT;
    }
  } else {
    if (dy < 0) {
      return TOP;
    } else if (dy > 0) {
      return BOTTOM;
    } else {
      // both dx and dy are 0!
      return null;
    }
  }
};

/**
 * Searches for a path using PathFinder and the given opts, turns the path into a Room.findPath-compatible
 * serialized result, and returns that result.
 *
 * Please ensure that all arguments have been validated when passing in, and that targetPos is a raw position
 * (not a RoomObject with a pos property).
 */
const findPathPathFinder = function(originPos, targetPos, options) {
  const result = PathFinder.search(
    originPos,
    {
      pos: targetPos,
      range: "range" in options ? options.range : 1
    },
    options
  );

  const path = result.path;
  var resultStringArray = []; // it's faster to use [...].join('') than to continuously add to a string.
  var roomToConvert = originPos.roomName;

  if (path.length < 1) {
    return "";
  }

  // The serialized format starts with the second position's x and y values, then the direction from the
  // first pos to second, then direction from second to third, etc.

  if (path[0].x > 9) {
    resultStringArray.push(path[0].x);
  } else {
    resultStringArray.push(0, path[0].x); // 0-pad
  }
  if (path[0].y > 9) {
    resultStringArray.push(path[0].y);
  } else {
    resultStringArray.push(0, path[0].y); // 0-pad
  }

  var last_x = originPos.x;
  var last_y = originPos.y;
  var pos, dx, dy, dir;
  for (var i = 0; i < path.length; i++) {
    pos = path[i];
    dx = pos.x - last_x;
    dy = pos.y - last_y;
    if (dx === -49) {
      dx = 1;
    } else if (dx === 49) {
      dx = -1;
    }
    if (dy === -49) {
      dy = 1;
    } else if (dy === 49) {
      dy = -1;
    }

    resultStringArray.push(dxDyToDirection(dx, dy));
    if (pos.roomName != roomToConvert) {
      break;
    }
    last_x = pos.x;
    last_y = pos.y;
  }
  return resultStringArray.join("");
};

Creep.prototype.defaultMoveTo = Creep.prototype.moveTo;

/**
 * Custom replacement of moveTo, which just calls moveTo unless a 'roomCallback' argument is passed in in the
 * options. The memory format this function uses is identical to the default moveTo's, so it is supported
 * alternate* calling this function with and without the 'roomCallback' option.
 *
 * When passed roomCallback, this function is identical to moveTo, except it:
 * - assumes that Creep.prototype.moveByPath has already been optimized to deal with
 *   serialized paths, and will pass it purely serialized paths.
 * - does not accept the 'serializeMemory' option, and will always assume it is set to true
 * - does not accept any of the 'costCallback', 'ignoreCreeps', 'ignoreRoads' or 'ignoreDestructibleStructures'
 *   options. (note: roomCallback is used by PathFinder instead of the costCallback used by findPath)
 * - passes all arguments on to PathFinder.search as is.
 * - accepts one additional option, 'range', which is passed into PathFinder as part of the target object.
 */
Creep.prototype.moveTo = function(arg1, arg2, arg3) {
  var x, y, roomName, opts;
  if (arg3 === undefined) {
    if (arg1.pos) {
      arg1 = arg1.pos;
    }
    x = arg1.x;
    y = arg1.y;
    roomName = arg1.roomName;
    opts = arg2 || {};
  } else {
    x = arg1;
    y = arg2;
    roomName = this.pos.roomName;
    opts = arg3 || {};
  }

  if (!("roomCallback" in opts)) {
    return this.defaultMoveTo(arg1, arg2, arg3); // Compatible memory format.
  }
  if (!_.isNumber(x) || !_.isNumber(y) || !_.isString(roomName)) {
    return ERR_INVALID_TARGET;
  }
  if (!_.isObject(opts)) {
    return ERR_INVALID_ARGS;
  }
  if (!this.my) {
    return ERR_NOT_OWNER;
  }
  if (this.spawning) {
    return ERR_BUSY;
  }
  if (this.fatigue > 0) {
    return ERR_TIRED;
  }
  if (!this.hasActiveBodyparts(MOVE)) {
    return ERR_NO_BODYPART;
  }

  const targetPos = new RoomPosition(x, y, roomName);

  if (this.pos.isNearTo(targetPos)) {
    if (this.pos.isEqualTo(targetPos)) {
      return OK;
    } else {
      return this.move(this.pos.getDirectionTo(targetPos));
    }
  }

  const reusePath =
    _.isObject(this.memory) && ("reusePath" in opts ? opts.reusePath : 5);

  if (reusePath) {
    var _move = this.memory._move;

    if (
      _.isObject(_move) &&
      Game.time <= _move.time + Number(reusePath) &&
      _move.room == this.pos.roomName &&
      _move.dest.room == targetPos.roomName &&
      _move.dest.x == targetPos.x &&
      _move.dest.y == targetPos.y
    ) {
      // moveByPath is optimized to deal with serialized paths already, and it's more CPU to
      // re-serialize each tick with a smaller string than it is to store the larger string the
      // whole time.
      var byPathResult = this.moveByPath(_move.path);
      if (
        byPathResult !== ERR_NOT_FOUND &&
        byPathResult !== ERR_INVALID_ARGS &&
        byPathResult !== ERR_NO_PATH
      ) {
        return byPathResult;
      }
    }
  }

  if (opts.noPathFinding) {
    return ERR_NOT_FOUND;
  }

  // This uses PathFinder, and returns the result as an already-serialized path.
  const path = findPathPathFinder(this.pos, targetPos, opts);

  if (reusePath) {
    this.memory._move = {
      dest: {
        x: targetPos.x,
        y: targetPos.y,
        room: targetPos.roomName
      },
      time: Game.time,
      path: path,
      room: this.pos.roomName
    };
  }

  return this.moveByPath(path);
};

Creep.prototype.defaultMoveByPath = Creep.prototype.moveByPath;

/**
 * Version of moveByPath, built to read raw serialized path strings without deserializing.
 *
 * If passed a non-string argument, this will just invoke the default moveByPath code.
 *
 * When passed a string, it should behave identically to the default moveByPath, but hopefully slightly faster.
 */
Creep.prototype.moveByPath = function(path) {
  if (!_.isString(path)) {
    return this.defaultMoveByPath(path);
  }
  var path_len = path.length;
  if (path_len < 5) {
    return ERR_NO_PATH;
  }
  var my_x = this.pos.x,
    my_y = this.pos.y;
  var x_to_check = +path.slice(0, 2);
  var y_to_check = +path.slice(2, 4);
  var dir, dxdy;
  // The path serialization format basically starts with the second position x, second position y, and then
  // follows with a list of directions *to get to each position*. To clarify, the first direction, at idx=4,
  // gives the direction *from the first position to the second position*. So, to find the first position,
  // we subtract that! I do think this is actually more performant than trying to do any more complicated
  // logic in the loop.
  dxdy = directionToDxDy(+path[4]);
  x_to_check -= dxdy[0];
  y_to_check -= dxdy[1];
  // Since we start at 4 again, we'll be re-adding what we just subtracted above - this lets us check both the
  // first and second positions correctly!
  for (var idx = 4; idx < path_len; idx++) {
    // Essentially at this point, *_to_check represent the point reached by the *last* movement (the pos
    // reached by the movement at (idx - 1) since idx just got incremented at the start of this loop)
    // Also, if this is the first iteration and x/y_to_check match the first pos, idx is at 4, the fifth
    // pos, directly after the initial x/y, and also the first direction to go!
    if (x_to_check === my_x && y_to_check == my_y) {
      dir = +path[idx];
      return this.move(dir);
    }
    dxdy = directionToDxDy(+path[idx]);
    if (dxdy === null) {
      return ERR_INVALID_ARGS;
    }
    x_to_check += dxdy[0];
    y_to_check += dxdy[1];
  }
  return ERR_NOT_FOUND;
};
