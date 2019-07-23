/**
 * Posted 7 October 2018 by @mototroller
 * 
 * Author:  Mototroller
 * Usage:   copy-paste
 * Licence: MIT
 * Version: 1.0
 *
 * Description:
 *  Simple prototype extention which allows every room object to use
 *  creep.say() method analogue: popup bubble with given text will be shown.
 *  Uses RoomVisual, so is should be enabled in GUI (enabled by default).
 */

/// @param {String} what - message will be displayed
RoomObject.prototype.say = function(what) {
    this.room.visual.line(this.pos.x, this.pos.y, this.pos.x + 1 - 0.2, this.pos.y - 1, {
        // Line from object to message bubble
        color: "#eeeeee",
        opacity: 0.9,
        width: 0.1
    }).circle(this.pos, {
        // Small dot marker at the top of object
        fill: "#aaffaa",
        opacity: 0.9
    }).text(what, this.pos.x + 1, this.pos.y - 1, {
        // Fake message, used to align background (to make black border)
        color: "black",
        opacity: 0.9,
        align: "left",
        font: "bold 0.6 Arial",
        backgroundColor: "black",
        backgroundPadding: 0.3
    }).text(what, this.pos.x + 1, this.pos.y - 1, {
        // Real message
        color: "black",
        opacity: 0.9,
        align: "left",
        font: "bold 0.6 Arial",
        backgroundColor: "#eeeeee",
        backgroundPadding: 0.2
    });
}
