/**
 * Market Calculator
 * In this class, it should be noticed that all these functions will ignore the error resulted from the parameters as much as possible.
 * Usage: write require("tool.marketCalculator") in your main.js.
 */
/**
 * @typedef {Object} CommodityComponent Object used to describe components.
 * @property {Number} CommodityComponent.[RESOURCE_TYPE] Key: one of RESOURCE_*, Value: required amount.
 * @property {Array} CommodityComponent.recipes
 */
/** 
 * @typedef {Object} Revenue
 * @property {Number} Revenue.revenues The expected revenues.
 * @property {Number} Revenue.cooldown  Total cooldown number.
 * @property {Objecct} Revenue.buy Resources you need to buy, which has the format of [resourceType]:[amount].
 */
/** 
 * @typedef {Object} CommodityInformation
 * @property {number} CommodityInformation.cooldown     Total Cooldown Number.
 * @property {CommodityComponent} CommodityInformation.components
 * @property {Object} CommodityInformation.recipes
 */
/* 
 * @typedef {Object} bestCommodity
 * @property {String} bestCommodity.resourceType resourceType.
 * @property {Number} bestCommodity.cooldown cooldown.
 * @property {Number} bestCommodity.revenue Revenue.
 * @property {Object} bestCommodity.buy Resources you need to buy, which has the format of [resourceType]:[amount].
 */

 /**
  * @class
  */
