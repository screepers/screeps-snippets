"use strict";
// Tick length calculation by Kamots 17 januari 2019
// Provides global.tickTime as seconds
global.calcTickTime = function(tickSamples = 1000) { // Call this from 1st line of main loop. Can adjust samples used for calculation from there.
    let millis = Date.now();

    // Set some sane defaults
    if (typeof Memory.lastTickMillis == "undefined") Memory.lastTickMillis = millis - 1010;
    if (typeof Memory.lastTickTime == "undefined") Memory.lastTickTime = 1.01;
    if (typeof Memory.tickTimeCount == "undefined") Memory.tickTimeCount = 0;
    if (typeof Memory.tickTimeTotal == "undefined") Memory.tickTimeTotal = 0;
    
    let lastTickMillis = Number(Memory.lastTickMillis);
    let tickTimeCount = Number(Memory.tickTimeCount);
    let tickTimeTotal = Number(Memory.tickTimeTotal);

    if (tickTimeCount >= (tickSamples-1)) {
        tickTimeTotal += millis - lastTickMillis;
        tickTimeCount++;
        global.tickTime = (tickTimeTotal / tickTimeCount) / 1000;
        console.log("Calculated tickTime as", global.tickTime, "from", tickTimeCount, "samples.");
        Memory.lastTickTime = global.tickTime;
        Memory.tickTimeTotal = millis - lastTickMillis;
        Memory.tickTimeCount = 1;
        Memory.lastTickMillis = millis;
    } else { 
        global.tickTime = Number(Memory.lastTickTime);
        tickTimeTotal += millis - lastTickMillis;
        Memory.tickTimeTotal = tickTimeTotal;
        tickTimeCount++;
        Memory.tickTimeCount = tickTimeCount;
        Memory.lastTickMillis = millis;
    }
    return;
}