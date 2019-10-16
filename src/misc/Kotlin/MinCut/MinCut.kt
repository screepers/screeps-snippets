package AET.Colony.Planner

import screeps.api.*

/**
 * Code for calculating the minCut in a room, written by Saruss
 * adapted for Typescript and flexible room subsets by Chobobobo,
 * a little debugging done by Muon
 *
 * Converted from TypeScript to Kotlin by Vipo
 */

class MinCut {

	private val UNWALKABLE = -1
	private val NORMAL = 0
	private val PROTECTED = 1
	private val CANNOT_BUILD = 2
	private val EXIT = 3

	data class Edge(
			var capacity: Int,
			var flow: Int,
			var resEdge: Int,
			var to: Int
	)
	data class Rectangle (
		val x1: Int,
		val y1: Int,
		val x2: Int,
		val y2: Int
	)

	class Graph(private var totalVertices: Int) {
		private var level = IntArray(totalVertices)
		private var edges = Array(totalVertices) { mutableListOf<Edge>()}

		init {
			for (i in edges.indices)
				edges[i] = mutableListOf()

		}

		/**
		 * Create a new edge in the graph as well as a corresponding reverse edge on the residual graph
		 * @param from - vertex edge starts at
		 * @param to - vertex edge leads to
		 * @param capacity - max flow capacity for this edge
		 */
		fun newEdge(from: Int, to: Int, capacity: Int) {
			// Normal forward Edge
			edges[from].add(Edge( to = to, resEdge = this.edges[to].size, capacity = capacity, flow = 0 ))
			// reverse Edge for Residual Graph
			edges[to].add(Edge( to = from, resEdge = this.edges[from].size - 1, capacity = 0, flow = 0 ))
		}

		/**
		 * Uses Breadth First Search to see if a path exists to the vertex 'to' and generate the level graph
		 * @param from - vertex to start from
		 * @param to - vertex to try and reach
		 */
		private fun createLevelGraph(from: Int, to: Int) : Boolean {
			if (to >= this.totalVertices) {
				return false
			}

			// reset old levels
			for (i in level.indices)
					level[i] = -1

			level[from] = 0;
			val q = mutableListOf(from) // queue with s as starting point
			//q.push(from);
			var u = 0;
			//let edge = null;
			while (q.isNotEmpty()) {
				u = q.removeAt(0)
				for (edge in edges[u]) {
					if (level[edge.to] < 0 && edge.flow < edge.capacity) {
						level[edge.to] = level[u] + 1;
						q.add(edge.to)
					}
				}
			}
			return level[to] >= 0; // return if theres a path, no level, no path!
		}

		/**
		 * Depth First Search-like: send flow at along path from from->to recursively while increasing the level of the
		 * visited vertices by one
		 * @param start - the vertex to start at
		 * @param end - the vertex to try and reach
		 * @param targetFlow - the amount of flow to try and achieve
		 * @param count - keep track of which vertices have been visited so we don't include them twice
		 */
		private fun calcFlow(start: Int, end: Int, targetFlow: Int, count: IntArray) : Int {
			if (start === end) { // Sink reached , abort recursion
				return targetFlow
			}
			//let edge: Edge;
			var flowTillHere = 0
			var flowToT = 0
			while (count[start] < edges[start].size) { // Visit all edges of the vertex one after the other
				var edge = edges[start][count[start]]
				if (level[edge.to] === level[start] + 1 && edge.flow < edge.capacity) {
					// Edge leads to Vertex with a level one higher, and has flow left
					flowTillHere = minOf(targetFlow, edge.capacity - edge.flow)
					flowToT = calcFlow(edge.to, end, flowTillHere, count)
					if (flowToT > 0) {
						edge.flow += flowToT // Add Flow to current edge
						// subtract from reverse Edge -> Residual Graph neg. Flow to use backward direction of BFS/DFS
						edges[edge.to][edge.resEdge].flow -= flowToT
						return flowToT
					}
				}
				count[start]++
			}
			return 0
		}

		/**
		 * Uses Breadth First Search to find the vertices in the minCut for the graph
		 * - Must call calcMinCut first to prepare the graph
		 * @param from - the vertex to start from
		 */
		fun getMinCut(from: Int) : List<Int> {
			val eInCut = mutableListOf<Pair<Int, Int>>()

			for (i in level.indices)
				level[i] = -1

			level[from] = 1;
			val q = mutableListOf<Int>()
			q.add(from)
			var u = 0;
			//let edge: Edge;
			while (q.isNotEmpty()) {
				u = q.removeAt(0)
				for (edge in edges[u]) {
					if (edge.flow < edge.capacity) {
						if (level[edge.to] < 1) {
							level[edge.to] = 1
							q.add(edge.to)
						}
					}
					if (edge.flow === edge.capacity && edge.capacity > 0) { // blocking edge -> could be in min cut
						eInCut.add(Pair(edge.to, u ))
					}
				}
			}

			val minCut = mutableListOf<Int>()
			//let cutEdge: { to: number, unreachable: number };
			for (cutEdge in eInCut) {
				if (this.level[cutEdge.first] === -1) {
					// Only edges which are blocking and lead to the sink from unreachable vertices are in the min cut
					minCut.add(cutEdge.second)
				}
			}
			return minCut
		}