(function(){
    const PLACE_HOLDER                  = "_";
    const ERR_MAX_ITERATION_REACHED     = 1;
    const ERR_NO_DATA                   = 2;
    
    const BASIC_RESOURCES               = [ RESOURCE_ENERGY,        RESOURCE_KEANIUM,           RESOURCE_HYDROGEN,          RESOURCE_OXYGEN,
                                            RESOURCE_CATALYST,      RESOURCE_ZYNTHIUM,          RESOURCE_UTRIUM,            RESOURCE_LEMERGIUM,
                                            RESOURCE_GHODIUM,];
    const COMPRESSED_RESOURCES          = [ RESOURCE_BATTERY,       RESOURCE_KEANIUM_BAR,       RESOURCE_REDUCTANT,         RESOURCE_OXIDANT, 
                                            RESOURCE_PURIFIER,      RESOURCE_ZYNTHIUM_BAR,      RESOURCE_UTRIUM_BAR,        RESOURCE_LEMERGIUM_BAR,
                                            RESOURCE_GHODIUM_MELT];
    const STORING_SINGLE_OBJECTS        = [ STRUCTURE_FACTORY];
    const STORING_MULTI_OBJECTS         = [ STRUCTURE_CONTAINER];
    const COMMODITIES_SETS              = {
        "basic"         :   [   PLACE_HOLDER,               RESOURCE_COMPOSITE,         RESOURCE_CRYSTAL,           RESOURCE_LIQUID],
        "compressed"    :       COMPRESSED_RESOURCES,
        "metal"         :   [   RESOURCE_ALLOY,             RESOURCE_TUBE,              RESOURCE_FIXTURES,          RESOURCE_FRAME,
                                RESOURCE_HYDRAULICS,        RESOURCE_MACHINE],
        "biomass"       :   [   RESOURCE_TISSUE,            RESOURCE_PHLEGM,            RESOURCE_TISSUE,            RESOURCE_MUSCLE,
                                RESOURCE_ORGANOID,          RESOURCE_ORGANISM],
        "silicon"       :   [   RESOURCE_WIRE,              RESOURCE_SWITCH,            RESOURCE_TRANSISTOR,        RESOURCE_MICROCHIP,
                                RESOURCE_CIRCUIT,           RESOURCE_DEVICE],
        "mist"          :   [   RESOURCE_CONDENSATE,        RESOURCE_CONCENTRATE,       RESOURCE_EXTRACT,           RESOURCE_SPIRIT,
                                RESOURCE_EMANATION,         RESOURCE_ESSENCE],
    }
    /**
     * Function to get price of one specific commodity.
     * You can modify this function to get a much more scientific outcome.
     * For example, even though some resources have price and transaction in the market, their amounts are very small, which means that if you want to deal a hugh amount, its price should take its available amount into account.
     * In this case, you can use the "penalty" to realize it.
     * @private
     * @param {String}  commodity   Commodity.
     * @returns {Number} The expected price of commodity.
     */
    function _getPrice(commodity) {
        const priceHistory = Game.market.getHistory(commodity);
        if (!priceHistory || Object.keys(priceHistory).length === 0) return ERR_NO_DATA;
        return priceHistory[priceHistory.length - 1]["avgPrice"];
    }
    /**
     * Function to calculate the required resources to produce the target [commodity].
     * This function will stop calculation at resources in [stopArr] or belonging to the basic types.
     * Notice that for every basic resourceType, there is RAW form and COMPRESSED form. If you do not specify explicitly, this function will automatically add the RAW form to [stopArr].
     * @param {String}      commodity                       Commodity.
     * @param {Object}      [settings]                      Settings.
     * @param {Number}      [settings.amount = 1]           The amount of commodity.
     * @param {String[]}    [settings.stopArr = []]         Array of resources. The result will be shown based on these resources and basic resources.
     * @param {Number}      [settings.maxIteration = 1024]  The maximum calculation iteration number.
     * @returns {CommodityInformation|Number} Object, Information about commodity | ERR_INVALID_ARGS | ERR_MAX_ITERATION_REACHED
     */
    function calcCommodityRawComponents(commodity,settings = {amount:1,stopArr:[],maxIteration:1024,reverse:true}) {
        _.defaults(settings,{
            amount:1,
            stopArr:[],
            maxIteration:1024,
            reverse:true
        });
        // Check for argument validity.
        if (!commodity || !COMMODITIES[commodity] || 
            settings.amount <= 0 || 
            !Array.isArray(settings.stopArr) || 
            settings.maxIteration <= 0) return ERR_INVALID_ARGS;
        // Check to avoid infinite loop.
        for (let i = 0; i < COMPRESSED_RESOURCES.length; i++) if (settings.stopArr.indexOf(COMPRESSED_RESOURCES[i]) === -1 && settings.stopArr.indexOf(BASIC_RESOURCES[i]) === -1) settings.stopArr.push(BASIC_RESOURCES[i]);

        const queue = [[commodity,settings.amount]];
        const ret = {cooldown:0,components:{},recipes:[]};
        let cnt = 1;
        const addToRet      = (type,amount) => ret.components[type] = ret.components[type] + amount || amount;
        const addCooldown   = (cooldown) => ret.cooldown += cooldown;
        const addRecipe     = (type,amount) => {
            const pos = _.map(ret.recipes,r => r[0]).indexOf(type);
            if (pos >= 0) ret.recipes[pos][1] += amount;
            else ret.recipes.push([type,amount]);
        }
        while (queue.length && cnt <= settings.maxIteration) {
            cnt++;
            const front = queue.shift();
            const type = front[0], amount = front[1];
            if (settings.stopArr.indexOf(type) >= 0 || !COMMODITIES[type]) {
                addToRet(type,amount);
                continue;
            }
            addCooldown(COMMODITIES[type].cooldown * (amount / COMMODITIES[type].amount));
            addRecipe(type,amount);
            for (let _type in COMMODITIES[type].components) {
                const amountRatio = COMMODITIES[type].components[_type] / COMMODITIES[type].amount;
                queue.push([_type,amountRatio * amount]);
            }
        }
        if (cnt > settings.maxIteration) return ERR_MAX_ITERATION_REACHED;
        if (settings.reverse) ret.recipes.reverse();
        return ret;
    }
   /**
    * Function to calculate the components to produce the specific commodity.
    * This function takes in the available amount of any resources into account.
    * Returns will based on settings.returnBasis. Refer to below for more information.
    * @param {String}   commodity                           Commodity.
    * @param {Object}   [settings]                          Settings.
    * @param {Number}   [settings.amount = 1]               The amount of commodity.
    * @param {String[]} [settings.stopArr = []]             Array of resources. The result will be shown based on these resources and basic resources.
    * @param {Array[]}  [settings.stopInfo = []]            An Array of [resourceType,amount], meaning these resources are available and will not be calculated.
    * @param {Number}   [settings.maxIteration = 1024]      The maximum number of calculation iterations.
    * @param {Number}   [settings.returnBasis = 0]          0 BASIC_RESOURCES | 1 COMPRESSED_RESOURCES | 2 MIXED(stop at both BASIC and COMPRESSED).
    * @returns {CommodityInformation|Number} Object, Information about commodity | ERR_INVALID_ARGS | ERR_MAX_ITERATION_REACHED
    */
    function calcCommodityComponents(commodity,settings = {amount:1,stopArr:[],stopInfo:[],maxIteration:1024,returnBasis:0}) {
        _.defaults(settings,{
            amount:1,
            stopInfo:[], 
            stopArr:[],
            maxIteration:1024,
            returnBasis:0
        });
        const ret = {components:{},cooldown:0,recipes:[]};
        let basedResources = [].concat(settings.stopArr);
        if (settings.returnBasis === 0) basedResources = basedResources.concat(BASIC_RESOURCES);
        else if (settings.returnBasis === 1) basedResources = basedResources.concat(COMPRESSED_RESOURCES);
        else if (settings.returnBasis === 2) basedResources = basedResources.concat(BASIC_RESOURCES,COMPRESSED_RESOURCES);
        else return ERR_INVALID_ARGS;
        
        const addToRet = (type,amount) => ret.components[type] = ret.components[type] + amount || amount;
        
        let cnt = 0;
        const queue = [[commodity,settings.amount]];
        while (queue.length && cnt < settings.maxIteration) {
            cnt++;
            const front = queue.shift();
            const resourceType = front[0],amount = front[1];
            if (basedResources.indexOf(resourceType) >= 0 || !COMMODITIES[resourceType]) {
                addToRet(resourceType,amount);
                continue;
            }
            const stopArr = basedResources.concat(_.map(settings.stopInfo,(i)=>i[0]));
            const _ret = calcCommodityRawComponents(resourceType,{amount,stopArr:stopArr,maxIteration:settings.maxIteration,reverse:false});
            if (typeof(_ret) === "number") return _ret;
            
            ret.cooldown += _ret.cooldown;
            for (const recipe of _ret.recipes) {
                const pos = _.map(ret.recipes,r => r[0]).indexOf(recipe[0]);
                if (pos >= 0) ret.recipes[pos][1] += recipe[1];
                else ret.recipes.push(recipe);
            }
            // Deal with the existing resources.
            for (let i = 0; i < settings.stopInfo.length; i++) {
                const type = settings.stopInfo[i][0],existingAmount = settings.stopInfo[i][1];
                if (type in _ret.components) {
                    if (_ret.components[type] > existingAmount) {
                        _ret.components[type] -= existingAmount;
                        settings.stopInfo[i][1] = 0;
                    }else if (_ret.components[type] <= existingAmount) {
                        settings.stopInfo[i][1] -= _ret.components[type];
                        delete _ret.components[type];
                    }
                }
            }
            settings.stopInfo = _.filter(settings.stopInfo,i => i[1] > 0);
            for (let component in _ret.components) queue.push([component,_ret.components[component]]);
        }
        if (cnt > settings.maxIteration) return ERR_MAX_ITERATION_REACHED;
        ret.recipes.reverse();
        return ret;
    }
    /**
     * Function to get available resources information.
     * @private
     * @param {Array}   stopResources The item can be [resourceType,amount] or resourceType or [resourceType], in the latter 2 cases, the function will assume you have infinity resources.
     */
    function _getResourcesInfo(stopResources = [],existenceBased = false,roomNames = [],storeObjects = [],findObjects = false){
        // Set default values.
        stopResources   = stopResources     || [];
        existenceBased  = existenceBased    || false;
        roomNames       = roomNames         || [];
        storeObjects    = storeObjects      || [];
        findObjects     = findObjects       || false;
        if (!Array.isArray(stopResources)) stopResources = [stopResources];
        if (!Array.isArray(roomNames)) roomNames = [roomNames];
        if (!Array.isArray(storeObjects)) storeObjects = [storeObjects];
        // Parse stopResources into stopInfo.
        let ret = [].concat(stopResources);
        for (let i = 0; i < ret.length; i++) {
            if (!Array.isArray(ret[i]))                 ret[i] = [ ret[i]   ,Infinity ];
            else if (ret[i].length === 1)               ret[i] = [ ret[i][0],Infinity ];
            else if (typeof(ret[i][1]) !== "number")    ret[i] = [ ret[i][0],Infinity ];
        }
        // Return if do not consider store.
        if (!existenceBased) return ret;
        const existingComponents = [],existingAmount = [];
        // Define Auxiliary Functions.
        const addToList         = function (type,amount) {
            const pos = existingComponents.indexOf(type);
            if (pos >= 0) existingAmount[pos] += amount;
            else {
                existingComponents.push(type);
                existingAmount.push(amount);
            }
        }
        const addToListByObject = function (object) {for (var carry in object.store) addToList(carry,object.store[carry]);}
        const addToListByRoom   = function (roomName) {
            if (!Game.rooms[roomName].controller || !Game.rooms[roomName].controller.my) return;
            if (Game.rooms[roomName].storage) addToListByObject(Game.rooms[roomName].storage);
            if (Game.rooms[roomName].terminal) addToListByObject(Game.rooms[roomName].terminal);
            if (findObjects) {
                const structures = Game.rooms[roomName].find(FIND_STRUCTURES);
                for (let structureName of STORING_SINGLE_OBJECTS) if (!Game.rooms[roomName][structureName]) Game.rooms[roomName][structureName] = _.filter(structures,s => s.structureType === structureName)[0];
                for (let structuresName of STORING_MULTI_OBJECTS) if (!Game.rooms[roomName][structuresName + "s"]) Game.rooms[roomName][structuresName + "s"] = _.filter(structures,s => s.structureType === structuresName);
            }
            for (let structureName of STORING_SINGLE_OBJECTS) if (Game.rooms[roomName][structureName]) addToListByObject(Game.rooms[roomName][structureName]);
            for (let structuresName of STORING_MULTI_OBJECTS) if (Game.rooms[roomName][structuresName + "s"]) for (let structure of Game.rooms[roomName][structuresName + "s"]) addToListByObject(structure);
        }
        // Add the information of room.
        if (roomNames.length > 0) {
            for (let roomName of roomNames) if (Game.rooms[roomName]) addToListByRoom(roomName);
        }else {
            for (let roomName in Game.rooms) addToListByRoom(roomName);
        }
        // Add the information of storeObjects.
        for (let storeObject of storeObjects) if (storeObject && storeObject.store) addToListByObject(storeObject);
        // Merge the ret with existing{Components,Amount}.
        for (let i = 0; i < existingComponents.length; i++) ret.push([existingComponents[i],existingAmount[i]]);
        return ret;
    }
   /**
    * Calculate the expected revenues of producing commodity based on some information about resources.
    * Notice that this function will return ERR_NO_DATA if the commodity itself does not have price in the market, no matter how the settings.ignoreNoData is.
    * Notice that this function will calculate based on storage, terminal by default, if set settings.existenceBased equals true.
    * Notice that settings.stopResources can exist with storing information. But all the information will be added. Be careful!
    * @param {String}                           commodity                                       Commodity.
    * @param {Object}                           [settings]                                      Settings.
    * @param {Number}                           [settings.amount = 1]                           Amount.
    * @param {Array}                            [settings.stopResources = []]                   An Array of information about resources(resourceType| [resourceType] | [resourceType,amount]), which the calculation will stop based on.
    * @param {String[]}                         [settings.stopArr = []]                         Array of resources. The result will be shown based on these resources and basic resources.
    * @param {Boolean}                          [settings.ignoreNoData = true]                  Whether ignores potential no-data resources, if false, their information will be returned.
    * @param {Boolean}                          [settings.buy = false]                          Whether return the information about resources you need to buy.
    * @param {Boolean}                          [settings.existenceBased = false]               Whether try to extract information from storing objects in the room, only if this is true, the following parameters related to storing will be used.
    * @param {String[]|String|null|undefined}   [settings.roomNames = []]                       An array of roomNames | one roomName | [], null, undefined, meaning all.
    * @param {Object[]|Object}                  [settings.storeObjects = []]                    Additional storing objects.
    * @param {Boolean}                          [settings.findObjects = false]                  Whether to find all storing objects in the room, this can cost additional CPU time. Notice that if you cache the structures to the Room object, this function will access them directly, and in this case, the default value for this parameter is true.
    * @returns {Object|Revenue} Object, which containing revenue: The expected revenues; cooldown: Total Cooldown Ticks; lackingPriceResources: Information about resources lacking price in the form of key-value pair; Recipes: The order to produce commodity. | ERR_NO_DATA | The revenue object.
    */
    function calcExpectedRevenue(commodity,settings = {amount:1,stopArr:[],stopResources:[],ignoreNoData:true,existenceBased:false,roomNames:[],storeObjects:[],findObjects:false,buy:false}) {
        _.defaults(settings,{
            amount:1,
            stopResources:[],
            stopArr:[],
            ignoreNoData:true,
            existenceBased:false,
            buy:false,
            roomNames:[],
            storeObjects:[],
            findObjects:false}
        );
        // Check for price of commodity.
        if (_getPrice(commodity) === ERR_NO_DATA) return ERR_NO_DATA;
        // Get resources information.
        settings.stopResources = _getResourcesInfo(settings.stopResources,settings.existenceBased,settings.roomNames,settings.storeObjects,settings.findObjects);
        const basis = calcCommodityComponents(commodity,{amount:settings.amount,stopInfo:settings.stopResources,stopArr:settings.stopArr});
        if (typeof(basis) === "number") return basis;
        // Calculate the cost.
        let cost = 0;
        let lackingPriceResources = {};
        let buy = {};
        for (let component in basis.components) {
            let price = _getPrice(component);
            if (price !== ERR_NO_DATA) {
                cost += price * basis.components[component];
                if (settings.buy) buy[component] = basis.components[component];
            }else if (!settings.ignoreNoData) lackingPriceResources[component] = basis.components[component];
        }
        return {revenue:_getPrice(commodity) * settings.amount - cost,cooldown:basis.cooldown,lackingPriceResources,buy,recipes:basis.recipes};
    }
   /**
    * Calculate the components of commodity.
    * Notice that this function will calculate based on storage, terminal by default, if set settings.existenceBased equals true.
    * Notice that settings.stopResources can exist with storing information. But all the information will be added. Be careful!
    * @param {String}                           commodity                                       Commodity.
    * @param {Object}                           [settings]                                      Settings.
    * @param {Number}                           [settings.amount = 1]                           The Amount of commodity.
    * @param {Array}                            [settings.stopResources = []]                   An Array of information about resources(resourceType | [resourceType] | [resourceType,amount]), which the calculation will stop based on.
    * @param {String[]}                         [settings.stopArr = []]                         Array of resources. The result will be shown based on these resources and basic resources.
    * @param {Boolean}                          [settings.existenceBased = false]               Whether try to extract information from storing objects in the room, only if this is true, the following parameters related to storing will be used.
    * @param {String[]|String|null|undefined}   [settings.roomNames = []]                       An array of roomNames | one roomName | [], null, undefined, meaning all.
    * @param {Object[]|Object}                  [settings.storeObjects = []]                    Additional storing objects.
    * @param {Boolean}                          [settings.findObjects = false]                  Whether to find all storing objects in the room, this can cost additional CPU time. Notice that if you cache the structures to the Room object, this function will access them directly, and in this case, the default value for this parameter is true.
    * @returns {CommodityInformation|Number} Object, Information about commodity | ERR_INVALID_ARGS | ERR_MAX_ITERATION_REACHED
    */
    function calcCommodityComponentsBasedOnExistence(commodity,settings = {amount:1,stopArr:[],stopResources:[],existenceBased:false,roomNames:[],storeObjects:[],findObjects:false}){
        _.defaults(settings,{
            amount:1,
            stopResources:[],
            stopArr:[],
            existenceBased:false,
            roomNames:[],
            storeObjects:[],
            findObjects:false,
        });
        const existingInfo = _getResourcesInfo(settings.stopResources,settings.existenceBased,settings.roomNames,settings.storeObjects,settings.findObjects);
        return calcCommodityComponents(commodity,{amount:settings.amount,stopInfo:existingInfo,stopArr:settings.stopArr});
    }
   /**
    * This function will calculate the most profittable commodity you can produce (only 1).
    * Notice that this function will not consider those commodities which require some resources lacking market data, that you do not have either.
    * Notice that this function will not detect the situation of your factorys' level by default, but you can turn it on by let settings.detectLevel = true.
    * Notice that this function will calculate all categories(namely 6)' commodities by default, this can be time-consuming and waste CPU given you just harvest and produce one type of commodity, you can change it in setting.series.
    * This function is very expensive.
    * @param {String}                           stopResources                                                                       An Array of information about resources(resourceType | [resourceType] | [resourceType,amount]), which the calculation will assume you have.
    * @param {Object}                           [settings]                                                                          Settings.
    * @param {Array}                            [settings.series = ["biomass","mist","metal","silicon","compressed","basic"]]       The categories of commodities this function will calculate: "compressed" including all compressing commodities. "basic" including "composite", "crystal" and "liquid".
    * @param {String[]}                         [settings.stopArr = []]                                                             Array of resources. The result will be shown based on these resources and basic resources.
    * @param {Boolean}                          [settings.detectLevel = false]                                                      Whether to detect the levels of factory automatically.
    * @param {Boolean}                          [settings.perTick = false]                                                          Whether takes cooldown into account to evaluate the commodity's value.
    * @param {Boolean}                          [settings.existenceBased = false]                                                   Whether try to extract information from storing objects in the room, only if this is true, the following parameters related to storing will be used.
    * @param {String[]|String|null|undefined}   [settings.roomNames = []]                                                           An array of roomNames | one roomName | [], null, undefined, meaning all.
    * @param {Object[]|Object}                  [settings.storeObjects = []]                                                        Additional storing objects.
    * @param {Boolean}                          [settings.findObjects = false]                                                      Whether to find all storing objects in the room, this can cost additional CPU time. Notice that if you cache the structures to the Room object, this function will access them directly, and in this case, the default value for this parameter is true.
    * @returns {bestCommodity} Object.
    */
    function calcBestResponseCommodityBasedOnExistence(stopResources = [],settings = {series:["biomass","mist","metal","silicon","compressed","basic"],stopArr:[],detectLevel:false,perTick:false,existenceBased:false,roomNames:[],storeObjects:[],findObjects:false}){
        stopResources = stopResources || [];
        _.defaults(settings,{series:["biomass","mist","metal","silicon","compressed","basic"],stopArr:[],detectLevel:false,perTick:false,existenceBased:false,roomNames:[],storeObjects:[],findObjects:false});
        const availableResourcesInformation = _getResourcesInfo(stopResources,settings.existenceBased,settings.roomNames,settings.storeObjects,settings.findObjects);
        let   factoryLevel = [];
        if (!settings.detectLevel) factoryLevel = [0,1,2,3,4,5];
        else{
            let factoryLevels =   _.map( _.filter(Game.rooms,(r)=>r.controller && r.controller.my) ,(r)=>r.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_FACTORY}})[0]).map(f => f && f.level).filter(l => l);
            factoryLevel = _.uniq(factoryLevels,false);
            factoryLevel.push(0);
        }
        const bestCommodity = {
            cooldown:0,
            revenue:0,
            resourceType:"",
            buy:{},
            recipes:{},
        }
        for (const serie of settings.series) {
            if (!COMMODITIES_SETS[serie]) continue;
            let potentialCommodities = COMMODITIES_SETS[serie];
            if (serie !== "compressed") potentialCommodities = _.filter(potentialCommodities,(value,index) => factoryLevel.indexOf(index) >= 0);
            for (const commodity of potentialCommodities) {
                if (!COMMODITIES[commodity]) continue;
                const expectedRevenue = calcExpectedRevenue(commodity,{amount:1,stopArr:settings.stopArr,stopResources:availableResourcesInformation,ignoreNoData:false,existenceBased:false,buy:true});
                if (typeof(expectedRevenue) === "number") continue;
                if (Object.keys(expectedRevenue.lackingPriceResources).length > 0) continue;
                if ((!settings.perTick && expectedRevenue.revenue > bestCommodity.revenue) ||
                    (settings.perTick  && (expectedRevenue.revenue / expectedRevenue.cooldown) > (bestCommodity.revenue / bestCommodity.cooldown))) {
                    bestCommodity.cooldown      = expectedRevenue.cooldown;
                    bestCommodity.revenue       = expectedRevenue.revenue;
                    bestCommodity.resourceType  = commodity;
                    bestCommodity.buy           = expectedRevenue.buy;
                    bestCommodity.recipes       = expectedRevenue.recipes;
                }
            }
        }
        return bestCommodity;
    }

    const MC = {
        commodity:{
            "revenue":calcExpectedRevenue,
            "component":calcCommodityComponentsBasedOnExistence,
            "rawComponent":calcCommodityRawComponents,
            "bestCommodity":calcBestResponseCommodityBasedOnExistence,
        }
    }
    // Mount to the global object.
    // You can mount to Game object.
    global.MarketCal = MC;
//  Game.MarketCal = MC;
})();