// helam 3 January 2017 at 01:37

/**
 * Used to create unique id numbers
 * Author: Helam
 * @returns {*|number}
 */
global.getId = function() {
  if (Memory.globalId == undefined || Memory.globalId > 10000) {
    Memory.globalId = 0;
  }
  Memory.globalId = Memory.globalId + 1;
  return Memory.globalId;
};

/**
 * INTERNAL USE ONLY.
 * Author: Helam
 * @param id
 * @param action
 * @param stopResult
 * @param tickLimit
 * @param startTime
 * @constructor
 */
global.QueuedAction = function({
  id,
  action,
  stopResult,
  tickLimit,
  startTime
}) {
  this.id = id || getId();
  this.action = id ? action : `return (${action.toString()})()`;
  this.stopResult = stopResult;
  this.tickLimit = tickLimit || 100;
  this.startTime = startTime || Game.time;
};

/**
 * INTERNAL USE ONLY.
 * Run the queued action and return false if:
 *  1. There is an error
 *  2. The return value of the queued action is equal to the stopResult
 *  3. The queued action has been run [tickLimit] number of times
 * Author: Helam
 * @returns {boolean}
 */
QueuedAction.prototype.run = function() {
  let func = Function(this.action);
  try {
    let result = func();
    if (result === this.stopResult) {
      return false;
    }
    if (Game.time - this.startTime >= this.tickLimit) {
      return false;
    }
  } catch (error) {
    console.log(error.stack);
    return false;
  }
  return true;
};

/**
 * INTERNAL USE ONLY.
 * Add the action to the queue.
 * Author: Helam
 */
QueuedAction.prototype.add = function() {
  Memory.queuedActions[this.id] = this;
};

/**
 * INTERNAL USE ONLY.
 * Remove the queued action from the queue.
 * Author: Helam
 */
QueuedAction.prototype.clear = function() {
  delete Memory.queuedActions[this.id];
};

/**
 * Put somewhere in the main loop.
 * Calls all of the queued actions.
 * Author: Helam
 */
global.runQueuedActions = function() {
  Object.keys(Memory.queuedActions || {}).forEach(id => {
    let action = new QueuedAction(Memory.queuedActions[id]);
    if (!action.run()) action.clear();
  });
};

/**
 * Call this function to add an action to the queue.
 * Author: Helam
 * @param action {Function} (the function you want called)
 * @param stopResult (return value of the function that should signal removing the action from the queue)
 * @param tickLimit (max number of ticks to call the function. default 100)
 */
global.queueAction = function(action, stopResult, tickLimit) {
  if (!Memory.queuedActions) Memory.queuedActions = {};
  let newAction = new QueuedAction({ action, stopResult, tickLimit });
  newAction.add();
};
