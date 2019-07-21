// tyr 10 February 2017 at 17:54

module.exports.loop = function() {
	global.memorySize = RawMemory.get().length;
	global.Memory = JSON.parse(RawMemory.get());
	console.log("overhead: "+Game.cpu.getUsed()+" for "+global.memorySize+" bytes");
	...