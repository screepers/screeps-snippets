/*
 * A set of functions that makes creeps tell other creeps to get out of the way using creep memory
 * 
 * call so creep reacts to being nudged
 * Creep.giveWay() - swaps places with creep that nudged it
 * Creep.giveWay(true) - moves into random available spot
 * Creep.giveWay({pos: controller.pos, range: 3 }) - moves into random available spot in range of target, if none are avaiable fallbacks to random spot
 */

/*
 * if alwaysNudge false you have to call Creep.move with additional argument -
 * creep.move(direction, true); - for creep to nudge other creeps,
 * so it's not compatible with creep.moveTo
 * 
 * if alwaysNudge is true then creeps... always nudge creeps in front of them
 */
const alwaysNudge = true;

/*
 * type declarations
 */
declare global {
  interface Creep {
    giveWay(): void;
    giveWay(random: boolean): void;
    giveWay(target: { pos: RoomPosition; range: number; }): void;
    move(direction: DirectionConstant, excuse: boolean): CreepMoveReturnCode;
  }

  interface PowerCreep {
    giveWay(): void;
    giveWay(random: boolean): void;
    giveWay(target: { pos: RoomPosition; range: number; }): void;
    move(direction: DirectionConstant, excuse: boolean): CreepMoveReturnCode;
  }
  interface CreepMemory {
    excuseMe?: DirectionConstant;
  };
  interface PowerCreepMemory {
    excuseMe?: DirectionConstant;
  };
}

/*
 * some utils that I'm using
 */
const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
function getRandomDir() {
  return (Math.floor(Math.random() * 8) + 1) as DirectionConstant;
}
function getOppositeDir(dir: DirectionConstant) {
  return ((dir + 3) % 8 + 1) as DirectionConstant;
}

/*
 * returns a weighted random direction from given position
 * prefers empty tiles over ones with creeps
 * never picks a direction that would result in hitting a wall or an obstacle structure
 */
function getNudgeDirection_Random(pos: RoomPosition) {
  const room = Game.rooms[pos.roomName];
  const terrain = Game.map.getRoomTerrain(pos.roomName);
  let totalWeight = 0;
  let dirCandidates = new Uint8Array(9);
  for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
    let posX = pos.x + offsetX[dir];
    let posY = pos.y + offsetY[dir];
    if (posX < 1 || posX > 48 || posY < 1 || posY > 48)
      continue;
    if ((terrain.get(posX, posY) & TERRAIN_MASK_WALL) > 0)
      continue;
    if (room.lookForAt(LOOK_STRUCTURES, posX, posY).find(s => OBSTACLE_OBJECT_TYPES.includes(s.structureType)))
      continue;

    const hasCreeps = room.lookForAt(LOOK_CREEPS, posX, posY).length > 0;
    const addWeight = hasCreeps ? 1 : 2;
    dirCandidates[dir] += addWeight;
    totalWeight += dirCandidates[dir];
  }

  let sum = 0;
  let rnd = _.random(1, totalWeight, false);
  for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
    if (dirCandidates[dir] > 0) {
      sum += dirCandidates[dir];
      if (rnd <= sum) {
        return dir;
      }
    }
  }

  // this should never happen, unless creep is spawned into a corner
  // or structure is built next to it and seals the only path out
  return getRandomDir();
}

/*
 * returns a weighted random direction from given position
 * tries to stay in targets range, if it's impossible then fallbacks to random direction
 * prefers empty tiles over ones with creeps
 * never picks a direction that would result in hitting a wall or an obstacle structure
 */
