const ALLIES = new Set([
  "ally 1",
  "ally_2"
]);
const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
​
// roomName, rampartIds
let rampartsToClose: Record<string, string[]> = {};
​
/**
 * opens ramparts around creeps of whitelisted players
 *
 * as long as allies ignore your ramparts when pathfinding
 * their creeps should have no problem going through your room
 */
export function letAlliesIn(room: Room) {
  // init rampartsToClose for this room
  if (!rampartsToClose[room.name]) {
    rampartsToClose[room.name] = room.find(FIND_MY_STRUCTURES)
      .filter(r => r.structureType === STRUCTURE_RAMPART && r.isPublic)
      .map(r => r.id);
  }
​
  let alliesInRoom = room.find(FIND_HOSTILE_CREEPS).filter(c => ALLIES.has(c.owner.username));
  // close ramparts and remove them from a list
  rampartsToClose[room.name] = rampartsToClose[room.name].filter(rampartId => {
    let r = Game.getObjectById<StructureRampart>(rampartId);
    if (!r || !r.isPublic)
      return false;
    const anyAllyNearRamp = alliesInRoom.some(ally => ally.pos.isNearTo(r.pos) && !ally.pos.isEqualTo(r.pos));
    if (anyAllyNearRamp)
      return true;
    r.setPublic(false);
    return true;
  });
​
  let rampartCount = _.sum(room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_RAMPART ? 1 : 0);
  if (alliesInRoom.length === 0 || rampartCount === 0)
    return;
​
  // might be a good idea
  //if (isUnderAttack(room))
  //  return;
​
  //
  for (let ally of alliesInRoom) {
    for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
      let x = ally.pos.x + offsetX[dir];
      let y = ally.pos.y + offsetY[dir];
      if (x < 0 || x > 49 || y < 0 || y > 49)
        continue;
      let rampartAtPos = room.lookForAt(LOOK_STRUCTURES, x, y).find(s => s.structureType === STRUCTURE_RAMPART) as StructureRampart;
      if (rampartAtPos && rampartAtPos.my && !rampartAtPos.isPublic) {
        rampartAtPos.setPublic(true);
        rampartsToClose[room.name].push(rampartAtPos.id);
      }
    }
  }
}
