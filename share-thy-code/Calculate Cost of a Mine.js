// Gankdalf 7 December 2016 at 22:35
function calculateCostOfaMine(distance, swampCount, mineCapacity) {
  //Get the number of WORK parts needed
  const energy_generated = mineCapacity / ENERGY_REGEN_TIME;
  const work_needed = energy_generated / HARVEST_POWER;

  //Get the travel time for the creeps
  //(will be used more with non-one-to-one creeps)
  const miner_travel_time = distance;
  const carry_travel_time = distance * 2;

  //Get the number of carry parts needed to move the generated energy in one trip
  //(can in theory be split between multiple creeps)
  const carry_needed = Math.ceil(
    carry_travel_time * (energy_generated / CARRY_CAPACITY)
  );

  //Get the number of move parts needed to move the work and carry parts at 1:1 on roads
  //(including a single work part for the carry creep)
  const work_move_needed = Math.ceil(work_needed / 2);
  const carry_move_needed = Math.ceil((carry_needed + 1) / 2);

  //Get the cost per tick for a container
  const container_cost =
    CONTAINER_DECAY / CONTAINER_DECAY_TIME_OWNED / REPAIR_POWER;

  //Get the one-time energy cost to create the needed needed creeps
  const miner_cost =
    work_needed * BODYPART_COST["work"] +
    work_move_needed * BODYPART_COST["move"];
  const carry_cost =
    carry_needed * BODYPART_COST["carry"] +
    carry_move_needed * BODYPART_COST["move"] +
    BODYPART_COST["work"];

  //Get the cost per-tick to create the needed creeps
  const carry_cost_per_tick =
    carry_cost / (CREEP_LIFE_TIME - carry_travel_time);
  const miner_cost_per_tick =
    miner_cost / (CREEP_LIFE_TIME - miner_travel_time);

  //Get the number of ticks required in a normal creep life cycle required to spawn the needed creeps
  //(This accounts for the time when two miners will exist at the same time for a single source)
  const miner_tick_cost_per_cycle =
    (((work_needed + work_move_needed) * 3) /
      (CREEP_LIFE_TIME - miner_travel_time)) *
    CREEP_LIFE_TIME;
  const carry_tick_cost_per_cycle =
    (((carry_needed + carry_move_needed) * 3) /
      (CREEP_LIFE_TIME - carry_travel_time)) *
    CREEP_LIFE_TIME;

  //Get the repair cost to maintain the roads
  const plain_road_cost =
    ((distance - swampCount) * (ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME)) /
    REPAIR_POWER;
  const swamp_road_cost =
    (swampCount *
      (ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME) *
      CONSTRUCTION_COST_ROAD_SWAMP_RATIO) /
    REPAIR_POWER;

  return {
    totalEnergyCostPerTick:
      Math.round(
        (carry_cost_per_tick +
          miner_cost_per_tick +
          swamp_road_cost +
          plain_road_cost +
          container_cost) *
          100
      ) / 100,
    spawnTicksPerCycle: Math.ceil(
      miner_tick_cost_per_cycle + carry_tick_cost_per_cycle
    ),
    spawnEnergyCapacityRequired: Math.max(miner_cost, carry_cost),
    initialStructureCost:
      (distance - swampCount) * CONSTRUCTION_COST["road"] +
      swampCount *
        CONSTRUCTION_COST["road"] *
        CONSTRUCTION_COST_ROAD_SWAMP_RATIO +
      CONSTRUCTION_COST["container"]
  };
}
