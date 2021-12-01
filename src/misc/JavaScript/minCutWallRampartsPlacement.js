//MinCut By Carson Burke. Modified by Michael Braecklein

//USAGE Example
//const minCut = require('class.mincut');
//const mc = new minCut(room);

//add all protected positions with radiuses
//mc.addAreaToProtect(controller.pos, 2); //3 is the default radius if not given. Do this for all areas to protect.
//mc.addAreaToProtect(bunker.pos, 10);
//mc.addAreaToProtect(source.pos, 3);
//const barrierPositions = mc.getCutTiles(); //returns an array of RoomPositions.

// Terrain types
const UNWALKABLE = -1;
const NORMAL = 0;
const PROTECTED = 1;
const TO_EXIT = 2;
const EXIT = 3;

class Graph {
	constructor(v) {
		this.v = v; // Vertex count
		this.level = Array(v);
		this.edges = Array(v).fill(0).map(x => []); // Array: for every vertex an edge Array mit {v,r,c,f} vertex_to,res_edge,capacity,flow
	}
	newEdge(u, v, c) { // Adds new edge from u to v
		this.edges[u].push({ v: v, r: this.edges[v].length, c: c, f: 0 }); // Normal forward Edge
		this.edges[v].push({ v: u, r: this.edges[u].length - 1, c: 0, f: 0 }); // reverse Edge for Residal Graph
	}
	Bfs(s, t) { // calculates Level Graph and if theres a path from s to t
		if (t >= this.v) return false;
		this.level.fill(-1); // reset old levels
		this.level[s] = 0;
		const q = []; // queue with s as starting point

		q.push(s);
		while (q.length) {
			const u = q.splice(0, 1)[0];
			for (let i = 0; i < this.edges[u].length; i++) {
				const edge = this.edges[u][i];
				if (this.level[edge.v] < 0 && edge.f < edge.c) {
					this.level[edge.v] = this.level[u] + 1;
					q.push(edge.v);
				}
			}
		}

		return this.level[t] >= 0; // return if theres a path to t -> no level, no path!
	};

	// DFS like: send flow at along path from s->t recursivly while increasing the level of the visited vertices by one
	// u vertex, f flow on path, t =Sink , c Array, c[i] saves the count of edges explored from vertex i
	Dfsflow(u, f, t, c) {
		if (u === t) // Sink reached , aboard recursion
			return f;

		while (c[u] < this.edges[u].length) { // Visit all edges of the vertex  one after the other
			let edge = this.edges[u][c[u]];

			if (this.level[edge.v] === this.level[u] + 1 && edge.f < edge.c) { // Edge leads to Vertex with a level one higher, and has flow left
				const flow_till_here = Math.min(f, edge.c - edge.f);
				const flow_to_t = this.Dfsflow(edge.v, flow_till_here, t, c);
				if (flow_to_t > 0) {
					edge.f += flow_to_t; // Add Flow to current edge
					this.edges[edge.v][edge.r].f -= flow_to_t; // subtract from reverse Edge -> Residual Graph neg. Flow to use backward direction of BFS/DFS
					return flow_to_t;
				}
			}
			c[u]++;
		}
		return 0;
	}

	Bfsthecut(s) { // breadth-first-search which uses the level array to mark the vertices reachable from s
		const e_in_cut = [];
		this.level.fill(-1);
		this.level[s] = 1;
		const q = [s];

		while (q.length) {
			const u = q.splice(0, 1)[0];
			const imax = this.edges[u].length;
			for (let i = 0; i < imax; i++) {
				let edge = this.edges[u][i];
				if (edge.f < edge.c) {
					if (this.level[edge.v] < 1) {
						this.level[edge.v] = 1;
						q.push(edge.v);
					}
				}
				if (edge.f === edge.c && edge.c > 0) { // blocking edge -> could be in min cut
					edge.u = u;
					e_in_cut.push(edge);
				}
			}
		}
		const min_cut = [];
		for (let i = 0; i < e_in_cut.length; i++) {
			if (this.level[e_in_cut[i].v] === -1) // Only edges which are blocking and lead to from s unreachable vertices are in the min cut
				min_cut.push(e_in_cut[i].u);
		}
		return min_cut;
	}
	Calcmincut(s, t) { // calculates min-cut graph (Dinic Algorithm)
		if (s === t)return -1;
		
		let returnvalue = 0;
		while (this.Bfs(s, t) === true) {
			const count = Array(this.v + 1).fill(0);
			let flow = 0;
			do {
				flow = this.Dfsflow(s, Number.MAX_VALUE, t, count);
				if (flow > 0)
					returnvalue += flow;
			} while (flow)
		}
		return returnvalue;
	}
}