		/**
		 * Calculates min-cut graph using Dinic's Algorithm.
		 * use getMinCut to get the actual verticies in the minCut
		 * @param source - Source vertex
		 * @param sink - Sink vertex
		 */
		fun calcMinCut(source: Int, sink: Int) : Int {
			if (source === sink) {
				return -1
			}
			var ret = 0
			//let count = [];
			var flow = 0
			while (createLevelGraph(source, sink)) {
				val count = IntArray(totalVertices + 1){0}
				do {
					flow = calcFlow(source, sink, Int.MAX_VALUE, count)
					if (flow > 0) {
						ret += flow
					}
				} while (flow > 0)
			}
			return ret
		}
	}

	/**
	 * An Array with Terrain information: -1 not usable, 2 Sink (Leads to Exit)
	 * @param room - the room to generate the terrain map from
	 */
	private fun get2DArray(roomName: String, bounds: Rectangle = Rectangle(0,0,49,49)) : Array<IntArray> {
		val room2D = Array(50) {IntArray(50){NORMAL}}

		val terrain = Game.map.getRoomTerrain(roomName)

		for (x in bounds.x1..bounds.x2) {
			for (y in bounds.y1..bounds.y2) {
				if (terrain.get(x, y) == TERRAIN_MASK_WALL) {
					room2D[x][y] = UNWALKABLE // Mark unwalkable
				} else if (x == bounds.x1 || y == bounds.y1 || x == bounds.x2 || y == bounds.y2) {
					room2D[x][y] = EXIT // Mark exit tiles
				}
			}
		}

		// Marks tiles as unbuildable if they are proximate to exits
		for (y in bounds.y1+1 until bounds.y2) {
			if (room2D[bounds.x1][y] == EXIT) {
				for (dy in -1..1) {
					if (room2D[bounds.x1 + 1][y + dy] != UNWALKABLE) {
						room2D[bounds.x1 + 1][y + dy] = CANNOT_BUILD
					}
				}
			}
			if (room2D[bounds.x2][y] == EXIT) {
				for (dy in -1..1) {
					if (room2D[bounds.x2 - 1][y + dy] != UNWALKABLE) {
						room2D[bounds.x2 - 1][y + dy] = CANNOT_BUILD
					}
				}
			}
		}
		for (x in bounds.x1 + 1 until bounds.x2) {
			if (room2D[x][bounds.y1] == EXIT) {
				for (dx in -1..1) {
					if (room2D[x + dx][bounds.y1 + 1] != UNWALKABLE) {
						room2D[x + dx][bounds.y1 + 1] = CANNOT_BUILD
					}
				}
			}
			if (room2D[x][bounds.y2] == EXIT) {
				for (dx in -1..1) {
					if (room2D[x + dx][bounds.y2 - 1] != UNWALKABLE) {
						room2D[x + dx][bounds.y2 - 1] = CANNOT_BUILD
					}
				}
			}
		}

		return room2D
	}

