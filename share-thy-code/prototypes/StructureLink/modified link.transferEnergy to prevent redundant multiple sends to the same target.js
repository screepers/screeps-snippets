// helam 3 January 2017 at 15:36
const ACCEPTABLE_FULL_AMOUNT = LINK_CAPACITY * (1 - LINK_LOSS_RATIO);
StructureLink.prototype._singleTransferEnergy =
  StructureLink.prototype.transferEnergy;
StructureLink.prototype.transferEnergy = function(target, amount) {
  if (target._isFull) return ERR_FULL;

  let transferResult = this._singleTransferEnergy.apply(this, arguments);

  if (transferResult === OK) {
    let transferred = (amount || this.energy) * (1 - LINK_LOSS_RATIO);
    if (target.energy + transferred >= ACCEPTABLE_FULL_AMOUNT)
      target._isFull = true;
  }
  return transferResult;
};
