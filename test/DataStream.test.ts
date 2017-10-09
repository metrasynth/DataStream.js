import DataStream, {TypedArray, TypeDef} from "../DataStream";
import {expect, assert} from "chai";
import "mocha";

const sameMembers = (typedArr: TypedArray, arr: any[], msg?: string) =>
    assert.sameMembers(Array.from(typedArr), arr, msg);

const TypedArrays = {
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array
};

// tslint:disable:no-shadowed-variable
describe("DataStream", () => {
    it("read/write", () => {
        // prettier-ignore
        const def: TypeDef = [
            ["obj", [
                ["num", "Int8"],
                ["greet", "Utf8WithLen"],
                ["a1", "Int16*"]]
            ],
            ["a2", "Uint16*"],
            ["a3", "Int8*"],
            ["a4", "Float64*"]
        ];
        // prettier-ignore
        const o = {
            obj: {
                num: 5,
                greet: "Xin chào",
                a1: [-3, 0, 4, 9, 0x7FFF],
            },
            a2: [3, 0, 4, 9, 0xFFFF],
            a3: [-3, 0, 4, 9, 0x7F],
            a4: [-3, 0, 4, 9, 0xFFFFFFF + .321]
        };
        const d = new DataStream();
        d.write(def, o);
        let pos = 0;
        const testResult = () => {
            d.seek(pos);
            const o2: any = d.read(def);
            assert.equal(o2.obj.num, o.obj.num);
            assert.equal(o2.obj.greet, o.obj.greet);
            sameMembers(o2.obj.a1, o.obj.a1);
            sameMembers(o2.a2, o.a2);
            sameMembers(o2.a3, o.a3);
            sameMembers(o2.a4, o.a4);
        };
        testResult();
        pos = d.position;
        // prettier-ignore
        d.writeArray([
            ["Int8", "Utf8WithLen", "Int16*"],
            "Uint16*",
            "Int8*",
            "Float64*"
        ], [
            [5,  "Xin chào", [-3, 0, 4, 9, 0x7FFF]],
            [3, 0, 4, 9, 0xFFFF],
            [-3, 0, 4, 9, 0x7F],
            [-3, 0, 4, 9, 0xFFFFFFF + .321]
        ]);
        testResult();
    });

    it("chained read/write utf8WithLen", () => {
        const d = new DataStream();
        const greet = "Xin chào";
        d.writeInt8(3).writeUtf8WithLen(greet);
        const d2 = new DataStream(d.buffer);
        // prettier-ignore
        const o = d2.readStruct([
            "num", "int8",
            "len", "uint16",
            "greet", "string,utf-8:len"
        ]);
        assert.deepEqual(o, {num: 3, len: 9, greet});
        d.seek(1);
        expect(d.readUtf8WithLen()).equal(greet);
    });
    const testType = (ds, t, elen) => {
        let i = 0;
        const boff = ds.byteOffset;
        const blen = ds.byteLength;
        ds.dynamicSize = true;
        ds.endianness = DataStream.LITTLE_ENDIAN;
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            ds["write" + t](125);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(ds["read" + t](), 125);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        if (elen > 1) {
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                assert.notEqual(ds["read" + t](), 125);
            }
        }
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            ds["write" + t](125);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(ds["read" + t](), 125);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        assert.throws(() => ds["read" + t]());
        ds.dynamicSize = false;
        assert.throws(() => ds["write" + t](125));
        testTypeArray(ds, t, elen);
    };

    const testSubArray = (typedArrayConstructor, t, arr) => {
        const typedArr = new typedArrayConstructor(arr);
        const ds = new DataStream();
        ds["write" + t + "Array"](typedArr.subarray(1));
        ds.seek(0);
        const outSubArray = ds["read" + t + "Array"](arr.length - 1);
        expect(typedArr.subarray(1)).to.deep.equal(outSubArray);
    };

    const testDS = (i, ds, boff, blen, t, elen, arr) => {
        ds.dynamicSize = true;
        ds.endianness = DataStream.LITTLE_ENDIAN;

        ds.seek(0);
        ds["write" + t + "Array"](arr);
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.seek(0);
        let rarr = ds["read" + t + "Array"](arr.length);
        testSubArray(rarr.constructor, t, arr);
        ds.seek(0);
        const rarr2 = [];
        for (i = 0; i < arr.length; i++) {
            rarr2.push(ds["read" + t]());
        }
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(rarr[i], arr[i]);
            assert.equal(rarr[i], rarr2[i]);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);

        ds.seek(0);
        for (const a of arr) {
            ds["write" + t](a);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.seek(0);
        rarr = ds["read" + t + "Array"](arr.length);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(rarr[i], arr[i]);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);

        // Map tests
        // console.log(t, arr.length, ds.byteOffset % rarr.BYTES_PER_ELEMENT === 0);
        // if (ds.byteOffset % rarr.BYTES_PER_ELEMENT === 0) {
        assert.equal(ds.byteOffset % rarr.BYTES_PER_ELEMENT, 0);

        ds.seek(0);
        rarr = ds["map" + t + "Array"](arr.length);
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(rarr[i], arr[i]);
            rarr[i] = 127;
        }
        ds.seek(0);
        let warr = ds["read" + t + "Array"](arr.length);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(warr[i], 127);
        }
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        rarr = ds["map" + t + "Array"](arr.length);
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.notEqual(rarr[i], arr[i]);
            rarr[i] = 127;
        }
        ds.seek(0);
        if (elen > 1) {
            warr = ds["read" + t + "Array"](arr.length);
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                assert.notEqual(warr[i], 127);
            }
        }
        ds.seek(0);
        ds["map" + t + "Array"](arr.length);
        ds.seek(0);
        warr = ds["read" + t + "Array"](arr.length);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(warr[i], 127);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.seek(0);
        rarr = ds["read" + t + "Array"](arr.length);
        if (elen > 1) {
            for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
                assert.notEqual(rarr[i], arr[i]);
            }
        }
        // }

        ds.seek(0);
        ds["write" + t + "Array"](arr);
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        ds.seek(0);
        rarr = ds["read" + t + "Array"](arr.length);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(rarr[i], arr[i]);
        }
        ds.seek(0);
        for (i = 0; i < Math.floor(ds.byteLength / elen); i++) {
            assert.equal(ds["read" + t](), arr[i]);
        }
        assert.equal(ds.position, elen * i);
        assert.equal(ds.byteLength, blen);
        assert.equal(ds.buffer.byteLength, ds.byteLength + boff);
        assert.throws(() => ds["read" + t + "Array"](1));
        ds.dynamicSize = false;
        assert.throws(() => ds["write" + t + "Array"]([125]));
        const ds2 = new DataStream();
        ds2["write" + t + "Array"](arr);
        ds2.seek(0);
        rarr = ds2["read" + t + "Array"](arr.length);
        for (i = 0; i < ds2.byteLength / elen; i++) {
            assert.equal(rarr[i], arr[i]);
        }
        ds2.buffer; // tslint:disable-line no-unused-expression
        assert.throws(() => ds2["read" + t + "Array"](1));
    };

    const testTypeArray = (ds, t, elen) => {
        const boff = ds.byteOffset;
        const blen = ds.byteLength;
        let arr: any = [];
        let i = 0;
        for (; i < Math.floor(ds.byteLength / elen); i++) {
            arr.push((125 + i) % 127);
        }
        testDS(i, ds, boff, blen, t, elen, arr);
        arr = new TypedArrays[t + "Array"](ds.byteLength / elen);
        for (i = 0; i < arr.length; i++) {
            arr[i] = (125 + i) % 127;
        }
        testDS(i, ds, boff, blen, t, elen, arr);
    };

    it("constructor", () => {
        const buf = new ArrayBuffer(100);
        let ds = new DataStream(buf);
        assert.equal(ds.byteLength, buf.byteLength);
        assert.equal(ds.endianness, DataStream.LITTLE_ENDIAN);
        for (let i = 0; i < 100; i++) {
            ds = new DataStream(buf, i);
            ds = new DataStream(buf, i, DataStream.BIG_ENDIAN);
            ds = new DataStream(buf, i, DataStream.LITTLE_ENDIAN);
            assert.equal(ds.byteLength, buf.byteLength - i);
            assert.equal(ds.byteOffset, i);
        }
        ds = new DataStream(buf, 2, DataStream.BIG_ENDIAN);
        assert.equal(ds.endianness, DataStream.BIG_ENDIAN);
        ds = new DataStream(buf, null, DataStream.BIG_ENDIAN);
        assert.equal(ds.endianness, DataStream.BIG_ENDIAN);
        assert.equal(ds.byteLength, buf.byteLength);
        ds = new DataStream(buf, null, DataStream.LITTLE_ENDIAN);
        assert.equal(ds.endianness, DataStream.LITTLE_ENDIAN);
        assert.equal(ds.byteLength, buf.byteLength);
        let dv: any = new DataView(buf);
        ds = new DataStream(dv, 0, DataStream.BIG_ENDIAN);
        assert.equal(ds.endianness, DataStream.BIG_ENDIAN);
        assert.equal(ds.byteLength, buf.byteLength);
        assert.equal(ds.byteOffset, dv.byteOffset);
        for (let i = 0; i < 100; i++) {
            dv = new DataView(buf, i);
            ds = new DataStream(dv);
            assert.equal(ds.byteLength, buf.byteLength - i);
            assert.equal(ds.byteOffset, dv.byteOffset);
        }
        for (let i = 0; i < 50; i++) {
            dv = new DataView(buf, 50);
            ds = new DataStream(dv, i);
            assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
            assert.equal(ds.byteOffset, dv.byteOffset + i);
        }
        for (let i = 0; i < 100; i++) {
            dv = new Uint8Array(buf, i);
            ds = new DataStream(dv);
            assert.equal(ds.byteLength, buf.byteLength - i);
            assert.equal(ds.byteOffset, dv.byteOffset);
        }
        for (let i = 0; i < 50; i++) {
            dv = new Uint8Array(buf, 50);
            ds = new DataStream(dv, i);
            assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
            assert.equal(ds.byteOffset, dv.byteOffset + i);
        }
        for (let i = 0; i < 25; i++) {
            dv = new Float32Array(buf, i * 4);
            ds = new DataStream(dv);
            assert.equal(ds.byteLength, buf.byteLength - i * 4);
            assert.equal(ds.byteOffset, dv.byteOffset);
        }
        for (let i = 0; i < 12; i++) {
            dv = new Float32Array(buf, 12);
            ds = new DataStream(dv, i);
            assert.equal(ds.byteLength, buf.byteLength - i - dv.byteOffset);
            assert.equal(ds.byteOffset, dv.byteOffset + i);
        }
    });

    it("Struct", () => {
        // prettier-ignore
        const embed = [
            "tag", "uint32be",
            "code", "uint32le",
            "greet", "cstring"
        ];
        // prettier-ignore
        const def = [
            "tag", "cstring:4",
            "code", "uint32le",
            "embed", embed,
            "length", "uint16be",
            "data", ["[]", "float32be", "length"],
            "greet", "cstring:20",
            "endNote", "uint8"
        ];

        // prettier-ignore
        const u = [137,  80,  78,  71,   0, 136, 136, 254, 137,  80,
            78,  71,   0, 136, 136, 255,  72, 101, 108, 108,
            111,  44,  32,  87, 111, 114, 108, 100,  33,   0,
            0,   2,   0,   1,   2,   3,   1,   2,   3,   4,
            72, 101, 108, 108, 111,  44,  32,  87, 111, 114,
            108, 100,  33,   0,   0,   0,   0,   0,   0,   0,
            255];

        const ds = new DataStream();
        ds.writeUint8Array(u);
        ds.writeUint8Array(u);
        ds.seek(0);
        const obj: any = ds.readStruct(def);
        const obj2: any = ds.readStruct(def);
        const d1 = obj.data;
        const d2 = obj2.data;
        delete obj.data;
        delete obj2.data;
        assert.equal(255, obj.endNote);
        assert.equal(255, obj2.endNote);
        expect(obj).to.deep.equal(obj2);
        expect(d1).to.deep.equal(d2);
        const p = ds.position;
        obj.data = d1;
        ds.writeStruct(def, obj);
        delete obj.data;
        ds.seek(p);
        const obj3: any = ds.readStruct(def);
        const d3 = obj3.data;
        delete obj3.data;
        ds.seek(p);
        assert.equal(255, obj3.endNote);
        sameMembers(ds.readUint8Array(u.length), u);
        expect(obj).to.deep.equal(obj3);
        expect(d1).to.deep.equal(d3);

        // prettier-ignore
        const def2 = [
            "one", "float32",
            "two", "float32be",
            "three", "float32le",
            "four", "float32"
        ];
        const u2 = [1, 1, 1, 1];
        const ds2 = new DataStream();
        ds2.writeFloat32Array(u2, DataStream.LITTLE_ENDIAN);
        ds2.seek(0);
        ds2.endianness = DataStream.LITTLE_ENDIAN;
        let o2: any = ds2.readStruct(def2);
        assert.equal(o2.one, 1);
        assert.equal(o2.four, 1);
        assert.notEqual(o2.two, o2.three);
        assert.equal(o2.one, o2.four);
        assert.equal(o2.one, o2.three);
        assert.notEqual(o2.one /*LE*/, o2.two /*BE*/);
        assert.equal(o2.one /*LE*/, o2.three /*LE*/);
        ds2.seek(0);
        ds2.endianness = DataStream.BIG_ENDIAN;
        o2 = ds2.readStruct(def2);
        assert.notEqual(o2.one, 1);
        assert.notEqual(o2.four, 1);
        assert.notEqual(o2.two, o2.three);
        assert.equal(o2.one, o2.four);
        assert.equal(o2.one /*BE*/, o2.two /*BE*/);
        assert.notEqual(o2.one /*BE*/, o2.three /*LE*/);

        // prettier-ignore
        const def3 = [
            "length", "uint16be",
            "data", ["[]", "uint8", s => s.length - 2],
            "endNote", "uint8"
        ];
        const u3 = [0, 8, 1, 2, 3, 4, 5, 6, 255];
        const ds3 = new DataStream();
        ds3.writeUint8Array(u3);
        ds3.seek(0);
        const o3: any = ds3.readStruct(def3);
        assert.equal(o3.length, 8);
        assert.equal(o3.endNote, 255);
        sameMembers(o3.data, [1, 2, 3, 4, 5, 6]);

        // prettier-ignore
        const def4 = [
            "length", "uint16be",
            "data", {
                get(ds, s) {
                    const o = {odd: [], even: []};
                    for (let i = 0; i < s.length - 2; i += 2) {
                        o.odd.push(ds.readUint8());
                        o.even.push(ds.readUint8());
                    }
                    return o;
                },
                set(ds, v) {
                    for (let i = 0; i < v.odd.length; i++) {
                        ds.writeUint8(v.odd[i]);
                        ds.writeUint8(v.even[i]);
                    }
                }
            },
            "endNote", "uint8"
        ];
        const u4 = [0, 8, 1, 2, 3, 4, 5, 6, 255];
        const ds4 = new DataStream(new Uint8Array(u4));
        const o4: any = ds4.readStruct(def4);
        assert.equal(o4.length, 8);
        assert.equal(o4.endNote, 255);
        expect(o4.data.odd).to.deep.equal([1, 3, 5]);
        expect(o4.data.even).to.deep.equal([2, 4, 6]);
        const pos = ds4.position;
        ds4.writeStruct(def4, o4);
        ds4.seek(pos);
        const o4b = ds4.readStruct(def4);
        expect(o4).to.deep.equal(o4b);
        sameMembers(new Uint8Array(ds4.buffer), u4.concat(u4));

        /* Test variable-length string definition */
        // prettier-ignore
        const def5 = [
            "len", "uint8",
            "greet", "cstring:len",
            "pad", "string:2",
            "len2", "uint8",
            "greet2", "string:len2",
            "tail", [[], "uint8", "*"]
        ];

        // prettier-ignore
        const u5 = [5,
            72, 101, 108, 108, 111, // "Hello"
            44,  32, // ", "
            6,
            87, 111, 114, 108, 100,  33, // "World!"
            0,   0,   0,   0,   0,   0,   0, 255];

        const ds5 = new DataStream();
        ds5.writeUint8Array(u5);
        ds5.seek(0);
        const o5: any = ds5.readStruct(def5);
        assert.equal(o5.len, o5.greet.length);
        assert.equal("Hello", o5.greet);
        assert.equal(", ", o5.pad);
        assert.equal(o5.len2, o5.greet2.length);
        assert.equal("World!", o5.greet2);
        sameMembers(o5.tail, [0, 0, 0, 0, 0, 0, 0, 255]);

        const def6 = ["len", "uint8", "greet", "string,utf-8:len"];
        const greet = "xin chào đỗữẫẨở";
        // var greetData = new TextEncoder('utf-8').encode(greet);
        // console.log(greetData, greetData.length, greet.length);
        // prettier-ignore
        const u6 = [27,
            120, 105, 110, 32, 99, 104, 195, 160, 111, 32, 196, 145, 225, 187, 151, 225, 187, 175, 225, 186, 171, 225, 186, 168, 225, 187, 159
        ];
        const ds6 = new DataStream();
        ds6.writeUint8Array(u6);
        ds6.seek(0);
        const o6: any = ds6.readStruct(def6);
        assert.equal(greet, o6.greet);

        const ds6b = new DataStream();
        ds6b.writeStruct(def6, o6);

        const ds6c = new DataStream();

        // struct to write don't have 'len' field
        ds6c.writeStruct(def6, {greet}, true);

        ds6b.seek(0);
        const o6b = ds6b.readStruct(def6);
        ds6c.seek(0);
        const o6c = ds6c.readStruct(def6);
        expect(o6).to.deep.equal(o6b);
        expect(o6).to.deep.equal(o6c);
        sameMembers(new Uint8Array(ds6.buffer), u6);
        sameMembers(new Uint8Array(ds6b.buffer), u6);
        sameMembers(new Uint8Array(ds6c.buffer), u6);
    });

    it("endianness", () => {
        assert(
            DataStream.endianness === DataStream.LITTLE_ENDIAN ||
                DataStream.endianness === DataStream.BIG_ENDIAN,
            "Err, DataStream.endianness should be DataStream.LITTLE_ENDIAN or DataStream.BIG_ENDIAN"
        );
    });

    const buf = new ArrayBuffer(1064);
    let ds: DataStream;
    it("common test", () => {
        ds = new DataStream(buf, 64);
        assert.equal(ds.byteLength + 64, buf.byteLength);
        ds.endianness = DataStream.LITTLE_ENDIAN;
        ds.writeUint16(1);
        ds.seek(0);
        let a = ds.readUint8Array(2);
        assert.equal(a[0], 1);
        assert.equal(a[1], 0);
        ds.seek(0);
        ds.endianness = DataStream.BIG_ENDIAN;
        ds.writeUint16(1);
        ds.seek(0);
        a = ds.readUint8Array(2);
        assert.equal(a[0], 0);
        assert.equal(a[1], 1);
        ds.seek(0);
        ds.endianness = DataStream.LITTLE_ENDIAN;
        for (let i = 0; i < 1000 / 8; i++) {
            ds.writeFloat64(0.125);
        }
        assert.equal(ds.position + 64, buf.byteLength);
        assert.equal(ds.byteLength + 64, buf.byteLength);
        assert.equal(ds.buffer.byteLength, buf.byteLength);

        ds.seek(0);
        for (let i = 0; i < 1000 / 8; i++) {
            assert.equal(0.125, ds.readFloat64());
        }
        assert.equal(ds.position + 64, buf.byteLength);

        assert.throws(() => ds.readFloat32());

        ds.seek(0);
        ds.endianness = DataStream.BIG_ENDIAN;
        for (let i = 0; i < 1000 / 8; i++) {
            assert.notEqual(0.125, ds.readFloat64());
        }
        ds.seek(0);
        for (let i = 0; i < 999; i++) {
            ds.writeFloat32(0.125);
        }
        // reading beyond extended buffer succeeds for performance reasons
        ds.readFloat32();
        assert.equal(ds.position, 4000);
        assert.equal(ds.byteLength, 3996);
        assert.equal(ds.buffer.byteLength, 3996 + 64);
        ds.position = 3996;
        // but fails after getting buffer due to _trimAlloc
        assert.throws(() => ds.readFloat32());

        ds.seek(0);
        for (let i = 0; i < 999; i++) {
            assert.equal(0.125, ds.readFloat32());
        }
        assert.equal(ds.position + 64, ds.buffer.byteLength);

        ds.writeFloat32(0.125);

        ds.dynamicSize = false;
        assert.throws(() => ds.writeFloat32(0.125));

        assert.equal(ds.position, 4000);
        assert.equal(ds.byteLength, 4000);
        assert.equal(ds.buffer.byteLength, ds.position + 64);
    });

    it("testType Int32", () => testType(ds, "Int32", 4));
    it("testType Int16", () => testType(ds, "Int16", 2));
    it("testType Int8", () => testType(ds, "Int8", 1));
    it("testType Uint32", () => testType(ds, "Uint32", 4));
    it("testType Uint16", () => testType(ds, "Uint16", 2));
    it("testType Uint8", () => testType(ds, "Uint8", 1));
    it("testType Float32", () => testType(ds, "Float32", 4));
    it("testType Float64", () => testType(ds, "Float64", 8));

    ds = new DataStream(buf, 7);

    it("testType Int32 - second run", () => testType(ds, "Int32", 4));
    it("testType Int16 - second run", () => testType(ds, "Int16", 2));
    it("testType Int8 - second run", () => testType(ds, "Int8", 1));
    it("testType Uint32 - second run", () => testType(ds, "Uint32", 4));
    it("testType Uint16 - second run", () => testType(ds, "Uint16", 2));
    it("testType Uint8 - second run", () => testType(ds, "Uint8", 1));
    it("testType Float32 - second run", () => testType(ds, "Float32", 4));
    it("testType Float64 - second run", () => testType(ds, "Float64", 8));

    it("other", () => {
        let s = "Hello, 世界";
        let dss = new DataStream();
        dss.writeUCS2String(s);
        dss.seek(0);
        assert.equal(s, dss.readUCS2String(s.length));

        s = "Exif\\000\\000";
        dss = new DataStream();
        dss.writeString(s);
        dss.seek(0);
        assert.equal(s, dss.readString(s.length));

        dss = new DataStream();
        s = "Hello, World!";
        dss.writeCString(s);
        assert.equal(dss.byteLength, s.length + 1);
        dss.seek(0);
        assert.equal(s, dss.readCString());
        const dp = dss.position;
        dss.writeCString(s, s.length); // no zero terminate
        dss.seek(dp);
        assert.equal(s, dss.readCString());
        dss.writeCString(s, s.length); // no zero terminate
        dss.seek(dp);
        assert.equal(s, dss.readCString(s.length));
        dss.buffer; // tslint:disable-line no-unused-expression
        assert.equal(s, dss.readCString());

        dss = new DataStream();
        s = "Hello, 世界";
        dss.writeString(s, "UTF-8");
        const bl = dss.byteLength;
        dss.seek(0);
        assert.equal(s, dss.readString(dss.byteLength, "UTF-8"));
        // ugh, byte-counted UTF-8 strings :(

        dss = new DataStream();
        s = "Hello, me";
        dss.writeString(s, "UTF-8");
        assert.notEqual(bl, dss.byteLength);
        dss.seek(0);
        assert.equal(s, dss.readString(dss.byteLength, "UTF-8"));
    });
});
