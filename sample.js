var sample = {

    //"operation_set": [0, 1, 2, 3], //Can be generated from bitMask
    "operation_flags":0, //Operator Flags
    "solution_flags":0, //Solution Flags
    "bitMask": 15,
    "number_set": 1,
    "key": "X5scS",
    "solution": [
    [
        [2, 2],
        [1, 1],
        [3, 3],
        [4, 4]
    ],
    [
        [4, 4],
        [3, 3],
        [1, 1],
        [2, 2]
    ],
    [
        [1, 1],
        [4, 4],
        [2, 2],
        [3, 3]
    ],
    [
        [3, 3],
        [2, 2],
        [4, 4],
        [1, 1]
    ]
],
    "c": [{
    "i": 4,
    "t": 0,
    "x": 0,
    "y": 0,
    "op": 3,
    "rt": {
        "solutions": [
            [{
                "x": 1,
                "y": 1,
                "val": 3
            }, {
                "x": 0,
                "y": 1,
                "val": 4
            }],
            [{
                "x": 1,
                "y": 1,
                "val": 3,
                "symbol": "3"
            }, {
                "x": 0,
                "y": 1,
                "val": 4,
                "symbol": "4"
            }]
        ],
        "eq": "((2+1)*3*4)"
    },
    "c": [{
        "i": 0,
        "t": 1,
        "x": 0,
        "y": 0,
        "op": 2,
        "rt": {
            "solutions": [
                [{
                    "x": 0,
                    "y": 0,
                    "val": 2
                }, {
                    "x": 1,
                    "y": 0,
                    "val": 1
                }],
                [{
                    "x": 0,
                    "y": 0,
                    "val": 2,
                    "symbol": "2"
                }, {
                    "x": 1,
                    "y": 0,
                    "val": 1,
                    "symbol": "1"
                }]
            ],
            "eq": "(2+1)"
        },
        "o": "Cca"
    }],
    "o": "Ctd",
    "ok": true
}, {
    "i": 4,
    "t": 0,
    "x": 2,
    "y": 0,
    "op": 3,
    "rt": {
        "solutions": [
            [{
                "x": 2,
                "y": 0,
                "val": 3
            }, {
                "x": 3,
                "y": 0,
                "val": 4
            }],
            [{
                "x": 2,
                "y": 0,
                "val": 3,
                "symbol": "3"
            }, {
                "x": 3,
                "y": 0,
                "val": 4,
                "symbol": "4"
            }]
        ],
        "eq": "((1*2)*3*4)"
    },
    "c": [{
        "i": 0,
        "t": 1,
        "x": 2,
        "y": 1,
        "op": 3,
        "rt": {
            "solutions": [
                [{
                    "x": 2,
                    "y": 1,
                    "val": 1
                }, {
                    "x": 3,
                    "y": 1,
                    "val": 2
                }],
                [{
                    "x": 2,
                    "y": 1,
                    "val": 1,
                    "symbol": "1"
                }, {
                    "x": 3,
                    "y": 1,
                    "val": 2,
                    "symbol": "2"
                }]
            ],
            "eq": "(1*2)"
        },
        "o": "C9j"
    }],
    "o": "C7_",
    "ok": true
}, {
    "i": 4,
    "t": 0,
    "x": 2,
    "y": 2,
    "op": 0,
    "rt": {
        "solutions": [
            [{
                "x": 2,
                "y": 2,
                "val": 2
            }, {
                "x": 3,
                "y": 2,
                "val": 3
            }],
            [{
                "x": 2,
                "y": 2,
                "val": 2,
                "symbol": "2"
            }, {
                "x": 3,
                "y": 2,
                "val": 3,
                "symbol": "3"
            }]
        ],
        "eq": "((4-1)-2-3)"
    },
    "c": [{
        "i": 0,
        "t": 1,
        "x": 2,
        "y": 3,
        "op": 0,
        "rt": {
            "solutions": [
                [{
                    "x": 2,
                    "y": 3,
                    "val": 4
                }, {
                    "x": 3,
                    "y": 3,
                    "val": 1
                }],
                [{
                    "x": 2,
                    "y": 3,
                    "val": 4,
                    "symbol": "4"
                }, {
                    "x": 3,
                    "y": 3,
                    "val": 1,
                    "symbol": "1"
                }]
            ],
            "eq": "(4-1)"
        },
        "o": "DAt"
    }],
    "o": "C.I",
    "ok": true
}, {
    "i": 4,
    "t": 0,
    "x": 0,
    "y": 2,
    "op": 1,
    "rt": {
        "solutions": [
            [{
                "x": 1,
                "y": 3,
                "val": 2
            }, {
                "x": 0,
                "y": 3,
                "val": 3
            }],
            [{
                "x": 1,
                "y": 3,
                "val": 2,
                "symbol": "2"
            }, {
                "x": 0,
                "y": 3,
                "val": 3,
                "symbol": "3"
            }]
        ],
        "eq": "((1/4)/2/3)"
    },
    "c": [{
        "i": 0,
        "t": 1,
        "x": 0,
        "y": 2,
        "op": 1,
        "rt": {
            "solutions": [
                [{
                    "x": 0,
                    "y": 2,
                    "val": 1
                }, {
                    "x": 1,
                    "y": 2,
                    "val": 4
                }],
                [{
                    "x": 0,
                    "y": 2,
                    "val": 1,
                    "symbol": "1"
                }, {
                    "x": 1,
                    "y": 2,
                    "val": 4,
                    "symbol": "4"
                }]
            ],
            "eq": "(1/4)"
        },
        "o": "Cfk"
    }],
    "o": "Cwn",
    "ok": true
}],
    "current_notes": null,
    "bitMask": 1
}

