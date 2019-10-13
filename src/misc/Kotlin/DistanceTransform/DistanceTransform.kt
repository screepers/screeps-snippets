package AET.Colony.Planner

import screeps.api.*
import kotlin.math.min

/**
        Distance transform based on Screeps Slack #automation pinned files
        Thanks to bames, sparr and semperrabbit

        Converted to Kotlin by Vipo

 */

class DistanceTransform(private val room: Room) {

    // The value in the CostMatrix is how many open tiles there is in all directions
    fun distanceTransformAllDirections() : PathFinder.CostMatrix {
        val costMatrix = buildableTilesForRoom()

        val bits = costMatrix._bits

        val oob = 255

        var A = 0; var B = 0; var C = 0
        var D = 0; var E = 0; var F = 0
        var G = 0; var H = 0; var I = 0

        for (n in 51..2499) {
            if(bits[n] != 0) {
                A = bits[n-51]
                B = bits[n-50]
                C = bits[n-49]
                D = bits[n-1]

                if(n % 50 == 0) {A = oob; D = oob }
                if(n % 50 == 49) {C = oob}

                bits[n] = min(min(min(A, B), min(C, D)), 254) + 1
            }
        }

        for(n in 2448 downTo 0) {
            E = bits[n]
            F = bits[n+1]
            G = bits[n+49]
            H = bits[n+50]
            I = bits[n+51]

            if(n > 2400) {G = oob; H = oob; I = oob}
            if(n % 50 == 49) {F = oob; I = oob}
            if(n % 50 == 0) {G = oob}

            bits[n] = min(min(min(F, G) + 1, min(H, I) + 1), E)
        }

        return costMatrix
    }

    // The value in the CostMatrix is how many open tiles there is up and left (the value is the bottom right corner)
    fun distanceTransformUpLeft() : PathFinder.CostMatrix {
        val costMatrix = buildableTilesForRoom()

        val bits = costMatrix._bits

        val oob = 255

        var A = 0; var B = 0;
        var D = 0;

        for (n in 51..2499) {
            if(bits[n] != 0) {
                A = bits[n-51]
                B = bits[n-50]
                D = bits[n-1]

                if(n % 50 == 0) {A = oob; D = oob }

                bits[n] = min(min(A, B), min(D, 254)) + 1
            }
        }

        return costMatrix
    }

    private fun buildableTilesForRoom() : PathFinder.CostMatrix {
        val costMatrix = PathFinder.CostMatrix()
        val terrain = Game.map.getRoomTerrain(room.name).getRawBuffer()

        val bits = costMatrix._bits

        // Everything but edges
        for (y in 2..47)
            for (x in 2..47)
                if(terrain[y*50+x].and(TERRAIN_MASK_WALL as Int) == 0)
                        bits[x*50+y] = 1

        // Northwards
        for(x in 1..48)
            if(terrain[x+50].and(TERRAIN_MASK_WALL as Int) == 0
                    && terrain[x].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[x-1].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[x+1].and(TERRAIN_MASK_WALL as Int) != 0)
                bits[x*50+1] = 1

        // Eastwards
        for(y in 1..48)
            if(terrain[y*50+48].and(TERRAIN_MASK_WALL as Int) == 0
                    && terrain[y*50+49].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[(y-1)*50+49].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[(y+1)*50+49].and(TERRAIN_MASK_WALL as Int) != 0)
                bits[y+2400] = 1

        // Southwards
        for(x in 1..48)
            if(terrain[x+2400].and(TERRAIN_MASK_WALL as Int) == 0
                    && terrain[x+2450].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[x+2449].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[x+2451].and(TERRAIN_MASK_WALL as Int) != 0)
                bits[x*50+48] = 1

        // Westwards
        for(y in 1..48)
            if(terrain[y*50+1].and(TERRAIN_MASK_WALL as Int) == 0
                    && terrain[y*50].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[(y-1)*50].and(TERRAIN_MASK_WALL as Int) != 0
                    && terrain[(y+1)*50].and(TERRAIN_MASK_WALL as Int) != 0)
                bits[y+50] = 1

        return costMatrix
    }

    fun displayCostMatrix(dt: PathFinder.CostMatrix) {
        val vis = room.visual

        val bits = dt._bits

        for (x in 0..50) {
            for (y in 0..50) {
                val value = bits[x*50+y]
                if(value > 0) {
                    vis.text(value.toString(), x.toDouble(),y.toDouble()+0.2)
                }
            }
        }
    }
}