// enrico 25 February 2017 at 23:38
let isAlleyRoom = /^[WE]\d*0[NS]\d*0$/.test(roomName);
let isCoreRoom = /(^[WE]\d*5[NS]\d*5$)|(^[WE]\d*5[NS]\d*5$)/.test(roomName);
let isCenterRoom = /^[WE]\d*[4-6]+[NS]\d*[4-6]+$/.test(roomName); // = core room + sk rooms
let isSourceKeeperRoom = /(^[WE]\d*[4-6][NS]\d*[4|6]$)|(^[WE]\d*[4|6][NS]\d*[4-6]$)/.test(
  roomName
);
let isControllerRoom = /(^[WE]\d*[1-9]+[NS]\d*[1-3|7-9]+$)|(^[WE]\d*[1-3|7-9]+[NS]\d*[1-9]+$)/.test(
  roomName
);