var sample2 = {
    "bitMask": 12,
    "key": "Zos6E",
    "operation_set": [2, 3],
    "number_set": 4,
    "c": [{
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 0,
        "op": 2,
        "o": "Bv",
        "c": [{
            "i": 7,
            "t": 1,
            "x": 0,
            "y": 0,
            "op": 3,
            "o": "D0Yp"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 0,
        "op": 2,
        "o": "B5",
        "c": [{
            "i": 6,
            "t": 1,
            "x": 2,
            "y": 0,
            "op": 3,
            "o": "EltX"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 2,
        "op": 2,
        "o": "Bw",
        "c": [{
            "i": 5,
            "t": 1,
            "x": 0,
            "y": 2,
            "op": 3,
            "o": "D5GZ"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 2,
        "op": 2,
        "o": "B6",
        "c": [{
            "i": 8,
            "t": 1,
            "x": 3,
            "y": 2,
            "op": 3,
            "o": "FDE7"
        }]
    }]
}

var sample3 = {
    "bitMask": 15,
    "key": "Yca2q",
    "operation_set": [2, 0, 3, 1],
    "number_set": 4,
    "c": [{
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 0,
        "op": 2,
        "o": "Bv",
        "c": [{
            "i": 7,
            "t": 1,
            "x": 0,
            "y": 0,
            "op": 3,
            "o": "D0Yp"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 0,
        "op": 0,
        "o": "B5",
        "c": [{
            "i": 6,
            "t": 1,
            "x": 2,
            "y": 0,
            "op": 2,
            "o": "EltX"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 2,
        "op": 3,
        "o": "Bw",
        "c": [{
            "i": 5,
            "t": 1,
            "x": 0,
            "y": 2,
            "op": 0,
            "o": "D5GZ"
        }]
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 2,
        "op": 1,
        "o": "B6",
        "c": [{
            "i": 8,
            "t": 1,
            "x": 3,
            "y": 2,
            "op": 3,
            "o": "FDE7"
        }]
    }]
}

var multi_solution_tester = {
    "bitMask": 4,
        "key": "YkDG8",
        //"operation_set": [2],
        "number_set": 5,
        "c": [{
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 0,
        "op": 2,
        "o": "F92vt",
        "c": []
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 0,
        "op": 2,
        "o": "HK64R",
        "c": []
    }, {
        "i": 4,
        "t": 0,
        "x": 0,
        "y": 2,
        "op": 2,
        "o": "GFj9X",
        "c": []
    }, {
        "i": 4,
        "t": 0,
        "x": 2,
        "y": 2,
        "op": 2,
        "o": "HSoF7",
        "c": []
    }]
}