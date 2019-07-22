
/** 
 * Posted 23 April 2019 by @warinternal
 * os.ds.bitset.js 
 */
'use strict';

exports.BitSet = class {
	/**
	 * Defaults to 1 unsigned 32 bit int
	 * @param {*} val 
	 */
	constructor(val = 1) {
		this.store = new Uint32Array(val);
		this.width = this.store.BYTES_PER_ELEMENT * 8;
	}

	calcIndex(bit) {
		return [~~(bit / this.width), bit % this.width];
	}

	isset(bit) {
		const [b, i] = this.calcIndex(bit);
		return !!(this.store[b] & (1 << i));
	}

	set(bit) {
		const [b, i] = this.calcIndex(bit);
		if (b >= this.store.length)
			this.resize(b + 1);
		this.store[b] |= (1 << i);
		return this;
	}

	unset(bit) {
		const [b, i] = this.calcIndex(bit);
		this.store[b] &= ~(1 << i);
		return this;
	}

	resize(length = 1) {
		const old = this.store;
		this.store = new Uint32Array(length);
		this.store.set(old);
		return this;
	}

	clear() {
		this.store = new Uint32Array(0);
		return this;
	}

	static from(val) {
		return new this(val);
	}

	toString() {
		return `[BitSet ${this.store.length}]`;
	}
};