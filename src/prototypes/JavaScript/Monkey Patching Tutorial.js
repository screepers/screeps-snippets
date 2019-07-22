// helam 25 February 2017 at 04:57

// Monkey Patching Tutorial
// AUTHOR: Helam
// WARNING: Monkey patching is often considered bad practice and there are those
// that will tell you that you should NEVER do it, and there are good reasons for this.
// Monkey patching, while very powerful and convenient, is a dangerous practice that should
// not be taken lightly.
​
// Monkey patching is the practice of modifying the way that existing prototype functions operate.
​
// I will provide examples that will demonstrate a few of the infinite uses for monkey patching
// each example will try to build on the previous one, so you'll want to read through all of it
// to make sure you understand it fully.
​
// **********************************************
// Introduction - Adding functions to prototypes
// **********************************************
​
// To understand monkey patching it is important to understand that functions are/can be stored
// in variables just like numbers, objects, arrays, and strings. Creep functions like `.moveTo`,
// '.harvest', or '.withdraw' are all stored in variables belonging to the Creep prototype object.
// These functions can be accessed like so: 'Creep.prototype.moveTo', 'Creep.prototype.harvest', and 'Creep.prototype.withdraw'
// Any values that belong to the Creep prototype will be accessible from any Creep object. 
// This is why you are able to call 'creep.moveTo' on all of your creeps. 
​
// Because these functions are variables in an object just like any other, you can add new ones: 
Creep.prototype.sayHello = function() { 
    // in prototype functions, 'this' usually has the value of the object calling the function.
    // in this case that is whatever creep you are calling 'sayHello' on.
    this.say("Hello!"); 
}; // after this code, you can do 'creep.sayHello();' on any of your creeps and they will say "Hello!"
​
// And you can overwrite existing functions:
Creep.prototype.suicide = function() {
    this.say("NO WAY MAN");
};
// the above code overwrites the normal creep.suicide function so that instead of suiciding,
// the creep will voice his disagreement with the command.
​
// But.. what if we really need the creep to suicide? We no longer have the normal suicide function
// because we overwrote it with our own!!! (in game this is not permanent. It would regain its 
// original value on a global reset, this also means you can execute these code examples outside of your
// main loop, they dont need to be executed every tick)
​
// *********************************************
// EXAMPLE #1 - upgradeController - "Praise GCL"
// *********************************************
​
// Let's try another one but a little differently. We'll modify the `.upgradeController` function
// so that the creep says "Praise GCL" whenever it upgrades the controller. First, unlike what we 
// did with `.suicide`, we are going to store the original function so we don't lose it.
Creep.prototype.storedUpgradeController = Creep.prototype.upgradeController; // <---- STORE THE ORIGINAL FUNCTION
​
// now that the normal `.upgradeController` function is safely 
// stored in `.storedUpgradeController`, we can replace it with our own.
Creep.prototype.upgradeController = function() {
    this.say("Praise GCL");
};
// now that we have put in our own function for `.upgradeController`, our creeps will now praise GCL
// whenever we tell them to upgrade. The only issue now is they wont actually upgrade the controller.
​
// To fix this so they will still upgrade the controller, we can call the stored version 
// of the original function in our new function. Note that we are including an argument this time
// because the original `.upgradeController` function requires that you pass a room controller as an argument.
Creep.prototype.upgradeController = function(controller) {
    this.say("Praise GCL");
    this.storedUpgradeController(controller); // <----- CALL THE ORIGINAL FUNCTION
};
// Now we have successfully modified the `.upgradeController` function so it will still upgrade the controller
// AND praise GCL. There is just one problem left in this function, and it is a common mistake in monkey patching.
​
// You should always remember to return the value returned by the original function, in case 
// other parts of your code or the game engine code rely on that return value. Basically you
// want your modified function to behave as closely to the original function as possible in order
// to be safe. You can of course violate this if you wish, just be aware of what you are doing.
Creep.prototype.upgradeController = function(controller) {
    this.say("Praise GCL");
    return this.storedUpgradeController(controller); // <---- RETURN THE ORIGINAL VALUE
};
​
// **********************************
// EXAMPLE #2 - moveTo - Measure CPU
// **********************************
​
// Store the original function. It is a common naming convention in JS
// to put an underscore in front of a variable name if the variable is
// meant to be "private" (only meant to be called by other internal functions)
// we'll use this naming convention to store the original functions from now on.
Creep.prototype._moveTo = Creep.prototype.moveTo;
​
// Now we'll modify the moveTo function to record how much cpu each creep is using for `.moveTo` calls
​
// This example is different because `.moveTo` can accept different arguments, and our
// monkey patched version should be able to accept the same arguments if we are being
// safe. The original function can take either (x, y, [opts]) OR (target, [opts])
// You have a few options to handle this:
​
// option #1 use your own arguments - not recommended as it is easy to make a mistake
// and accidentally leave out an argument or use them incorrectly.
Creep.prototype.moveTo = function(myArg1, myArg2, myArg3) {
    console.log(`My monkey patched moveTo with my own arguments!`);
    
    let startCpu = Game.cpu.getUsed();
    let returnValue = this._moveTo(myArg1, myArg2, myArg3); // <-- store return value of original function
    let endCpu = Game.cpu.getUsed();
    
    let used = endCpu - startCpu;
    
    if (!this.memory.moveToCPU) this.memory.moveToCPU = 0;
    
    this.memory.moveToCPU += used;
    
    return returnValue; // <-- return original value
};
​
// option #2 - use the `arguments` object available in every function
// this is the recommended option if you do not need to modify or use any of the arguments
// The `arguments` object behaves somewhat like an array but is not a proper array. 
// Use option 3 if you want an array of the arguments instead
Creep.prototype.moveTo = function() {
    console.log(`My monkey patched moveTo using the arguments object!`);
    
    let startCpu = Game.cpu.getUsed();
    let returnValue = this._moveTo.apply(this, arguments); // there is a short description of Function.apply() later
    let endCpu = Game.cpu.getUsed();
    
    let used = endCpu - startCpu;
    
    if (!this.memory.moveToCPU) this.memory.moveToCPU = 0;
    
    this.memory.moveToCPU += used;
    
    return returnValue;
};
​
// option #3 - use "rest parameters" to get an array of the arguments passed into the funtion
Creep.prototype.moveTo = function(...myArgumentsArray) {
    console.log(`My monkey patched moveTo using rest parameters!`);
    
    let startCpu = Game.cpu.getUsed();
    let returnValue = this._moveTo.apply(this, myArgumentsArray); // <--
    let endCpu = Game.cpu.getUsed();
    
    let used = endCpu - startCpu;
    
    if (!this.memory.moveToCPU) this.memory.moveToCPU = 0;
    
    this.memory.moveToCPU += used;
    
    return returnValue;
};
​
// Function.apply(thisArg, argumentsArray) calls a function with the specified `this` value
// and passes each element of the arguments array as an argument to the function.
// for example: 
    var name = "Helam";
    console.log("Hello my name is: ", name);
