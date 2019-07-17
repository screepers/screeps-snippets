// dissi 29 November 2016 at 07:15

global.CACHE_MEMORY_SEGMENT = {};
global.CACHE_MEMORY_SEGMENT_VERSION = {};
global.CACHE_MEMORY_SEGMENT_DIRTY = {};

global.MEMSEG_ROUTES_matrixes = "MatrixesSwap";
var preLoadOnInit = [
    MEMSEG_ROUTES_matrixes
];
var tickSaved = Game.time - 1;
global.initMemorySegments = function() {
    var cpuNow = Game.cpu.getUsed();
    Memory;
    reportDuration("MEMLOAD_ALL", Game.cpu.getUsed() - cpuNow);
    for (var i = 0; i < preLoadOnInit.length; i++) {
        getMemorySegment(preLoadOnInit[i]);
    }
}

global.getMemorySegment = function(theSegmentName) {
    if (!Memory.segments) {
        Memory.segments = {};
    }
    if (!Memory.segments[theSegmentName]) {
        return {};
    }
    if (!CACHE_MEMORY_SEGMENT[theSegmentName] || CACHE_MEMORY_SEGMENT_VERSION[theSegmentName] != getMemorySegmentVersion(theSegmentName)) {
        var cpuNow = Game.cpu.getUsed();
        CACHE_MEMORY_SEGMENT[theSegmentName] = JSON.parse(Memory.segments[theSegmentName]);
        CACHE_MEMORY_SEGMENT_VERSION[theSegmentName] = getMemorySegmentVersion(theSegmentName);
        var used = Game.cpu.getUsed() - cpuNow;
        reportDuration("MEMLOAD_" + theSegmentName, used);
        log("Loaded memory segment: [" + theSegmentName + "] took " + used.toFixed(2) + "ms", "memstore")
    }
    return CACHE_MEMORY_SEGMENT[theSegmentName];
}

global.getMemorySegmentVersion = function(theSegmentName) {
    if (!Memory.segmentsBookKeeping) {
        Memory.segmentsBookKeeping = {};
    }
    if (!Memory.segmentsBookKeeping[theSegmentName]) {
        Memory.segmentsBookKeeping[theSegmentName] = 0;
    }
    return Memory.segmentsBookKeeping[theSegmentName];
}

global.increaseMemorySegmentVersion = function(theSegmentName) {
    Memory.segmentsBookKeeping[theSegmentName]++;
}

global.storeMemorySegment = function(theSegmentName, theData) {
    if (!Memory.segments) {
        Memory.segments = {};
    }

    CACHE_MEMORY_SEGMENT[theSegmentName] = theData;
    if (tickSaved == Game.time) // after game loop access
    {
        handleSaveOfDirtySegment(theSegmentName);
    } else {
        CACHE_MEMORY_SEGMENT_DIRTY[theSegmentName] = true;
    }
}

global.setMemoryDelayStore = function() {
    tickSaved = Game.time - 1;
}

global.storeDirtyMemory = function() {
    for (var key in CACHE_MEMORY_SEGMENT_DIRTY) {
        handleSaveOfDirtySegment(key);
    }
    CACHE_MEMORY_SEGMENT_DIRTY = {};
    tickSaved = Game.time;
}

function handleSaveOfDirtySegment(theSegmentName) {
    var cpuNow = Game.cpu.getUsed();
    Memory.segments[theSegmentName] = JSON.stringify(CACHE_MEMORY_SEGMENT[theSegmentName]);
    increaseMemorySegmentVersion(theSegmentName);
    var used = Game.cpu.getUsed() - cpuNow;
    reportDuration("MEMSTORE_" + theSegmentName, used);
    log("Stored memory segment: [" + theSegmentName + "] took " + used.toFixed(2) + "ms", "memstore");
}


function log(theMessage, theCategory) {
    console.log("[" + theCategory + "] - " + theMessage);
}

function reportDuration(theOperationName, theUsedCpu); {
    log("Operation [" + theOperationName + "] took [" + theUsedCpu.toFixed(2) + "] CPU", "durationReport")
}