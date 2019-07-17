// warinternal 28 November 2016 at 01:32

/** first we put the function in global */
global.DEFINE_CACHED_GETTER = function(
  proto,
  propertyName,
  fn,
  enumerable = false
) {
  Object.defineProperty(proto, propertyName, {
    get: function() {
      if (this === proto || this == null) return null;
      var result = fn.call(this, this);
      Object.defineProperty(this, propertyName, {
        value: result,
        configurable: true,
        enumerable: false
      });
      return result;
    },
    configurable: true,
    enumerable: enumerable
  });
};

/** Then we define some properties! */
DEFINE_CACHED_GETTER(Creep.prototype, "carryTotal", c => _.sum(c.carry));
DEFINE_CACHED_GETTER(
  Creep.prototype,
  "carryCapacityAvailable",
  c => c.carryCapacity - c.carryTotal
);
