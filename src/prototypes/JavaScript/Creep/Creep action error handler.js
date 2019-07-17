// warinternal 29 April 2017 at 21:13

/**
 * Globally patch creep actions to log error codes.
 */
[
  "attack",
  "attackController",
  "build",
  "claimController",
  "dismantle",
  "drop",
  "generateSafeMode",
  "harvest",
  "heal",
  "move",
  "moveByPath",
  "moveTo",
  "pickup",
  "rangedAttack",
  "rangedHeal",
  "rangedMassAttack",
  "repair",
  "reserveController",
  "signController",
  "suicide",
  "transfer",
  "upgradeController",
  "withdraw"
].forEach(function(method) {
  let original = Creep.prototype[method];
  // Magic
  Creep.prototype[method] = function() {
    let status = original.apply(this, arguments);
    if (typeof status === "number" && status < 0) {
      console.log(
        `Creep ${this.name} action ${method} failed with status ${status} at ${
          this.pos
        }`
      );
    }
    return status;
  };
});