	/**
	 * Function to create Source, Sink, Tiles arrays: takes a rectangle-Array as input for Tiles that are to Protect
	 * @param room - the room to consider
	 * @param toProtect - the coordinates to protect inside the walls
	 * @param bounds - the area to consider for the minCut
	 */
	private fun createGraph(roomName: String, toProtect: List<Rectangle>,
								bounds: Rectangle = Rectangle(x1 = 0, y1 = 0, x2 = 49, y2 = 49 ))
			: Graph {
		val roomArray = get2DArray(roomName, bounds)
		// For all Rectangles, set edges as source (to protect area) and area as unused
		//let r: Rectangle;
		//let x: number;
		//let y: number;
		for (r in toProtect) {
			if (bounds.x1 >= bounds.x2 || bounds.y1 >= bounds.y2 ||
				bounds.x1 < 0 || bounds.y1 < 0 || bounds.x2 > 49 || bounds.y2 > 49) {
				throw Exception("ERROR: Invalid bounds ${JSON.stringify(bounds)}")
			} else if (r.x1 >= r.x2 || r.y1 >= r.y2) {
				throw Exception("ERROR: Rectangle ${JSON.stringify(r)} invalid.");
			} else if (r.x1 < bounds.x1 || r.x2 > bounds.x2 || r.y1 < bounds.y1 || r.y2 > bounds.y2) {
				throw Exception("ERROR: Rectangle ${JSON.stringify(r)} out of bounds:  ${JSON.stringify(bounds)}")
			}
			for (x in r.x1 until r.x2 + 1) {
				for (y in r.y1 until r.y2 + 1) {
					if (x == r.x1 || x == r.x2 || y == r.y1 || y == r.y2) {
						if (roomArray[x][y] == NORMAL) {
							roomArray[x][y] = PROTECTED;
						}
					} else {
						roomArray[x][y] = UNWALKABLE;
					}
				}
			}
		}
		//let max: number;
		// ********************** Visualization
		if (true) {
			val visual = RoomVisual(roomName)
			for (x in bounds.x1 until bounds.x2 + 1) {
				for (y in bounds.y1 until bounds.y2 + 1) {
					val xd = x.toDouble()
					val yd = y.toDouble()
					when(roomArray[x][y]) {
						UNWALKABLE -> visual.circle(xd, yd, options { radius = 0.5; fill = "#111166"; opacity = 0.3 })
						NORMAL -> visual.circle(xd, yd, options { radius = 0.5; fill = "#e8e863"; opacity = 0.3 })
						PROTECTED -> visual.circle(xd, yd, options { radius = 0.5; fill = "#75e863"; opacity = 0.3 })
						CANNOT_BUILD -> visual.circle(xd, yd, options { radius = 0.5; fill = "#b063e8"; opacity = 0.3 })
					}
				}
			}
		}

		// initialise graph
		// possible 2*50*50 +2 (st) Vertices (Walls etc set to unused later)
		val g = Graph(2 * 50 * 50 + 2)
		val infini = Int.MAX_VALUE
		val surr = arrayOf(intArrayOf(0, -1),
				intArrayOf(-1, -1),
				intArrayOf(-1, 0),
				intArrayOf(-1, 1),
				intArrayOf(0, 1),
				intArrayOf(1, 1),
				intArrayOf(1, 0),
				intArrayOf(1, -1))
		// per Tile (0 in Array) top + bot with edge of c=1 from top to bott  (use every tile once!)
		// infini edge from bot to top vertices of adjacent tiles if they not protected (array =1)
		// (no reverse edges in normal graph)
		// per prot. Tile (1 in array) Edge from source to this tile with infini cap.
		// per exit Tile (2in array) Edge to sink with infini cap.
		// source is at  pos 2*50*50, sink at 2*50*50+1 as first tile is 0,0 => pos 0
		// top vertices <-> x,y : v=y*50+x   and x= v % 50  y=v/50 (math.floor?)
		// bot vertices <-> top + 2500
		val source = 2 * 50 * 50
		val sink = 2 * 50 * 50 + 1
		var top = 0
		var bot = 0
		var dx = 0
		var dy = 0
		var max = 49

		for (x in bounds.x1 + 1 until bounds.x2) {
			for (y in bounds.y1 + 1 until bounds.y2) {
				top = y * 50 + x
				bot = top + 2500
				if (roomArray[x][y] == NORMAL || roomArray[x][y] == PROTECTED) {
					if (roomArray[x][y] == NORMAL) {
						g.newEdge(top, bot, 1)
					} else if (roomArray[x][y] == PROTECTED) { // connect this to the source
						g.newEdge(source, top, infini)
						g.newEdge(top, bot, 1)
					}
					for (i in 0..7) { // attach adjacent edges
						dx = x + surr[i][0]
						dy = y + surr[i][1]
						if (roomArray[dx][dy] == NORMAL || roomArray[dx][dy] == CANNOT_BUILD) {
							g.newEdge(bot, dy * 50 + dx, infini)
						}
					}
				} else if (roomArray[x][y] == CANNOT_BUILD) { // near Exit
					g.newEdge(top, sink, infini)
				}
			}
		} // graph finished
		return g
	}

	/**
	 * Main function to be called by user: calculate min cut tiles from room using rectangles as protected areas
	 * @param room - the room to use
	 * @param rectangles - the areas to protect, defined as rectangles
	 * @param bounds - the area to be considered for the minCut
	 */
	public fun getCutTiles(roomName: String, toProtect: List<Rectangle>,
								bounds: Rectangle = Rectangle( x1 = 0, y1 = 0, x2 = 49, y2 = 49 ))
		: List<RoomPosition> {
		val graph = createGraph(roomName, toProtect, bounds)

		val source = 2 * 50 * 50 // Position Source / Sink in Room-Graph
		val sink = 2 * 50 * 50 + 1
		val count = graph.calcMinCut(source, sink)
		// console.log('Number of Tiles in Cut:', count);
		val positions = mutableListOf<RoomPosition>()
		if (count > 0) {
			val cutVertices = graph.getMinCut(source)

			for (v in cutVertices) {
				// x= vertex % 50  y=v/50 (math.floor?)
				val x = v % 50
				val y = kotlin.math.floor(v / 50.0).toInt()
				positions.add(RoomPosition( x, y, roomName))
			}
		}
		// Visualise Result
		if (positions.isNotEmpty()) {
			val visual = RoomVisual(roomName)
			positions.forEach {
				visual.circle(it.x.toDouble(), it.y.toDouble(), options { radius = 0.5; fill = "#ff7722"; opacity = 0.9 })
			}
		} else {
			return positions
		}
		val wholeRoom = bounds.x1 == 0 && bounds.y1 == 0 && bounds.x2 == 49 && bounds.y2 == 49
		return if(wholeRoom) positions
			else pruneDeadEnds(roomName, positions)
	}

