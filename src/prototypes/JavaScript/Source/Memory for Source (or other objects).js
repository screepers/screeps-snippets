// w4rl0ck 26 April 2017 at 23:41

Object.defineProperty(Source.prototype, "memory", {
  configurable: true,
  get() {
    if (_.isUndefined(this.room.memory.sources)) {
      this.room.memory.sources = {};
    }
    return (this.room.memory.sources[this.id] =
      this.room.memory.sources[this.id] || {});
  },
  set(value) {
    if (_.isUndefined(this.room.memory.sources)) {
      this.room.memory.sources = {};
    }
    if (!_.isObject(Memory.structure)) {
      throw new Error("Could not set structure memory");
    }
    this.room.memory.sources[this.id] = value;
  }
});
