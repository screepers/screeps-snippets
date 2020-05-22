// artritus 20 August 2016 at 01:57

// delete memory of dead creeps
// do this BEFORE spawning new creeps or the memory will get deleted before they exist
for (var i in Memory.creeps) {
  if (!Game.creeps[i]) {
    delete Memory.creeps[i];
  }
}
