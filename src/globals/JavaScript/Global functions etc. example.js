// maxion 15 October 2017 at 05:45

// globals.js
global.MY_CONSTANT = 'String constant.';
global.exampleFunc = function() {
	console.log('This is an example.');
};
global.otherFunc = function(prop = 'default value') {
	console.log(MY_CONSTANT + ' ' + prop);
};
​
// main.js above the loop
require('globals');