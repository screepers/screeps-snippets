// issacar 18 April 2017 at 20:49

let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
let fMod = parsed[1] % 10;
let sMod = parsed[2] % 10;
let isSK =
  !(fMod === 5 && sMod === 5) &&
  (fMod >= 4 && fMod <= 6) &&
  (sMod >= 4 && sMod <= 6);
