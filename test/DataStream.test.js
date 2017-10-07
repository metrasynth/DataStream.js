(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../DataStream", "chai", "mocha"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DataStream_1 = require("../DataStream");
    var chai_1 = require("chai");
    require("mocha");
    var sameMembers = function (typedArr, arr, msg) {
        return chai_1.assert.sameMembers(Array.from(typedArr), arr, msg);
    };
    var TypedArrays = { Int8Array: Int8Array, Uint8Array: Uint8Array, Uint8ClampedArray: Uint8ClampedArray, Int16Array: Int16Array, Uint16Array: Uint16Array, Int32Array: Int32Array, Uint32Array: Uint32Array, Float32Array: Float32Array, Float64Array: Float64Array };
    describe('DataStream', function () {
        var testType = function (ds, t, elen) {
            var i = 0;
            var boff = ds.byteOffset;
            var blen = ds.byteLength;
            ds.dynamicSize = true;
            ds.endianness = DataStream_1.default.LITTLE_ENDIAN;
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                ds["write" + t](125);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(ds["read" + t](), 125);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.endianness = DataStream_1.default.BIG_ENDIAN;
            ds.seek(0);
            if (elen > 1) {
                for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                    chai_1.assert.notEqual(ds["read" + t](), 125);
                }
            }
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                ds["write" + t](125);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(ds["read" + t](), 125);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            chai_1.assert.throws(function () {
                ds["read" + t]();
            });
            ds.dynamicSize = false;
            chai_1.assert.throws(function () {
                ds["write" + t](125);
            });
            testTypeArray(ds, t, elen);
        };
        var testSubArray = function (typedArrayConstructor, t, arr) {
            var typedArr = new typedArrayConstructor(arr);
            var ds = new DataStream_1.default();
            ds["write" + t + "Array"](typedArr.subarray(1));
            ds.seek(0);
            var outSubArray = ds["read" + t + "Array"](arr.length - 1);
            chai_1.expect(typedArr.subarray(1)).to.deep.equal(outSubArray);
        };
        var testDS = function (i, ds, boff, blen, t, elen, arr) {
            ds.dynamicSize = true;
            ds.endianness = DataStream_1.default.LITTLE_ENDIAN;
            ds.seek(0);
            ds["write" + t + "Array"](arr);
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            var rarr = ds["read" + t + "Array"](arr.length);
            testSubArray(rarr.constructor, t, arr);
            ds.seek(0);
            var rarr2 = [];
            for (i = 0; i < arr.length; i++) {
                rarr2.push(ds["read" + t]());
            }
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(rarr[i], arr[i]);
                chai_1.assert.equal(rarr[i], rarr2[i]);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var a = arr_1[_i];
                ds["write" + t](a);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            var rarr = ds["read" + t + "Array"](arr.length);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(rarr[i], arr[i]);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            // Map tests
            // console.log(t, arr.length, ds.byteOffset % rarr.BYTES_PER_ELEMENT === 0);
            // if (ds.byteOffset % rarr.BYTES_PER_ELEMENT === 0) {
            chai_1.assert.equal(ds.byteOffset % rarr.BYTES_PER_ELEMENT, 0);
            ds.seek(0);
            var rarr = ds["map" + t + "Array"](arr.length);
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(rarr[i], arr[i]);
                rarr[i] = 127;
            }
            ds.seek(0);
            var warr = ds["read" + t + "Array"](arr.length);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(warr[i], 127);
            }
            ds.endianness = DataStream_1.default.BIG_ENDIAN;
            ds.seek(0);
            var rarr = ds["map" + t + "Array"](arr.length);
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.notEqual(rarr[i], arr[i]);
                rarr[i] = 127;
            }
            ds.seek(0);
            if (elen > 1) {
                var warr = ds["read" + t + "Array"](arr.length);
                for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                    chai_1.assert.notEqual(warr[i], 127);
                }
            }
            ds.seek(0);
            ds["map" + t + "Array"](arr.length);
            ds.seek(0);
            var warr = ds["read" + t + "Array"](arr.length);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(warr[i], 127);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.endianness = DataStream_1.default.BIG_ENDIAN;
            ds.seek(0);
            var rarr = ds["read" + t + "Array"](arr.length);
            if (elen > 1) {
                for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                    chai_1.assert.notEqual(rarr[i], arr[i]);
                }
            }
            // }
            ds.seek(0);
            ds["write" + t + "Array"](arr);
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            ds.seek(0);
            var rarr = ds["read" + t + "Array"](arr.length);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(rarr[i], arr[i]);
            }
            ds.seek(0);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                chai_1.assert.equal(ds["read" + t](), arr[i]);
            }
            chai_1.assert.equal(ds.position, elen * i);
            chai_1.assert.equal(ds.byteLength, blen);
            chai_1.assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
            chai_1.assert.throws(function () {
                ds["read" + t + "Array"](1);
            });
            ds.dynamicSize = false;
            chai_1.assert.throws(function () {
                ds["write" + t + "Array"]([125]);
            });
            var ds2 = new DataStream_1.default();
            ds2["write" + t + "Array"](arr);
            ds2.seek(0);
            var rarr = ds2["read" + t + "Array"](arr.length);
            for (i = 0; i < ds2.byteLength / elen; i++) {
                chai_1.assert.equal(rarr[i], arr[i]);
            }
            ds2.buffer;
            chai_1.assert.throws(function () {
                ds2["read" + t + "Array"](1);
            });
        };
        var testTypeArray = function (ds, t, elen) {
            var i = 0;
            var boff = ds.byteOffset;
            var blen = ds.byteLength;
            var arr = [];
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                arr.push((125 + i) % 127);
            }
            testDS(i, ds, boff, blen, t, elen, arr);
            var arr = new TypedArrays[t + "Array"](ds.byteLength / elen);
            for (i = 0; i < arr.length; i++) {
                arr[i] = (125 + i) % 127;
            }
            testDS(i, ds, boff, blen, t, elen, arr);
        };
        it('constructor', function () {
            var buf = new ArrayBuffer(100);
            var ds = new DataStream_1.default(buf);
            chai_1.assert.equal(ds.byteLength, buf.byteLength);
            chai_1.assert.equal(ds.endianness, DataStream_1.default.LITTLE_ENDIAN);
            for (var i = 0; i < 100; i++) {
                ds = new DataStream_1.default(buf, i);
                ds = new DataStream_1.default(buf, i, DataStream_1.default.BIG_ENDIAN);
                ds = new DataStream_1.default(buf, i, DataStream_1.default.LITTLE_ENDIAN);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i);
                chai_1.assert.equal(ds.byteOffset, i);
            }
            ds = new DataStream_1.default(buf, 2, DataStream_1.default.BIG_ENDIAN);
            chai_1.assert.equal(ds.endianness, DataStream_1.default.BIG_ENDIAN);
            ds = new DataStream_1.default(buf, null, DataStream_1.default.BIG_ENDIAN);
            chai_1.assert.equal(ds.endianness, DataStream_1.default.BIG_ENDIAN);
            chai_1.assert.equal(ds.byteLength, buf.byteLength);
            ds = new DataStream_1.default(buf, null, DataStream_1.default.LITTLE_ENDIAN);
            chai_1.assert.equal(ds.endianness, DataStream_1.default.LITTLE_ENDIAN);
            chai_1.assert.equal(ds.byteLength, buf.byteLength);
            var dv = new DataView(buf);
            ds = new DataStream_1.default(dv, 0, DataStream_1.default.BIG_ENDIAN);
            chai_1.assert.equal(ds.endianness, DataStream_1.default.BIG_ENDIAN);
            chai_1.assert.equal(ds.byteLength, buf.byteLength);
            chai_1.assert.equal(ds.byteOffset, dv.byteOffset);
            for (var i = 0; i < 100; i++) {
                dv = new DataView(buf, i);
                ds = new DataStream_1.default(dv);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset);
            }
            for (var i = 0; i < 50; i++) {
                dv = new DataView(buf, 50);
                ds = new DataStream_1.default(dv, i);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset + i);
            }
            for (var i = 0; i < 100; i++) {
                dv = new Uint8Array(buf, i);
                ds = new DataStream_1.default(dv);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset);
            }
            for (var i = 0; i < 50; i++) {
                dv = new Uint8Array(buf, 50);
                ds = new DataStream_1.default(dv, i);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset + i);
            }
            for (var i = 0; i < 25; i++) {
                dv = new Float32Array(buf, i * 4);
                ds = new DataStream_1.default(dv);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i * 4);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset);
            }
            for (var i = 0; i < 12; i++) {
                dv = new Float32Array(buf, 12);
                ds = new DataStream_1.default(dv, i);
                chai_1.assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
                chai_1.assert.equal(ds.byteOffset, dv.byteOffset + i);
            }
        });
        it('Struct', function () {
            var embed = [
                'tag', 'uint32be',
                'code', 'uint32le',
                'greet', 'cstring'
            ];
            var def = [
                'tag', 'cstring:4',
                'code', 'uint32le',
                'embed', embed,
                'length', 'uint16be',
                'data', ['[]', 'float32be', 'length'],
                'greet', 'cstring:20',
                'endNote', 'uint8'
            ];
            var u = [137, 80, 78, 71, 0, 136, 136, 254, 137, 80,
                78, 71, 0, 136, 136, 255, 72, 101, 108, 108,
                111, 44, 32, 87, 111, 114, 108, 100, 33, 0,
                0, 2, 0, 1, 2, 3, 1, 2, 3, 4,
                72, 101, 108, 108, 111, 44, 32, 87, 111, 114,
                108, 100, 33, 0, 0, 0, 0, 0, 0, 0,
                255];
            var ds = new DataStream_1.default();
            ds.writeUint8Array(u);
            ds.writeUint8Array(u);
            ds.seek(0);
            var obj = ds.readStruct(def);
            var obj2 = ds.readStruct(def);
            var d1 = obj.data;
            var d2 = obj2.data;
            delete obj.data;
            delete obj2.data;
            chai_1.assert.equal(255, obj.endNote);
            chai_1.assert.equal(255, obj2.endNote);
            chai_1.expect(obj).to.deep.equal(obj2);
            chai_1.expect(d1).to.deep.equal(d2);
            var p = ds.position;
            obj.data = d1;
            ds.writeStruct(def, obj);
            delete obj.data;
            ds.seek(p);
            var obj3 = ds.readStruct(def);
            var d3 = obj3.data;
            delete obj3.data;
            ds.seek(p);
            chai_1.assert.equal(255, obj3.endNote);
            sameMembers(ds.readUint8Array(u.length), u);
            chai_1.expect(obj).to.deep.equal(obj3);
            chai_1.expect(d1).to.deep.equal(d3);
            var def2 = [
                'one', 'float32',
                'two', 'float32be',
                'three', 'float32le',
                'four', 'float32'
            ];
            var u2 = [1, 1, 1, 1];
            var ds2 = new DataStream_1.default();
            ds2.writeFloat32Array(u2, DataStream_1.default.LITTLE_ENDIAN);
            ds2.seek(0);
            ds2.endianness = DataStream_1.default.LITTLE_ENDIAN;
            var o2 = ds2.readStruct(def2);
            chai_1.assert.equal(o2.one, 1);
            chai_1.assert.equal(o2.four, 1);
            chai_1.assert.notEqual(o2.two, o2.three);
            chai_1.assert.equal(o2.one, o2.four);
            chai_1.assert.equal(o2.one, o2.three);
            chai_1.assert.notEqual(o2.one /*LE*/, o2.two /*BE*/);
            chai_1.assert.equal(o2.one /*LE*/, o2.three /*LE*/);
            ds2.seek(0);
            ds2.endianness = DataStream_1.default.BIG_ENDIAN;
            o2 = ds2.readStruct(def2);
            chai_1.assert.notEqual(o2.one, 1);
            chai_1.assert.notEqual(o2.four, 1);
            chai_1.assert.notEqual(o2.two, o2.three);
            chai_1.assert.equal(o2.one, o2.four);
            chai_1.assert.equal(o2.one /*BE*/, o2.two /*BE*/);
            chai_1.assert.notEqual(o2.one /*BE*/, o2.three /*LE*/);
            var def3 = [
                'length', 'uint16be',
                'data', ['[]', 'uint8', function (s) { return s.length - 2; }],
                'endNote', 'uint8'
            ];
            var u3 = [0, 8, 1, 2, 3, 4, 5, 6, 255];
            var ds3 = new DataStream_1.default();
            ds3.writeUint8Array(u3);
            ds3.seek(0);
            var o3 = ds3.readStruct(def3);
            chai_1.assert.equal(o3.length, 8);
            chai_1.assert.equal(o3.endNote, 255);
            sameMembers(o3.data, [1, 2, 3, 4, 5, 6]);
            var def4 = [
                'length', 'uint16be',
                'data', {
                    get: function (ds, s) {
                        var o = { odd: [], even: [] };
                        for (var i = 0; i < s.length - 2; i += 2) {
                            o.odd.push(ds.readUint8());
                            o.even.push(ds.readUint8());
                        }
                        return o;
                    },
                    set: function (ds, v) {
                        for (var i = 0; i < v.odd.length; i++) {
                            ds.writeUint8(v.odd[i]);
                            ds.writeUint8(v.even[i]);
                        }
                    }
                },
                'endNote', 'uint8'
            ];
            var u4 = [0, 8, 1, 2, 3, 4, 5, 6, 255];
            var ds4 = new DataStream_1.default(new Uint8Array(u4));
            var o4 = ds4.readStruct(def4);
            chai_1.assert.equal(o4.length, 8);
            chai_1.assert.equal(o4.endNote, 255);
            chai_1.expect(o4.data.odd).to.deep.equal([1, 3, 5]);
            chai_1.expect(o4.data.even).to.deep.equal([2, 4, 6]);
            var pos = ds4.position;
            ds4.writeStruct(def4, o4);
            ds4.seek(pos);
            var o4b = ds4.readStruct(def4);
            chai_1.expect(o4).to.deep.equal(o4b);
            sameMembers(new Uint8Array(ds4.buffer), u4.concat(u4));
            /* Test variable-length string definition */
            var def5 = [
                'len', 'uint8',
                'greet', 'cstring:len',
                'pad', 'string:2',
                'len2', 'uint8',
                'greet2', 'string:len2',
                'tail', [[], 'uint8', '*']
            ];
            var u5 = [5,
                72, 101, 108, 108, 111,
                44, 32,
                6,
                87, 111, 114, 108, 100, 33,
                0, 0, 0, 0, 0, 0, 0, 255];
            var ds5 = new DataStream_1.default();
            ds5.writeUint8Array(u5);
            ds5.seek(0);
            var o5 = ds5.readStruct(def5);
            chai_1.assert.equal(o5.len, o5.greet.length);
            chai_1.assert.equal('Hello', o5.greet);
            chai_1.assert.equal(', ', o5.pad);
            chai_1.assert.equal(o5.len2, o5.greet2.length);
            chai_1.assert.equal('World!', o5.greet2);
            sameMembers(o5.tail, [0, 0, 0, 0, 0, 0, 0, 255]);
            var def6 = [
                'len', 'uint8',
                'greet', 'string,utf-8:len'
            ];
            var greet = 'xin chào đỗữẫẨở';
            // var greetData = new TextEncoder('utf-8').encode(greet);
            // console.log(greetData, greetData.length, greet.length);
            var u6 = [27,
                120, 105, 110, 32, 99, 104, 195, 160, 111, 32, 196, 145, 225, 187, 151, 225, 187, 175, 225, 186, 171, 225, 186, 168, 225, 187, 159
            ];
            var ds6 = new DataStream_1.default();
            ds6.writeUint8Array(u6);
            ds6.seek(0);
            var o6 = ds6.readStruct(def6);
            chai_1.assert.equal(greet, o6.greet);
            var ds6b = new DataStream_1.default();
            ds6b.writeStruct(def6, o6);
            var ds6c = new DataStream_1.default();
            // struct to write don't have 'len' field
            ds6c.writeStruct(def6, { greet: greet }, true);
            ds6b.seek(0);
            var o6b = ds6b.readStruct(def6);
            ds6c.seek(0);
            var o6c = ds6c.readStruct(def6);
            chai_1.expect(o6).to.deep.equal(o6b);
            chai_1.expect(o6).to.deep.equal(o6c);
            sameMembers(new Uint8Array(ds6.buffer), u6);
            sameMembers(new Uint8Array(ds6b.buffer), u6);
            sameMembers(new Uint8Array(ds6c.buffer), u6);
        });
        it('endianness', function () {
            chai_1.assert(DataStream_1.default.endianness === DataStream_1.default.LITTLE_ENDIAN || DataStream_1.default.endianness === DataStream_1.default.BIG_ENDIAN, "Err, DataStream.endianness should be DataStream.LITTLE_ENDIAN or DataStream.BIG_ENDIAN");
        });
        var buf = new ArrayBuffer(1064);
        var ds;
        it('common test', function () {
            ds = new DataStream_1.default(buf, 64);
            chai_1.assert.equal(ds.byteLength + 64, buf.byteLength);
            ds.endianness = DataStream_1.default.LITTLE_ENDIAN;
            ds.writeUint16(1);
            ds.seek(0);
            var a = ds.readUint8Array(2);
            chai_1.assert.equal(a[0], 1);
            chai_1.assert.equal(a[1], 0);
            ds.seek(0);
            ds.endianness = DataStream_1.default.BIG_ENDIAN;
            ds.writeUint16(1);
            ds.seek(0);
            var a = ds.readUint8Array(2);
            chai_1.assert.equal(a[0], 0);
            chai_1.assert.equal(a[1], 1);
            ds.seek(0);
            ds.endianness = DataStream_1.default.LITTLE_ENDIAN;
            for (var i = 0; i < 1000 / 8; i++) {
                ds.writeFloat64(0.125);
            }
            chai_1.assert.equal(ds.position + 64, buf.byteLength);
            chai_1.assert.equal(ds.byteLength + 64, buf.byteLength);
            chai_1.assert.equal(ds.buffer.byteLength, buf.byteLength);
            ds.seek(0);
            for (var i = 0; i < 1000 / 8; i++) {
                chai_1.assert.equal(0.125, ds.readFloat64());
            }
            chai_1.assert.equal(ds.position + 64, buf.byteLength);
            chai_1.assert.throws(function () {
                ds.readFloat32();
            });
            ds.seek(0);
            ds.endianness = DataStream_1.default.BIG_ENDIAN;
            for (var i = 0; i < 1000 / 8; i++) {
                chai_1.assert.notEqual(0.125, ds.readFloat64());
            }
            ds.seek(0);
            for (var i = 0; i < 999; i++) {
                ds.writeFloat32(0.125);
            }
            // reading beyond extended buffer succeeds for performance reasons
            ds.readFloat32();
            chai_1.assert.equal(ds.position, 4000);
            chai_1.assert.equal(ds.byteLength, 3996);
            chai_1.assert.equal(ds.buffer.byteLength, 3996 + 64);
            ds.position = 3996;
            // but fails after getting buffer due to _trimAlloc
            chai_1.assert.throws(function () {
                ds.readFloat32();
            });
            ds.seek(0);
            for (var i = 0; i < 999; i++) {
                chai_1.assert.equal(0.125, ds.readFloat32());
            }
            chai_1.assert.equal(ds.position + 64, ds.buffer.byteLength);
            ds.writeFloat32(0.125);
            ds.dynamicSize = false;
            chai_1.assert.throws(function () {
                ds.writeFloat32(0.125);
            });
            chai_1.assert.equal(ds.position, 4000);
            chai_1.assert.equal(ds.byteLength, 4000);
            chai_1.assert.equal(ds.buffer.byteLength, ds.position + 64);
        });
        it('testType Int32', function () { return testType(ds, 'Int32', 4); });
        it('testType Int16', function () { return testType(ds, 'Int16', 2); });
        it('testType Int8', function () { return testType(ds, 'Int8', 1); });
        it('testType Uint32', function () { return testType(ds, 'Uint32', 4); });
        it('testType Uint16', function () { return testType(ds, 'Uint16', 2); });
        it('testType Uint8', function () { return testType(ds, 'Uint8', 1); });
        it('testType Float32', function () { return testType(ds, 'Float32', 4); });
        it('testType Float64', function () { return testType(ds, 'Float64', 8); });
        ds = new DataStream_1.default(buf, 7);
        it('testType Int32 - second run', function () { return testType(ds, 'Int32', 4); });
        it('testType Int16 - second run', function () { return testType(ds, 'Int16', 2); });
        it('testType Int8 - second run', function () { return testType(ds, 'Int8', 1); });
        it('testType Uint32 - second run', function () { return testType(ds, 'Uint32', 4); });
        it('testType Uint16 - second run', function () { return testType(ds, 'Uint16', 2); });
        it('testType Uint8 - second run', function () { return testType(ds, 'Uint8', 1); });
        it('testType Float32 - second run', function () { return testType(ds, 'Float32', 4); });
        it('testType Float64 - second run', function () { return testType(ds, 'Float64', 8); });
        it('other', function () {
            var s = "Hello, 世界";
            var dss = new DataStream_1.default();
            dss.writeUCS2String(s);
            dss.seek(0);
            chai_1.assert.equal(s, dss.readUCS2String(s.length));
            var s = "Exif\\000\\000";
            var dss = new DataStream_1.default();
            dss.writeString(s);
            dss.seek(0);
            chai_1.assert.equal(s, dss.readString(s.length));
            var dss = new DataStream_1.default();
            var s = "Hello, World!";
            dss.writeCString(s);
            chai_1.assert.equal(dss.byteLength, s.length + 1);
            dss.seek(0);
            chai_1.assert.equal(s, dss.readCString());
            var dp = dss.position;
            dss.writeCString(s, s.length); // no zero terminate
            dss.seek(dp);
            chai_1.assert.equal(s, dss.readCString());
            dss.writeCString(s, s.length); // no zero terminate
            dss.seek(dp);
            chai_1.assert.equal(s, dss.readCString(s.length));
            dss.buffer;
            chai_1.assert.equal(s, dss.readCString());
            var dss = new DataStream_1.default();
            var s = "Hello, 世界";
            dss.writeString(s, 'UTF-8');
            var bl = dss.byteLength;
            dss.seek(0);
            chai_1.assert.equal(s, dss.readString(dss.byteLength, 'UTF-8'));
            // ugh, byte-counted UTF-8 strings :(
            var dss = new DataStream_1.default();
            var s = "Hello, me";
            dss.writeString(s, 'UTF-8');
            chai_1.assert.notEqual(bl, dss.byteLength);
            dss.seek(0);
            chai_1.assert.equal(s, dss.readString(dss.byteLength, 'UTF-8'));
        });
    });
});
//# sourceMappingURL=DataStream.test.js.map