class minCut {
	constructor(room) {
		this.room = room;
		this.roomName = room.name;
		this.protectedAreas = []; //our areas to protect
	}
	formatRoomTerrain(roomName, bounds = { x1: 0, y1: 0, x2: 49, y2: 49 }) {
        const room_2d = Array(50).fill(0).map(x => Array(50).fill(UNWALKABLE)); // Array for room tiles
        const terrain = Game.map.getRoomTerrain(roomName);

        // Loop through each tile and find terrain type, assign to usable terrain values
        for (let i = bounds.x1; i <= bounds.x2; i++) {
            for (let j = bounds.y1; j <= bounds.y2; j++) {
                if (terrain.get(i, j) !== TERRAIN_MASK_WALL) {
                    room_2d[i][j] = NORMAL; // mark unwalkable
                    if (i === bounds.x1 || j === bounds.y1 || i === bounds.x2 || j === bounds.y2) {
                        room_2d[i][j] = TO_EXIT; // user specified bounds, this will mark the exit of the bounds
                    }
                    if (i === 0 || j === 0 || i === 49 || j === 49) {
                        room_2d[i][j] = EXIT; // Exit Tiles mark of theroom.
                    }
                }
            }
        }

        // Marks tiles Near Exits for sink- where you cannot build wall/rampart
        for (let i = 1; i < 49; i++) {
            if (room_2d[0][i - 1] === EXIT) room_2d[1][i] = TO_EXIT;
            if (room_2d[0][i] === EXIT) room_2d[1][i] = TO_EXIT;
            if (room_2d[0][i + 1] === EXIT) room_2d[1][i] = TO_EXIT;
            if (room_2d[49][i - 1] === EXIT) room_2d[48][i] = TO_EXIT;
            if (room_2d[49][i] === EXIT) room_2d[48][i] = TO_EXIT;
            if (room_2d[49][i + 1] === EXIT) room_2d[48][i] = TO_EXIT;
            if (room_2d[i - 1][0] === EXIT) room_2d[i][1] = TO_EXIT;
            if (room_2d[i][0] === EXIT) room_2d[i][1] = TO_EXIT;
            if (room_2d[i + 1][0] === EXIT) room_2d[i][1] = TO_EXIT;
            if (room_2d[i - 1][49] === EXIT) room_2d[i][48] = TO_EXIT;
            if (room_2d[i][49] === EXIT) room_2d[i][48] = TO_EXIT;
            if (room_2d[i + 1][49] === EXIT) room_2d[i][48] = TO_EXIT;
        }

        // mark Border Tiles near room edge as unwalkable
        for (let i = 1; i < 49; i++) {
            room_2d[0][i] == UNWALKABLE;
            room_2d[49][i] == UNWALKABLE;
            room_2d[i][0] == UNWALKABLE;
            room_2d[i][49] == UNWALKABLE;
        }
        return room_2d;
    }