// will do the same thing as:
    var name = "Helam";
    var myArguments = ["Hello my name is: ", name];
    console.log.apply(console, myArguments);
​
​
// ********************************************************
// Now you know how to monkey patch! Be careful!
// Below are a couple examples that could be used in game
// VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
​
​
// Monkey patch Spawn.createCreep to automatically name your creeps.
// When you have a large amount of creeps, using the default naming
// can consume an alarming amount of CPU (Can take dozens of CPU if 
// you have a large number of creeps). Naming them yourself can reduce 
// your CPU usage.
StructureSpawn.prototype._createCreep = StructureSpawn.prototype.createCreep; // <-- store original
​
// the original signature: createCreep(body, [name], [memory])
StructureSpawn.prototype.createCreep = function(body, memory = {}) { // <-- our new signature without the name argument
    if (!Memory.myCreepNameCounter) Memory.myCreepNameCounter = 0;
    
    // now we need to generate a name and make sure it hasnt been taken
    let name;
    let canCreate;
    do {
        name = `c${Memory.creepNameCounter++}`;
        canCreate = this.canCreateCreep(body, name);
    } while (canCreate === ERR_NAME_EXISTS);
    
    // now we call the original function passing in our generated name and returning the value
    return this._createCreep(body, name, memory);
};
​
​
// Monkey Patch Observer.observeRoom so that subsequent calls to it in
// the same tick on the same observer will return ERR_BUSY instead of 
// overriding the previous call
StructureObserver.prototype._observeRoom = StructureObserver.prototype.observeRoom;
StructureObserver.prototype.observeRoom = function() {
    if (this.observing) 
        return ERR_BUSY;
    let observeResult = this._observeRoom.apply(this, arguments);
    if (observeResult === OK)
        this.observing = roomName;
    return observeResult;
};