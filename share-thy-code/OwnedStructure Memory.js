// warinternal 27 December 2016 at 18:51

// This is called during global reset to set up structure memory,
// because it doesn't need to be called often.
if (!Memory.structures) {
  console.log("[Memory] Initializing structure memory");
  Memory.structures = {};
}

// Adds structure memory to OwnedStructure things.
// Easier to reason about garbage collection in this implementation.
Object.defineProperty(OwnedStructure.prototype, "memory", {
  get: function() {
    if (!Memory.structures[this.id]) Memory.structures[this.id] = {};
    return Memory.structures[this.id];
  },
  set: function(v) {
    return _.set(Memory, "structures." + this.id, v);
  },
  configurable: true,
  enumerable: false
});

// Call this periodically to garbage collect structure memory
// (I find once every 10k ticks is fine)
global.GCStructureMemory = function() {
  for (var id in Memory.structures)
    if (!Game.structures[id]) {
      console.log(
        "Garbage collecting structure " +
          id +
          ", " +
          JSON.stringify(Memory.structures[id])
      );
      delete Memory.structures[id];
    }
};
