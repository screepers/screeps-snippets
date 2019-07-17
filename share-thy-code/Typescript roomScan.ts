// crzytrane 13 March 2017 at 12:06
public roomScan(sampleSize): this {
    let terrainData = <LookAtResultMatrix>this.room.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 49);
    let sampleBlockCount: number = 50 / sampleSize;

    let sampleBlocks: { [y: number]: { [x: number]: { freeSpaces } } } = {};
    let blockY: number;
    let blockX: number;
    let sampleY: number;
    let sampleX: number;
    for (blockY = 0; blockY < sampleBlockCount; blockY++) {
      sampleBlocks[blockY] = {};
      for (blockX = 0; blockX < sampleBlockCount; blockX++) {
        sampleBlocks[blockY][blockX] = { freeSpaces: 0 };

        for (sampleY = 0; sampleY < sampleSize; sampleY++) {
          for (sampleX = 0; sampleX < sampleSize; sampleX++) {
            if (terrainData[blockY * sampleSize + sampleY][blockX * sampleSize + sampleX] != 'wall') {
              sampleBlocks[blockY][blockX].freeSpaces++;
            }
          }
        }
      }
    }
    for (let sampleYIndex in sampleBlocks) {
      for (let sampleXIndex in sampleBlocks[sampleYIndex]) {
        let x: number = Number(sampleXIndex) * sampleSize + sampleSize / 2;
        let y: number = Number(sampleYIndex) * sampleSize + sampleSize / 2;
        let percentageFree: number = sampleBlocks[sampleYIndex][sampleXIndex].freeSpaces / (sampleSize * sampleSize);

        let radius: number = percentageFree * sampleSize/2;
        this.room.visual.circle(x, y, {radius: radius, fill: this.getColour(percentageFree), opacity: 0.2})
        this.room.visual.text(sampleBlocks[sampleYIndex][sampleXIndex].freeSpaces, x, y + 0.25);
      }
    }

    return this;
  }