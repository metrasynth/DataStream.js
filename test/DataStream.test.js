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
    /*
      var testType = (ds, t, elen) => test('Type:' + t, assert => {
        var i = 0;
        var boff = ds.byteOffset;
        var blen = ds.byteLength;
        ds.dynamicSize = true;
        ds.endianness = DataStream.LITTLE_ENDIAN;
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          ds["write"+t](125);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(ds["read"+t]()).to.equal(125);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        if (elen > 1) {
          for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
            expect(ds["read"+t]()).to.not.equal(125);
          }
        }
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          ds["write"+t](125);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(ds["read"+t]()).to.equal(125);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        assert.throws(function() {
          ds["read"+t]();
        });
        ds.dynamicSize = false;
        assert.throws(function() {
          ds["write"+t](125);
        });
        testTypeArray(ds, t, elen);
      });
    
      var testSubArray = (typedArrayConstructor, t, arr) => test('SubArray:' + t, assert => {
          var typedArr = new typedArrayConstructor(arr);
          var ds = new DataStream();
          ds["write" + t + "Array"](typedArr.subarray(1));
          ds.seek(0);
          var outSubArray = ds["read" + t + "Array"](arr.length - 1);
          expect(typedArr.subarray(1)).to.deep.equal(outSubArray);
      });
    
      var testDS = (i, ds, boff, blen, t, elen, arr) => test('DS:' + t, assert => {
        ds.dynamicSize = true;
        ds.endianness = DataStream.LITTLE_ENDIAN;
    
        ds.seek(0);
        ds["write"+t+"Array"](arr);
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.seek(0);
        var rarr = ds["read"+t+"Array"](arr.length);
        testSubArray(rarr.constructor, t, arr);
        ds.seek(0);
        var rarr2 = [];
        for (i=0; i<arr.length; i++) {
          rarr2.push(ds["read"+t]());
        }
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(rarr[i]).to.equal(arr[i]);
          expect(rarr[i]).to.equal(rarr2[i]);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
    
        ds.seek(0);
        for (var i=0; i<arr.length; i++) {
          ds["write"+t](arr[i]);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.seek(0);
        var rarr = ds["read"+t+"Array"](arr.length);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(rarr[i]).to.equal(arr[i]);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
    
        // Map tests
        if ((ds.byteOffset & rarr.BYTES_PER_ELEMENT) === 0) {
    
    
        ds.seek(0);
        var rarr = ds["map"+t+"Array"](arr.length);
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(rarr[i]).to.equal(arr[i]);
          rarr[i] = 127;
        }
        ds.seek(0);
        var warr = ds["read"+t+"Array"](arr.length);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(warr[i]).to.equal(127);
        }
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        var rarr = ds["map"+t+"Array"](arr.length);
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(rarr[i]).to.not.equal(arr[i]);
          rarr[i] = 127;
        }
        ds.seek(0);
        if (elen > 1) {
        var warr = ds["read"+t+"Array"](arr.length);
          for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
            expect(warr[i]).to.not.equal(127);
          }
        }
        ds.seek(0);
        ds["map"+t+"Array"](arr.length);
        ds.seek(0);
        var warr = ds["read"+t+"Array"](arr.length);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(warr[i]).to.equal(127);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        var rarr = ds["read"+t+"Array"](arr.length);
        if (elen > 1) {
          for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
            expect(rarr[i]).to.not.equal(arr[i]);
          }
        }
        }
    
        ds.seek(0);
        ds["write"+t+"Array"](arr);
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        ds.seek(0);
        var rarr = ds["read"+t+"Array"](arr.length);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(rarr[i]).to.equal(arr[i]);
        }
        ds.seek(0);
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          expect(ds["read"+t]()).to.equal(arr[i]);
        }
        expect(ds.position ).to.equal(elen*i);
        expect(ds.byteLength ).to.equal(blen);
        expect(ds.buffer.byteLength ).to.equal(ds.byteLength+boff);
        assert.throws(function() {
          ds["read"+t+"Array"](1);
        });
        ds.dynamicSize = false;
        assert.throws(function() {
          ds["write"+t+"Array"]([125]);
        });
        var ds2 = new DataStream();
        ds2["write"+t+"Array"](arr);
        ds2.seek(0);
        var rarr = ds2["read"+t+"Array"](arr.length);
        for (i=0; i<ds2.byteLength/elen; i++) {
          expect(rarr[i]).to.equal(arr[i]);
        }
        ds2.buffer;
        assert.throws(function() {
          ds2["read"+t+"Array"](1);
        });
      });
    
      var testTypeArray = (ds, t, elen)=> test('SubArray:' + t, assert => {
        var i = 0;
        var boff = ds.byteOffset;
        var blen = ds.byteLength;
        var arr: any = [];
        for (i=0; i<Math.floor(ds.byteLength/elen); i++) {
          arr.push((125 + i) % 127);
        }
        testDS(i, ds, boff, blen, t, elen, arr);
        var arr = new this[t+"Array"](ds.byteLength/elen);
        for (i=0; i<arr.length; i++) {
          arr[i] = (125 + i) % 127;
        }
        testDS(i, ds, boff, blen, t, elen, arr);
      });
    */
    describe('DataStream', function () {
        it('constructor', function () {
            var buf = new ArrayBuffer(100);
            var ds = new DataStream_1.default(buf);
            chai_1.expect(ds.byteLength).to.equal(buf.byteLength);
            chai_1.expect(ds.endianness).to.equal(DataStream_1.default.LITTLE_ENDIAN);
            for (var i = 0; i < 100; i++) {
                ds = new DataStream_1.default(buf, i);
                ds = new DataStream_1.default(buf, i, DataStream_1.default.BIG_ENDIAN);
                ds = new DataStream_1.default(buf, i, DataStream_1.default.LITTLE_ENDIAN);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i);
                chai_1.expect(ds.byteOffset).to.equal(i);
            }
            ds = new DataStream_1.default(buf, 2, DataStream_1.default.BIG_ENDIAN);
            chai_1.expect(ds.endianness).to.equal(DataStream_1.default.BIG_ENDIAN);
            ds = new DataStream_1.default(buf, null, DataStream_1.default.BIG_ENDIAN);
            chai_1.expect(ds.endianness).to.equal(DataStream_1.default.BIG_ENDIAN);
            chai_1.expect(ds.byteLength).to.equal(buf.byteLength);
            ds = new DataStream_1.default(buf, null, DataStream_1.default.LITTLE_ENDIAN);
            chai_1.expect(ds.endianness).to.equal(DataStream_1.default.LITTLE_ENDIAN);
            chai_1.expect(ds.byteLength).to.equal(buf.byteLength);
            var dv = new DataView(buf);
            ds = new DataStream_1.default(dv, 0, DataStream_1.default.BIG_ENDIAN);
            chai_1.expect(ds.endianness).to.equal(DataStream_1.default.BIG_ENDIAN);
            chai_1.expect(ds.byteLength).to.equal(buf.byteLength);
            chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset);
            for (var i = 0; i < 100; i++) {
                dv = new DataView(buf, i);
                ds = new DataStream_1.default(dv);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset);
            }
            for (var i = 0; i < 50; i++) {
                dv = new DataView(buf, 50);
                ds = new DataStream_1.default(dv, i);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i - dv.byteOffset);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset + i);
            }
            for (var i = 0; i < 100; i++) {
                dv = new Uint8Array(buf, i);
                ds = new DataStream_1.default(dv);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset);
            }
            for (var i = 0; i < 50; i++) {
                dv = new Uint8Array(buf, 50);
                ds = new DataStream_1.default(dv, i);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i - dv.byteOffset);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset + i);
            }
            for (var i = 0; i < 25; i++) {
                dv = new Float32Array(buf, i * 4);
                ds = new DataStream_1.default(dv);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i * 4);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset);
            }
            for (var i = 0; i < 12; i++) {
                dv = new Float32Array(buf, 12);
                ds = new DataStream_1.default(dv, i);
                chai_1.expect(ds.byteLength).to.equal(buf.byteLength - i - dv.byteOffset);
                chai_1.expect(ds.byteOffset).to.equal(dv.byteOffset + i);
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
            chai_1.expect(255).to.equal(obj.endNote);
            chai_1.expect(255).to.equal(obj2.endNote);
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
            chai_1.expect(255).to.equal(obj3.endNote);
            var uExpect = ds.readUint8Array(u.length);
            chai_1.expect(u).to.deep.equal(uExpect);
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
            chai_1.expect(o2.one).to.equal(1);
            chai_1.expect(o2.four).to.equal(1);
            chai_1.expect(o2.two).to.not.equal(o2.three);
            chai_1.expect(o2.one).to.equal(o2.four);
            chai_1.expect(o2.one).to.equal(o2.three);
            chai_1.expect(o2.one /*LE*/).to.not.equal(o2.two /*BE*/);
            chai_1.expect(o2.one /*LE*/).to.equal(o2.three /*LE*/);
            ds2.seek(0);
            ds2.endianness = DataStream_1.default.BIG_ENDIAN;
            o2 = ds2.readStruct(def2);
            chai_1.expect(o2.one).to.not.equal(1);
            chai_1.expect(o2.four).to.not.equal(1);
            chai_1.expect(o2.two).to.not.equal(o2.three);
            chai_1.expect(o2.one).to.equal(o2.four);
            chai_1.expect(o2.one /*BE*/).to.equal(o2.two /*BE*/);
            chai_1.expect(o2.one /*BE*/).to.not.equal(o2.three /*LE*/);
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
            chai_1.expect(o3.length).to.equal(8);
            chai_1.expect(o3.endNote).to.equal(255);
            chai_1.expect(o3.data).to.deep.equal([1, 2, 3, 4, 5, 6]);
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
            chai_1.expect(o4.length).to.equal(8);
            chai_1.expect(o4.endNote).to.equal(255);
            chai_1.expect(o4.data.odd).to.deep.equal([1, 3, 5]);
            chai_1.expect(o4.data.even).to.deep.equal([2, 4, 6]);
            var pos = ds4.position;
            ds4.writeStruct(def4, o4);
            ds4.seek(pos);
            var o4b = ds4.readStruct(def4);
            chai_1.expect(o4).to.deep.equal(o4b);
            chai_1.expect(u4.concat(u4)).to.deep.equal(new Uint8Array(ds4.buffer));
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
            chai_1.expect(o5.len).to.equal(o5.greet.length);
            chai_1.expect('Hello').to.equal(o5.greet);
            chai_1.expect(', ').to.equal(o5.pad);
            chai_1.expect(o5.len2).to.equal(o5.greet2.length);
            chai_1.expect('World!').to.equal(o5.greet2);
            chai_1.expect([0, 0, 0, 0, 0, 0, 0, 255]).to.deep.equal(o5.tail);
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
            chai_1.expect(greet).to.equal(o6.greet);
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
            chai_1.expect(u6).to.deep.equal(new Uint8Array(ds6.buffer));
            chai_1.expect(u6).to.deep.equal(new Uint8Array(ds6b.buffer));
            chai_1.expect(u6).to.deep.equal(new Uint8Array(ds6c.buffer));
        });
    });
});
/*
  if (DataStream.endianness != DataStream.LITTLE_ENDIAN && DataStream.endianness != DataStream.BIG_ENDIAN) {
    throw("Err, DataStream.endianness should be DataStream.LITTLE_ENDIAN or DataStream.BIG_ENDIAN");
  }
  test('other', assert => {
  var buf = new ArrayBuffer(1064);
  var ds = new DataStream(buf, 64);
  expect(ds.byteLength+64).to.equal(buf.byteLength);
  ds.endianness = DataStream.LITTLE_ENDIAN;
  ds.writeUint16(1);
  ds.seek(0);
  var a = ds.readUint8Array(2);
  expect(a[0]).to.equal(1);
  expect(a[1]).to.equal(0);
  ds.seek(0);
  ds.endianness = DataStream.BIG_ENDIAN;
  ds.writeUint16(1);
  ds.seek(0);
  var a = ds.readUint8Array(2);
  expect(a[0]).to.equal(0);
  expect(a[1]).to.equal(1);
  ds.seek(0);
  ds.endianness = DataStream.LITTLE_ENDIAN;
  for (var i = 0; i < 1000 / 8; i++) {
    ds.writeFloat64(0.125);
  }
  expect(ds.position+64 ).to.equal(buf.byteLength);
  expect(ds.byteLength+64 ).to.equal(buf.byteLength);
  expect(ds.buffer.byteLength ).to.equal(buf.byteLength);

  ds.seek(0);
  for (var i = 0; i < 1000 / 8; i++) {
    expect(0.125 ).to.equal(ds.readFloat64());
  }
  expect(ds.position+64 ).to.equal(buf.byteLength);

  assert.throws(function() {
    ds.readFloat32();
  });

  ds.seek(0);
  ds.endianness = DataStream.BIG_ENDIAN;
  for (var i = 0; i < 1000 / 8; i++) {
    expect(0.125).to.not.equal(ds.readFloat64());
  }
  ds.seek(0);
  for (var i = 0; i < 999; i++) {
    ds.writeFloat32(0.125);
  }
  // reading beyond extended buffer succeeds for performance reasons
  ds.readFloat32();
  expect(ds.position ).to.equal(4000);
  expect(ds.byteLength ).to.equal(3996);
  expect(ds.buffer.byteLength ).to.equal(3996+64);
  ds.position = 3996;
  // but fails after getting buffer due to _trimAlloc
  assert.throws(function() {
    ds.readFloat32();
  });

  ds.seek(0);
  for (var i = 0; i < 999; i++) {
    expect(0.125 ).to.equal(ds.readFloat32());
  }
  expect(ds.position+64 ).to.equal(ds.buffer.byteLength);

  ds.writeFloat32(0.125);

  ds.dynamicSize = false;
  assert.throws(function() {
    ds.writeFloat32(0.125);
  });

  expect(ds.position ).to.equal(4000);
  expect(ds.byteLength ).to.equal(4000);
  expect(ds.buffer.byteLength ).to.equal(ds.position+64);

  // testType(ds, 'Int32', 4);
  // testType(ds, 'Int16', 2);
  // testType(ds, 'Int8', 1);
  // testType(ds, 'Uint32', 4);
  // testType(ds, 'Uint16', 2);
  // testType(ds, 'Uint8', 1);
  // testType(ds, 'Float32', 4);
  // testType(ds, 'Float64', 8);

  ds = new DataStream(buf, 7);

  // testType(ds, 'Int32', 4);
  // testType(ds, 'Int16', 2);
  // testType(ds, 'Int8', 1);
  // testType(ds, 'Uint32', 4);
  // testType(ds, 'Uint16', 2);
  // testType(ds, 'Uint8', 1);
  // testType(ds, 'Float32', 4);
  // testType(ds, 'Float64', 8);

  var s = "Hello, 世界";
  var dss = new DataStream();
  dss.writeUCS2String(s);
  dss.seek(0);
  expect(s).to.equal(dss.readUCS2String(s.length));

  var s = "Exif\\000\\000";
  var dss = new DataStream();
  dss.writeString(s);
  dss.seek(0);
  expect(s).to.equal(dss.readString(s.length));

  var dss = new DataStream();
  var s = "Hello, World!";
  dss.writeCString(s);
  expect(dss.byteLength).to.equal(s.length + 1);
  dss.seek(0);
  expect(s).to.equal(dss.readCString());
  var dp = dss.position;
  dss.writeCString(s,s.length); // no zero terminate
  dss.seek(dp);
  expect(s).to.equal(dss.readCString());
  dss.writeCString(s,s.length); // no zero terminate
  dss.seek(dp);
  expect(s).to.equal(dss.readCString(s.length));
  dss.buffer;
  expect(s).to.equal(dss.readCString());

  var dss = new DataStream();
  var s = "Hello, 世界";
  dss.writeString(s, 'UTF-8');
  var bl = dss.byteLength;
  dss.seek(0);
  expect(s, dss.readString(dss.byteLength).to.equal('UTF-8'));
  // ugh, byte-counted UTF-8 strings :(

  var dss = new DataStream();
  var s = "Hello, me";
  dss.writeString(s, 'UTF-8');
  expect(bl).to.not.equal(dss.byteLength);
  dss.seek(0);
  expect(s, dss.readString(dss.byteLength).to.equal('UTF-8'));
});
*/ 
//# sourceMappingURL=DataStream.test.js.map