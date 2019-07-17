/* Posted August 11th, 2018 by @semperrabbit*/
/**
 * global.setTimeout()    - works like external to screeps except measured in ticks, not milliseconds
 * global.clearTimeout()  - works like external to screeps
 * 
 * global.setInterval()   - works like external to screeps except measured in ticks, not milliseconds
 * global.clearInterval() - works like external to screeps
 * 
 * global.runTimeout()    - required to run inside loop to force tick increment for all timeouts
 * 
 * @author:  SemperRabbit
 * @version: 1.2
 * @date:    180811
 *
 * NOTE: global resets will clear all timeouts and intervals...
 * 
 * setTimeout() acts as it regularly would in JS outside of screeps, except that it is measured in
 *   ticks as opposed to milliseconds. It returns a timeout ID, which can be cancelled via
 *   clearTimeout(id). runTimeout() is required to increment the tick count. setInterval() and
 *   clearInterval() work the same way.
 * 
 * Example:
 *   setInterval(()=>{console.log('every 3 ticks')}, 3);
 *
 *   var a = setTimeout(()=>{console.log('5 ticks from start')}, 5);
 *   clearTimeout(a) // removes the "5 ticks from start" timeout
 * 
 *   module.exports.loop = function() {
 *       runTimeout();
 *       // remainder of loop
 *   }
 * 
 * ChangeLog:
 *   v1.0 initial commit
 *   v1.1 refactored function storage from module scoped array to internal to the generator
 *   v1.2 added setInterval/clearInterval in addition to setTimeout/clearTimeout
 */



// Storage for timer generators
var timerStor = [];

// timer generator, calling function every time `ticks % count === 0`
function *timerGen(func, count, interval = false){
	var id = timerStor.length;
	var ticks = 0;
	yield id; // used to return the id to setTimeout() for registration in timerStor
	while(true){
	    ticks++;
		if(ticks % count === 0 && ticks !== 0){
		    if(!interval)
		        timerStor[id] = undefined;
			yield func(); // run the function
		} else {
			yield false; // do not run the function
		}
	}
}

// must be run inside the loop for the tick count to proceed
global.runTimeout = function runTimeout(){
	for(var i=0;i<timerStor.length;i++){
		if(!!timerStor[i]) // ensure generator exists
		    timerStor[i].next();
	}
}

// initialize a new generator and register it in `timerStor[]`
global.setTimeout = function setTimeout(func, time){
	var t = timerGen(func, time);
	var id = t.next().value;
	timerStor[id] = t;
	return id;
}
// initialize a new generator and register it in `timerStor[]`
global.setInterval = function setTimeout(func, time){
	var t = timerGen(func, time, true);
	var id = t.next().value;
	timerStor[id] = t;
	return id;
}

// removes timeout of "id" from activity. id is returned from setTimeout()
// the same function can be used for intervals and timeouts
global.clearTimeout = global.clearInterval= function(id){
    if(!!timerStor[id])
        timerStor[id]=undefined;
}