/* Posted Oct 23rd, 2016 by @semperrabbit*/
/* This code gives a simple example of prototyping and allows a creep to say multiple parts of a single string*/

/* require('util.fun.singing');
 * NOTES: sentences are broken down using | to seperate pieces
 *        public will default to true
 * 
 * Creep.prototype.sing(sentence, public)
 *   creep will sing a different part of sentence per tick
 */

Creep.prototype.sing = function(sentence, public){
	if(public === undefined)public = true;
	let words = sentence.split("|");
	this.say(words[Game.time % words.length], public);
}