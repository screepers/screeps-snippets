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

There will be a voting system installed for automatically merging PRs once this is further established. More details to follow...

## Index of all current snippets

### classes
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| bitSet.js | warinternal| bit set class|
|JS| class.RoomVisualCache_module.js| semperrabbit|RoomVisual cache|
|JS|creepsSingingSongs.js| Lucifer| creeps singing songs|
|JS|Es6LRUMapWithSizeAndTtl.js | warinternal| A cache that can exhibit both least recently used (LRU) and max time to live (TTL) eviction policies.|
|JS|WorldPosition.js| warinternal| Uniform screeps world position with E0S0 as origin.|

### client-abuse
  
| folder | name | author |Description                    |
| ----- |---------| -------|----------------------- |
|JS|inject_script_tag.js|semperrabbit| injects script tag|
|JS|LoAN_tampermonkey_inject_for_any_client.js| semperrabbit| will attempt to load the LoAN tampermonkey code each global reset.|
|JS|run_window.onTick()\_inside_the_client_per_tick.js|semperrabbit| run window.onTick() inside the client per tick|
|JS|saveAlliancesInMemory.js|semperrabbit|Inject alliance data into Memory.alliances|
|JS|util.inject.Birthday.js|semperrabbit|shows room object birth dates based on their id|
|JS|util.inject.RoomTracker.js|semperrabbit|Allows for the retrieval of rooms currently being viewed in the client from in-game code|
|JS|util.inject.RoomViewNotifier.js|semperrabbit| adds currently viewed room to memory |
|JS|util.inject.TEMPLATE.js|semperrabbit|template for injections|

### globals
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS |adjust_CPU_limit_based_on_bucket_levels.js|semperrabbit|Adjust your CPU limit per tick based on current and target bucket levels|
|JS|boostComponentsObject.js|shibdib| boost components|
|JS|calculateTickTimeInGame.js|Kamots|Provides global.tickTime as seconds|
|JS|command to clear in-game console.js|GimmeCookies|Clear the in-game console|
|JS|determineFileFunctionLineWithinCode.js|knightshade| determine file, function, line within code|
|JS|Global functions etc. example.js|maxion| example on how to use global |
|JS|hasRespawned.js|semperrabbit| check if you just respawned|
|JS|optimizedIsActive.js| tigga | a better OwnedStructure.isActive()|
|JS|resourceColors.js| engineeryo| hex color codes for minerals, energy and power |
|JS|respawn assist to clear memory and flags.js|semperrabbit|clears memory and flags|
|JS|Reverse lookup tables for errors, colors, and resources.js|warinternal| reverse lookup tables for errors colors and resources|
|JS|setTimeout_setInterval.js|semperrabbit| setTimeout() / setInterval() from JS, but it uses screeps ticks instead of ms|
|JS|to get memory size.js|tyr| get memory size|
|JS|voiceConsole.js|stybbe| say() but for real|
||Cached dynamic properties.js|warinternal| cached properties|
||Entity Message Bus.js|warinternal|receive messages on room object|
||Memory segment emulation.js|dissi|segment emulator|
||queueAction() system.js|Helam|queue actions|
||upkeep_costs.js|warinternal| constants for upkeep of decaying structures|


### logging
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
| - | - | - | - |

