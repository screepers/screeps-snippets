/*
 * Posted 20 June 2019 by @engineeryo  
 * Get type of room from name
 *
 * @author engineeryo
 * @co-author warinternal
 */

global.ROOM_STANDARD = 		'room'
global.ROOM_SOURCE_KEEPER =	'source_keeper'
global.ROOM_CENTER =		'center'
global.ROOM_HIGHWAY = 		'highway'
global.ROOM_CROSSROAD = 	'highway_portal'

Room.describe = function(name) {
	const [EW, NS] = name.match(/\d+/g)
	if (EW%10 == 0 && NS%10 == 0) {
		return ROOM_CROSSROAD
	}
  	else if (EW%10 == 0 || NS%10 == 0) {
		return ROOM_HIGHWAY
	}
	else if (EW%5 == 0 && NS%5 == 0) {
		return ROOM_CENTER
	}
	else if (Math.abs(5 - EW%10) <= 1 && Math.abs(5 - NS%10) <= 1) {
		return ROOM_SOURCE_KEEPER
	}
	else {
		return ROOM_STANDARD
	}
}
