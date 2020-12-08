# screeps-snippets
This repository is for saving pinned snippets from the [#client-abuse](https://screeps.slack.com/messages/client-abuse/), [#help](https://screeps.slack.com/messages/help/), [#logging](https://screeps.slack.com/messages/logging/), [#share-thy-code](https://screeps.slack.com/messages/share-thy-code/) slack channels and any other important slack snippets from elsewhere for posterity.

If you want to contribute, please PR your additions.

The folder structure is broken into 6 primary categories:

- client-abuse
- classes
- globals
- logging
- misc
- prototypes

Each category is further divided into various languages

- JavaScript
- TypeScript
- Kotlin (only some categories)

Other languages are welcome (e.g. kotalin) if people want to share their code. Simply throw the file in a new language folder in the primary category.

For pull requests, we use [GitConsensus](https://www.gitconsensus.com/) to allow the community to vote whether to merge or not. Currently, any PR with 6+ votes and 75% of votes being upvotes will be merged 10 days after the final action on the PR. Quick merges occur immediately after 18 upvotes. See the repo's [.gitconsensus.yaml](./.gitconsensus.yaml) for all the current rules.

## Index of all current snippets

### classes
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| [bitSet.js](src/classes/JavaScript/bitSet.js) | warinternal| bit set class|
|JS| [class.RoomVisualCache_module.js](src/classes/JavaScript/class.RoomVisualCache_module.js)| semperrabbit|RoomVisual cache|
|JS| [creepsSingingSongs.js](src/classes/JavaScript/creepsSingingSongs.js)| Lucifer| creeps singing songs|
|JS| [Es6LRUMapWithSizeAndTtl.js](src/classes/JavaScript/Es6LRUMapWithSizeAndTtl.js) | warinternal| A cache that can exhibit both least recently used (LRU) and max time to live (TTL) eviction policies.|
|JS| [WorldPosition.js](src/classes/JavaScript/WorldPosition.js)| warinternal| Uniform screeps world position with E0S0 as origin.|

### client-abuse
  
| folder | name | author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| [inject_script_tag.js](/src/client-abuse/JavaScript/inject_script_tag.js)|semperrabbit| injects script tag|
|JS| [LoAN_tampermonkey_inject_for_any_client.js](/src/client-abuse/JavaScript/LoAN_tampermonkey_inject_for_any_client.js) | semperrabbit| will attempt to load the LoAN tampermonkey code each global reset.|
|JS| [run_window.onTick()\_inside_the_client_per_tick.js](/src/client-abuse/JavaScript/run_window.onTick()\_inside_the_client_per_tick.js) |semperrabbit| run window.onTick() inside the client per tick|
|JS| [saveAlliancesInMemory.js](/src/client-abuse/JavaScript/saveAlliancesInMemory.js) |semperrabbit|Inject alliance data into Memory.alliances|
|JS| [util.inject.Birthday.js](/src/client-abuse/JavaScript/util.inject.Birthday.js) |semperrabbit|shows room object birth dates based on their id|
|JS| [util.inject.RoomTracker.js](/src/client-abuse/JavaScript/util.inject.RoomTracker.js) |semperrabbit|Allows for the retrieval of rooms currently being viewed in the client from in-game code|
|JS| [util.inject.RoomViewNotifier.js](/src/client-abuse/JavaScript/util.inject.RoomViewNotifier.js) |semperrabbit| adds currently viewed room to memory |
|JS| [util.inject.TEMPLATE.js](/src/client-abuse/JavaScript/util.inject.TEMPLATE.js) |semperrabbit|template for injections|

### globals
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| [adjust_CPU_limit_based_on_bucket_levels.js](/src/globals/JavaScript/adjust_CPU_limit_based_on_bucket_levels.js) |semperrabbit|Adjust your CPU limit per tick based on current and target bucket levels|
|JS| [boostComponentsObject.js](/src/globals/JavaScript/boostComponentsObject.js) |shibdib| boost components |
|JS| [calculateTickTimeInGame.js](/src/globals/JavaScript/calculateTickTimeInGame.js) |Kamots |Provides global.tickTime as seconds|
|JS| [command to clear in-game console.js](/src/globals/JavaScript/command%20to%20clear%20in-game%20console.js) |GimmeCookies|Clear the in-game console|
|JS| [determineFileFunctionLineWithinCode.js](/src/globals/JavaScript/determineFileFunctionLineWithinCode.js) |knightshade| determine file, function, line within code|
|JS| [Global functions etc. example.js](/src/globals/JavaScript/Global%20functions%20etc.%20example.js) |maxion| example on how to use global |
|JS| [hasRespawned.js](/src/globals/JavaScript/hasRespawned.js) |semperrabbit| check if you just respawned|
|JS| [optimizedIsActive.js](/src/globals/JavaScript/optimizedIsActive.js) | tigga | a better OwnedStructure.isActive()|
|JS| [resourceColors.js](/src/globals/JavaScript/resourceColors.js) | engineeryo| hex color codes for minerals, energy and power |
|JS| [respawn assist to clear memory and flags.js](/src/globals/JavaScript/respawn%20assist%20to%20clear%20memory%20and%20flags.js) |semperrabbit|clears memory and flags|
|JS| [Reverse lookup tables for errors, colors, and resources.js](/src/globals/JavaScript/Reverse%20lookup%20tables%20for%20errors,%20colors,%20and%20resources.js) |warinternal| reverse lookup tables for errors colors and resources|
|JS| [setTimeout_setInterval.js](/src/globals/JavaScript/setTimeout_setInterval.js) |semperrabbit| setTimeout() / setInterval() from JS, but it uses screeps ticks instead of ms|
|JS| [to get memory size.js](/src/globals/JavaScript/to%20get%20memory%20size.js) |tyr| get memory size|
|JS| [voiceConsole.js](/src/globals/JavaScript/voiceConsole.js) |stybbe| say() but for real|
|JS| [tool.marketCalculator.js](/src/globals/JavaScript/tool.marketCalculator.js) | BoosterKevin | help make decision about producing commodity [documentation](https://github.com/RaymondJiangkw/screeps_script/blob/master/src/tool/marketCalculator/README.md) |
|| [Cached dynamic properties.js](/src/globals/Cached%20dynamic%20properties.js) |warinternal| cached properties|
|| [Entity Message Bus.js](/src/globals/Entity%20Message%20Bus.js) |warinternal|receive messages on room object|
|| [Memory segment emulation.js](/src/globals/Memory%20segment%20emulation.js) |dissi|segment emulator|
|| [queueAction() system.js](/src/globals/queueAction()%20system.js) |Helam|queue actions|
|| [upkeep_costs.js](/src/globals/upkeep_costs.js) |warinternal| constants for upkeep of decaying structures|


### logging
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
| - | - | - | - |

### misc
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| [actually commented evil tower code.js](/src/misc/JavaScript/actually%20commented%20evil%20tower%20code.js) | daboross| lodash chain tower code|
|JS| [bunkerLayoutsHumanReadable.js](/src/misc/JavaScript/bunkerLayoutsHumanReadable.js) |sparr| readable bunker layouts sample|
|JS| [Calculate Cost of a Mine.js](/src/misc/JavaScript/Calculate%20Cost%20of%20a%20Mine.js) |Gankdalf| mining cost calculations|
|JS| [Check if room is a source keeper room.js](/src/misc/JavaScript/Check%20if%20room%20is%20a%20source%20keeper%20room.js) |issacar|check if room is a source keeper room|
|JS| [colors.js](/src/misc/JavaScript/colors.js) |dissi| visualize percentage with colors|
|JS| [get room type without visibility(but regex^^).js](/src/misc/JavaScript/get%20room%20type%20without%20visibility%20(but%20regex^^).js) |enrico|get room type without visibility|
|JS| [Global Tracking.js](/src/misc/JavaScript/Global%20Tracking.js) |ags131|track global age|
|JS| [how to delete the memory of dead creeps (in memoriam!).js](/src/misc/JavaScript/how%20to%20delete%20the%20memory%20of%20dead%20creeps%20(in%20memoriam!).js) |artritus|remove memory of dead creeps|
|JS| [Memory Cache.js](/src/misc/JavaScript/Memory%20Cache.js) |postcrafter|memory hack|
|JS| [minCutWallRampartsPlacement.js](/src/misc/JavaScript/minCutWallRampartsPlacement.js) |saruss|calculate minCut in a room|
|JS| [Minimal Starting AI.js](/src/misc/JavaScript/Minimal%20Starting%20AI.js) |WolfWings|example bot starting point|
|JS| [module.exports example.js](/src/misc/JavaScript/module.exports%20example.js) |maxion|example on how to use module.exports |
|JS| [moveTo version supporting raw PathFinder arguments, and a moveByPath which directly reads serialized strings.js](/src/misc/JavaScript/moveTo%20version%20supporting%20raw%20PathFinder%20arguments,%20and%20a%20moveByPath%20which%20directly%20reads%20serialized%20strings.js) |daboross|see name|
|JS| [OwnedStructure Memory.js](/src/misc/JavaScript/OwnedStructure%20Memory.js) |warinternal|structure memory|
|JS| [powerCreepChatter.js](/src/misc/JavaScript/powerCreepChatter.js) |kittytack|power creeps saying things|
|JS| [protocolBufferStorage.js](/src/misc/JavaScript/protocolBufferStorage.js) |daboross|metadata storage|
|JS| [pushdownAutomataStateMachine.js](/src/misc/JavaScript/pushdownAutomataStateMachine.js) |warinternal|PDA implementation|
|JS| [Remote mining generator.js](/src/misc/JavaScript/Remote%20mining%20generator.js) |domnomnom|generates a remote mine setup|
|JS| [Reset Memory to default.js](/src/misc/JavaScript/Reset%20Memory%20to%20default.js) |Doctor Zuber| clears memory|
|JS| [roomDescribe.js](/src/misc/JavaScript/roomDescribe.js) |engineeryo|get room type from room name|
|JS| [screeps_astar.js](/src/misc/JavaScript/screeps_astar.js) |tedivm|a\* adapted to screeps|
|JS| [simple benchmarks.js](/src/misc/JavaScript/Simple%20benchmarks.js) |warinternal|Simple benchmark test with sanity check|
|JS| [Simplified grid class.js](/src/misc/JavaScript/Simplified%20grid%20class.js) |warinternal|simple grid class|
|JS| [sos_lib_crypto.js](/src/misc/JavaScript/sos_lib_crypto.js) |tedivm|crypto library for screeps|
|JS| [String encryption.js](/src/misc/JavaScript/String%20encryption.js) |warinternal|vernam chiper implementation|
|JS| [Uint8ArrayConversion.js](/src/misc/JavaScript/Uint8ArrayConversion.js) |daboross|encoding and decoding strings to uint8 arrays for storage|
|JS| [Unicode directional arrows.js](/src/misc/JavaScript/Unicode%20directional%20arrows.js) |warinternal|hex codes for unicode arrows for all directions|
|JS| [WorldPosition uniform global coordinate system.js](/src/misc/JavaScript/WorldPosition%20uniform%20global%20coordinate%20system.js) |warinternal|Uniform screeps world position with E0S0 as origin.|
|TS| [Creep intent tracker.ts](/src/misc/TypeScript/Creep%20intent%20tracker.ts) |unfleshedone|intent tracker implementation|
|TS| [moving.average.ts](/src/misc/TypeScript/moving.average.ts) |unsleshedone|moving average implementation|
|TS| [Typescript roomScan.ts](/src/misc/TypeScript/Typescript%20roomScan.ts) |crzytrane|room scanner?|
|| [migrate room to sim.md](/src/misc/migrate%20room%20to%20sim.md) |semperrabbit|how to migrate room to sim|
|| [screeps body calculator.md](/src/misc/screeps%20body%20calculator.md) |nitroevil|link to creep calculator|
|KT| [DistanceTransform](src/misc/Kotlin/DistanceTransform/) |Vipo|Algoritm for finding open areas in rooms|
|KT| [MinCut.kt](/src/misc/Kotlin/MinCut/) | Vipo | Code for calculating the minCut in a room |
|KT| [VipoOS](/src/misc/Kotlin/VipoOS/) |Vipo|Example of a tiny OS solution for Screeps, written in Kotlin|

### prototypes
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS/Creep| [Creep action error handler.js](/src/prototypes/JavaScript/Creep/Creep%20action%20error%20handler.js) |warinternal| log creep action error codes|
|JS/Creep| [Creep.getOffExit.js](/src/prototypes/JavaScript/Creep/Creep.getOffExit.js) | engineeryo| move creep of room exits|
|JS/Creep| [Freshly minted getActiveBodyparts accounting for boosts!.js](/src/prototypes/JavaScript/Creep/Freshly%20minted%20getActiveBodyparts%20accounting%20for%20boosts!.js) |daboross|see name|
|JS/Creep| [Idle_Suspend for creeps.js](/src/prototypes/JavaScript/Creep/Idle_Suspend%20for%20creeps.js) |proximo|idle creeps for a certain amount of ticks|
|JS/Creep| [prototype.Creep.moveToStandByPos.js](/src/prototypes/JavaScript/Creep/prototype.Creep.moveToStandByPos.js) | semperrabbit|park creeps in their parking spots |
|JS/Creep| [untitled_activeBodyparts.js](/src/prototypes/JavaScript/Creep/untitled_activeBodyparts.js) |proximo|optimized Creep.getActiveBodyparts()|
|JS/Creep| [util.fun.singing.js](/src/prototypes/JavaScript/Creep/util.fun.singing.js) |semperrabbit|creeps singing|
|JS/Room| [prototype.Room.structures.js](/src/prototypes/JavaScript/Room/prototype.Room.structures.js) |semperrabbit|extends Room prototype with structures, also caching them|
|JS/Room| [Room.mineral.js](/src/prototypes/JavaScript/Room/Room.mineral.js) |Helam|extends Room prototype with a mineral property including caching|
|JS/RoomObject| [Generalized target locking (with examples).js](/src/prototypes/JavaScript/RoomObject/Generalized%20target%20locking%20(with%20examples).js) |warinternal|target locking for actors with memory|
|JS/RoomObject| [lookForNear.js](/src/prototypes/JavaScript/RoomObject/lookForNear.js) |warinternal|extends RoomObject with .lookForNear()|
|JS/RoomObject| [lookNear.js](/src/prototypes/JavaScript/RoomObject/lookNear.js) |warinternal|extends RoomObject with .lookNear()|
|JS/RoomObject| [roomObjectSay.js](/src/prototypes/JavaScript/RoomObject/roomObjectSay.js) |mototroller| say() on RoomObject|
|JS/RoomPosition| [findFirstInRange implementation for RoomPosition.js](/src/prototypes/JavaScript/RoomPosition/findFirstInRange%20implementation%20for%20RoomPosition.js) |proximo|findFirstInRange() for RoomPosition|
|JS/RoomPosition| [prototype.RoomPosition.toString_fromString.js](/src/prototypes/JavaScript/RoomPosition/prototype.RoomPosition.toString_fromString.js) |semperrabbit|better string functions for RoomPosition|
|JS/RoomVisual| [RawVisual Structures.js](/src/prototypes/JavaScript/RoomVisual/RawVisual%20Structures.js) |ags131|RoomVisuals for all structures|
|JS/Source| [Memory for Source (or other objects).js](/src/prototypes/JavaScript/Source/Memory%20for%20Source%20(or%20other%20objects).js) |w4rl0ck|adds memory to Source object|
|JS/StructureLink| [modified link.transferEnergy to prevent redundant multiple sends to the same target.js](/src/prototypes/JavaScript/StructureLink/modified%20link.transferEnergy%20to%20prevent%20redundant%20multiple%20sends%20to%20the%20same%20target.js) |helam| optimized StructureLink.transferEnergy()|
|| [DefineProperty Tutorial.js](/src/prototypes/JavaScript/DefineProperty%20Tutorial.js) |helam|see name|
|| [functionMiddleware.js](/src/prototypes/JavaScript/functionMiddleware.js) |warinternal|Loops over only functions on the prototype and passes them to a callback function|
|| [Monkey Patching Tutorial.js](/src/prototypes/JavaScript/Monkey%20Patching%20Tutorial.js) |helam|see name|
|JS/Creep| [excuseMe.js](/src/prototypes/JavaScript/Creep/excuseMe.js) |Robalian|A set of functions that makes creeps tell other creeps to get out of the way using creep memory|
|TS| [excuseMe.ts](/src/prototypes/Typescript/excuseMe.ts) |Robalian|A set of functions that makes creeps tell other creeps to get out of the way using creep memory|
