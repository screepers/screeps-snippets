/**
 * Posted 25 August 2017 by @Daboross
 * 
 * String storage, encoding and decoding Uint8Array arrays.
 *
 * All credit for figuring out the actual implementation goes to dissi (@dissi) and ScreepsDiplomacy
 * (https://github.com/ButAds/ScreepsDiplomacy).
 *
 * This is a copy of the internals of ScreepsDiplomacy's DiplomacyPacket, but optimized for use encoding directly
 * from and decoding directly to Uint8Arrays.
 */
const stringStorage = global.StringStorage = {
    encode: function (byteArray) {
        var BITS_PER_CHARACTER = 15,
            BITS_PER_BYTE = 8;
        var result = [];
        var bitNum = 0;
        var currentCharData = 0;
        for (var i = 0; i < byteArray.length; i++) {
            var thisByte = byteArray[i];
            for (var j = 0; j < BITS_PER_BYTE; j++) {
                var thisBit = thisByte >> j & 0x1;

                currentCharData |= thisBit << bitNum;
                bitNum += 1;
                if (bitNum >= BITS_PER_CHARACTER) {
                    result.push(String.fromCodePoint(currentCharData));
                    bitNum = 0;
                    currentCharData = 0;
                }
            }
        }
        if (currentCharData) {
            // To be honest, this _could_ have data in it that's = 0, but a null byte is not very well serialized
            // to JSON. Instead, we just append 2 '0's whenever decoding something, and that works out alright.
            result.push(String.fromCodePoint(currentCharData));
        }
        return result.join('');
    },
    decode: function (string) {
        var BITS_PER_CHARACTER = 15,
            BITS_PER_BYTE = 8;
        // Add in two 0 bytes to the end to account for any 0's that were stripped at the end of the encoding.
        var result = new Uint8Array(Math.ceil(string.length * BITS_PER_CHARACTER / BITS_PER_BYTE) + 2);
        var resultPos = 0;

        var bitNum = 0;
        var currentByte = 0;
        for (var i = 0; i < string.length; i++) {
            var thisCharData = string.codePointAt(i);
            for (var j = 0; j < BITS_PER_CHARACTER; j++) {
                var bit = thisCharData >> j & 0x1;
                currentByte |= bit << bitNum;
                bitNum += 1;
                if (bitNum >= BITS_PER_BYTE) {
                    result[resultPos++] = currentByte;
                    bitNum = 0;
                    currentByte = 0;
                }
            }
        }
        // This could have been unmodified, but at worst that just adds an extra '0' to the end!
        // Pbf ignores bytes after the message ends, so it doesn't really matter.
        result[resultPos++] = currentByte;
        // fill the rest of the array up with 0s
        for (resultPos; resultPos < result.length; resultPos++) {
            result[resultPos] = 0;
        }
        return result;
    }
};