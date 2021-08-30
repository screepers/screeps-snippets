// bunkerLayout.ts
// A library for processing human-readable bunker layout maps

/**
 * Originally posted to Slack on 19 October 2017 by @sparr
 * Ported from JS to TS and improved by @sparr in August 2021
 */

// An example layout, one array for buildings, one for the RCL at which to build them
// let bunkerStructures : string[] = [      // let bunkerLevels : string[] = [
//     "  ..E...E..  ",                     //     "  445233555  ",
//     " .EE.EEE.EE. ",                     //     " 44422233555 ",
//     ".EE.E.E.E.EE.",                     //     "4442212233555",
//     ".E.EEA.EEE.E.",                     //     "4444211335555",
//     "E.EEE.T.EEE.E",                     //     "6444413335556",
//     ".E.E.T.T.A.E.",                     //     "6664455757666",
//     ".EE.NSKMP.E.E",                     //     "6666N456P6666",
//     ".E.E.T.T.E.E.",                     //     "7777686866666",
//     "E.EEE.T.OLL..",                     //     "7777768686766",
//     ".E.EEA.ELL.L.",                     //     "7777787866677",
//     ".EE.E.E.L.LL.",                     //     "7788888888877",
//     " .EE.E.E.LL. ",                     //     " 88888888888 ",
//     "  ..E.E....  ",                     //     "  888888888  ",
// ];                                       // ];
// A similar structure might describe rampart locations and levels

// example usage:
// BunkerLayout.getLayout(bunkerStructures,{rcl:6})
// returns a description of all the structures up to RCL 6:
// {rcl:6,buildings:{road:{pos:[{x:2,y:0},...]},extension:{pos:[{x:4,y:0},...]},spawn:{pos:[{x:5,y:4}]},...}}
// intended to comply with the schema used by https://screeps.admon.dev/building-planner

// maps chacters in the layout arrays to structures
const layoutMappingForward : { [symbol:string]:BuildableStructureConstant } = {
    'A': STRUCTURE_SPAWN,
    'N': STRUCTURE_NUKER,
    'K': STRUCTURE_LINK,
    'L': STRUCTURE_LAB,
    'E': STRUCTURE_EXTENSION,
    'S': STRUCTURE_STORAGE,
    'T': STRUCTURE_TOWER,
    'O': STRUCTURE_OBSERVER,
    'M': STRUCTURE_TERMINAL,
    'P': STRUCTURE_POWER_SPAWN,
    '.': STRUCTURE_ROAD,
    'C': STRUCTURE_CONTAINER,
    'R': STRUCTURE_RAMPART,
    'W': STRUCTURE_WALL,
    'X': STRUCTURE_EXTRACTOR,
    'F': STRUCTURE_FACTORY,
};
// maps structures to characters
const layoutMappingReverse : { [key in BuildableStructureConstant]:string } = _.invert(layoutMappingForward);
// lowercase letters are structure+road
for(let letter in layoutMappingForward) {
    layoutMappingForward[letter.toLocaleLowerCase()]=layoutMappingForward[letter];
}

export interface BunkerLayoutPos {
    x: number,
    y: number,
}

export interface BunkerLayoutArrayEntry extends BunkerLayoutPos {
    rcl?: number,
    structureType?: BuildableStructureConstant,
};


/**
 * Get all the positions from a layout, optionally for a specific structure type(s), optionally for a specific RCL, optionally as an array
 * @param  {String[]} [layout] a layout map with structure letters
 * @param  {BuildableStructureConstant|BuildableStructureConstant[]} [params.structureType] structure(s) to return, optional
 * @param  {String[]} [params.levelLayout] a layout map with level numbers, optional
 * @param  {Number} [params.rcl] room control level, optional
 * @param  {Boolean} [params.asArray=false] results as flat array, optional
 * @return {BunkerLayoutResults} object 
 * @return {{x:Number,y:Number,stuctureType?:String,level?:Number}[]} array of coordinate+type?+level? objects
 */
 export interface BunkerGetLayoutParams {
    structureType?: BuildableStructureConstant | BuildableStructureConstant[],
    levelLayout?: string[],
    rcl?: number,
    asArray?: boolean,
}
export interface BunkerLayoutResults {
    rcl?: number,
    buildings:Partial<{
        [structureType in BuildableStructureConstant]:{
            pos:BunkerLayoutPos[]
        }
    }>,
}
function getLayout(layout: string[], params?: BunkerGetLayoutParams): any
{
    const height = layout.length;
    const width = layout[0].length;
    params||={};
    if(typeof(params.structureType) == "string") params.structureType = [params.structureType];
    // convert [road,container,extension] into {.:road,C:container,E:extension}
    const structureTypesMap = new Map((params.structureType||[]).map((s:BuildableStructureConstant)=>[layoutMappingReverse[s],s]));
    const results: BunkerLayoutResults = {buildings:{}};
    if(params.rcl) results.rcl = params.rcl;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (params.levelLayout && params.rcl && params.rcl < parseInt(params.levelLayout[y][x])) continue;
            const layoutChar = layout[y][x];
            const structureChar = layoutChar.toUpperCase();
            const structureType = layoutMappingForward[structureChar];
            if(structureType) {
                const pos = {x:x, y:y};
                if(structureTypesMap.size==0 || structureTypesMap.get(structureChar)) {
                    (results.buildings[structureType]||={pos:[]}).pos.push(pos);
                }
                if (layoutChar != structureChar && (structureTypesMap.size == 0 || structureTypesMap.get('.'))) {
                    // emit a road if the character was the wrong case and we're doing roads or everything
                    (results.buildings[STRUCTURE_ROAD]||={pos:[]}).pos.push(pos);
                }
            }
        }
    }

    if (!params.asArray) return results;

    const resultsArray: BunkerLayoutArrayEntry[] = [];
    for(let structureType in results.buildings) {
        for(let pos of results.buildings[structureType as BuildableStructureConstant]!.pos) {
            const entry: BunkerLayoutArrayEntry = {x:pos.x, y:pos.y, structureType:structureType as BuildableStructureConstant};
            if (!params.rcl && params.levelLayout) entry.rcl = parseInt(params.levelLayout[pos.y][pos.x]);
            resultsArray.push(entry);
        }
    }
    return resultsArray;
};

const BunkerLayout = {
    layoutMappingForward: layoutMappingForward,
    layoutMappingReverse: layoutMappingReverse,
    getLayout: getLayout,
}

export default BunkerLayout;