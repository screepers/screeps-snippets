// semperrabbit 25 November 2016 at 22:27

// to be used after you respawn into a new location
//   but before you spawn your first creep...
global.respawn = function() {
  for (let f in Game.flags) {
    Game.flags[f].remove();
  }
  Memory = {};
  RawMemory.set("");
};
