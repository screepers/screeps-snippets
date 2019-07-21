// Doctor Zuber 23 July 2018 at 07:41

// warning, this does exactly what it says. it removes all memory
// and leaves you with the base 4 empty objects.
​
function resetMemory(){
	RawMemory.set('{}');
	Memory.creeps = {};
	Memory.rooms = {};
	Memory.flags = {};
	Memory.spawns = {};
}