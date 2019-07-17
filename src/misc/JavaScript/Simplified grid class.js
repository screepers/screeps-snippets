// warinternal 1 February 2017 at 04:06
/**
 * Grid.js
 */
"use strict";

class Grid {
  /** @var height */
  /** @var width */

  /**
   * @param int
   * @param int
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.arr = [];
  }

  /**
   * @param int
   * @param int
   */
  set(x, y, val) {
    if (x > this.width || y > this.height)
      throw new RangeError("Out of bounds");
    let pos = y * this.height + x;
    this.arr[pos] = val;
    return this;
  }

  /**
   * @param int
   * @param int
   */
  get(x, y) {
    let pos = y * this.height + x;
    return this.arr[pos];
  }

  /**
   *
   */
  toString() {
    return this.arr.toString();
  }
}

module.exports = Grid;
