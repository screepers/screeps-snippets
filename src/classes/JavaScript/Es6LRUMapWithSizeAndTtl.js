/**
 * posted 3 April 2018 by @warinternal
 * 
 * A cache that can exhibit both least recently used (LRU) and max time to live (TTL) eviction policies.
 *
 * Internally the cache is backed by a `Map` but also maintains a linked list of entries to support the eviction policies.
 * Source: https://github.com/ianp/es6-lru-cache
 */
'use strict';

class LRU {

	// cache entries are objects with
	//   key - duplicated here to make iterator based methods more efficient
	//   value
	//   prev - a pointer
	//   next - a pointer
	//   expires - time of death in Date.now

	/**
	 *
	 * @param {number} ttl - the max. time to live, in ticks
	 * @param {number} max - the max. number of entries in the cache
	 * @param {Object|Iterable} data - the data to initialize the cache with
	 */
	constructor({ ttl, max, data = {} }) {
		this.data = new Map();
		if (max) { this.max = max; }
		if (ttl) { this.ttl = ttl; }
		// this.head = undefined
		// this.tail = undefined
		if (data) {
			if (data[Symbol.iterator]) {
				for (const [key, value] in data) {
					this.set(key, value);
				}
			} else {
				Object.keys(data).forEach(key => this.set(key, data[key]));
			}
		}
	}

	clear() {
		this.data.clear();
		this.head = undefined;
		this.tail = undefined;
	}

	delete(key) {
		const curr = this.data.get(key);
		if (this.data.delete(key)) {
			this._remove(curr);
			return true;
		}
		return false;
	}

	entries() {
		return this.it(entry => [entry.key, entry.value]);
	}

	evict() {
		let curr,count = 0;
		const {max} = this;
		const now = this.ttl ? Game.time : false;
		for (curr = this.head; curr; curr = curr.next) {
			++count;
			if ((max && max < count) || (now && now > curr.expires)) {
				this.data.delete(curr.key);
				this._remove(curr);
			}
		}
		return this.data.size;
	}

	forEach(callback) {
		const iterator = this.it(entry => {
			callback(entry.key, entry.value); // todo: support thisArg parameter
			return true;
		});
		while (iterator.next()) { /* no-op */ }
	}

	get(key) {
		const entry = this.data.get(key);
		if (entry) {
			if (entry.expires && entry.expires < Game.time) {
				this.delete(key);
			} else {
				this._remove(entry);
				this._insert(entry);
				return entry.value;
			}
		}
		return null;
	}

	has(key) {
		const entry = this.data.get(key);
		if (entry) {
			if (entry.expires && entry.expires < Game.time) {
				this.delete(key);
			} else {
				return true;
			}
		}
		return false;
	}

	keys() {
		return this.it(entry => entry.key);
	}

	set(key, value) {
		let curr = this.data.get(key);
		if (curr) {
			this._remove(curr);
		} else {
			this.data.set(key, curr = {});
		}
		curr.key = key;
		curr.value = value;
		if (this.ttl) { curr.expires = Game.time + this.ttl; }
		this._insert(curr);
		this.evict();
		return this;
	}

	get size() {
		// run an eviction then we will report the correct size
		return this.evict();
	}

	values() {
		return this.it(entry => entry.value);
	}

	[Symbol.iterator]() {
		return this.it(entry => [entry.key, entry.value]);
	}

	*it(accessFn) {
		this.evict();
		let curr;
		for (curr = this.head; curr; curr = curr.next)
			yield accessFn(curr);
	}
	
	/**
	 * Remove entry `curr` from the linked list.
	 * @private
	 */
	_remove(curr) {
		if (!curr.prev) {
			this.head = curr.next;
		} else {
			curr.prev.next = curr.next;
		}
		if (!curr.next) {
			this.tail = curr.prev;
		} else {
			curr.next.prev = curr.prev;
		}
	}

	/**
	 * Insert entry `curr` into the head of the linked list.
	 * @private
	 */
	_insert(curr) {
		if (!this.head) {
			this.head = curr;
			this.tail = curr;
		} else {
			const node = this.head;
			curr.prev = node.prev;
			curr.next = node;
			if (!node.prev) {
				this.head = curr;
			} else {
				node.prev.next = curr;
			}
			node.prev = curr;
		}
	}
}

module.exports = LRU;