### misc
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS| actually commented evil tower code.js| daboross| lodash chain tower code|
|JS|bunkerLayoutsHumanReadable.js|sparr| readable bunker layouts sample|
|JS|Calculate Cost of a Mine.js|Gankdalf| mining cost calculations|
|JS|Check if room is a source keeper room.js|issacar|check if room is a source keeper room|
|JS|colors.js|dissi| visualize percentage with colors|
|JS|get room type without visibility (but regex^^).js|enrico|get room type without visibility|
|JS|Global Tracking.js|ags131|track global age|
|JS|how to delete the memory of dead creeps (in memoriam!).js|artritus|remove memory of dead creeps|
|JS|Memory Cache.js|postcrafter|memory hack|
|JS|minCutWallRampartsPlacement.js|saruss|calculate minCut in a room|
|JS|Minimal Starting AI.js|WolfWings|example bot starting point|
|JS|module.exports example.js|maxion|example on how to use module.exports|
|JS|moveTo version supporting raw PathFinder arguments, and a moveByPath which directly reads serialized strings.js|daboross|see name|
|JS|OwnedStructure Memory.js|warinternal|structure memory|
|JS|powerCreepChatter.js|kittytack|power creeps saying things|
|JS|protocolBufferStorage.js|daboross|metadata storage|
|JS|pushdownAutomataStateMachine.js|warinternal|PDA implementation|
|JS|Remote mining generator.js|domnomnom|generates a remote mine setup|
|JS|Reset Memory to default.js|Doctor Zuber| clears memory|
|JS|roomDescribe.js|engineeryo|get room type from room name|
|JS|screeps_astar.js|tedivm|a\* adapted to screeps|
|JS|simple benchmarks.js|warinternal|Simple benchmark test with sanity check|
|JS|Simplified grid class.js|warinternal|simple grid class|
|JS|sos_lib_crypto.js|tedivm|crypto library for screeps|
|JS|String encryption.js|warinternal|vernam chiper implementation|
|JS|Uint8ArrayConversion.js|daboross|encoding and decoding strings to uint8 arrays for storage|
|JS|Unicode directional arrows.js|warinternal|hex codes for unicode arrows for all directions|
|JS|WorldPosition uniform global coordinate system.js|warinternal|Uniform screeps world position with E0S0 as origin.|
|TS|Creep intent tracker.ts|unfleshedone|intent tracker implementation|
|TS|moving.average.ts|unsleshedone|moving average implementation|
|TS|Typescript roomScan.ts|crzytrane|room scanner?|
||migrate room to sim.md|semperrabbit|how to migrate room to sim|
||screeps body calculator.md|nitroevil|link to creep calculator|
|KT|DistanceTransform|Vipo|Algoritm for finding open areas in rooms|
|KT|VipoOS|Vipo|Example of a tiny OS solution for Screeps, written in Kotlin|



### prototypes
  
| folder | name |author |Description                    |
| ----- |---------| -------|----------------------- |
|JS/Creep|Creep action error handler.js|warinternal| log creep action error codes|
|JS/Creep|Creep.getOffExit.js|engineeryo| move creep of room exits|
|JS/Creep|Freshly minted getActiveBodyparts accounting for boosts!.js|daboross|see name|
|JS/Creep|Idle_Suspend for creeps.js|proximo|idle creeps for a certain amount of ticks|
|JS/Creep|prototype.Creep.moveToStandByPos.js|semperrabbit|park creeps in their parking spots|
|JS/Creep|untitled_activeBodyparts.js|proximo|optimized Creep.getActiveBodyparts()|
|JS/Creep|util.fun.singing.js|semperrabbit|creeps singing|
|JS/Room|prototype.Room.structures.js|semperrabbit|extends Room prototype with structures, also caching them|
|JS/Room|Room.mineral.js|Helam|extends Room prototype with a mineral property including caching|
|JS/RoomObject|Generalized target locking (with examples).js|warinternal|target locking for actors with memory|
|JS/RoomObject|lookForNear.js|warinternal|extends RoomObject with .lookForNear()|
|JS/RoomObject|lookNear.js|warinternal|extends RoomObject with .lookNear()|
|JS/RoomObject|roomObjectSay.js|mototroller| say() on RoomObject|
|JS/RoomPosition|findFirstInRange implementation for RoomPosition.js|proximo|findFirstInRange() for RoomPosition|
|JS/RoomPosition|prototype.RoomPosition.toString_fromString.js|semperrabbit|better string functions for RoomPosition|
|JS/RoomVisual|RawVisual Structures.js|ags131|RoomVisuals for all structures|
|JS/Source|Memory for Source (or other objects).js|w4rl0ck|adds memory to Source object|
|JS/StructureLink|modified link.transferEnergy to prevent redundant multiple sends to the same target.js|helam| optimized StructureLink.transferEnergy()|
||DefineProperty Tutorial.js|helam|see name|
||functionMiddleware.js|warinternal|Loops over only functions on the prototype and passes them to a callback function|
||Monkey Patching Tutorial.js|helam|see name|
