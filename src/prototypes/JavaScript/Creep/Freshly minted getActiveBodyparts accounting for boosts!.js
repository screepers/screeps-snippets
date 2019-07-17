// daboross 4 December 2016 at 22:32
Creep.prototype.getActiveBodypartsBoostEquivalent = function(type, action) {
  var total = 0;
  for (var i = this.body.length; i-- > 0; ) {
    var x = this.body[i];
    if (x.hits <= 0) {
      break;
    }
    if (x.type == type) {
      if (x.boost !== undefined) {
        total += BOOSTS[type][x.boost][action];
      } else {
        total += 1;
      }
    }
  }
  return total;
};

Creep.prototype.getBodypartsBoostEquivalent = function(type, action) {
  var total = 0;
  for (var i = this.body.length; i-- > 0; ) {
    var x = this.body[i];
    if (x.type == type) {
      if (x.boost !== undefined) {
        total += BOOSTS[type][x.boost][action];
      } else {
        total += 1;
      }
    }
  }
  return total;
};
