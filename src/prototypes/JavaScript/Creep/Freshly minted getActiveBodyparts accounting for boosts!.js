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

//optional, add action+'Amount object to all creeps. For example creep.repairAmount would return the amount that creep can repair based on parts and boosts.
//create an actionsMatrix to hold all actions based on body parts
global.actionsMatrix = {
    [WORK] : [
        'harvest', 'build', 'repair','dismantle','upgradeController'
    ],
    [ATTACK] : [
        'attack'
    ], 
    [RANGED_ATTACK] : [
        'rangedAttack', 'rangedMassAttack'
    ],
    [HEAL] : [
        'heal', 'rangedHeal'
    ],
    [CARRY] : [
        'capacity'
    ],
    [MOVE] : [
        'fatigue'
    ],
    [TOUGH] : [
        'damage'
    ]
}
//create a prototype for each action.
for (const type in actionsMatrix) {
    actionsMatrix[type].forEach(function(action){
        Object.defineProperty(Creep.prototype, action+'Amount', {
            get: function(){
                //initialize..if one isn't initialized, none of them are
                if (!this['_'+action+'Amount']) {
                    this['_'+action+'Amount'] = this.getActiveBodypartsBoostEquivalent(type, action)
                }
                return this['_'+action+'Amount']
            },
            set: function(){},
            enumerable: false,
            configurable: true,
        });
    });
}
