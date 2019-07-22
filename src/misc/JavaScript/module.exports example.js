// maxion 13 August 2017 at 20:39

// in module.js
var thing = {
	foo: function() {
		console.log('hello world');
	},
	bar: function(param = 'world') { // default value if param is undefined (or not passed to the function)
		console.log('hello ' + param);
	}
};
module.exports = thing;
​
// in main.js above the loop
var functionModule = require('module.js');
​
// inside loop
functionModule.foo();
functionModule.bar('human');