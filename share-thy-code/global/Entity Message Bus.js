// warinternal 30 March 2017 at 06:43

/**
 * Receive message on room object. Extend this message to any
 * entity using the message bus.
 *
 * @param mixed msg - string or object sent
 * @param number tick - the tick the message was sent on
 *
 * @return false to repeat message (up until it expires)
 *
 * ex: StructureTerminal.prototype.receiveMessage = function(msg) {}
 */
RoomObject.prototype.receiveMessage = function(msg, sender, tick) {
  var AB = Game.time & 1;
  console.log(`Receiving message ${JSON.stringify(msg)} on channel ${AB}`);
};

/**
 * Send a message to an entity to be received on the next tick.
 * The next tick delivery ensures all messages can be processed
 * and states updated before logic begins, as well as preventing
 * infinite loops.
 *
 * @param string id - object id to receive
 * @param mixed data - string or object to send
 */
global.sendMessage = function(id, data = {}, expire = 5, sender = "global") {
  if (typeof id !== "string")
    throw new TypeError("Expected id string or flag name");
  var AB = 1 - (Game.time & 1);
  console.log(`Sending message on to ${id} on channel ${AB}`);
  if (!Memory.messages) Memory.messages = [];
  if (!Memory.messages[AB]) Memory.messages[AB] = [];
  return Memory.messages[AB].push({
    id,
    sender,
    data: JSON.stringify(data),
    tick: Game.time,
    expire: Game.time + expire
  });
};

/**
 * Helper to pass in the sender id
 */
RoomObject.prototype.sendMessage = function(id, data = {}, expire = 5) {
  return sendMessage(id, data, expire, this.id || this.name);
};

/**
 * Process loop for message bus
 * Call once per tick to deliver messages to entities.
 *
 * Messages may deliver at a later time.
 *
 */
global.processMessages = function() {
  var AB = Game.time & 1;
  var obj, status;
  if (!Memory.messages || !Memory.messages[AB] || !Memory.messages[AB].length)
    return;
  _.remove(Memory.messages[AB], function({ id, sender, data, tick, expire }) {
    if (Game.time > expire) return true;
    obj = Game.getObjectById(id) || Game.flags[id];
    if (!obj) return false;
    status = obj.receiveMessage(JSON.parse(data), sender, tick);
    return status == undefined ? true : status;
  });
};
