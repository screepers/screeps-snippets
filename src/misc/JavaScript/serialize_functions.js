/* DOCS: These functions serialize/deserialize a function. That is, they
 * convert a function to a string and back. This allows functions to be stored
 * in the global Memory object, so individual creeps can have unique callbacks.
 * 
 * Note that any tabs, newlines and carriage returns are removed to minimize
 * space used, while space-characters are preserved. If you use spaces for
 * indentation, they will be captured as part of the string, but won't effect
 * the function's execution. Probably.
 * 
 * I give no guarantees as to the efficiency and application of this system,
 * other than that the functions presented work correctly within the domain
 * outlined above.
 * 
 * Added to screeps-snippets by Kayne Ruse (Ratstail91)
*/

function serializeFunction(func) {
	return func.toString().replace(/[\t\n\r]/g, '');
}

function deserializeFunction(str) {
	return new Function('return ' + str)();
}

module.exports = {
	serializeFunction,
	deserializeFunction
};