import DataStream from "../DataStream";
import jpeg = require("jpeg-js");

document
    .querySelector('input[type="file"]')
    .addEventListener("change", function(e) {
        var reader = new FileReader();

        var tiffByteSize = {
            1: 1,
            2: 1,
            3: 2,
            4: 4,
            5: 8,
            6: 1,
            7: 1,
            8: 2,
            9: 4,
            10: 8,
            11: 4,
            12: 8
        };

        var tiffTag = [
            "tag",
            "uint16",
            "type",
            "uint16",
            "count",
            "uint32",
            "value",
            function(ds, s) {
                var p = ds.position;
                if (s.count * tiffByteSize[s.type] > 4) {
                    ds.seek(ds.readUint32());
                }
                var v: any = {error: "Unknown TIFF Field"};
                switch (s.type) {
                    case 1:
                        v = ds.readUint8Array(s.count);
                        break;
                    case 2:
                        v = ds.readString(s.count);
                        break;
                    case 3:
                        v = ds.readUint16Array(s.count);
                        break;
                    case 4:
                        v = ds.readUint32Array(s.count);
                        break;
                    case 5:
                        v = ds.readUint32Array(2 * s.count);
                        break;
                    case 6:
                        v = ds.readInt8Array(s.count);
                        break;
                    case 7:
                        v = ds.readInt8Array(s.count);
                        break;
                    case 8:
                        v = ds.readInt16Array(s.count);
                        break;
                    case 9:
                        v = ds.readInt32Array(s.count);
                        break;
                    case 10:
                        v = ds.readInt32Array(2 * s.count);
                        break;
                    case 11:
                        v = ds.readFloat32(s.count);
                        break;
                    case 12:
                        v = ds.readFloat64(s.count);
                        break;
                }
                ds.position = p + 4;
                if (v.length && s.type != 2) {
                    v = Array.prototype.join.call(v);
                }
                return v;
            }
        ];

        var parseTIFF = function(u8) {
            var rv: any = {};
            var ds = new DataStream(u8);
            rv.endianness = ds.readString(2);
            ds.endianness =
                rv.endianness == "MM"
                    ? DataStream.BIG_ENDIAN
                    : DataStream.LITTLE_ENDIAN;
            rv.magic = ds.readUint16();
            if (rv.magic != 42) return null;
            rv.firstOff = ds.readUint32();
            ds.seek(rv.firstOff);
            var h = [];
            rv.entries = h;
            rv.dirOffsets = [];
            while (true) {
                const numEntries = ds.readUint16();
                for (var i = 0; i < numEntries; i++) {
                    h.push(ds.readStruct(tiffTag));
                }
                const nextOff = ds.readUint32();
                if (nextOff) {
                    ds.seek(nextOff);
                    rv.dirOffsets.push(nextOff);
                } else {
                    break;
                }
            }
            return rv;
        };

        var jpegMarkers = {
            // Huffman coding SOFs
            0xffc0: "SOF0", // baseline DCT
            0xffc1: "SOF1", // extended sequential DCT
            0xffc2: "SOF2", // progressive DCT
            0xffc3: "SOF3", // lossless (sequential)

            0xffc5: "SOF5", // differential sequential DCT
            0xffc6: "SOF6", // differential progressive DCT
            0xffc7: "SOF7", // differential lossless (sequential)

            // Arithmetic coding SOFs
            0xffc8: "JPG", // reserved
            0xffc9: "SOF9", // extended sequential DCT
            0xffca: "SOF10", // progressive DCT
            0xffcb: "SOF11", // lossless sequential

            0xffcd: "SOF13", // differential sequential DCT
            0xffce: "SOF14", // differential progressive DCT
            0xffcf: "SOF15", // differential lossless DCT

            0xffc4: "DHT", // Define Huffman table(s)
            0xffcc: "DAC", // Define arithmetic coding conditioning(s)

            // Restart interval termination
            0xffd0: "RST0",
            0xffd1: "RST1",
            0xffd2: "RST2",
            0xffd3: "RST3",
            0xffd4: "RST4",
            0xffd5: "RST5",
            0xffd6: "RST6",
            0xffd7: "RST7",

            // other markers
            0xffd8: "SOI", // start of image
            0xffd9: "EOI", // end of image
            0xffda: "SOS", // start of scan
            0xffdb: "DQT", // define quantization table(s)
            0xffdc: "DNL", // define number of lines
            0xffdd: "DRI", // define restart interval
            0xffde: "DHP", // define hierarchical progression
            0xffdf: "EXP", // expand reference component(s)

            // APP markers
            0xffe0: "APP0",
            0xffe1: "APP1",
            0xffe2: "APP2",
            0xffe3: "APP3",
            0xffe4: "APP4",
            0xffe5: "APP5",
            0xffe6: "APP6",
            0xffe7: "APP7",
            0xffe8: "APP8",
            0xffe9: "APP9",
            0xffea: "APP10",
            0xffeb: "APP11",
            0xffec: "APP12",
            0xffed: "APP13",
            0xffee: "APP14",
            0xffef: "APP15",

            // JPEG extensions
            0xfff0: "JPG0",
            0xfff1: "JPG1",
            0xfff2: "JPG2",
            0xfff3: "JPG3",
            0xfff4: "JPG4",
            0xfff5: "JPG5",
            0xfff6: "JPG6",
            0xfff7: "JPG7",
            0xfff8: "JPG8",
            0xfff9: "JPG9",
            0xfffa: "JPG10",
            0xfffb: "JPG11",
            0xfffc: "JPG12",
            0xfffd: "JPG13",

            0xfffe: "COM", // comment

            0xff01: "TEM*" // For temporary private use in arithmetic coding
        };

        var jpegStruct = [
            "start",
            function(ds) {
                var t = ds.readUint16();
                return t == 0xffd8 ? t : null;
            },
            "markers",
            [
                "[]",
                [
                    "tag",
                    function(ds) {
                        var t = ds.readUint16();
                        return t == 0xffd9 ? null : t;
                    },
                    "tagName",
                    function(ds, s) {
                        return jpegMarkers[s.tag] || "Unknown";
                    },
                    "length",
                    "uint16be",
                    "data",
                    {
                        get: function(ds, s) {
                            switch (s.tag) {
                                case 0xffe1: // EXIF
                                    var exif = ds.readString(6);
                                    if (exif == "Exif\0\0") {
                                        // parse rest of Exif
                                        return {
                                            exif: exif,
                                            data: parseTIFF(
                                                ds.mapUint8Array(s.length - 8)
                                            )
                                        };
                                    } else {
                                        ds.position -= exif.length;
                                        var xmp = ds.readCString();
                                        if (
                                            xmp ==
                                            "http://ns.adobe.com/xap/1.0/"
                                        ) {
                                            return {
                                                xmp: xmp,
                                                data: ds.readString(
                                                    s.length -
                                                        2 -
                                                        xmp.length -
                                                        1
                                                )
                                            };
                                        } else {
                                            ds.position -= xmp.length + 1;
                                            return ds.mapUint8Array(
                                                s.length - 2
                                            ).length;
                                        }
                                    }
                                // break;
                                case 0xffe0: // APP0
                                    if (s.length >= 7) {
                                        // probably a JFIF
                                        var p = ds.position;
                                        var jfif = ds.readCString(5);
                                        if (jfif == "JFIF" || jfif == "JFXX") {
                                            var jfifStruct = [
                                                "majorVersion",
                                                "uint8",
                                                "minorVersion",
                                                "uint8",
                                                "units",
                                                "uint8",
                                                "xDensity",
                                                "uint16",
                                                "yDensity",
                                                "uint16",
                                                "thumbnail",
                                                [
                                                    "width",
                                                    "uint8",
                                                    "height",
                                                    "uint8",
                                                    "data",
                                                    ["[]", "uint8", "*"]
                                                ]
                                            ];
                                            if (jfif == "JFXX") {
                                                jfifStruct.unshift(
                                                    "extensionCode",
                                                    "uint8"
                                                );
                                            }
                                            var u8 = ds.mapUint8Array(
                                                s.length - 7
                                            );
                                            var rv = new DataStream(
                                                u8,
                                                null,
                                                DataStream.BIG_ENDIAN
                                            ).readStruct(jfifStruct);
                                            if (!rv) {
                                                ds.position = p;
                                                return ds.readString(
                                                    s.length - 2
                                                );
                                            }
                                            return {jfif: jfif, data: rv};
                                        } else {
                                            ds.position -= 5;
                                            return ds.readString(s.length - 2);
                                        }
                                    } else {
                                        return ds.mapUint8Array(s.length - 2)
                                            .length;
                                    }
                                // break;
                                case 0xffe2: // APP2, ICC Profile most likely
                                    return ds.readString(s.length - 2);
                                case 0xffed: // APP13, IPTC / Photoshop IRB
                                    return ds.readString(s.length - 2);
                                case 0xffdd: // DRI
                                    return s.length == 4
                                        ? ds.readUint16()
                                        : ds.mapUint8Array(s.length - 2).length;
                                case 0xffda: // image stream
                                    var p = ds.position;
                                    var cmpCount = ds.readUint8();
                                    var cs = [];
                                    for (var i = 0; i < cmpCount; i++) {
                                        cs.push({
                                            id: ds.readUint8(),
                                            huffmanTable: ds.readUint8()
                                        });
                                    }
                                    ds.position = p + s.length;
                                    p = ds.position;
                                    var u8 = ds.mapUint8Array(
                                        ds.byteLength - ds.position
                                    );
                                    for (var i = 1; i < u8.length; i++) {
                                        if (
                                            u8[i - 1] == 0xff &&
                                            u8[i] == 0xd9
                                        ) {
                                            break;
                                        }
                                    }
                                    ds.position = p;
                                    return {
                                        components: cs,
                                        imageData: ds.mapUint8Array(i - 1)
                                            .length
                                    };
                                default:
                                    return ds.mapUint8Array(s.length - 2)
                                        .length;
                            }
                        }
                    }
                ],
                "*"
            ],
            "end",
            function(ds) {
                var t = ds.readUint16();
                return t == 0xffd9 ? t : null;
            }
        ];

        reader.onload = function(e) {
            var ds = new DataStream(this.result);
            ds.endianness = DataStream.BIG_ENDIAN;
            var obj = ds.readStruct(jpegStruct) || parseTIFF(this.result);
            const pre = document.querySelector("pre");
            if (obj) {
                pre.textContent = JSON.stringify(obj, null, 4);
                if (obj.start) {
                    const j = jpeg.decode(this.result);
                    var c = document.createElement("canvas");
                    c.width = j.width;
                    c.height = j.height;
                    var ctx = c.getContext("2d");
                    const id = new ImageData(
                        new Uint8ClampedArray(j.data),
                        j.width,
                        j.height
                    );
                    ctx.putImageData(id, 0, 0);
                    c.style.display = "block";
                    pre.appendChild(c);
                }
            } else {
                pre.textContent =
                    "Failed to parse JPEG at " + ds.failurePosition + " :(";
            }
        };

        reader.readAsArrayBuffer(this.files[0]);
    });
