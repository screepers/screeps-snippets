// original post from @domnomnom, Dec 6, 2016

//Heck yes: Generators
function* myTerminals() {
    for (const room of _.values(Game.rooms)) {
        const terminal = room.terminal;
        if (terminal && terminal.my) yield terminal;
    }
}

for (const terminal of myTerminals()) {
	console.log(`> ${terminal} ${terminal.pos.roomName}`);
}