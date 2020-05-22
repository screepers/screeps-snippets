/**
 * Posted 18 October 2017 by @warinternal
 * 
 * Pushdown automata state machine
 */

/** Call this to run the current state */
RoomObject.prototype.invokeState = function() {
	if(!this.memory.stack || !this.memory.stack.length)
		return false;
	var [[state,scope]] = this.memory.stack;
	var method = `run${state}`;
	if(!this[method])
		return false;
	this[method](scope);
	return true;
};

/**
 * @param {string} [defaultState] - Fallback state if none defined.
 */
RoomObject.prototype.getState = function (defaultState = 'I') {
	if(!this.memory.stack)
		return defaultState;
	return this.memory.stack[0][0] || defaultState;
};

/**
 * @param {string} state - Name of state to switch to.
 * @param {*} scope - Any data you want to supply to the state.
 */
RoomObject.prototype.setState = function (state, scope) {
	if (state == null)
		throw new TypeError('State can not be null');
	if (!this.memory.stack)
		this.memory.stack = [[]];
	this.memory.stack[0] = [state, scope];
	return state;
};

/**
 * @param {string} state - Name of state to push
 * @param {*} scope - Any data you want to supply to the state.
 */
RoomObject.prototype.pushState = function (state, scope={}) {
	if (!this.memory.stack)
		this.memory.stack = [];
	var method = `run${state}`;
	if (this[method] == null)
		throw new Error(`No such state or action ${method}`);
	if (this.memory.stack.length >= 100)
		throw new Error('Automata stack limit exceeded');
	this.memory.stack.unshift([state, scope]);
	return state;
};

/** Pop the current state off the stack */
RoomObject.prototype.popState = function () {
	if (!this.memory.stack || !this.memory.stack.length)
		return;
	const [state] = this.memory.stack.shift();
	if (!this.memory.stack.length)
		this.memory.stack = undefined;
};

/** Clear the stack */
RoomObject.prototype.clearState = function() {
	this.memory.stack = undefined;
};

/** Example state - goto location */
Creep.prototype.runGoto = function (scope) {
	var { pos, range = 1 } = scope;
	var roomPos = _.create(RoomPosition.prototype, pos);
	if (this.moveTo(roomPos, { range: range }) === ERR_NO_PATH)
		this.popState();
};

/** Example state - goto room */
Creep.prototype.runGotoRoom = function (scope) {
	if (this.moveToRoom(scope) === ERR_NO_PATH)
		this.popState();
};

/** 
 * Example - Heal self and flee
 * Push this state when you start to get hurt. Creep will heal
 * and go back to what it was doing. If it keeps getting hurt, it 
 * will leave the room, and try to go back to healing. 
 */
Creep.prototype.runHealSelf = function (scope) {
	this.heal(this);
	// take this opportunity to flee	
	if (this.hits >= this.hitsMax) { // If we're back to full, we're done
		return this.popState();
	} else if(this.hits / this.hitsMax < 0.5) { // Otherwise run away
		// Find neighboring room
		this.pushState('GotoRoom', /* neighbor */);
	}
};