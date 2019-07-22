/**
 * Posted 25 August 2017 by @Daboross
 * 
 * Metadata storage!
 *
 * This file contains version 3.0.5 of the 'pbf' protocol buffer library, our compiled protocol buffer definitions, a
 * Uint8Array <-> string (via utf8 characters) compressor, and a wrapper to expose in globals.
 *
 * I could probably have written the manual parts in here separately, and built something to automatically generate this
 * file, but honestly it seemed like much more work than it would be worth. It shouldn't be too hard to update with new
 * compiled protocol buffer definitions anyways, just have to write a few functions for the encode/decode wrappers and
 * a default constructor!
 *
 * Credits:
 *
 * - pbf (https://github.com/mapbox/pbf) for the library that is included, and for the node application which is used to
 *   generate the compiled JavaScript code from the protocol buffer definition files.
 * - ScreepsDiplomacy (https://github.com/ButAds/ScreepsDiplomacy) for the base code for quickly turning raw binary data
 *   into compact JavaScript strings.
 * - dissi (@dissi, dissi in Screeps) for research into how JavaScript strings work, which is greatly used in here.
 */
'use strict';

function defineRoomMetadataPrototypes() {
    // let's just inline the pbf library, because why not! :D
    // Note: the 'float' functionality is completely removed from this, as we don't ever use it, and it required
    // an additional library.
    const Pbf = (function () {
        'use strict';

        function Pbf(buf) {
            this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
            this.pos = 0;
            this.type = 0;
            this.length = this.buf.length;
        }

        Pbf.Varint = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
        Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
        Pbf.Bytes = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
        Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

        var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
            SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

        Pbf.prototype = {

            destroy: function () {
                this.buf = null;
            },

            // === READING =================================================================

            readFields: function (readField, result, end) {
                end = end || this.length;

                while (this.pos < end) {
                    var val = this.readVarint(),
                        tag = val >> 3,
                        startPos = this.pos;

                    this.type = val & 0x7;
                    readField(tag, result, this);

                    if (this.pos === startPos) this.skip(val);
                }
                return result;
            },

            readMessage: function (readField, result) {
                return this.readFields(readField, result, this.readVarint() + this.pos);
            },

            readFixed32: function () {
                var val = readUInt32(this.buf, this.pos);
                this.pos += 4;
                return val;
            },

            readSFixed32: function () {
                var val = readInt32(this.buf, this.pos);
                this.pos += 4;
                return val;
            },

            // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

            readFixed64: function () {
                var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
                this.pos += 8;
                return val;
            },

            readSFixed64: function () {
                var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
                this.pos += 8;
                return val;
            },

            readVarint: function (isSigned) {
                var buf = this.buf,
                    val, b;

                b = buf[this.pos++];
                val = b & 0x7f;
                if (b < 0x80) return val;
                b = buf[this.pos++];
                val |= (b & 0x7f) << 7;
                if (b < 0x80) return val;
                b = buf[this.pos++];
                val |= (b & 0x7f) << 14;
                if (b < 0x80) return val;
                b = buf[this.pos++];
                val |= (b & 0x7f) << 21;
                if (b < 0x80) return val;
                b = buf[this.pos];
                val |= (b & 0x0f) << 28;

                return readVarintRemainder(val, isSigned, this);
            },

            readVarint64: function () { // for compatibility with v2.0.1
                return this.readVarint(true);
            },

            readSVarint: function () {
                var num = this.readVarint();
                return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
            },

            readBoolean: function () {
                return Boolean(this.readVarint());
            },

            readString: function () {
                var end = this.readVarint() + this.pos,
                    str = readUtf8(this.buf, this.pos, end);
                this.pos = end;
                return str;
            },

            readBytes: function () {
                var end = this.readVarint() + this.pos,
                    buffer = this.buf.subarray(this.pos, end);
                this.pos = end;
                return buffer;
            },

            // verbose for performance reasons; doesn't affect gzipped size

            readPackedVarint: function (arr, isSigned) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readVarint(isSigned));
                return arr;
            },
            readPackedSVarint: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readSVarint());
                return arr;
            },
            readPackedBoolean: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readBoolean());
                return arr;
            },
            readPackedFixed32: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readFixed32());
                return arr;
            },
            readPackedSFixed32: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readSFixed32());
                return arr;
            },
            readPackedFixed64: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readFixed64());
                return arr;
            },
            readPackedSFixed64: function (arr) {
                var end = readPackedEnd(this);
                arr = arr || [];
                while (this.pos < end) arr.push(this.readSFixed64());
                return arr;
            },

            skip: function (val) {
                var type = val & 0x7;
                if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {
                }
                else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
                else if (type === Pbf.Fixed32) this.pos += 4;
                else if (type === Pbf.Fixed64) this.pos += 8;
                else throw new Error('Unimplemented type: ' + type);
            },

            // === WRITING =================================================================

            writeTag: function (tag, type) {
                this.writeVarint((tag << 3) | type);
            },

            realloc: function (min) {
                var length = this.length || 16;

                while (length < this.pos + min) length *= 2;

                if (length !== this.length) {
                    var buf = new Uint8Array(length);
                    buf.set(this.buf);
                    this.buf = buf;
                    this.length = length;
                }
            },

            finish: function () {
                this.length = this.pos;
                this.pos = 0;
                return this.buf.subarray(0, this.length);
            },

            writeFixed32: function (val) {
                this.realloc(4);
                writeInt32(this.buf, val, this.pos);
                this.pos += 4;
            },

            writeSFixed32: function (val) {
                this.realloc(4);
                writeInt32(this.buf, val, this.pos);
                this.pos += 4;
            },

            writeFixed64: function (val) {
                this.realloc(8);
                writeInt32(this.buf, val & -1, this.pos);
                writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
                this.pos += 8;
            },

            writeSFixed64: function (val) {
                this.realloc(8);
                writeInt32(this.buf, val & -1, this.pos);
                writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
                this.pos += 8;
            },

            writeVarint: function (val) {
                val = +val || 0;

                if (val > 0xfffffff || val < 0) {
                    writeBigVarint(val, this);
                    return;
                }

                this.realloc(4);

                this.buf[this.pos++] = val & 0x7f | (val > 0x7f ? 0x80 : 0);
                if (val <= 0x7f) return;
                this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0);
                if (val <= 0x7f) return;
                this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0);
                if (val <= 0x7f) return;
                this.buf[this.pos++] = (val >>> 7) & 0x7f;
            },

            writeSVarint: function (val) {
                this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
            },

            writeBoolean: function (val) {
                this.writeVarint(Boolean(val));
            },

            writeString: function (str) {
                str = String(str);
                this.realloc(str.length * 4);

                this.pos++; // reserve 1 byte for short string length

                var startPos = this.pos;
                // write the string directly to the buffer and see how much was written
                this.pos = writeUtf8(this.buf, str, this.pos);
                var len = this.pos - startPos;

                if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

                // finally, write the message length in the reserved place and restore the position
                this.pos = startPos - 1;
                this.writeVarint(len);
                this.pos += len;
            },

            writeBytes: function (buffer) {
                var len = buffer.length;
                this.writeVarint(len);
                this.realloc(len);
                for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
            },

            writeRawMessage: function (fn, obj) {
                this.pos++; // reserve 1 byte for short message length

                // write the message directly to the buffer and see how much was written
                var startPos = this.pos;
                fn(obj, this);
                var len = this.pos - startPos;

                if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

                // finally, write the message length in the reserved place and restore the position
                this.pos = startPos - 1;
                this.writeVarint(len);
                this.pos += len;
            },

            writeMessage: function (tag, fn, obj) {
                this.writeTag(tag, Pbf.Bytes);
                this.writeRawMessage(fn, obj);
            },

            writePackedVarint: function (tag, arr) {
                this.writeMessage(tag, writePackedVarint, arr);
            },
            writePackedSVarint: function (tag, arr) {
                this.writeMessage(tag, writePackedSVarint, arr);
            },
            writePackedBoolean: function (tag, arr) {
                this.writeMessage(tag, writePackedBoolean, arr);
            },
            writePackedFixed32: function (tag, arr) {
                this.writeMessage(tag, writePackedFixed32, arr);
            },
            writePackedSFixed32: function (tag, arr) {
                this.writeMessage(tag, writePackedSFixed32, arr);
            },
            writePackedFixed64: function (tag, arr) {
                this.writeMessage(tag, writePackedFixed64, arr);
            },
            writePackedSFixed64: function (tag, arr) {
                this.writeMessage(tag, writePackedSFixed64, arr);
            },

            writeBytesField: function (tag, buffer) {
                this.writeTag(tag, Pbf.Bytes);
                this.writeBytes(buffer);
            },
            writeFixed32Field: function (tag, val) {
                this.writeTag(tag, Pbf.Fixed32);
                this.writeFixed32(val);
            },
            writeSFixed32Field: function (tag, val) {
                this.writeTag(tag, Pbf.Fixed32);
                this.writeSFixed32(val);
            },
            writeFixed64Field: function (tag, val) {
                this.writeTag(tag, Pbf.Fixed64);
                this.writeFixed64(val);
            },
            writeSFixed64Field: function (tag, val) {
                this.writeTag(tag, Pbf.Fixed64);
                this.writeSFixed64(val);
            },
            writeVarintField: function (tag, val) {
                this.writeTag(tag, Pbf.Varint);
                this.writeVarint(val);
            },
            writeSVarintField: function (tag, val) {
                this.writeTag(tag, Pbf.Varint);
                this.writeSVarint(val);
            },
            writeStringField: function (tag, str) {
                this.writeTag(tag, Pbf.Bytes);
                this.writeString(str);
            },
            writeBooleanField: function (tag, val) {
                this.writeVarintField(tag, Boolean(val));
            }
        };

        function readVarintRemainder(l, s, p) {
            var buf = p.buf,
                h, b;

            b = buf[p.pos++];
            h = (b & 0x70) >> 4;
            if (b < 0x80) return toNum(l, h, s);
            b = buf[p.pos++];
            h |= (b & 0x7f) << 3;
            if (b < 0x80) return toNum(l, h, s);
            b = buf[p.pos++];
            h |= (b & 0x7f) << 10;
            if (b < 0x80) return toNum(l, h, s);
            b = buf[p.pos++];
            h |= (b & 0x7f) << 17;
            if (b < 0x80) return toNum(l, h, s);
            b = buf[p.pos++];
            h |= (b & 0x7f) << 24;
            if (b < 0x80) return toNum(l, h, s);
            b = buf[p.pos++];
            h |= (b & 0x01) << 31;
            if (b < 0x80) return toNum(l, h, s);

            throw new Error('Expected varint not more than 10 bytes');
        }

        function readPackedEnd(pbf) {
            return pbf.type === Pbf.Bytes ?
                pbf.readVarint() + pbf.pos : pbf.pos + 1;
        }

        function toNum(low, high, isSigned) {
            if (isSigned) {
                return high * 0x100000000 + (low >>> 0);
            }

            return ((high >>> 0) * 0x100000000) + (low >>> 0);
        }

        function writeBigVarint(val, pbf) {
            var low, high;

            if (val >= 0) {
                low = (val % 0x100000000) | 0;
                high = (val / 0x100000000) | 0;
            } else {
                low = ~(-val % 0x100000000);
                high = ~(-val / 0x100000000);

                if (low ^ 0xffffffff) {
                    low = (low + 1) | 0;
                } else {
                    low = 0;
                    high = (high + 1) | 0;
                }
            }

            if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
                throw new Error('Given varint doesn\'t fit into 10 bytes');
            }

            pbf.realloc(10);

            writeBigVarintLow(low, high, pbf);
            writeBigVarintHigh(high, pbf);
        }

        function writeBigVarintLow(low, high, pbf) {
            pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
            low >>>= 7;
            pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
            low >>>= 7;
            pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
            low >>>= 7;
            pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
            low >>>= 7;
            pbf.buf[pbf.pos] = low & 0x7f;
        }

        function writeBigVarintHigh(high, pbf) {
            var lsb = (high & 0x07) << 4;

            pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 0x80 : 0);
            if (!high) return;
            pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
            if (!high) return;
            pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
            if (!high) return;
            pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
            if (!high) return;
            pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
            if (!high) return;
            pbf.buf[pbf.pos++] = high & 0x7f;
        }

        function makeRoomForExtraLength(startPos, len, pbf) {
            var extraLen =
                len <= 0x3fff ? 1 :
                    len <= 0x1fffff ? 2 :
                        len <= 0xfffffff ? 3 : Math.ceil(Math.log(len) / (Math.LN2 * 7));

            // if 1 byte isn't enough for encoding message length, shift the data to the right
            pbf.realloc(extraLen);
            for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
        }

        function writePackedVarint(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
        }

        function writePackedSVarint(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
        }

        function writePackedBoolean(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
        }

        function writePackedFixed32(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
        }

        function writePackedSFixed32(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
        }

        function writePackedFixed64(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
        }

        function writePackedSFixed64(arr, pbf) {
            for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
        }

        // Buffer code below from https://github.com/feross/buffer, MIT-licensed

        function readUInt32(buf, pos) {
            return ((buf[pos]) |
                (buf[pos + 1] << 8) |
                (buf[pos + 2] << 16)) +
                (buf[pos + 3] * 0x1000000);
        }

        function writeInt32(buf, val, pos) {
            buf[pos] = val;
            buf[pos + 1] = (val >>> 8);
            buf[pos + 2] = (val >>> 16);
            buf[pos + 3] = (val >>> 24);
        }

        function readInt32(buf, pos) {
            return ((buf[pos]) |
                (buf[pos + 1] << 8) |
                (buf[pos + 2] << 16)) +
                (buf[pos + 3] << 24);
        }

        function readUtf8(buf, pos, end) {
            var str = '';
            var i = pos;

            while (i < end) {
                var b0 = buf[i];
                var c = null; // codepoint
                var bytesPerSequence =
                    b0 > 0xEF ? 4 :
                        b0 > 0xDF ? 3 :
                            b0 > 0xBF ? 2 : 1;

                if (i + bytesPerSequence > end) break;

                var b1, b2, b3;

                if (bytesPerSequence === 1) {
                    if (b0 < 0x80) {
                        c = b0;
                    }
                } else if (bytesPerSequence === 2) {
                    b1 = buf[i + 1];
                    if ((b1 & 0xC0) === 0x80) {
                        c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                        if (c <= 0x7F) {
                            c = null;
                        }
                    }
                } else if (bytesPerSequence === 3) {
                    b1 = buf[i + 1];
                    b2 = buf[i + 2];
                    if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                        c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                        if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                            c = null;
                        }
                    }
                } else if (bytesPerSequence === 4) {
                    b1 = buf[i + 1];
                    b2 = buf[i + 2];
                    b3 = buf[i + 3];
                    if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                        c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                        if (c <= 0xFFFF || c >= 0x110000) {
                            c = null;
                        }
                    }
                }

                if (c === null) {
                    c = 0xFFFD;
                    bytesPerSequence = 1;

                } else if (c > 0xFFFF) {
                    c -= 0x10000;
                    str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
                    c = 0xDC00 | c & 0x3FF;
                }

                str += String.fromCharCode(c);
                i += bytesPerSequence;
            }

            return str;
        }

        function writeUtf8(buf, str, pos) {
            for (var i = 0, c, lead; i < str.length; i++) {
                c = str.charCodeAt(i); // code point

                if (c > 0xD7FF && c < 0xE000) {
                    if (lead) {
                        if (c < 0xDC00) {
                            buf[pos++] = 0xEF;
                            buf[pos++] = 0xBF;
                            buf[pos++] = 0xBD;
                            lead = c;
                            continue;
                        } else {
                            c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                            lead = null;
                        }
                    } else {
                        if (c > 0xDBFF || (i + 1 === str.length)) {
                            buf[pos++] = 0xEF;
                            buf[pos++] = 0xBF;
                            buf[pos++] = 0xBD;
                        } else {
                            lead = c;
                        }
                        continue;
                    }
                } else if (lead) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                    lead = null;
                }

                if (c < 0x80) {
                    buf[pos++] = c;
                } else {
                    if (c < 0x800) {
                        buf[pos++] = c >> 0x6 | 0xC0;
                    } else {
                        if (c < 0x10000) {
                            buf[pos++] = c >> 0xC | 0xE0;
                        } else {
                            buf[pos++] = c >> 0x12 | 0xF0;
                            buf[pos++] = c >> 0xC & 0x3F | 0x80;
                        }
                        buf[pos++] = c >> 0x6 & 0x3F | 0x80;
                    }
                    buf[pos++] = c & 0x3F | 0x80;
                }
            }
            return pos;
        }

        return Pbf;
    })();

    /**
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
	
	// All of below, besides commented bits, were generated by a protocol buffer files and https://github.com/mapbox/pbf

    var StoredObstacleType = global.StoredObstacleType = {
        "OTHER_IMPASSABLE": 0,
        "ROAD": 1,
        "CONTROLLER": 2,
        "SOURCE": 3,
        "MINERAL": 4,
        "SOURCE_KEEPER_SOURCE": 5,
        "SOURCE_KEEPER_MINERAL": 6,
        "SOURCE_KEEPER_LAIR": 7
    };

    var StoredEnemyRoomState = global.StoredEnemyRoomState = {
        "FULLY_FUNCTIONAL": 0,
        "RESERVED": 1,
        "JUST_MINING": 2,
        "OWNED_DEAD": 3
    };

    var ReverseStoredObstacleType = [
        "OTHER_IMPASSABLE",
        "ROAD",
        "CONTROLLER",
        "SOURCE",
        "MINERAL",
        "SOURCE_KEEPER_SOURCE",
        "SOURCE_KEEPER_MINERAL",
        "SOURCE_KEEPER_LAIR"
    ];

    var ReverseStoredEnemyRoomState = [
        "FULLY_FUNCTIONAL",
        "RESERVED",
        "JUST_MINING",
        "OWNED_DEAD"
    ];

    // StoredObstacle ========================================

    var StoredObstacle = global.StoredObstacle = function StoredObstacle(x = 0, y = 0, type = 0,
                                                                         source_capacity = undefined) {
        this.type = type;
        this.x = x;
        this.y = y;
        if (source_capacity !== undefined) {
            this.source_capacity = source_capacity;
        }
    };
    StoredObstacle.prototype.toString = function () {
        return `[${ReverseStoredStructureType[this.type] || this.type} ${this.x},${this.y}]`;
    };

    StoredObstacle.read = function (pbf, end) {
        return pbf.readFields(StoredObstacle._readField, {type: 0, x: 0, y: 0, source_capacity: 0}, end);
    };
    StoredObstacle._readField = function (tag, obj, pbf) {
        if (tag === 1) obj.type = pbf.readVarint();
        else if (tag === 2) obj.x = pbf.readVarint();
        else if (tag === 3) obj.y = pbf.readVarint();
        else if (tag === 4) obj.source_capacity = pbf.readVarint();
    };
    StoredObstacle.write = function (obj, pbf) {
        if (obj.type) pbf.writeVarintField(1, obj.type);
        if (obj.x) pbf.writeVarintField(2, obj.x);
        if (obj.y) pbf.writeVarintField(3, obj.y);
        if (obj.source_capacity) pbf.writeVarintField(4, obj.source_capacity);
    };

    // StoredEnemyRoomOwner ========================================

	// constructor was added
    var StoredEnemyRoomOwner = global.StoredEnemyRoomOwner = function StoredEnemyRoomOwner(name = "", state = 0) {
        this.name = name;
        this.state = state;
    };
	// toString was added
    StoredEnemyRoomOwner.prototype.toString = function () {
        return `[${this.name}, ${ReverseStoredEnemyRoomState[this.state] || this.state}]`;
    };

    StoredEnemyRoomOwner.read = function (pbf, end) {
        return pbf.readFields(StoredEnemyRoomOwner._readField, new StoredEnemyRoomOwner(), end);
    };
    StoredEnemyRoomOwner._readField = function (tag, obj, pbf) {
        if (tag === 1) obj.name = pbf.readString();
        else if (tag === 2) obj.state = pbf.readVarint();
    };
    StoredEnemyRoomOwner.write = function (obj, pbf) {
        if (obj.name) pbf.writeStringField(1, obj.name);
        if (obj.state) pbf.writeVarintField(2, obj.state);
    };

    // StoredRoom ========================================

	// constructor was added
    var StoredRoom = global.StoredRoom = function StoredRoom(obstacles = [], last_updated = 0, reservation_end = 0, owner = undefined, avoid_always=false) {
        this.obstacles = obstacles;
        this.reservation_end = reservation_end;
        this.last_updated = last_updated;
        if (owner !== undefined) {
            this.owner = owner;
        }
        this.avoid_always = avoid_always;
    };

	// toString was added
    StoredRoom.prototype.toString = function () {
        let values = [];
        if (this.owner) {
            values.push(this.owner);
        }
        if (this.reservation_end) {
            values.push(`[reservation_ends ${this.reservation_end}]`);
        }
        if (this.last_updated) {
            values.push(`[structures_updated ${this.last_updated}]`);
        }
        if (this.structures) {
            values.push(...this.structures);
        }
        if (this.avoid_always) {
            values.push(" [manually avoiding always]");
        }
        return `[StoredRoom ${values.join(' ')}]`;
    };

    StoredRoom.read = function (pbf, end) {
        return pbf.readFields(StoredRoom._readField, new StoredRoom(), end);
    };
    StoredRoom._readField = function (tag, obj, pbf) {
        if (tag === 1) obj.obstacles.push(StoredObstacle.read(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 2) obj.last_updated = pbf.readVarint();
        else if (tag === 3) obj.reservation_end = pbf.readVarint();
        else if (tag === 4) obj.owner = StoredEnemyRoomOwner.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 5) obj.avoid_always = pbf.readBoolean();
    };
    StoredRoom.write = function (obj, pbf) {
        if (obj.obstacles) for (var i = 0; i < obj.obstacles.length; i++) pbf.writeMessage(1, StoredObstacle.write, obj.obstacles[i]);
        if (obj.last_updated) pbf.writeVarintField(2, obj.last_updated);
        if (obj.reservation_end) pbf.writeVarintField(3, obj.reservation_end);
        if (obj.owner) pbf.writeMessage(4, StoredEnemyRoomOwner.write, obj.owner);
        if (obj.avoid_always) pbf.writeBooleanField(5, obj.avoid_always);
    };

	// encode/decode were added manually
    StoredRoom.prototype.encode = function () {
        let pbf = new Pbf();
        pbf.writeRawMessage(StoredRoom.write, this);
        return stringStorage.encode(pbf.finish());
    };

    StoredRoom.decode = function (data) {
        if (!ArrayBuffer.isView(data)) {
            data = stringStorage.decode(data);
        }
        let pbf = new Pbf(data);
        return pbf.readMessage(StoredRoom._readField, new StoredRoom());
    };

    global.__metadata_active = true;
}
if (!global.__metadata_active) {
    defineRoomMetadataPrototypes();
}