function getNudgeDirection_KeepRange(pos: RoomPosition, target: { pos: RoomPosition; range: number; }) {
  const room = Game.rooms[pos.roomName];
  const terrain = Game.map.getRoomTerrain(pos.roomName);
  let keepRangeTotalWeight = 0;
  let keepRangeDirCandidates = new Uint8Array(9);
  let randomTotalWeight = 0;
  let randomDirCandidates = new Uint8Array(9);
  for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
    let posX = pos.x + offsetX[dir];
    let posY = pos.y + offsetY[dir];
    if (posX < 1 || posX > 48 || posY < 1 || posY > 48)
      continue;
    if ((terrain.get(posX, posY) & TERRAIN_MASK_WALL) > 0)
      continue;
    if (room.lookForAt(LOOK_STRUCTURES, posX, posY).find(s => OBSTACLE_OBJECT_TYPES.includes(s.structureType)))
      continue;

    const hasCreeps = room.lookForAt(LOOK_CREEPS, posX, posY).length > 0;
    const addWeight = hasCreeps ? 1 : 2;
    randomDirCandidates[dir] += addWeight;
    if (target.pos.inRangeTo(posX, posY, target.range))
      keepRangeDirCandidates[dir] += addWeight;
    keepRangeTotalWeight += keepRangeDirCandidates[dir];
    randomTotalWeight += randomDirCandidates[dir];
  }

  const dirCandidates = keepRangeTotalWeight > 0 ? keepRangeDirCandidates : randomDirCandidates;
  const totalWeight = keepRangeTotalWeight > 0 ? keepRangeTotalWeight : randomTotalWeight;
  let sum = 0;
  if (totalWeight > 0) {
    let rnd = _.random(1, totalWeight, false);
    for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
      if (dirCandidates[dir] > 0) {
        sum += dirCandidates[dir];
        if (rnd <= sum) {
          return dir;
        }
      }
    }
  }

  // this should never happen, unless creep is spawned into a corner
  // or structure is built next to it and seals the only path out
  return getRandomDir();
}

/*
 * a nudge
 */
function excuseMe(pos: RoomPosition, direction: DirectionConstant) {
  const nextX = pos.x + offsetX[direction];
  const nextY = pos.y + offsetY[direction];
  if (nextX > 49 || nextX < 0 || nextY > 49 || nextY < 0)
    return;

  const room = Game.rooms[pos.roomName];
  const creeps = room.lookForAt(LOOK_CREEPS, nextX, nextY);
  if (creeps.length > 0 && creeps[0].my)
    creeps[0].memory.excuseMe = getOppositeDir(direction);
  const powerCreeps = room.lookForAt(LOOK_POWER_CREEPS, nextX, nextY);
  if (powerCreeps.length > 0 && powerCreeps[0].my)
    powerCreeps[0].memory.excuseMe = getOppositeDir(direction);
}

/*
 * 
 */
let creepsThatTriedToMove: { [key: string]: RoomPosition; } = {};
const move = Creep.prototype.move;
Creep.prototype.move = function (direction: DirectionConstant | Creep, nudge?: boolean) {
  if ((alwaysNudge || nudge) && _.isNumber(direction))
    excuseMe(this.pos, direction);
  creepsThatTriedToMove[this.name] = this.pos;
  return move.call(this, direction);
};

/*
 * call this on creeps that should react to being nudged
 */
function giveWay(creep: AnyCreep, arg?: boolean | { pos: RoomPosition; range: number; }) {
  if (creep.memory.excuseMe) {
    if (!arg)
      creep.move(creep.memory.excuseMe, true);
    else if (typeof arg === 'object')
      creep.move(getNudgeDirection_KeepRange(creep.pos, arg), true);
    else
      creep.move(getNudgeDirection_Random(creep.pos), true);
  }
}
Creep.prototype.giveWay = function (arg?: boolean | { pos: RoomPosition; range: number; }) {
  giveWay(this, arg);
};
PowerCreep.prototype.giveWay = function (arg?: boolean | { pos: RoomPosition; range: number; }) {
  giveWay(this, arg);
};

/*
 * clears nudges from memory of creeps that moved
 * call on tick start
 */
export function clearNudges() {
  for (let creepName in creepsThatTriedToMove) {
    const creep = Game.creeps[creepName];
    const powerCreep = Game.powerCreeps[creepName];
    const prevPos = creepsThatTriedToMove[creepName];
    if ((!creep || !creep.pos.isEqualTo(prevPos)) && (!powerCreep || !powerCreep.pos.isEqualTo(prevPos))) {
      const creepMemory = Memory.creeps[creepName];
      if (creepMemory)
        creepMemory.excuseMe = undefined;
      const powerCreepMemory = Memory.powerCreeps[creepName];
      if (powerCreepMemory)
        powerCreepMemory.excuseMe = undefined;
      delete creepsThatTriedToMove[creepName];
    }
  }
}