    // Function to create Source, Sink, Tiles arrays: takes a rectangle-Array as input for Tiles that are to Protect
    // rects have top-left/bottom_right Coordinates {x1,y1,x2,y2}
    createGraph(roomName, rect, bounds) {
        // Create array with terrain usable information
        const roomArray = this.formatRoomTerrain(roomName, bounds)

        // Check if near exit
        const exits = this.room.find(FIND_EXIT)

        for (const exit of exits) {
            if (exit.getRangeTo(rect.x1, rect.y1) === 0 || exit.getRangeTo(rect.x2, rect.y2) === 0) {
                return console.log("ERROR: Too close to exit")
            }
        }

        for (const r of rect) {
            // Test sizes of rectangles
            if (r.x1 >= r.x2 || r.y1 >= r.y2) {
                return console.log('ERROR: Rectangle Nr.', j, JSON.stringify(r), 'invalid.')
            }

            for (let x = r.x1; x < r.x2 + 1; x++) {
                if (!roomArray[x]) continue
                for (let y = r.y1; y < r.y2 + 1; y++) {
                    if (x === r.x1 || x === r.x2 || y === r.y1 || y === r.y2) {
                        if (roomArray[x][y] === NORMAL) roomArray[x][y] = PROTECTED
                    } else roomArray[x][y] = UNWALKABLE
                }
            }
        }


		const visual = new RoomVisual(roomName);

		for (let x = 0; x < 50; x++) {
			for (let y = 0; y < 50; y++) {
				if (roomArray[x][y] === UNWALKABLE) {
					visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: '#111166', opacity: 0.3, stroke: "#111166", strokeWidth: 0.05 })
				} else if (roomArray[x][y] === NORMAL) {
					visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: '#e8e863', opacity: 0.3, stroke: "#e8e863", strokeWidth: 0.05 })
				} else if (roomArray[x][y] === PROTECTED) {
					visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: '#75e863', opacity: 0.3, stroke: "#75e863", strokeWidth: 0.05 })
				} else if (roomArray[x][y] === TO_EXIT) {
					visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: '#b063e8', opacity: 0.3, stroke: "#b063e8", strokeWidth: 0.05 })
				}
			}
		}
        // initialise graph
        // possible 2*50*50 +2 (st) Vertices (Walls etc set to unused later)
        const g = new Graph(2 * 50 * 50 + 2)
        const infini = Number.MAX_VALUE
        const surr = [
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1]
        ]

        // per Tile (0 in Array) top + bottom with edge of c=1 from top to bottomt  (use every tile once!)
        // infini edge from bottom to top vertices of adjacent tiles if they not protected (array =1) (no reverse edges in normal graph)
        // per prot. Tile (1 in array) Edge from source to this tile with infini cap.
        // per exit Tile (2in array) Edge to sink with infini cap.
        // source is at  pos 2*50*50, sink at 2*50*50+1 as first tile is 0,0 => pos 0
        // top vertices <-> x,y : v=y*50+x   and x= v % 50  y=v/50 (math.floor?)
        // bottom vertices <-> top + 2500
        const sink = 2 * 50 * 50 + 1

        for (let x = 1; x < 49; x++) {
            for (let y = 1; y < 49; y++) {

                const top = y * 50 + x;
                const bottom = top + 2500;

                if (roomArray[x][y] === NORMAL) { // normal Tile
                    // If normal tile do x
                    g.newEdge(top, bottom, 1);
                    for (let i = 0; i < 8; i++) {
                        const dx = x + surr[i][0];
                        const dy = y + surr[i][1];
                        if (roomArray[dx][dy] === NORMAL || roomArray[dx][dy] === TO_EXIT) g.newEdge(bottom, dy * 50 + dx, infini);
                    }
                } else if (roomArray[x][y] === PROTECTED) {
                    // If protected tile do x
                    g.newEdge(5000, top, infini);
                    g.newEdge(top, bottom, 1);
                    for (let i = 0; i < 8; i++) {
                        const dx = x + surr[i][0];
                        const dy = y + surr[i][1];
                        if (roomArray[dx][dy] === NORMAL || roomArray[dx][dy] === TO_EXIT) g.newEdge(bottom, dy * 50 + dx, infini);
                    }
                } else if (roomArray[x][y] === TO_EXIT) {
                    // If exit tile do x
                    g.newEdge(top, sink, infini);
                }
            }
        }

        return g;
    }

    deleteTilesToDeadEnds(cut_tiles_array) {
        // make any tiles that don't have a path to the exits unwalkable terrain
        const roomArray = room_2d_array(this.roomName);
        for (let i = cut_tiles_array.length - 1; i >= 0; i--) {
            roomArray[cut_tiles_array[i].x][cut_tiles_array[i].y] = UNWALKABLE;
        }

        // Floodfill from exits: save exit tiles in array and do a bfs-like search
        // I think that they are just making any tile that is at the edge and not a dark blue tile an exit; they then add those tiles to the Breadth's first search algorithm
        const unvisited_pos = [];
        for (let y = 0; y < 49; y++) {
            if (roomArray[1][y] === TO_EXIT) unvisited_pos.push(50 * y + 1)
            if (roomArray[48][y] === TO_EXIT) unvisited_pos.push(50 * y + 48)
        }

        for (let x = 0; x < 49; x++) {
            if (roomArray[x][1] === TO_EXIT) unvisited_pos.push(50 + x)
            if (roomArray[x][48] === TO_EXIT) unvisited_pos.push(2400 + x) // 50*48=2400
        }

        // Iterate over all unvisited TO_EXIT- Tiles and mark neigbours as TO_EXIT tiles, if walkable (NORMAL), and add to unvisited
        /* This array holds all of the relative positions of each neighboring tile, including diagonally
         * * *
         * # *
         * * *
         */
        const surr = [
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1]
        ];
        while (unvisited_pos.length > 0) {
            // Take the last tile from the unvisited tiles array, and set it as the current tile to be "inspected"
            const index = unvisited_pos.pop();

            const x = index % 50;
            const y = Math.floor(index / 50);

            // Loop through all neighboring tiles as determined by the relative positions in "surr"
            for (let i = 0; i < 8; i++) {
                // Current neighbor
                const dx = x + surr[i][0];
                const dy = y + surr[i][1];

                // If the neighboring tile is walkable (NORMAL), add it to the unvisited tiles array to continue the Breadths first search
                // Since the search began at the exit, we know that if this tile has been reached, it has a path to the exit, so we mark it as such
                if (roomArray[dx][dy] === NORMAL) {
                    unvisited_pos.push(50 * dy + dx);
                    roomArray[dx][dy] = TO_EXIT;
                }
            }
        }

        // Remove tile if there is no TO-EXIT surrounding it
        for (let i = cut_tiles_array.length - 1; i >= 0; i--) {
            let leads_to_exit = false;

            // Loop through the tile's neighbors once again
            const x = cut_tiles_array[i].x;
            const y = cut_tiles_array[i].y;
            for (let i = 0; i < 8; i++) {
                const dx = x + surr[i][0];
                const dy = y + surr[i][1];

                // If the tile has a path to the exit, then set the flag to skip it
                if (roomArray[dx][dy] === TO_EXIT) {
                    leads_to_exit = true;
                }
            }

            // If the tile doesn't lead to an exit, remove it from the array (this should remove it from the "positions" array that was originally passed to this function)
            if (!leads_to_exit) {
                cut_tiles_array.splice(i, 1);
            }
        }
    }
	//pass center point and radius
	addAreaToProtect(pos, dist = 3) {
		const exits = this.room.find(FIND_EXIT)
		for (const exit of exits) {
			if (exit.getRangeTo(pos) <= dist) {
				return;
			}
		}
		// If not near give position for protection
		this.protectedAreas.push({ x1: pos.x - dist, y1: pos.y - dist, x2: pos.x + dist, y2: pos.y + dist });
	}
    // Function for user: calculate min cut tiles from room, rect[]
    getCutTiles(rect = this.protectedAreas, bounds = { x1: 0, y1: 0, x2: 49, y2: 49 }) {
        const graph = this.createGraph(this.roomName, rect); // Get the map 
        const source = 5000
        const sink = 2 * 50 * 50 + 1;
        const count = graph.Calcmincut(source, sink);

        const positions = [];
        if (count > 0) {
            // I think by cut_edges, they mean any edge that is not unwalkable
            const cut_edges = graph.Bfsthecut(source);
            // Get Positions from Edge

            for (let i = 0; i < cut_edges.length; i++) {
                const u = cut_edges[i]; // x= v % 50  y=v/50 (math.floor?)
                const x = u % 50;
                const y = Math.floor(u / 50);
                positions.push(new RoomPosition(x, y, this.roomName))
            }
        }

        // if bounds are given,
        // try to dectect islands of walkable tiles, which are not conntected to the exits, and delete them from the cut-tiles

        const whole_room = (bounds.x1 == 0 && bounds.y1 == 0 && bounds.x2 == 49 && bounds.y2 == 49);
        if (positions.length > 0 && !whole_room)
            this.deleteTilesToDeadEnds(positions);

        // Visualise Result
        if (positions.length > 0) {
            const visual = new RoomVisual(this.roomName);
            for (let i = positions.length - 1; i >= 0; i--) {
                // These must be the walls
                visual.circle(positions[i].x, positions[i].y, { radius: 0.4, fill: COLOR_GREEN, opacity: 0.8 });
            }
        }
        return _.map(positions, coord => new RoomPosition(coord.x, coord.y, this.roomName));
    }
}

module.exports = minCut
