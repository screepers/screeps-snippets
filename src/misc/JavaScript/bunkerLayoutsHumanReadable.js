/**
 * Posted 19 October 2017 by @sparr
 */

// maps letters in the layout arrays to structures and vice versa
exports.layoutKey = {
    'A': STRUCTURE_SPAWN,
    'N': STRUCTURE_NUKER,
    'K': STRUCTURE_LINK,
    'L': STRUCTURE_LAB,
    'E': STRUCTURE_EXTENSION,
    'S': STRUCTURE_STORAGE,
    'T': STRUCTURE_TOWER,
    'O': STRUCTURE_OBSERVER,
    'M': STRUCTURE_TERMINAL,
    'P': STRUCTURE_POWER_SPAWN,
    '.': STRUCTURE_ROAD,
    'C': STRUCTURE_CONTAINER,
    'R': STRUCTURE_RAMPART,
    'W': STRUCTURE_WALL,
};
_.merge(exports.layoutKey, _.invert(exports.layoutKey));

// the preferred layout, if there's enough room
exports.bunkerLayout = [
    '  ..E...E..  ',
    ' .EE.EEE.EE. ',
    '.EE.E.E.E.EE.',
    '.E.EEA.EEE.E.',
    'E.EEE.T.EEE.E',
    '.E.E.T.T.A.E.',
    '.EE.NSKMP.E.E',
    '.E.E.T.T.E.E.',
    'E.EEE.T.OLL..',
    '.E.EEA.ELL.L.',
    '.EE.E.E.L.LL.',
    ' .EE.E.E.LL. ',
    '  ..E.E....  ',
];

exports.bunkerExtensionOrder = [
    '    3   7    ',
    '  43 447 78  ',
    ' 43 2 4 7 78 ',
    ' 3 24  887 7 ',
    '3 242   887 7',
    ' 4 2       7 ',
    ' 44       8 8',
    ' 5 5     8 8 ',
    '5 566        ',
    ' 5 56  6     ',
    ' 65 5 6      ',
    '  65 5 6     ',
    '    6 6      ',
];

exports.bunkerRoadOrder = [
    '  .. ... ..  ',
    ' .  2   7  . ',
    '.  2 2 7 7  .',
    '. 2   2   7 .',
    ' 2   2 3   7 ',
    '. 2 2 3 7 7 .',
    '.  2     7 8 ',
    '. 5 5 . . 8 .',
    ' 5   5 .   ..',
    '. 5   5   . .',
    '.  5 5 6 .  .',
    ' .  5 6 .  . ',
    '  .. . ....  ',
];

exports.bunkerRampartOrder = [
    '  555555555  ',
    ' 55777777755 ',
    '5577777777755',
    '57777   77775',
    '5777  3  7775',
    '577  333  775',
    '577 33333 775',
    '577  333  775',
    '5777  3  7775',
    '57777   77775',
    '5577777777755',
    ' 55777777755 ',
    '  555555555  ',
];

// just the core of the bunker, plus two spawns
exports.coreLayout = [
    '   .   ',
    '  AT.  ',
    ' .T.T. ',
    '.NSKMP.',
    ' .T.T. ',
    '  .TAO ',
    '   .   ',
];

// just the lab block, for placement elsewhere if necessary
exports.labLayout = [
    ' LL.',
    'LL.L',
    'L.LL',
    '.LL ',
];

// rapid-fill extension block, if there's room
exports.extensionLayout = [
    '     EEE   ',
    '   EErrEE  ',
    '  EErEErEE ',
    ' EErEEErrEE',
    'EErECECEErE',
    ' rEEEKEEEr ',
    'ErEECECErEE',
    'EErrEEErEE ',
    ' EErEErEE  ',
    '  EErrEE   ',
    '   EEE     ',
];

/**
 * Get all the positions for a certain structure/letter from a layout
 * @param  {String[]} layout
 * @param  {String|String} char letter or structure to return, optional
 * @return {{x:Number,y:Number}[]} array of coordinate objects
 * @return {Object} map of structure types to arrays of coordinate objects
 */
exports.getPositions = function(layout, char) {
    if (typeof(char) === 'string') {
        char = [char];
    }
    const height = layout.length;
    const width = layout[0].length;
    const top = height / 2 | 0;
    const left = width / 2 | 0;
    if (char instanceof Array) {
        const positions = [];
        for (let c of char) {
            if (c.length>1) {
                if (c in exports.layoutKey) {
                    c = exports.layoutKey[c];
                } else {
                    continue;
                }
            }
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (layout[y][x] === c) {
                        positions.push({x: x-left, y: y-top});
                    }
                }
            }
        }
        return positions;
    } else {
        const positions = {};
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = layout[y][x];
                positions[exports.layoutKey[char]] = positions[exports.layoutKey[char]] || [];
                positions[exports.layoutKey[char]].push({x: x-left, y: y-top});
            }
        }
    }
};