	/**
	 * Removes unnecessary tiles if they are blocking the path to a dead end
	 * Useful if minCut has been run on a subset of the room
	 * @param roomName - Room to work in
	 * @param cutTiles - Array of tiles which are in the minCut
	 */
	private fun pruneDeadEnds(roomName: String, cutTiles: List<RoomPosition>) : List<RoomPosition> {
		// Get Terrain and set all cut-tiles as unwalkable
		val roomArray = get2DArray(roomName)

		for (tile in cutTiles) {
			roomArray[tile.x][tile.y] = UNWALKABLE
		}
		// Floodfill from exits: save exit tiles in array and do a BFS-like search
		val unvisited = mutableListOf<Int>()

		for (y in 0..49) {
			if (roomArray[0][y] == EXIT) {
				console.log("prune: toExit  0 $y")
				unvisited.add(50 * y)
			}
			if (roomArray[49][y] == EXIT) {
				console.log("prune: toExit 49 $y")
				unvisited.add(50 * y + 49)
			}
		}
		for (x in 0..49) {
			if (roomArray[x][0] == EXIT) {
				console.log("prune: toExit $x, 0")
				unvisited.add(x)
			}
			if (roomArray[x][49] == EXIT) {
				console.log("prune: toExit  $x, 49");
				unvisited.add(2450 + x) // 50*49=2450
			}
		}
		// Iterate over all unvisited EXIT tiles and mark neigbours as EXIT tiles if walkable, add to unvisited
		val surr = arrayOf(intArrayOf(0, -1),
				intArrayOf(-1, -1),
				intArrayOf(-1, 0),
				intArrayOf(-1, 1),
				intArrayOf(0, 1),
				intArrayOf(1, 1),
				intArrayOf(1, 0),
				intArrayOf(1, -1))

		while (unvisited.isNotEmpty()) {
			val currPos = unvisited.removeAt(0)
			val x = currPos % 50
			val y = kotlin.math.floor(currPos.toDouble() / 50.0).toInt()
			for (i in 0..7) {
				val dx = x + surr[i][0]
				val dy = y + surr[i][1]
				if (dx < 0 || dx > 49 || dy < 0 || dy > 49) {
					continue
				}
				if (roomArray[dx][dy] == NORMAL || roomArray[dx][dy] == CANNOT_BUILD) {
					unvisited.add(50 * dy + dx)
					roomArray[dx][dy] = EXIT
				}
			}
		}
		// Remove min-Cut-Tile if there is no EXIT reachable by it
		var leadsToExit = false
		val validCut = mutableListOf<RoomPosition>()
		for (tile in cutTiles) {
			leadsToExit = false
			for (j in 0..7) {
				val dx = tile.x + surr[j][0]
				val dy = tile.y + surr[j][1]
				if (roomArray[dx][dy] == EXIT) {
					leadsToExit = true
				}
			}
			if (leadsToExit) {
				validCut.add(tile)
			}
		}
		return validCut
	}

	/**
	 * Example function: demonstrates how to get a min cut with 2 rectangles, which define a "to protect" area
	 * @param roomName - the name of the room to use for the test, must be visible
	 */
	public fun test(roomName: String, subset: Boolean = false) {
		val room = Game.rooms[roomName]
		if(room == null) {
			console.log("No visibility")
			return
		}

		val startCpu = Game.cpu.getUsed()
		// Rectangle Array, the Rectangles will be protected by the returned tiles
		val rectArray = mutableListOf<Rectangle>()
		rectArray.add(Rectangle( x1 = 29, y1 = 12, x2 = 35, y2 = 18 ))
		rectArray.add(Rectangle( x1 = 33, y1 = 27, x2 = 39, y2 = 33 ))
		// Get Min cut
		val positions = if(!subset) getCutTiles(roomName, rectArray) // Positions is an array where to build walls/ramparts
		else getCutTiles(roomName, rectArray, Rectangle( x1 = 5, y1 = 5, x2 = 44, y2 = 44 ))
		// Test output
		console.log("Positions returned: ${positions.size}")
		val spentCpu = Game.cpu.getUsed() - startCpu
		console.log("Needed  $spentCpu cpu time")
	}
}