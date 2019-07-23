/**
 * Posted 18 September 2017 by @warinternal
 * 
 * Loops over only functions on the prototype and
 * passes them to a callback function.
 */
function forEachFn(proto, cb) {
	var names = Object.getOwnPropertyNames(proto);
	var name,i,desc;
	for(i=0; i<names.length; i++) {
		name = names[i];
		desc = Object.getOwnPropertyDescriptor(proto, name);
		if(desc.get !== undefined || desc.set !== undefined)		
			continue;				
		cb(name,proto);
	}
}

/** Example: Adding logging to all creep functions */
forEachFn(Creep.prototype, function(name,proto) {
	let original = proto[name];
	proto[name] = function() {		
		// console.log(`Calling ${name} on ${this.name}`);
		let status = original.apply(this,arguments);
		// apply your overrides here
		return status;
	};
});