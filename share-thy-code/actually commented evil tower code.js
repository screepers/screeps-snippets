// daboross 30 December 2016 at 10:48

// Get all rooms, wrap in a lodash chain (so we can execute the following methods directly on the object)
_(Game.rooms)
  // Filter by ones that we own
  .filter(r =>
    _.get(r, ["controller", "my"])
      // Iterate over each room
      .forEach(r => {
        // Find all structures in the room, wrap the result in a lodash chain
        _(r.find(FIND_MY_STRUCTURES))
          // Filter the structures by ones which are towers
          .filter("structureType", STRUCTURE_TOWER)
          // Shuffle the towers (so they happen in a random order)
          .shuffle()
          // "zip" the list of towers with the following information
          // (zip turns two lists [1, 2, 3], [a, b, c, d] into [[1, a], [2, b], [3, c], [undefined, d]], etc.)
          .zip(
            // For the other list, let's find all hostile creeps in the room
            _(
              r
                .find(FIND_HOSTILE_CREEPS)
                // Since we don't want to waste our energy, filter out all hostiles with no hostile parts
                .filter(x => {
                  // Inside the filter, we're going to iterate over each bodypart of the creep, using "some"
                  // "_.some" returns true the instant the inner condition returns true for any of the parts.
                  // In this case, the inner condition is checking if the part's type (y.type) is in this list.
                  // In other words, if the part is an ATTACK,WORK,RANGED_ATTACK or CARRY part. (we care about
                  // CARRY parts since they can withdraw energy from structures)
                  return _.some(x.body, y =>
                    [ATTACK, WORK, RANGED_ATTACK, CARRY].includes(y.type)
                  );
                })
                // Now, we shuffle the targets (so they also appear in a random order)
                // We need to shuffle both the towers and the targets so that if there are more of one than the other, it is truly random which one is left unattacked.
                .shuffle()
                // This "ends" the lodash chain, executing the filter and shuffle, and giving us back a plain array
                // which can be used by "zip"
                .value()
            )
          )
          // Now that we have the "zipped" array, let's end the outer lodash chain. This does another forEach, except
          // this time it's over the [tower, target] pairs.
          .forEach(t => {
            // '!_.some(t, x => !x)' is a somewhat roundabout way of saying "are all things in this array true?"
            // Remember that zip() will include 'undefined' for some items if we have more towers than hostiles, or more hostiles than towers. This _.some() will return true if either term is undefined, and then '!_.some...' will be false.
            !_.some(t, x => !x) &&
              // '&& ...' here is another somewhat roundabout way of saying "do the second action only if the first is true". In this case, it will only execute t[0].attack(t[1]) if '!_.some(t, x => !x)' is true.
              // Now, for the actual attack. Since zip() gives us pairs in the form of [item_in_first_array, item_in_second_array], 't' will be an array like [tower, hostile]. With that in mind, it makes perfect sense to say tower.attack(hostile) to actually perform the attack.
              t[0].attack(t[1]);
          });
      })
  );
