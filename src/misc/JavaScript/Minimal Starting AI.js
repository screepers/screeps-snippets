// WolfWings 6 February 2018 at 04:20

// Use a Red/White flag as a 'rally point' when there's nothing to do in a room.
// Use a Yellow/Yellow flag to mark an exit row that leads TO a room to remote-mine.
// Use a Yellow/Grey flag to mark an exit leading back FROM a room to where more storage is.
// REMEMBER TO BUILD ROADS AND EXTENSIONS! This is not an automated AI, you control construction!
​
var repairFilter = (object) => ( (object.my !== false) && (object.structureType !== STRUCTURE_WALL) && (object.structureType !== STRUCTURE_RAMPART) && (object.hits < object.hitsMax) && (object.hits < object.hitsMax - 500) );
​
module.exports.loop = () => {
	if ((Game.time % 100) === 0) {
		for(let name in Memory.creeps) {
			if(!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}
	}
​
	var creeps = {};
	for (let name in Game.creeps) {
		let creep = Game.creeps[name];
		if (!creep.my) {
			continue;
		}
		let room = creep.memory.room || creep.room.name;
		creeps[room] = creeps[room] || [];
		creeps[room].push(creep);
	}
​
    for (let roomIndex in Game.rooms) {
		let room = Game.rooms[roomIndex];
		let spawns = undefined;
		if (creeps[roomIndex] && creeps[roomIndex].length > 0) {
			creeps[roomIndex].sort((a, b) => (a.ticksToLive - b.ticksToLive));
		}
		let structures = room.find(FIND_STRUCTURES);
		let my_structures = _.filter(structures, (object) => (object.my === true));
		let towers = _.filter(my_structures, (object) => (object.structureType === STRUCTURE_TOWER));
		let tanks = undefined;
		let repair = undefined;
		let hostile_creeps = undefined;
		let wounded_creeps = undefined;
​
		for (let tower of towers) {
			do {
				hostile_creeps = hostile_creeps || room.find(FIND_HOSTILE_CREEPS);
				if (hostile_creeps.length > 0) {
					tower.attack(tower.pos.findClosestByRange(hostile_creeps));
					break;
				}
​
				wounded_creeps = wounded_creeps || _.filter(creeps[roomIndex], (object) => (object.hits < object.hitsMax) );
				if (wounded_creeps.length > 0) {
					tower.heal(tower.pos.findClosestByRange(wounded_creeps));
					break;
				}
			} while (false);
		}
​
		do {
			let body = null;
			creeps[roomIndex] = creeps[roomIndex] || [];
			if ((creeps[roomIndex].length < 3) &&
				(room.energyAvailable >= 250)) {
				body = [WORK,CARRY,MOVE,MOVE];
			} else if ((creeps[roomIndex].length < 20) &&
				(room.energyAvailable === room.energyCapacityAvailable)) {
				body = [WORK,WORK,CARRY,MOVE];
				if (room.energyAvailable >= 1300) {
					body = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
				} else if (room.energyAvailable >= 800) {
					body = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
				} else if (room.energyAvailable >= 550) {
					body = [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
				}
			}
​
			if (body !== null) {
				spawns = spawns || room.find(FIND_MY_SPAWNS, {filter: (object) => (object.spawning === null) } );
				if (spawns.length > 0) {
					var spawn = spawns.pop();
					spawn.spawnCreep(body, room.name + ":" + Game.time, { memory: { room: spawn.room.name } } );
				}
			}
		} while (false);
​
		for (let creep of creeps[roomIndex]) {
            if (creep.memory.full) {
                if (creep.carry.energy === 0) {
                    creep.memory.full = false;
                }
            } else {
                if (creep.carry.energy === creep.carryCapacity) {
                    creep.memory.full = true;
                }
            }
​
            let target;
            let result;
​
            if (creep.memory.full) {
                do {
					if (tanks === undefined) {
						tanks = _.filter(my_structures, (object) => ( ( (object.structureType === STRUCTURE_SPAWN) || (object.structureType === STRUCTURE_EXTENSION) || (object.structureType == STRUCTURE_TOWER) ) && (object.energy < object.energyCapacity) ) );
					}
					if (tanks.length > 0) {
						target = creep.pos.findClosestByRange(tanks);
						if (target.energyCapacity !== undefined) {
							result = creep.transfer(target, RESOURCE_ENERGY);
						} else {
							result = ERR_NOT_IN_RANGE;
						}
						break;
					}
​
					target = creep.pos.findClosestByRange(room.find(FIND_MY_CONSTRUCTION_SITES));
					if ((target === null) &&
					    (creep.room.name !== roomIndex)) {
						target = creep.pos.findClosestByRange(creep.room.find(FIND_MY_CONSTRUCTION_SITES));
					}
					if (target !== null) {
						result = creep.build(target);
						break;
					}
​
					if (repair === undefined) {
						repair = _.filter(structures, repairFilter )
						if ((repair.length === 0) &&
						    (roomIndex !== creep.room.name)) {
							repair = creep.room.find(FIND_STRUCTURES, {filter: repairFilter } );
						}
						repair.sort((a, b) => (a.id.localeCompare(b.id)));
					}
					if (repair.length > 0) {
						target = repair.pop();
						result = creep.repair(target);
						break;
					}
​
					target = creep.pos.findClosestByRange(creep.room.find(FIND_FLAGS, { filter: (flag) => flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_GREY}));
					if (target !== null) {
						result = ERR_NOT_IN_RANGE;
						break;
					}
​
					target = room.controller;
                    result = creep.upgradeController(target);
				} while (false);
            } else {
				do {
					target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (object) => (object.resourceType === RESOURCE_ENERGY) });
					if (target !== null) {
						result = creep.pickup(target);
						break;
					}
​
					let sources = creep.room.find(FIND_SOURCES_ACTIVE);
					if (sources.length === 0) {
						sources = creep.room.find(FIND_FLAGS, { filter: (flag) => flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_YELLOW});
					}
					target = creep.pos.findClosestByRange(sources);
					if (target !== null) {
						if (target.energy) {
							result = creep.harvest(target);
						} else {
							result = ERR_NOT_IN_RANGE;
						}
						break;
					}
​
					if (creep.carry.energy > 0) {
						creep.memory.full = true;
					} else {
						target = creep.room.find(FIND_FLAGS, {filter: (object) => ( (object.color === COLOR_RED) && (object.secondaryColor === COLOR_WHITE) ) } );
						if (target.length > 0) {
							target = target.pop();
							result = ERR_NOT_IN_RANGE;
						}
					}
				}
				while (false);
            }
​
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
}