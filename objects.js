/**
MIT License
-----------

    Copyright (c) 2015-2016, Thomas Wiegand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**/

//The one and only number set object
//This object is used to display and use number set arrays
//A number set is the set of numbers used in a puzzle ie 1, 2, a, 2a
//set this in your gamelogic page
var g_number_sets = null;

var CONST = {

    COLOR_GOOD:"black",
    COLOR_BAD:"red",

    G_PARENT:0,
    G_CHILD:1,

    G_YES:"Y",
    G_NO:"N",

    G_UNIT_LENGTH:1,
    G_ADJUST:.04, //Adjustment applied to length of cage sides

    G_DEFAULT_MARGIN:.04,
    G_DEFAULT_RADIUS:.18,
    G_DEFAULT_LINE_WIDTH:.03,

    G_CHILD_MARGIN:0.12,
    G_CHILD_RADIUS:0.09,

    G_SCALE:50,
    G_WIDTH:24, //32,
    G_HEIGHT:14,
    G_X_MARGIN:4,
    G_Y_MARGIN:4,
    G_X_PAD:4, //8,
    G_Y_PAD:1,

    G_FONT:"10px Arial",

    G_SAVE_GAME:1,
    G_SAVE_TEMPLATE:2,
    G_SAVE_NEW_GAME:3,

    //Color constants
    G_SUBTRACT_FILL:"#f8e79f",
    G_SUBTRACT_STROKE:"#f8d540",
    G_DIVIDE_FILL:"#e8cdbf",
    G_DIVIDE_STROKE:"#cd7344",
    G_ADD_FILL:"#daeeaf",
    G_ADD_STROKE:"#91b73d",
    G_MULTIPLY_FILL:"#ddc0ea",
    G_MULTIPLY_STROKE:"#8d58a4",
    G_CONCATENATE_FILL:"#9eaef6",
    G_CONCATENATE_STROKE:"#465184",
    G_GCF_FILL:"#98e8fc",
    G_GCF_STROKE:"#01ccff",


    //Bit Mask Values
    G_SUBTRACT:1,
    G_DIVIDE:2,
    G_ADD:4,
    G_MULTIPLY:8,
    G_CONCATENATE:16,
    G_GCF:32,

    //Operator Flags
    OP_STATIC:0,                //Use values supplied by template
    OP_RANDOM:1,                //Generate Operators Randomly
    OP_SUPRESS_DUPLICATES:2,    //Try to make sure cages do not contain duplicate operators
    OP_NO_NEGATIVES:4,          //Make sure no negative solutions are generated
    OP_NO_FRACTIONS:8,          //Make sure no fractional solutions are generated
    OP_SORT_DESCENDING:16,      //Sort non commutative operations in descending order

    //Solution Generation
    SOL_STATIC:0,               //Use supplied solution
    SOL_RANDOM:1,               //Generate Random Solution

    // Direction Constants
    N: Math.PI + Math.PI / 2,
    E: 0,
    S: Math.PI / 2,
    W: Math.PI,

}

var Utl = {

  sleep:function(miliseconds)
  {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {}
  },

  addFlag:function(bitMask, flag)
  {
      return bitMask | flag;
  },

  removeFlag:function(bitMask, flag)
  {
      return bitMask & ~flag;
  },

  checkFlag:function(bitMask, flag)
  {
      return bitMask & flag;
  },

  solution_shuffle:function (array)
  {
      var key = "";
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          key += randomIndex;
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return {array: array, key: key};
  },

  /*
  solution_objectsAreSame:function (x, y) {
      var objectsAreSame = true;
      for (var propertyName in x) {
          if (x[propertyName] !== y[propertyName]) {
              objectsAreSame = false;
              break;
          }
      }
      return objectsAreSame;
  },
  */

  escapeRegExp:function (string) {
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  },

  replaceAll:function (string, find, replace) {
      return string.replace(new RegExp(Utl.escapeRegExp(find), 'g'), replace);
  },

  //Round to 3 decimal places
  roundOff:function (val) {
      return Math.round(val * 1000) / 1000;
  },

  drawStar:function (ctx, cx, cy, spikes, outerRadius, innerRadius) {
      var rot = Math.PI / 2 * 3;
      var x = cx;
      var y = cy;
      var step = Math.PI / spikes;

      ctx.strokeSyle = "#000";
      ctx.fillStyle = "#FFE700";
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius)
      for (i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y)
          rot += step

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y)
          rot += step
      }
      ctx.lineTo(cx, cy - outerRadius)
      ctx.stroke();
      ctx.closePath();
      ctx.fill();

  },

  G_KAPPA_SQUARE: .8,
  G_KAPPA_ROUND: .5522848,

  drawEllipse:function (shape, ctx, x, y, w, h) {
      var kappa = shape,
          ox = (w / 2) * kappa, // control point offset horizontal
          oy = (h / 2) * kappa, // control point offset vertical
          xe = x + w,           // x-end
          ye = y + h,           // y-end
          xm = x + w / 2,       // x-middle
          ym = y + h / 2;       // y-middle

      ctx.beginPath();
      ctx.moveTo(x, ym);
      ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

      ctx.fill();
      ctx.stroke();
  },

  //Used to proportion the placement of result Ellipse
  widthFactor:function (value) {
      var test = value.toString();
      var len = test.length;
      switch (len) {
          case 1:
              return .64;
          case 2:
              return .84;
          case 3:
              return 1;
          case 4:
              return 1.2;
          case 5:
              return 1.4;
          case 6:
              return 1.6;
          case 7:
              return 1.8;
          case 8:
              return 2;
          case 9:
              return 2.2;
          case 10:
              return 2.4;

      }
      if (len > 10) {
          return 1.8;
      }
      return 1;
  },

  translateOperands:function (source, dest, operands) {
      var array = [];
      var dx = dest[0] - source[0];
      var dy = dest[1] - source[1];
      for (var i = 0; i < operands.length; i++) {
          array.push([operands[i][0] + dx, operands[i][1] + dy]);
      }
      return array;
  },

  // Converts from degrees to radians.
  radians:function (degrees) {
      return degrees * Math.PI / 180;
  },

  // Converts from radians to degrees.
  degrees:function (radians) {
      return radians * 180 / Math.PI;
  },

  //Calcs destination point using origin(x y) and vector
  toRect:function (x, y, dist, angle) {
      x2 = x + Math.cos(angle) * dist;
      y2 = y + Math.sin(angle) * dist;
      return {x: x2, y: y2};
  },

  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  getRandomInt:function (min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
  },

  numericVal:function (str) {
      switch (str) {
          case "N":
              return CONST.N;
          case "E":
              return CONST.E;
          case "S":
              return CONST.S;
          case "W":
              return CONST.W;
      }
  },

  strArrayToNumeric:function (str) {
      var ret = [];
      for (var i = 0; i < str.length; i++) {
          ret.push(Utl.numericVal(str[i]));
      }
      return ret;
  },

  exteriorAngle:function (direction, next_direction) {
      reverse_direction = direction + Math.PI;
      reverse_direction = reverse_direction >= 2 * Math.PI ? reverse_direction - 2 * Math.PI : reverse_direction;
      var angle = next_direction - reverse_direction;
      return angle < 0 ? 2 * Math.PI + angle : angle;
  },

  gcd:function (a, b) {
      if (!b) {
          return a;
      }
      return Utl.gcd(b, a % b);
  },

  makeSymbolicExpression:function (array, operator) {
      var str = "(" + array[0];
      for (var i = 1; i < array.length; i++) {
          str += operator + array[i];
      }
      return str + ")";
  },

  arrangeSymbolicArray:function (target, order) {
      var ret = [];
      for (var i = 0; i < order.length; i++) {
          ret.push(target[order[i]]);
      }
      return ret;
  }

}

var Operations = {

    execute: function (name, array) {
        switch (name) {
            case "subtract":
                return this.subtract(array);
            case "divide":
                return this.divide(array);
            case "add":
                return this.add(array);
            case "multiply":
                return this.multiply(array);
            case "concatenate":
                return this.concatenate(array);
            case "gcf":
                return this.greatest(array);
            default:
                return 0;
        }
    },
    greatest: function (array) {
        var result = array[0];
        for (var i = 1; i < array.length; i++) {
            result = Utl.gcd(result, array[i]);
        }
        return Math.round(result * 100) / 100;
    },

    subtract: function (array) {
        //TODO sort?
        return Utl.makeSymbolicExpression(array, "-");
    },

    divide: function (array) {
        //TODO sort?
        return Utl.makeSymbolicExpression(array, "/");
    },

    add: function (array) {
        return Utl.makeSymbolicExpression(array, "+");
    },

    multiply: function (array) {
        return Utl.makeSymbolicExpression(array, "*");
    },

    concatenate: function (array) {
        //TODO under construction
        return Utl.makeSymbolicExpression(array, "");
        /*
         var result = array[0].toString();
         for(var i=1; i < array.length; i++)
         {
         result = result + array[i].toString();
         }
         return parseInt(result);
         */
    }

}

var Math_ops =
{
    matrix: [
        {name: "subtract", symbol: "-", mask:CONST.G_SUBTRACT, fillStyle: CONST.G_SUBTRACT_FILL, strokeStyle: CONST.G_SUBTRACT_STROKE, commutative: false},
        {name: "divide", symbol: "/", mask:CONST.G_DIVIDE, fillStyle: CONST.G_DIVIDE_FILL, strokeStyle: CONST.G_DIVIDE_STROKE, commutative: false},
        {name: "add", symbol: "+", mask:CONST.G_ADD, fillStyle: CONST.G_ADD_FILL, strokeStyle: CONST.G_ADD_STROKE, commutative: true},
        {name: "multiply", symbol: "*", mask:CONST.G_MULTIPLY, fillStyle: CONST.G_MULTIPLY_FILL, strokeStyle: CONST.G_MULTIPLY_STROKE, commutative: true},
        {name: "concatenate", symbol: "-", mask:CONST.G_CONCATENATE, fillStyle: CONST.G_CONCATENATE_FILL, strokeStyle: CONST.G_CONCATENATE_STROKE, commutative: true},
        {name: "gcf", symbol: "gcf", mask:CONST.G_GCF, fillStyle: CONST.G_GCF_FILL, strokeStyle: CONST.G_GCF_STROKE, commutative: true}
    ],
    getIndexForName: function (name) {
        for (var i = 0; i < this.matrix.length; i++) {
            if (name == this.matrix[i].name) {
                return i;
            }
        }
    },
    makeOperationSet: function (nameArray) {
        var ret = [];
        for (var i = 0; i < nameArray.length; i++) {
            ret.push(this.getIndexForName(nameArray[i]));
        }
        return ret;
    },
    get: function (name) {
        for (var i = 0; i < this.matrix.length; i++) {
            if (name == this.matrix[i].name) {
                return this.matrix[i];
            }
        }
    },
    selectCommutativeOps: function (array) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            var operation = Math_ops.matrix[array[i]];
            if (operation.commutative) {
                ret.push(array[i]);
            }
        }
        return ret;
    },
    getRecommendedOp: function (excludeArray, array) {
        var workingSet = [];
        for (var i = 0; i < array.length; i++) {
            var found = false;
            for (var j = 0; j < excludeArray.length; j++) {
                if (excludeArray[j] == array[i]) {
                    found = true;
                }
            }
            if (!found) {
                workingSet.push(array[i]);
            }
        }
        if (workingSet.length == 0) {
            workingSet = array;
        }
        var n = Utl.getRandomInt(0, workingSet.length);
        return workingSet[n];
    },
    toBitmask: function (operation_set)
    {
        var mask = 0;
        for(var i=0; i < operation_set.length; i++)
        {
            mask += this.matrix[operation_set[i]].mask;
        }
        return mask;
    },
    bitMaskToString: function(bit_mask)
    {
      var str = "";
      for(var i=0; i < this.matrix.length; i++)
      {
        var test = this.matrix[i].mask;
        if(bit_mask & test)
        {
          str += this.matrix[i].symbol + " ";
        }
      }
      return str;
    },
    testBitmask: function(operation_name, bit_mask)
    {
      var i = this.getIndexForName(operation_name);
      var test = this.matrix[i].mask;
      if(bit_mask & test) {
        return true;
      }
      return false;
    },
    toOperationSet: function (bit_mask)
    {
        var array = [];
        for(var i=0; i < this.matrix.length; i++)
        {
            var test = this.matrix[i].mask;
            if(bit_mask & test)
            {
                array.push(i);
            }
        }
        return array;
    },
    test: function()
    {
        for(var i=0; i < this.matrix.length; i++)
        {
            var mask = 0;
            var testArray = [];
            for(j=0; j <= i; j++)
            {
                mask += this.matrix[j].mask;
                testArray.push(j);
            }
            console.log("mask=" + mask);
            var array = this.toOperationSet(mask);
            console.log("array=" + JSON.stringify(array));
            var test = this.toBitmask(array);
            console.log("bitMask=" + test);
            if(test != mask){console.log("toBitmask FAILED test")}
            console.log("");
        }
    }
}

var Cage_properties =
{
    parent: {
        iT: CONST.G_YES, //is Thin set to CONST.G_YES to draw thin border
        iF: CONST.G_YES, //is Fill set to CONST.G_YES to fill cage
        m: CONST.G_DEFAULT_MARGIN, //Margin width
        r: CONST.G_DEFAULT_RADIUS, //Radius
        lw: CONST.G_DEFAULT_LINE_WIDTH, //Line Width
        jr: CONST.G_DEFAULT_MARGIN, //Join Radius
        l: Utl.roundOff(CONST.G_UNIT_LENGTH - 2 * CONST.G_DEFAULT_RADIUS - 2 * CONST.G_DEFAULT_MARGIN + CONST.G_ADJUST - CONST.G_DEFAULT_LINE_WIDTH)
    },
    child: {
        iT: CONST.G_NO, //is Thin set to CONST.G_NO to draw thick border
        iF: CONST.G_YES, //is Fill set to CONST.G_YES to fill cage
        m: CONST.G_CHILD_MARGIN, //Margin width
        r: CONST.G_CHILD_RADIUS, //Radius
        lw: CONST.G_DEFAULT_LINE_WIDTH, //Line Width
        jr: CONST.G_CHILD_MARGIN, //Join Radius
        l: Utl.roundOff(CONST.G_UNIT_LENGTH - 2 * CONST.G_CHILD_RADIUS - 2 * CONST.G_CHILD_MARGIN + CONST.G_ADJUST - CONST.G_DEFAULT_LINE_WIDTH)
    }
}

///////////////////////////////////////  Cartouche objects  ///////////////////////////////////
var Cartouche_Objects = (function () {

    //Private functions
    function findTopLeft(parent_id, solution) {
        var len = solution.length;
        for (var y = 0; y < len; y++) {
            for (var x = 0; x < len; x++) {
                if (solution[y][x][2] == parent_id) {
                    return {x: x, y: y};
                }
            }
        }
        return null;
    }

    //Add the point to the proper row in the table
    function addPointToProfile(profile, point) {
        var x = point[0];
        var y = point[1];
        var found = false;
        for (var i = 0; i < profile.length; i++) {
            //Test first column of row
            var row = profile[i];
            if (row[0][1] === y) {
                //add point to this row then sort row ascending
                row.push(point);
                row.sort(function (a, b) {
                    return a[0] - b[0]
                });
                found = true;
                break;
            }
        }
        if (!found) {
            //Push the point onto a new row
            profile.push([point]);
        }
    }

    //function getNextDirection(last,
    //Constructor
    function Cage(ctx) {
        this.i = null; //Index to Pallete Cage template for this cage
        this.t = CONST.G_PARENT; //Type of cage
        this.x = 0;
        this.y = 0;
        this.op = Math_ops.ADD; //Math operation for cage
        this.rt = {}; //Return Value

        this.c = []; //Array of inner cages

        this.o = []; //Array of operands
        this.B = ["E", "E", "S", "W", "W", "N"]; //default 2 box horizontal rectangle

        var props = Cage_properties.parent;
        if (this.t == CONST.G_CHILD) {
            props = Cage_properties.child;
        }

        if (ctx) //stored cages have no context
        {
            this.ctx = ctx;
            this.ctx.lineWidth = props.lw;
        }
    }

    Cage.prototype.setUnitLength = function (len) {
        var props = Cage_properties.parent;
        if (this.t == CONST.G_CHILD) {
            props = Cage_properties.child;
        }
        var adjust = CONST.G_ADJUST - props.lw;
        this.l = Utl.roundOff(len - 2 * props.r - 2 * props.m + adjust);
    }

    //Set Cage drawing data using Pallete template
    Cage.prototype.setDrawingData = function (template) {
        this.B = template.B;
        //this.o = template.o;
    }

    Cage.prototype.setIndex = function (index) {
        this.i = index;
    }

    Cage.prototype.setType = function (type) {
        this.t = type;
    }

    Cage.prototype.setBorderArray = function (array) {
        this.B = array;
    }

    Cage.prototype.setOperandsArray = function (operands) {
        this.o = operands;
    }

    Cage.prototype.setOperation = function (index) {
        this.op = index;
    }

    Cage.prototype.setResult = function (result) {
        this.rt = result || {};
    }

    /////////////////////////////////// SET OPERATION VALUES //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    Cage.prototype.setOperationValues = function (operation_set, recommended_operation, solution, reCalc) {
        var symbolsArray = [];
        var opArray = [];
        var userArray = [];
        //Add Child results to array
        for (var i = 0; i < this.c.length; i++) {
            //Use unshift so equations are formed left to right
            var return_object = this.c[i].rt;
            var child_equation = return_object.eq;
            symbolsArray.unshift(child_equation);
        }

        //Save these values for convenience
        var subtract = Math_ops.getIndexForName("subtract");
        var divide = Math_ops.getIndexForName("divide");

        //TODO This can only be done for simple numeric expressions
        if (Game.number_set.type == 0 && Utl.checkFlag(Game.operation_flags, CONST.OP_SORT_DESCENDING))
        {
          //TODO for no negative results re-order Highest val to lowest where recommended_operation is subtraction
          //Only garanteed for two member arrays - see below for checking for negative results
          if (subtract == recommended_operation || divide == recommended_operation) {
            // sort the o array solution values in descending order
            this.o.sort(function (a, b) {
              //return b - a for descending
              var x = a[0];
              var y = a[1];
              //Get operand from solution
              var point = solution[y][x];
              var opA = point[0];

              x = b[0];
              y = b[1];
              //Get operand from solution
              point = solution[y][x];
              var opB = point[0];

              //Get symbol for op
              var symbolA = Game.getNumberSetExpressionByIndex(opA);
              var symbolB = Game.getNumberSetExpressionByIndex(opB);

              var intA = parseInt(symbolA);
              var intB = parseInt(symbolB);

              return intB - intA;

            });
          }
        }
        if(reCalc) //Must be allowed to change operator types for this operation
        {
          if (Utl.checkFlag(Game.operation_flags, CONST.OP_NO_NEGATIVES))
          {
            //Fix negative results (only possible with arrays larger than 2)
            if (subtract == recommended_operation && this.o.length > 2) {
              //get the subtraction result
              var subtraction_result;
              for (var i = 0; i < this.o.length; i++) {
                var x = this.o[i][0];
                var y = this.o[i][1];
                //Get operand from solution
                var point = solution[y][x];
                var op = point[0];
                var symbol = Game.getNumberSetExpressionByIndex(op);
                var n = parseInt(symbol);
                if (i == 0) {
                  subtraction_result = n;
                }
                else {
                  subtraction_result = subtraction_result - n;
                }
              }
              if (subtraction_result < 0) {
                //If subtraction result is less than 0 substitute another operation type
                //Get a random operation from the set excluding subtraction
                recommended_operation = Math_ops.getRecommendedOp([subtract], Game.operation_set);
              }
            }
          }
        }

        //Add symbolsArray from cage.
        for (var i = 0; i < this.o.length; i++) {
            var x = this.o[i][0];
            var y = this.o[i][1];
            //Get operand from solution
            var point = solution[y][x];
            var op = point[0];
            opArray.push({x: x, y: y, val: op});
            var usr = point[1];
            userArray.push({x: x, y: y, val: usr});
            //Convert operand index into symbolic value
            var symbol = Game.getNumberSetExpressionByIndex(op);
            if(symbol)
            {
              symbolsArray.push(symbol);
            }
            else
            {
              console.log("Cage.prototype.setOperationValues No symbol Error: this.o = " + JSON.stringify(this.o));
              console.log("solution = " + JSON.stringify(solution));
            }
        }

        var operation = Math_ops.matrix[recommended_operation];
        //create the array that holds the various solutions
        var expArray = [];
        //Add the generated solution
        expArray.push(opArray);
        //Add the empty user solution
        expArray.push(userArray);

        this.rt.solutions = expArray;
        this.rt.eq = Operations.execute(operation.name, symbolsArray);

        if(reCalc) {
          //For simple numeric operators if the equation result is negative
          //change the recommended_operation from subtract
          if (Game.number_set.type == 0) {
            if (subtract == recommended_operation && Utl.checkFlag(Game.operation_flags, CONST.OP_NO_NEGATIVES)) {
              //Test if equation result is less than 0
              var simplification = CQ(this.rt.eq).simplify().toString();
              if ("-" == simplification.charAt(0) && "-(0)" != simplification) {
                //if result is less than 0 change recommended_operation to a value other than subtract
                recommended_operation = Math_ops.getRecommendedOp([subtract], Game.operation_set);
                operation = Math_ops.matrix[recommended_operation];
                this.rt.eq = Operations.execute(operation.name, symbolsArray);
              }
            }
          }
          this.op = Math_ops.getIndexForName(operation.name);
        }
        return recommended_operation;
    }

    Cage.prototype.drawResultTag = function (x, y) {
        var type = Game.number_set.type;

        this.ctx.save();

        this.ctx.scale(1 / CONST.G_SCALE, 1 / CONST.G_SCALE);

        var xs = x * CONST.G_SCALE + CONST.G_X_MARGIN;
        var ys = y * CONST.G_SCALE + CONST.G_Y_MARGIN;

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#78c9b3";
        this.ctx.fillStyle = "#78c9b3";

        var simplification = CQ(this.rt.eq).simplify().toString();
        simplification = Utl.replaceAll(simplification, "**", "^");

        //TODO investigate cause of -(0) bug
        simplification = simplification == "-(0)" ? "0" : simplification;

        //console.log("Basic Equation: " + this.rt.eq);
        //console.log("Simplification: " + simplification);

        if (type == 0) {
            var w = CONST.G_WIDTH * Utl.widthFactor(simplification);

            Utl.drawEllipse(Utl.G_KAPPA_ROUND, this.ctx, xs, ys, w, CONST.G_HEIGHT);

            this.ctx.font = CONST.G_FONT;
            this.ctx.fillStyle = "black";
            this.ctx.textBaseline = "top";
            this.ctx.fillText(simplification, xs + CONST.G_X_PAD, ys + CONST.G_Y_PAD);
            this.ctx.restore();
        }
        else {
            var xs = x * CONST.G_SCALE + 2;// + CONST.G_X_MARGIN;
            var ys = y * CONST.G_SCALE + 3;// + CONST.G_Y_MARGIN;

            var root = cvm.parse.parser.parse(simplification);
            var box = cvm.layout.ofExpr(root).box();
            root.box = box;

            var SCALE_FACTOR = 2; //The larger this factor the smaller the letter
            //Scale using width
            //var scale = h/SCALE_FACTOR/box.height;
            //var bw = box.width/SCALE_FACTOR+2*CONST.G_X_MARGIN;
            //var bh = box.height/SCALE_FACTOR+2*CONST.G_Y_MARGIN;
            var bw = box.width / SCALE_FACTOR;
            var bh = box.height / SCALE_FACTOR;

            Utl.drawEllipse(Utl.G_KAPPA_SQUARE, this.ctx, xs, ys, bw + 6, bh + 2);

            this.ctx.restore();
            this.ctx.save();

            this.ctx.scale(1 / (CONST.G_SCALE * SCALE_FACTOR), 1 / (CONST.G_SCALE * SCALE_FACTOR));

            var xs = (x * CONST.G_SCALE + CONST.G_X_MARGIN) * SCALE_FACTOR;
            var ys = (y * CONST.G_SCALE + CONST.G_Y_MARGIN) * SCALE_FACTOR;

            //Make adjustemts using box dimensions
            var left = xs;
            var bottom = ys + bh + CONST.G_Y_PAD * 8;//(h - bh)/2+9*SCALE_FACTOR/scale;

            this.ctx.fillStyle = "black";
            box.drawOnCanvas(this.ctx, left, bottom);

            this.ctx.restore();
        }
    }

    Cage.prototype.drawCage = function (x, y) {
        this.x = x;
        this.y = y;

        var operation = Math_ops.matrix[this.op];
        this.ctx.fillStyle = operation.fillStyle;
        this.ctx.strokeStyle = operation.strokeStyle;
        this.ctx.beginPath();
        var end_point;
        var border_array = Utl.strArrayToNumeric(this.B);
        for (var i = 0; i < border_array.length; i++) {
            if (i == 0) {
                end_point = this.startCage(x, y, border_array[i], border_array[i + 1]);
            }
            else if (i == border_array.length - 1) //last border
            {
                end_point = this.drawSegment(end_point, border_array[i], border_array[0]);
            }
            else {
                end_point = this.drawSegment(end_point, border_array[i], border_array[i + 1]);
            }
        }

        var props = Cage_properties.parent;
        if (this.t == CONST.G_CHILD) {
            props = Cage_properties.child;
        }

        if (props.iT == CONST.G_YES) {
            //stroke then fill produces thin outline
            this.ctx.stroke();
            if (props.iF == CONST.G_YES) {
                //this.ctx.fill();
            }
        }
        else {
            //fill then stroke produces thick outline
            if (props.iF == CONST.G_YES) {
                //this.ctx.fill();
            }
            this.ctx.stroke();
        }
    }

    Cage.prototype.startCage = function (x, y, direction, next_direction) {
        var props = Cage_properties.parent;
        if (this.t == CONST.G_CHILD) {
            props = Cage_properties.child;
        }
        var x_offset = x + props.m + props.r + props.lw / 2;
        var y_offset = y + props.m + props.lw / 2;
        point = {x: x_offset, y: y_offset};
        this.ctx.moveTo(point.x, point.y);
        return this.drawSegment(point, direction, next_direction);
    }

    Cage.prototype.drawSegment = function (point, direction, next_direction) {
        var props = Cage_properties.parent;
        if (this.t == CONST.G_CHILD) {
            props = Cage_properties.child;
        }
        var x = point.x, y = point.y;
        //move to end of curve corner to start
        var line_end = Utl.toRect(x, y, props.l, direction);
        var end_point = Utl.toRect(x, y, props.l + props.r, direction);

        //First end point is always right of line
        var direction_right = direction + Math.PI / 2;
        var direction_left = direction - Math.PI / 2;
        var curve_end = Utl.toRect(end_point.x, end_point.y, props.r, direction_right);
        this.ctx.lineTo(line_end.x, line_end.y);
        this.ctx.stroke();
        this.ctx.quadraticCurveTo(end_point.x, end_point.y, curve_end.x, curve_end.y);
        this.ctx.stroke();
        var xtAngle = Utl.exteriorAngle(direction, next_direction);
        switch (xtAngle) {
            case CONST.N: // 270
                break;
            case CONST.W: // 180
                var cp1 = Utl.toRect(curve_end.x, curve_end.y, props.jr, direction_right);
                var ec1 = Utl.toRect(cp1.x, cp1.y, props.jr, direction);
                var cp2 = Utl.toRect(ec1.x, ec1.y, props.jr, direction);
                var cp3 = Utl.toRect(line_end.x, line_end.y, props.jr * 2 + props.r, direction);
                curve_end = Utl.toRect(line_end.x, line_end.y, props.jr * 2 + props.r * 2, direction);
                var ec2 = Utl.toRect(cp3.x, cp3.y, props.r, direction_right);
                this.ctx.quadraticCurveTo(cp1.x, cp1.y, ec1.x, ec1.y);
                this.ctx.quadraticCurveTo(cp2.x, cp2.y, ec2.x, ec2.y);
                this.ctx.quadraticCurveTo(cp3.x, cp3.y, curve_end.x, curve_end.y);
                break;
            case CONST.E: // 0 - should never get here
                alert("0 Whats the problem here?")
                break;
            case CONST.S: // 90
                //build first curve
                var cp1 = Utl.toRect(curve_end.x, curve_end.y, props.jr, direction_right);
                var ec1 = Utl.toRect(cp1.x, cp1.y, props.jr, direction);
                var cp2 = Utl.toRect(ec1.x, ec1.y, props.jr, direction);
                var cp3 = Utl.toRect(line_end.x, line_end.y, props.jr * 2 + props.r, direction);
                curve_end = Utl.toRect(line_end.x, line_end.y, props.jr * 2 + props.r * 2, direction);
                var ec2 = Utl.toRect(cp3.x, cp3.y, props.r, direction_right);
                this.ctx.quadraticCurveTo(cp1.x, cp1.y, ec1.x, ec1.y);
                this.ctx.quadraticCurveTo(cp2.x, cp2.y, ec2.x, ec2.y);
                this.ctx.quadraticCurveTo(cp3.x, cp3.y, curve_end.x, curve_end.y);
                //build second curve
                cp1 = Utl.toRect(curve_end.x, curve_end.y, props.jr, direction);
                ec1 = Utl.toRect(cp1.x, cp1.y, props.jr, direction_left);
                cp2 = Utl.toRect(ec1.x, ec1.y, props.jr, direction_left);
                cp3 = Utl.toRect(cp3.x, cp3.y, props.jr * 2, direction_left);
                curve_end = Utl.toRect(cp3.x, cp3.y, props.r, direction_left);
                ec2 = Utl.toRect(cp3.x, cp3.y, props.r, direction);
                this.ctx.quadraticCurveTo(cp1.x, cp1.y, ec1.x, ec1.y);
                this.ctx.quadraticCurveTo(cp2.x, cp2.y, ec2.x, ec2.y);
                this.ctx.quadraticCurveTo(cp3.x, cp3.y, curve_end.x, curve_end.y);
                break;
        }
        return curve_end;
    }

    Cage.prototype.addChild = function (cage) {
        this.c.push(cage);
    }

    Cage.prototype.formatStrArray = function (str) {
        var arr = str.split(",");
        strArray = [];
        for (var i = 0; i < arr.length; i++) {
            strArray.push(arr[i]);
        }
        return strArray;
    }

    //TODO used in CageMaker - not funtional at this time
    Cage.prototype.isValidStrArray = function (str) {
        var strArray = this.formatStrArray(str);
        var retVal = false;
        //TODO makeDimensionsObject is not defined
        var dims = this.makeDimensionsObject(strArray);
        if (dims.N != 0 && dims.S != 0 && dims.E != 0 && dims.W != 0) {
            if (dims.N === dims.S && dims.E === dims.W) {
                retVal = true;
            }
        }
        return retVal;
    }

    //TODO used in CageMaker - not funtional at this time
    //Returns true if a valid array was passed
    Cage.prototype.addStrArray = function (str) {
        var strArray = this.formatStrArray(str);
        var retVal = false;
        //TODO makeDimensionsObject is not defined
        var dims = this.makeDimensionsObject(strArray);
        if (dims.N != 0 && dims.S != 0 && dims.E != 0 && dims.W != 0) {
            if (dims.N === dims.S && dims.E === dims.W) {
                this.B = strArray;
                retVal = true;
            }
        }
        return retVal;
    }

    //Get the Height and Width of a Box that will contain the cage
    Cage.prototype.getBoundingDimensions = function (deep) {
        var h_max = 0;
        var v_max = 0;
        //Parent operands
        for (var i = 0; i < this.o.length; i++) {
            var op = this.o[i];
            h_max = op[0] > h_max ? op[0] : h_max;
            v_max = op[1] > v_max ? op[1] : v_max;
        }
        //process Child Operands to get bounds of entire cage
        if (deep) {
            for (var j = 0; j < this.c.length; j++) {
                child = this.c[j];
                for (var i = 0; i < child.o.length; i++) {
                    var op = child.o[i];
                    h_max = op[0] > h_max ? op[0] : h_max;
                    v_max = op[1] > v_max ? op[1] : v_max;
                }
            }
        }
        return {H: v_max + 1, W: h_max + 1};
    }

    //Used for auto gen
    Cage.prototype.expand = function () {
        this.profile = [];
        if (this.o.length > 0) {
            //add first item to profile
            this.profile.push([this.o[0]]);
            for (var i = 1; i < this.o.length; i++) {
                addPointToProfile(this.profile, this.o[i]);
            }
            //Now sort the rows in ascending order
            this.profile.sort(function (a, b) {
                return a[0][1] - b[0][1]
            });
        }
    }

    Cage.prototype.translate = function (x, y) {
        var array = [];
        var dx = x - this.x;
        var dy = y - this.y;
        for (var i = 0; i < this.o.length; i++) {
            var point = this.o[i];
            this.o[i][0] = point[0] + dx;
            this.o[i][1] = point[1] + dy;
            array.push(point);
        }
        this.x = x;
        this.y = y;
        return array;
    }

    Cage.prototype.findPoint = function (x, y) {
        for (var i = 0; i < this.o.length; i++) {
            if (this.o[i][0] == x && this.o[i][1] == y) {
                return true
            }
        }
        return false;
    }

    Cage.prototype.removeOperands = function (operands_array) {
        for (var j = 0; j < operands_array.length; j++) {
            var child = operands_array[j];
            for (var i = 0; i < this.o.length; i++) {
                var parent = this.o[i];
                if (child[0] == parent[0] && child[1] == parent[1]) {
                    //Remove the parent operand
                    this.o.splice(i, 1);
                    break;
                }
            }
        }
    }

    //Update user solution value
    Cage.prototype.updateUserSolution = function (x, y, n, solution_index) {
        var index = 1;
        if(solution_index) index = solution_index;

        for (var i = 0; i < this.o.length; i++) {
            //Find the coresponding operand
            if (x == this.o[i][0] && y == this.o[i][1]) {
                //update the array
                this.rt.solutions[index][i].val = n;
                if(index == 1) {
                    //update the matrix
                    Game.solution[y][x][1] = parseInt(n);
                    //Update History
                    History_Stack.addState();
                }
                else
                {
                    //TODO update user solution symbol also
                    var symbol = Game.getNumberSetExpressionByIndex(n);
                    if(symbol)
                    {
                      this.rt.solutions[index][i].symbol = symbol;
                    }
                    else
                    {
                      console.log("Cage.prototype.updateUserSolution Error: this.o = " + JSON.stringify(this.o));
                      console.log("solution = " + JSON.stringify(Game.solution));
                    }
                }
                return;
            }
        }
        //If not in parent search children
        for (var j = 0; j < this.c.length; j++) {
            var child = this.c[j];
            for (var i = 0; i < child.o.length; i++) {
                //Find the coresponding operand
                if (x == child.o[i][0] && y == child.o[i][1]) {
                    //update the array
                    child.rt.solutions[index][i].val = n;
                    if(index == 1) {
                        //update the matrix
                        Game.solution[y][x][1] = parseInt(n);
                        //Update History
                        History_Stack.addState();
                    }
                    else
                    {
                        var symbol = Game.getNumberSetExpressionByIndex(n);
                        if(symbol)
                        {
                          child.rt.solutions[index][i].symbol = symbol;
                        }
                        else
                        {
                          console.log("Cage.prototype.updateUserSolution Error: child.o = " + JSON.stringify(child.o));
                          console.log("solution = " + JSON.stringify(Game.solution));
                        }
                    }
                    return;
                }
            }
        }
    }

    Cage.prototype.reset = function(clearNotes)
    {
        for(var i=0; i < this.rt.solutions[1].length; i++)
        {
            this.rt.solutions[1][i].val = null;
            this.ok= false;
        }
        if(clearNotes)
        {
            this.rt.solutions.splice(2, this.rt.solutions.length);
        }
        //Do the children now
        for(var i=0; i < this.c.length; i++)
        {
            var child = this.c[i];
            for(var j=0; j < child.rt.solutions[1].length; j++)
            {
                child.rt.solutions[1][j].val = null;
                child.ok= false;
            }
            if(clearNotes)
            {
                child.rt.solutions.splice(2, child.rt.solutions.length);
            }
        }
    }

    //Test solutions
    Cage.prototype.testSolutions = function () {

        //TODO use this guard code for testing only
        //Production code should never encounter empty solution values
        var simplification = CQ(this.rt.eq).simplify().toString();
        simplification = Utl.replaceAll(simplification, "**", "^");
        //console.log("Equation: " + this.rt.eq + " simplification: " + simplification);
        //TODO test count remove
        var total = 0, count =0;
        for(var i=0; i < this.rt.solutions[1].length; i++)
        {
            var item = this.rt.solutions[1][i];
            total++;
            if(item.val)count++;
        }
        for (var i = 0; i < this.c.length; i++)
        {
            var child = this.c[i];
            for(var j=0; j < child.rt.solutions[1].length; j++)
            {
                var item = child.rt.solutions[1][j];
                total++;
                if(item.val)count++;
            }
        }
        //console.log(simplification + " total: " + total +" count: " + count);
        if(total != count)return false;
        //TODO end of guard code

        //Set up the array that will hold all solution array objects
        var all_solution_array_objects = [];

        //Get the user solution array for this cage
        //array contains xy coords and index values
        var userSolutionArray = this.rt.solutions[1];
        //Add symbolic values to the array
        //TODO this step is probably redundant - test this hypothesis
        userSolutionArray = this.toSymbolic(userSolutionArray);

        var temp = [];
        for(var i=0; i < userSolutionArray.length; i++)
        {
            temp = [];
            var item = userSolutionArray[i];
            temp.push(item.symbol);
            //Note all parent operands are added as individual solutions
            //The reason for this is so that for non-commutative operations
            //the operations can be arranged in all permutations
            all_solution_array_objects.push({operation:this.op, array:temp, type:1}); //type 1 parent
        }

        //Now do children
        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            var childUserSolutionArray = child.rt.solutions[1];
            //Add symbolic values to the array
            childUserSolutionArray = this.toSymbolic(childUserSolutionArray);
            var temp = [];
            for(var j=0; j < childUserSolutionArray.length; j++)
            {
                var item = childUserSolutionArray[j];
                temp.push(item.symbol);
            }
            all_solution_array_objects.push({operation:child.op, array:temp, type:2}); //type 2 child
        }
        //console.log(simplification + " all_solution_array_objects " + JSON.stringify(all_solution_array_objects));

        var executionTable;
        //If the parent operation is commutative (order is not important)
        if(Math_ops.matrix[this.op].commutative)
        {
            executionTable = PermutationTable.getStandardArray(all_solution_array_objects.length);
        }
        else //order is important get permutations table
        {
            executionTable = PermutationTable.get(all_solution_array_objects.length);
        }

        //console.log(simplification + " executionTable " + JSON.stringify(executionTable));

        //Execute all permutations of the list of solution array objects
        for(var i=0; i < executionTable.length; i++)
        {
            var allSolutionPermutations = [];
            for(var j=0; j < all_solution_array_objects.length; j++)
            {
                //Get the index tables for each object in the solution array
                var solutionPermutations;
                var obj = all_solution_array_objects[j];
                //If the parent operation is commutative (order is not important)
                if(Math_ops.matrix[obj.operation].commutative)
                {
                    solutionPermutations = [0];
                }
                else //order is important get permutations table
                {
                    solutionPermutations = PermutationTable.getIndexTable(obj.array.length);
                }
                allSolutionPermutations.push(solutionPermutations);
            }
            //Get the table containing all combinations of all solution permutations
            var allCombinations = PermutationTable.cartesian(allSolutionPermutations);
            //console.log("all combinations:" + JSON.stringify(allCombinations));
            //For each combination of permutations execute solutions until success
            for(var k=0; k < allCombinations.length; k++)
            {
                var eqArray = [];
                //get a combination of permutation indexes
                var permutationIndexCombination = allCombinations[k];
                //For each solution apply its corresponding permutation
                for(var l=0; l < all_solution_array_objects.length; l++)
                {
                    //Get the solution
                    var solution = all_solution_array_objects[l];
                    //get the permutation table for solutions of this length
                    var permutationsTable = PermutationTable.get(solution.array.length);
                    //Arange the symbols in the solution according to the order from the permutation table
                    var array = Utl.arrangeSymbolicArray(solution.array, permutationsTable[permutationIndexCombination[l]]);
                    //Combine the symbols into an expression
                    var expr = Operations.execute(Math_ops.matrix[solution.operation].name, array);
                    //Add the expression to an array making up parts of the equation
                    eqArray.push(expr);
                }

                //Re-order the equation array according to executionTable
                //Note this is the order that the parent cage executes the operations in
                var orderedArray = Utl.arrangeSymbolicArray(eqArray, executionTable[i]);

                //console.log("Ordered Solutions:" + JSON.stringify(solutions));
                var equation = Operations.execute(Math_ops.matrix[this.op].name, orderedArray);
                //console.log("Does " + this.rt.eq + " = " + equation);

                //Test equations for equality
                var eq1 = CQ(this.rt.eq);
                var eq2 = CQ(equation);
                if(eq1.equals(eq2))
                {
                    //console.log("YES " + this.rt.eq + " = " + equation);
                    return true;
                }
            }
        }

        //TODO determine success above - return true on success
        return false;
    }

    //Get Equation
    Cage.prototype.successCount = function () {
        this.ok = false;
        var count = 0;
        var total = 0;
        var set_count = 0;
        //Get the user solutions array for this cage
        var solutionArray = this.rt.solutions[0];
        var userSolutionArray = this.rt.solutions[1];

        //Count parent first
        for (var i = 0; i < solutionArray.length; i++) {
            total++;
            if (solutionArray[i].val == userSolutionArray[i].val) {
                count++;
            }
            //Count the number values that are set
            if(userSolutionArray[i].val)
            {
                set_count++;
            }
        }
        //Now do children
        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            solutionArray = child.rt.solutions[0];
            userSolutionArray = child.rt.solutions[1];
            for (var j = 0; j < solutionArray.length; j++) {
                total++;
                if (solutionArray[j].val == userSolutionArray[j].val) {
                    count++;
                }
                //Count the number values that are set
                if(userSolutionArray[j].val)
                {
                    set_count++;
                }
            }
        }
        if(count == total){
            //Set to true so that extra checking does not have to be performed
            this.ok = true;
        }
        return {count:count, total:total, set_count:set_count};
    }

    Cage.prototype.getPermutations = function (size) {


    }

    Cage.prototype.checkAllSolutions = function () {
        //Make permutaions array of all expression items if non commutative

    }

    Cage.prototype.toSymbolic = function (array) {
        for (var i = 0; i < array.length; i++) {
            var symbol = Game.getNumberSetExpressionByIndex(array[i].val); // || "";
            if(symbol)
            {
              array[i].symbol = symbol;
            }
            else
            {
              array[i].symbol = "";
              console.log("Cage.prototype.toSymbolic Error: from array " + JSON.stringify(array));
            }
        }
        return array;
    }

    //Get Equation
    Cage.prototype.getEquation = function (index) {
        var eqArray = [];
        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            //eqArray.push({op:child.op, solutions:this.toSymbolic(child.rt.solutions[index])});
            eqArray.unshift({op: child.op, terms: this.toSymbolic(child.rt.solutions[index])});
        }
        //eqArray.push({op:this.op, solutions:this.toSymbolic(this.rt.solutions[index])});
        eqArray.unshift({op: this.op, terms: this.toSymbolic(this.rt.solutions[index])});
        return {equation: this.rt.eq, components: eqArray};
    }

    Cage.prototype.getState = function () {
        var state = {c: [], x: this.x, y: this.y, solutions: this.rt.solutions};
        //Now do children
        for (var i = 0; i < this.c.length; i++) {
            state.c.push({solutions: this.c[i].rt.solutions});
        }
        return state;
    }

    Cage.prototype.cloneSolution = function (index) {

        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            //Do a deep copy of the solutions array
            var copy = $.extend(true, [], child.rt.solutions[index]);
            child.rt.solutions.push(copy);
        }
        //Do a deep copy of the solutions array
        var copy = $.extend(true, [], this.rt.solutions[index]);
        this.rt.solutions.push(copy);
        return this.rt.solutions.length - 1;
    }

    Cage.prototype.randomizeSolution = function (index) {

        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            //Do a deep copy of the solutions array
            var copy = $.extend(true, [],child.rt.solutions[index]);
            var obj = Utl.solution_shuffle(copy);
            //Reset the xy values for the solution
            for(var i=0; i < child.rt.solutions[0].length; i++)
            {
                var term = child.rt.solutions[0][i];
                obj.array[i].x = term.x;
                obj.array[i].y = term.y;
            }
            child.rt.solutions.push(obj.array);
        }
        //Do a deep copy of the solutions array
        var copy = $.extend(true, [],this.rt.solutions[index]);
        var obj = Utl.solution_shuffle(copy);
        //Reset the xy values for the solution
        for(var i=0; i < this.rt.solutions[0].length; i++)
        {
            var term = this.rt.solutions[0][i];
            obj.array[i].x = term.x;
            obj.array[i].y = term.y;
        }
        this.rt.solutions.push(obj.array);
        return this.rt.solutions.length - 1;
    }

    Cage.prototype.removeSolution = function (index) {

        var obj = {childsolutions:[], solution:null};
        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            //Do a deep copy of the solutions array
            var copy = $.extend(true, [], child.rt.solutions[index]);
            obj.childsolutions.push(copy);
            child.rt.solutions.splice(index, 1);
        }
        //Do a deep copy of the solutions array
        var copy2 = $.extend(true, [], this.rt.solutions[index]);
        obj.solution = copy2;
        this.rt.solutions.splice(index, 1);
        return obj;
    }

    Cage.prototype.insertCurrent = function (solutions_obj) {

        for (var i = 0; i < this.c.length; i++) {
            var child = this.c[i];
            child.rt.solutions.splice(1, 0, solutions_obj.childsolutions[i]);
        }
        this.rt.solutions.splice(1, 0, solutions_obj.solution);
    }

    Cage.prototype.compress = function(){

        var obj = {};

        obj.i = this.i; //Index to Pallete Cage template for this cage
        obj.t = this.t; //Type of cage
        obj.x = this.x;;
        obj.y = this.y;;
        obj.op = this.op; //Math operation for cage
        obj.o = $.extend(true, [], this.o);

        //this.rt; //Return Value
        // Deep copy
        obj.rt = $.extend(true, {}, this.rt);

        if(obj.t === CONST.G_PARENT)
        {
            obj.c = []; //Array of inner cages
        }

        //obj.o = $.extend(true, [], this.o); //Array of operands
        //obj.B = $.extend(true, [], this.B); // array default 2 box horizontal rectangle

        return obj;

    }

    return {Cage: Cage};
})();

//Closure
function DrawCage(cage, container_id, i) {
    var boundingDimensions = cage.getBoundingDimensions();
    var height = CONST.G_SCALE * boundingDimensions.H + CONST.G_DEFAULT_MARGIN * 2;
    var width = CONST.G_SCALE * boundingDimensions.W + CONST.G_DEFAULT_MARGIN * 2;

    var $canvas = $('<canvas draggable="true" class="cage_container" data-cageIndex="' + i + '" width="' + width + '" height="' + height + '">');
    $($canvas).appendTo(container_id);
    var canvas = $canvas[0];
    var my_ctx = canvas.getContext('2d');
    //my_ctx.lineWidth=1;
    my_ctx.scale(CONST.G_SCALE, CONST.G_SCALE);
    //Note must set lineWidth since supplied cage had no ctx
    my_ctx.lineWidth = CONST.G_DEFAULT_LINE_WIDTH;
    cage.ctx = my_ctx;
    var x = cage.o[0][0];
    var y = cage.o[0][1];
    cage.drawCage(x, y);

    var n = CONST.G_DEFAULT_MARGIN * 4;
    Utl.drawStar(my_ctx, x + n * 2, y + n * 1.7, 5, n, n / 2);
}

//////////////////////////////////////  Pallete  /////////////////////////////////////////////
//
//	The CagePallete is the array of cage objects used to construct
//	a game page. Used in CageMaker and PageMaker Apps.
//
//////////////////////////////////////////////////////////////////////////////////////////////
var CagePallete = {
    scale: CONST.G_SCALE,
    ctx: null,
    c: [], //cages
    size: 0,
    init: function (saved_cages) {
        if(this.c.length == saved_cages.length) return;
        for (var j = 0; j < saved_cages.length; j++) {
            //uncomment to Add index
            //saved_cages[j].i = j;

            var cage = this.restoreCage(saved_cages[j]);
            this.c.push(cage);
        }
        //console.log(JSON.stringify(saved_cages));
    },
    addCage: function (cage) {
        this.c.push(cage);
    },
    restoreCage: function (cage_data) {
        var props = {iT: CONST.G_NO};
        //saved cages have no context
        var cage = new Cartouche_Objects.Cage(null);
        cage.setBorderArray(cage_data.B);
        cage.setOperation(cage_data.op);
        cage.setOperandsArray(cage_data.o);
        cage.setResult(cage_data.rt);
        cage.setIndex(cage_data.i);
        return cage;
    },
    drawPallete: function (container_id) {
        $(container_id).html("");
        for (var i = 0; i < this.c.length; i++) {
            var cage = this.c[i];
            DrawCage(cage, container_id, i);
        }
    },
    getCageByIndex: function (index) {
        for (var i = 0; i < this.c.length; i++) {
            var cage = this.c[i];
            if (cage.i == index) {
                return cage;
            }
        }
    }

}

function compressCoordinateArray(array) {
    var str = "1"; //Must prepend 1 so resulting number does not have a leading 0 - remove in expandCoordinates function
    //Walk the array turning coordinates into 2 digit numbers
    //NOTE only works if ordinals are less than 10
    for (var i = 0; i < array.length; i++) {
        var coord = array[i];
        str += String(coord[0]) + String(coord[1]);
    }
    return MeZip.encode(str);
}

function expandCoordinatesString(strEncoded) {
    var operaterArray = [];
    var str = String(MeZip.decode(strEncoded));
    //Remove leading 1
    str = str.substring(1);
    for (var i = 0; i < str.length; i += 2) {
        var x = parseInt(str.charAt(i));
        var y = parseInt(str.charAt(i + 1));
        operaterArray.push([x, y]);
    }
    return operaterArray;
}

//Closure
function cloneCage(ctx, cage_data) {
    var cage = new Cartouche_Objects.Cage(ctx);
    cage.setType(cage_data.t);
    cage.setBorderArray(cage_data.B);
    cage.setOperation(cage_data.op);
    cage.setOperandsArray(cage_data.o);
    cage.setResult(cage_data.rt);
    cage.setIndex(cage_data.i);
    cage.x = cage_data.x;
    cage.y = cage_data.y;

    if (cage_data.rt) {
        cage.rt = cage_data.rt;
    }

    //Expand the drawing data using cage_data.i
    var template = CagePallete.getCageByIndex(cage_data.i);

    cage.setDrawingData(template);

    return cage;
}

function isInParent(parentArray, childArray) {
    var count = 0;
    //search through all of parent coordinates make shure child is contained within
    for (var i = 0; i < parentArray.length; i++) {
        var parent = parentArray[i];
        for (var j = 0; j < childArray.length; j++) {
            var child = childArray[j];
            if (child[0] == parent[0] && child[1] == parent[1]) {
                count++;
            }
        }
    }
    return childArray.length == count;
}

function isInBounds(size, cageOpsArray) {
    var count = 0;
    //search through all of parent coordinates make shure child is contained within
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var i = 0; i < cageOpsArray.length; i++) {
                var cageOp = cageOpsArray[i];
                if (cageOp[0] == x && cageOp[1] == y) {
                    count++;
                }
            }
        }
    }
    return cageOpsArray.length == count;
}

function overlapsExistingCage(obj, cageOpsArray) {
    var count = 0;
    //search through all existing cages make shure child is no within
    for (var i = 0; i < obj.c.length; i++) {
        var parent = obj.c[i];
        for (var k = 0; k < parent.o.length; k++) {
            var op = parent.o[k];
            for (var l = 0; l < cageOpsArray.length; l++) {
                var cop = cageOpsArray[l];
                if (op[0] == cop[0] && op[1] == cop[1]) {
                    return true;
                }
            }
        }
        for (var j = 0; j < parent.c.length; j++) {
            var child = parent.c[j];
            for (var k = 0; k < child.o.length; k++) {
                var op = child.o[k];
                for (var l = 0; l < cageOpsArray.length; l++) {
                    var cop = cageOpsArray[l];
                    if (op[0] == cop[0] && op[1] == cop[1]) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

///////////////////////////////////////////  Game  ///////////////////////////////////////////

var Game = {

    //Extra information Added Jan 17 2016
    name:null,
    id:null,

    //New math operation and solution flags bitmap
    operation_flags:CONST.OP_STATIC,       //Uses the supplied operator (Cage.op) values
    solution_flags:CONST.SOL_STATIC,     //Uses the supplied solution

    //any variables removed here on compress must be reinstated on expand
    number_set: null,               //The selected number set
    size: 0,
    key: null,
    current_selection: null, //current selection
    scale: CONST.G_SCALE,
    ctx: null,
    solution: null,
    operation_set: null, //[], //alowed operations for this game choose from add, subtract, divide ....
    weighted_operation_set: [], //Operations that have been randomly selected = used to help weight the choice of
    //random solutions so that there is an even distribution of operations

    //The array of cages contained in the puzzle
    c: [], //cages

    current_notes: null, //Object containing Current Notes page elements and data

    init: function (ctx, size, obj)//, isTemplate)
    {
        this.current_notes = null;
        this.operation_set = null;
        this.current_selection = null;
        this.ctx = ctx;
        if(obj) {

            //Extra information Added Jan 17 2016
            if(obj.name){this.name = obj.name};
            if(obj.id){this.id = obj.id}

            //Get operation flags from supplied json - NOTE allow case where flag is zero
            if(obj.operation_flags || obj.operation_flags == CONST.OP_STATIC)
            {
              this.operation_flags = obj.operation_flags;
            }
            //Get solution flags from supplied json
            if(obj.solution_flags) {
                this.solution_flags = obj.solution_flags;
            }
            //Get the operation set from supplied json
            if (obj.operation_set) {
                this.operation_set = obj.operation_set; //operation_set;
            }
            else {
                if (obj.bitMask) {
                    this.operation_set = Math_ops.toOperationSet(obj.bitMask);
                }
                else { //Default
                    this.operation_set = [Math_ops.getIndexForName("add"), Math_ops.getIndexForName("multiply")];
                }
            }
            this.initWeigtedSet();
        }
        else { //Using CageMaker set up empty array
          this.operation_set = [];
        }
        this.c = [];
        this.size = size;
    },
    //Weighted operation choices
    initWeigtedSet: function()
    {
      this.weighted_operation_set = [];
      //operation_set
      for(var i=0; i < this.operation_set.length; i++)
      {
        this.weighted_operation_set.push(0);
      }
    },
    addToWeightedSet: function(operation)
    {
      //Get the index of the operation in the set
      for(var i=0; i < this.operation_set.length; i++)
      {
        if(this.operation_set[i] == operation)
        {
          this.weighted_operation_set[i]++;
          return;
        }
      }
    },
    getBestWeightedOperation: function()
    {
      var result = [];
      for(var i=0; i < this.weighted_operation_set.length; i++)
      {
        if(i == 0)
        {
          result.push(i);
        }else
        {
          //Compare with the first value in the lowest numbers array
          if(this.weighted_operation_set[i] < this.weighted_operation_set[result[0]])
          {
            result = [];
            result.push(i);
          }
          else if(this.weighted_operation_set[i] == this.weighted_operation_set[result[0]])
          {
            result.push(i);
          }
        }
      }
      //result will now contain the array of indexes of lowest values
      if(result.length > 1)
      {
        //get random result
        var n = Utl.getRandomInt(0,result.length);
        return this.operation_set[result[n]];
      }
      return this.operation_set[result[0]];
    },
    getSize: function () {
        return this.size;
    },
    getKey: function () {
        return this.key;
    },
    //Generate the solution and return the key
    //If no solution is supplied a new solution and key will be generated
    //If a key is provided then the solution will be generated using that key
    shuffle: function (key, solution) {
        Solution.init();
        if (!solution) {
            this.solution = Solution.generate(this.size, key);
            this.key = Solution.getKey();
            return Solution.getKey();
        }
        else {
            this.solution = solution;
            this.key = key;
        }
        return key;
    },
    //Generate a compressed key using a size
    generateKey: function(size)
    {
      Solution.init();
      Solution.generate(size, null);
      var key = "" + size + Solution.getKey();
      return MeZip.encode(key);
    },
    //Set the bit or bits for positions in operation_flag specified by flag
    updateOperationFlags: function (flag){
        this.operation_flags = Utl.addFlag(this.operation_flags, flag);
    },
    //UnSet the bit or bits for positions in operation_flag specified by flag
    removeOperationFlags: function (flag){
        this.operation_flags = Utl.removeFlag(this.operation_flags, flag);
    },
    //Iterate through Cages setting appropriate operation values
    //Call this after new solution has been added.
    setOperationValues: function () {

        var reCalc = Utl.checkFlag(this.operation_flags, CONST.OP_RANDOM);
        //outer cages
        for (var i = 0; i < this.c.length; i++) {
            var recommended_operation;
            var excludeArray = [];
            var parent = this.c[i];
            //var selected_operation = parent.
            //Do the Child values first so results can be used by parent
            for (var j = 0; j < parent.c.length; j++) {
                var child = parent.c[j];
                if (reCalc) {
                    if(j == 0)
                    {
                      //Get the best weighted value to start off with
                      recommended_operation = this.getBestWeightedOperation();
                    }
                    else {
                      //Get a random operation from the set
                      recommended_operation = Math_ops.getRecommendedOp(excludeArray, this.operation_set)
                    }
                    this.addToWeightedSet(recommended_operation)
                }
                else {
                    recommended_operation = child.op;
                }
                var used_op = child.setOperationValues(this.operation_set, recommended_operation, this.solution, reCalc);
                if (reCalc) {
                  //Keep track of used operations to avoid using again
                  excludeArray.push(used_op);
                }
            }
            if (reCalc) {
                if(this.c.length == 0) //If there are no children use weighted value
                {
                  //Get the best weighted value
                  recommended_operation = this.getBestWeightedOperation();
                }
                else
                {
                  recommended_operation = Math_ops.getRecommendedOp(excludeArray, this.operation_set);
                }
            }
            else {
                recommended_operation = parent.op;
            }
            this.addToWeightedSet(recommended_operation);
            parent.setOperationValues(this.operation_set, recommended_operation, this.solution, reCalc);
        }
    },
    //Clear all user values
    resetGame: function(clearNotes)
    {
        //Clear cage values
        for(var i=0; i < this.c.length; i++)
        {
            this.c[i].reset(clearNotes);
        }
        //clear solution values
        for (var y = 0; y < this.size; y++)
        {
            for (var x = 0; x < this.size; x++)
            {
                this.solution[y][x][1] = null;
            }
        }
        //clear History
        History_Stack.clear();
        this.current_selection = null;
    },
    clearCanvas: function (canvas) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    reDraw: function (canvas) {
        //Clear any old drawings
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Draw the cages
        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            parent.drawCage(parent.x, parent.y);
            for (var j = 0; j < parent.c.length; j++) {
                var child = parent.c[j];
                child.drawCage(child.x, child.y);
            }
            parent.drawResultTag(parent.x, parent.y);
        }
    },
    //Restore a game using data from json(obj)
    //copies all properties from obj to this
    restore: function (obj) {
        //this.ctx = ctx; //redundant
        //this.solution = obj.solution; //solution is regenerated usin key see shuffle function
        //this.size = obj.size; //redundant
        //Restore the outer cages
        for (var i = 0; i < obj.c.length; i++) {
            var cage = this.restoreCage(obj.c[i]);
            this.addCage(cage);
            //restore the inner cages
            var cages = obj.c[i].c;
            for (var j = 0; j < cages.length; j++) {
                var child = this.restoreCage(cages[j]);
                cage.addChild(child);
            }
        }
    },
    restoreCage: function (cage_data) {
        var cage = cloneCage(this.ctx, cage_data);
        //cage.drawCage(cage_data.x, cage_data.y); //TODO remove me
        return cage;
    },
    addCage: function (cage) {
        this.c.push(cage);
    },
    getCage: function (x, y) {
        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            if (parent.x == x && parent.y == y) {
                return parent;
            }
            else {
                //Search through the o (operands array for a match)
                for (var j = 0; j < parent.o.length; j++) {
                    var o = parent.o[j];
                    if (o[0] == x && o[1] == y) {
                        return parent;
                    }
                }
                //Search through each child for a match
                for (var k = 0; k < parent.c.length; k++) {
                    var child = parent.c[k];
                    for (var l = 0; l < child.o.length; l++) {
                        var o = child.o[l];
                        if (o[0] == x && o[1] == y) {
                            return parent;
                        }
                    }
                }
            }
        }
        return null;
    },
    //////////////////////////////////////////  Game Play  //////////////////////////////////
    //Scan the solution to see if all cells have been completed correctly
    scanSuccess: function () {
        var count = 0;
        var total = 0;
        var set_count = 0;
        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            var obj = parent.successCount();
            count += obj.count;
            total += obj.total;
            set_count += obj.set_count;
        }
        return {count:count, total:total, set_count:set_count};
    },
    //Scan the solution to see if all cells have been completed correctly
    scanEccentrics: function () {
        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            //if(!parent.ok)
            //{
                if(!parent.testSolutions())
                {
                    //TODO if any solution fails return false
                    return false;
                }
            //}
        }
        //TODO return true here all tests passed
        return true;
    },
    //Scan the solution to see if there are duplicate values in any row
    scanDuplicates: function (solution, isTrans) {
        var correct = 0;
        var res = [];
        //Scan Rows for duplicates
        for (var y = 0; y < this.size; y++) {
            for (var n = 1; n <= this.size; n++) {
                var temp = [];
                var count = 0;
                for (var x = 0; x < this.size; x++) {
                    var g = solution[y][x][1];
                    if (g == n) {
                        temp.push(true);
                        count++;
                    }
                    else {
                        temp.push(false);
                    }
                }
                if (count > 1) {
                    for (var i = 0; i < temp.length; i++) {
                        if (temp[i] === true) {
                            if (isTrans) {
                                res.push([i, y]);
                            }
                            else {
                                res.push([y, i]);
                            }
                        }
                    }
                }
            }
        }
        return res;
    },
    ////////////////////////////////////  page construction  /////////////////////////////
    //Validate and place cage
    placeCage: function (cage_data, x, y, current_op) {
        var self = this;
        //Find underlying cage
        var parent;
        var inParent = false;
        for (var i = 0; i < self.c.length; i++) {
            parent = self.c[i];
            if (parent.findPoint(x, y)) {
                inParent = true;
                break;
            }
        }
        if (inParent) {
            var cage = cloneCage(self.ctx, cage_data);
            cage.setOperation(current_op);
            cage.setType(CONST.G_CHILD);
            var temp = Utl.translateOperands([cage.x, cage.y], [x, y], cage.o);
            cage.o = temp;
            //If number of operaters are equal this is not valid
            //Check if the child will fit in the parent
            if (isInParent(parent.o, cage.o)) {
                //alert("parent: " + parent.i + " and child: " + cage.i);
                if (parent.i == cage.i) {
                    alert("This cage is the same shape as its parent!");
                    return;
                }
                cage.drawCage(x, y);
                parent.addChild(cage);
                //remove underlying operands from parent
                parent.removeOperands(cage.o);
                //RESET - TODO improve this
                cage_data.setType(CONST.G_PARENT);
            }
            else {
                alert("This cage does not fit!");
            }
        }
        else {
            var cage = cloneCage(this.ctx, cage_data);
            cage.setOperation(current_op);
            var temp = Utl.translateOperands([cage.x, cage.y], [x, y], cage.o);
            cage.o = temp;
            if (isInBounds(this.size, cage.o)) {
                if (overlapsExistingCage(this, cage.o)) {
                    alert("This cage overlaps an existing cage!");
                    return;
                }
                cage.drawCage(x, y);
                self.addCage(cage);
            }
            else {
                alert("Cage is out of bounds!");
            }
        }
    },
    //Remove un-needed properties
    compress: function (scope) {

        var obj = {};

        obj.bitMask = Math_ops.toBitmask(this.operation_set);
        //Append size to start of key then compress
        obj.key = "" + this.size + this.key;
        obj.key = MeZip.encode(obj.key);
        obj.operation_set = $.extend(true, [],this.operation_set);
        obj.number_set = this.number_set.id;

        //Extra information Added Jan 17 2016
        if(this.name){obj.name = this.name};
        if(this.id){obj.id = this.id}

        if (CONST.G_SAVE_TEMPLATE != scope) {
            obj.solution = $.extend(true, [], this.solution);
            //TODO save Notes
            //obj.notes = Notes.compress();
        }

        obj.c = [];//this.c; //Cage.compress()

        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            var parent_clone = parent.compress();


            //Compress operands array
            parent_clone.o = compressCoordinateArray(parent.o);

            if (CONST.G_SAVE_TEMPLATE === scope) {
                delete parent_clone.rt //Remove return value
            }
            //Encode then remove properties
            //this.encodeProperties(parent);
            for (var j = 0; j < parent.c.length; j++) {
                var child = parent.c[j];
                var child_clone = child.compress();

                //Compress operands array
                child_clone.o = compressCoordinateArray(child.o);

                if (CONST.G_SAVE_TEMPLATE == scope) {
                    delete child_clone.rt //Remove return value
                }
                parent_clone.c.push(child_clone);
            }
            obj.c.push(parent_clone);
        }
        return obj;
    },
    encodeProperties: function (cage) {
        var str = "";
        //encode properties
        //NOTE add 1 to first property to avoid leading 0
        str += (cage.i + 1); //Cage template index - used to restore drawing data
        str += cage.t; //Type of cage - parent or child
        str += cage.x; //horizontal val
        str += cage.y; //vertical value
        str += cage.op; //Type of math operation
        var enc = MeZip.encode(str);
        //Now remove properties
        delete cage.i;
        delete cage.t;
        delete cage.x;
        delete cage.y;
        delete cage.op;
        //Add encoded props
        cage.e = enc;
    },
    decodeProperties: function (cage) {
        var str = String(MeZip.decode(cage.e));
        for (var i = 0; i < str.length; i++) {
            var digit = parseInt(str.charAt(i));
            switch (i) {
                case 0:
                    cage.i = digit - 1; //Reduce by one: see encodeProperties above
                    break;
                case 1:
                    cage.t = digit;
                    break;
                case 2:
                    cage.x = digit;
                    break;
                case 3:
                    cage.y = digit;
                    break;
                case 4:
                    cage.op = digit;
                    break;
            }
        }
        delete cage.e;
    },
    //Expand properties of the compressed object
    expand: function (obj) {

        if (obj.key && !obj.size) //If we have a size property then the key has already been expanded
        {
          //Restore the size and key
          var str = String(MeZip.decode(obj.key));
          obj.size = parseInt(str.charAt(0));
          obj.key = str.substring(1);

          //Note at this time obj.number_set is simply a numeric id
          obj.number_set = Game.numberSetById(obj.number_set);
          //TODO rationalize initialization process
          this.number_set = obj.number_set;

          for (var i = 0; i < obj.c.length; i++) {
            var parent = obj.c[i];
            //this.decodeProperties(parent); //TODO use a closure here
            parent.o = expandCoordinatesString(parent.o);
            //for(var j=0; j < obj.c[i].c.length; j++)
            for (var j = 0; j < parent.c.length; j++) {
              var child = parent.c[j];
              //this.decodeProperties(child); //TODO use a closure here
              child.o = expandCoordinatesString(child.o);
            }
          }
        }
        return obj;
    },
    //scan the game, make and return operation set
    //get the total count of operators (should be size*size for completed game setup)
    updateOpSet: function () {
        this.o_count = 0;
        for (var i = 0; i < this.c.length; i++) {
            var parent = this.c[i];
            //start adding up the number of operator cells
            this.o_count += parent.o.length;
            this._update_operation_set(parent.op);
            for (var j = 0; j < parent.c.length; j++) {
                var child = parent.c[j];
                //continue adding up the number of operator cells
                this.o_count += child.o.length;
                this._update_operation_set(child.op);
            }
        }
        return this.operation_set;
    },
    _update_operation_set: function (op) {
        for (var i = 0; i < this.operation_set.length; i++) {
            if (this.operation_set[i] == op) {
                return;
            }
        }
        this.operation_set.push(op);
    },
    ///////////////////////////////////////  Number Set Operations  /////////////////////////////
    //if found sets this.number_set and returns it
    //returns null on failure
    numberSetById: function (id) {
        var len = g_number_sets.groups.length;
        for (var i = 0; i < len; i++) {
            var group = g_number_sets.groups[i];
            for (var j = 0; j < group.sets.length; j++) {
                var set = group.sets[j];
                if (set.id == id) {
                    //clone this to avoid inadvertant pointer manipulations of source
                    return $.extend(true, {}, set);
                }
            }
        }
        return null;
    },
    getNumberSetExpressionByIndex: function (index) {
        var nSet = null;
        //solution sets start at 1
        //number_set set array starts at 0
        my_index = index - 1;
        if(my_index >= 0)
        {
          nSet = this.number_set.set[my_index];
          var pattern = /[*]/;
          if(nSet.match(pattern))
          {
            //Surround with parenthesis for complex operands
            nSet = "(" + nSet + ")";
          }
        }
        else
        {
          console.log("function getNumberSetExpressionByIndex Error: index value " + index + " is less than 1");
        }
        return  nSet;
    },
    ////////////////////////////////  State Management  ////////////////////////
    //Remove un-needed properties
    getState: function () {
        var state = {solution: this.solution, c: []};
        //Remove data from the cages
        for (var i = 0; i < this.c.length; i++) {
            state.c.push(this.c[i].getState());
        }
        return JSON.stringify(state);
    },
    updateSolutions: function (state) {
        this.solution = state.solution;
        for (var i = 0; i < state.c.length; i++) {
            var saved_cage = state.c[i];
            var cage = this.getCage(saved_cage.x, saved_cage.y);
            cage.rt.solutions = cloneSolutions(saved_cage.solutions);
            for (var j = 0; j < saved_cage.c.length; j++) {
                cage.c[j].rt.solutions = cloneSolutions(saved_cage.c[j].solutions);
            }
        }
    },
    setPromotedValues: function (solutions_obj, cage)
    {
        for(var i=0; i < solutions_obj.childsolutions.length; i++)
        {
            for(var j=0; j < solutions_obj.childsolutions[i].length; j++)
            {
                var term = solutions_obj.childsolutions[i][j];
                //this.solution[term.y][term.x][1] = term.val;
                //Update the user solution array and the global solution
                //and Update the History stack
                cage.updateUserSolution(term.x, term.y, parseInt(term.val));

            }
        }
        for(var j=0; j < solutions_obj.solution.length; j++)
        {
            var term = solutions_obj.solution[j];
            //this.solution[term.y][term.x][1] = term.val;
            //Update the user solution array and the global solution
            //and Update the History stack
            cage.updateUserSolution(term.x, term.y, parseInt(term.val));
        }
    }

}

function cloneSolutions(saved_solutions) {
    //Cheap trick deep copy
    var str = JSON.stringify(saved_solutions);
    return JSON.parse(str);
}

var Solution = {
    key: "",
    savedKey: null,
    solution: [],
    counter: 0,
    iterator: 1,
    init: function () {
        this.solution = [];
        counter = 0;
        iterator = 1;
    },
    //Takes all rows of array and switches it with column (row 1 will equal all column 1 etc)
    transpose: function (array) {
        // Calculate the width and height of the Array
        var w = array.length ? array.length : 0,
            h = array[0] instanceof Array ? array[0].length : 0;
        // In case it is a zero matrix, no transpose routine needed.
        if (h === 0 || w === 0) {
            return [];
        }
        /**
         * @var {Number} i Counter
         * @var {Number} j Counter
         * @var {Array} t Transposed data is stored in this array.
         */
        var i, j, t = [];
        // Loop through every item in the outer array (height)
        for (i = 0; i < h; i++) {
            // Insert a new row (array)
            t[i] = [];
            // Loop through every item per item in outer array (width)
            for (j = 0; j < w; j++) {
                // Save transposed data.
                t[i][j] = array[j][i];
            }
        }
        return t;
    },
    //Takes the rows of array and randomly shuffles them
    shuffle: function (array) {
        var counter = array.length, temp = null, index = 0;
        // While there are elements in the array
        while (counter > 0) {

            if (this.savedKey) {
                index = parseInt(this.savedKey.shift());
            }
            else {
                // Pick a random index
                index = Math.floor(Math.random() * counter);
            }
            //concatinate onto key value
            this.key += index;

            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    },
    //Generates a solution per how many rows and columns required
    //If no key is supplied a new solution and key will be generated
    //If a key is provided then the solution will be generated using that key
    //saves and returns key for generated solution
    generate: function (rows, key) {
        if (key) //When a key string is passed in solution will not be generated randomly
        {
            //Use this key to create solution
            this.savedKey = key.split("");
        }
        else {
            this.savedKey = null; //Reset to null for random shuffles
        }
        //Clear the key
        this.key = "";
        //Create 2D array for how many rows needed
        for (var i = 0; i < rows; i++) {
            this.solution.push([]);
        }
        //Loop for how many rows there are
        for (var j = 0; j < rows; j++) {
            //Only loop for how many colums required (same as amount of rows)
            while (this.counter < rows) {
                this.solution[j].push([this.iterator, null]); //J is the row and iterator is the value of the column, null will contain the guess entered by the user for this cell
                this.counter++;  //Increase the column counter
                //If the column counter is less then the amount of rows
                if (this.counter < rows) {
                    //If iterator is greater then the amount of rows then reset iterator to 1 else increment it
                    if (this.iterator == rows) {
                        this.iterator = 1;
                    } else {
                        this.iterator++;
                    }
                }
            }
            this.counter = 0; //Reset the column counter for the next row
        }
        this.solution = this.shuffle(this.solution);  //Shuffle the rows of the array
        this.solution = this.transpose(this.solution);  //Swap rows with columns
        this.solution = this.shuffle(this.solution);  //Shuffle the rows of the array
        return this.solution;  //return the solution
    },
    //Return the randomly generated key
    getKey: function () {
        return this.key;
    },
    get: function (y, x) {
        return this.solution[y][x][0];
    },
    clone: function(solution)
    {
        var rows = [];
        for(var y=0; y < solution.length; y++)
        {
            rows[y] = [];
            var row = solution[y];
            for(x=0; x < row.length; x++)
            {
                rows[y][x] = [solution[y][x][0], solution[y][x][1]];
            }
        }
        return rows;
    }
};

var History_Stack = {
    stack: [],
    index: 0,
    clear: function() {
        this.stack = [];
    },
    addState: function () {
        if (this.index !== 0) {
            this.stack.splice(0, this.index);
            this.index = 0;
        }
        this.stack.unshift(Game.getState());
    },
    getNext: function () {
        this.index++;
        if (this.index < this.stack.length) {
            return this.stack[this.index];
        }
        else {
            this.index = this.stack.length;
        }
        return null;
    },
    getPrevious: function () {
        this.index--;
        if (this.index >= 0) {
            return this.stack[this.index];
        }
        else {
            this.index = 0;
        }
        return null;
    },
    logState: function () {
        //console.log(JSON.stringify(this.stack));
        for (var i = 0; i < this.stack.length; i++) {
            console.log(this.stack[i]);
        }
    }
}

var PermutationTable = {
    table:[],
    count:6,
    init:function(count)
    {
        this.count = count || this.count;
        function makePermsArray(input) {
            var permArr = [],
                usedChars = [];
            function permute(input) {
                var i, ch;
                for (i = 0; i < input.length; i++) {
                    ch = input.splice(i, 1)[0];
                    usedChars.push(ch);
                    if (input.length == 0) {
                        permArr.push(usedChars.slice());
                    }
                    permute(input);
                    input.splice(i, 0, ch);
                    usedChars.pop();
                }
                return permArr
            };
            return permute(input);
        }
        this.table = [];
        for(var i=1; i <= this.count; i++)
        {
            var row = [];
            for(var j=0; j < i; j++)
            {
                row.push(j);
            }
            this.table.push(makePermsArray(row));
        }
        //console.log(JSON.stringify(this.table));
    },
    get:function(size)
    {
        if(size > 0 && size <= this.count) {
            return this.table[size - 1];
        }
        else{
            console.log("INVALID size for PermutationTable.get(size)");
            return [];
        };
    },
    //Create an array with the indexes to all permutations by size
    getIndexTable:function(size)
    {
        if(size < 1)return [];
        var indexes = [];
        for(var i=0; i < this.table[size - 1].length; i++)
        {
            indexes.push(i);
        }
        return 	indexes;
    },
    //Helper function to get the standard array containing (size) indexes. ie [[0,1,2]] for size 3
    getStandardArray:function(size)
    {
        var arr = [];
        for(var i=0; i < size; i++)
        {
            arr.push(i);
        }
        return [arr];
    },
    cartesian:function(arg)
    {
        //var r = [], arg = arguments, max = arg.length-1;
        var r = [], max = arg.length-1;
        function helper(arr, i) {
            for (var j=0, l=arg[i].length; j<l; j++) {
                var a = arr.slice(0); // clone arr
                a.push(arg[i][j])
                if (i==max) {
                    r.push(a);
                } else
                    helper(a, i+1);
            }
        }
        helper([], 0);
        return r;
    }
}

var Display_Objects = (function () {

    //Private functions

    function scanTempForDuplicates(array) {
        //Scan for duplicates
        var res1 = Game.scanDuplicates(array, false);
        var tranny = Solution.transpose(array);
        var res2 = Game.scanDuplicates(tranny, true);
        return res1.concat(res2);
    }

    function isSet(res, x, y)
    {
        for(var i=0; i < res.length; i++)
        {
            if(res[i][0] == y && res[i][1] == x)
            {
                return true;
            }
        }
        return false;
    }

    function getCanvasBox(strTerm) {
        var root = cvm.parse.parser.parse(strTerm);
        var box = cvm.layout.ofExpr(root).box();
        root.box = box;
        return box;
    }

    function drawExpressionTerm(ctx, box, h, scale_factor) {
        var type = Game.number_set.type;

        //Scale using box.height and h
        var scale = h / scale_factor / box.height;
        var bw = box.width * scale;
        var bh = box.height * scale;
        var margin_factor = bh / bw; //The wider the expression the smaller the margin

        //Make adjustemts using height h
        var left = 0;//.1*h/scale*margin_factor;

        var DROP_CONST = .75;
        var bottom = DROP_CONST * h / scale;

        ctx.scale(scale, scale);
        box.drawOnCanvas(ctx, left, bottom);
    }

    function drawSolutionExpression(h, $eq, str)
    {
        var str = CQ(str).simplify().toString();
        str = Utl.replaceAll(str, "**", "^");

        //TODO investigate -(0) bug
        str = str == "-(0)" ? "0" : str;

        var SCALE_FACTOR = 1.5; //The larger this factor the smaller the letter
        var box = getCanvasBox(str);
        var scale = h / SCALE_FACTOR / box.height;
        var bw = box.width * scale;
        var bh = box.height * scale;

        var $canvas = $('<canvas width="' + bw + 'px" height="' + h + 'px"></canvas>').appendTo($eq);
        var canvas = $canvas.get(0);

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "black";
        drawExpressionTerm(ctx, box, h, SCALE_FACTOR);
        return ctx;
    }

    function measureText(h, str) {
        $canvasTest = $('<canvas></canvas>');
        var canvasTest = $canvasTest.get(0);
        var ctxTest = canvasTest.getContext('2d');
        ctxTest.font = h * .5 + "px Arial";
        var w = ctxTest.measureText(str).width;
        ctxTest = null;
        canvasTest = null;
        $canvasTest = null;
        return w;
    }

    function drawExpressionOperator(h, $parent, str) {
        var w = measureText(h, str);
        $div = $('<div class="expression_term">').appendTo($parent);
        $canvas = $('<canvas width="' + w + 'px" height="' + h + 'px"></canvas>').appendTo($div);
        var canvas = $canvas.get(0);
        var ctx = canvas.getContext('2d');
        ctx.font = h * .5 + "px Arial";
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";
        ctx.fillText(str, 0, h * .3);
        return ctx;
    }

    //Constructor
    function Notes(cage, line_height) {

        this.current_selection = null;
        this.current_expression = null;

        this.notes = [];
        this.cage = cage;
        this.x;
        this.y;
        this.line_height = line_height;
        //Get the div to draw symbolic solution
        this.$ss = $("#symbolic_solution");
        this.$ss.html(""); //clear it

        //get div to draw current expression
        this.$ce = $("#current_solution");
        this.$ce.html(""); //clear it
    }

    Notes.prototype.redrawSolutions = function () {
        //Clear the current_solution div
        this.$ce.html("");
        this.notes = [];
        this.drawSolutionList(this.cage, this.line_height);
    }

    Notes.prototype.drawPage = function () {

        //Get the equation representing the solution for this cage
        var obj = this.cage.getEquation(0);
        //Draw the expression to the symbolic_solution div
        drawExpressionOperator(this.line_height, this.$ss, "Expression: "); //returns ctx

        drawSolutionExpression(this.line_height, this.$ss, obj.equation, false); //returns ctx

        drawExpressionOperator(this.line_height, this.$ss, " =");

        this.drawSolutionList(this.cage, this.line_height);
    }

    Notes.prototype.drawSolutionList = function() {

        //Start with current solution
        for (var i = 1; i < this.cage.rt.solutions.length; i++) {
            var note = new Note(this, i);
            this.notes.push(note);
            note.draw();
        }
    }

    Notes.prototype.setDuplicates = function() {
        //Start with current solution
        for (var i = 1; i < this.cage.rt.solutions.length; i++) {
            for(var j=0; j < this.notes.length; j++)
            {
                var note = this.notes[j];
                note.setDuplicates();
            }
        }
    }

    Notes.prototype.add = function(new_note) {
        this.notes.push(new_note);
        //Reset indexes and solution_index
        for(var i=0; i < this.notes.length; i++)
        {
            var note = this.notes[i];
            note.setIndex(i);
        }
    }

    Notes.prototype.insertCurrent = function(current_note) {
        var array = this.notes.splice(0, 0, current_note);
        //Reset indexes and solution_index
        for(var i=0; i < this.notes.length; i++)
        {
            var note = this.notes[i];
            note.setIndex(i);
        }
        return array[0];
    }

    Notes.prototype.remove = function(index) {
        this.notes[index].removeNode();
        this.notes.splice(index,1);
        //Reset indexes
        for(var i=0; i < this.notes.length; i++)
        {
            var note = this.notes[i];
            note.setIndex(i);
        }
    }

    //Constructor
    function Note(notes, solution_index) {

        this.index = solution_index - 1;
        this.expressions = [];
        this.notes = notes;
        this.solution_index = solution_index;
        this.line_height = notes.line_height;
        this.$container = notes.$ce;
        this.cage = notes.cage;
        //this.answer = this.cage.getEquation(0);
        this.solution = this.cage.rt.solutions[solution_index];

        //Add Header
        if(solution_index == 1) //current solution
        {
            var html =
            '<div class="header_section colLightSand">' +
                '<button class="noteCopyBtnsL colTurquoise" data-action="random" data-id="' + solution_index + '">&</button>' +
                '<div class="noteActionL">Random Copy</div>' +
                '<div class="noteActionR">Exact Copy </div>' +
                '<button class="noteCopyBtnsR colTurquoise" data-action="add" data-id="' + solution_index + '">+</button>' +
            '</div>';
        }
        else {
            var html =
            '<div class="header_section colLightSand">' +
                '<button class="noteCopyBtnsL colTurquoise" data-action="promote" data-id="' + solution_index + '">^</button>' +
                '<div class="noteActionL">Promote</div>' +
                '<div class="noteActionR">Remove </div>' +
                '<button class="noteCopyBtnsR colTurquoise" data-action="remove" data-id="' + solution_index + '">-</button>' +
            '</div>';
        }
        this.$header = $(html).appendTo(this.$container);
        this.$div = $('<div class="solution_section colLightSand">').appendTo(this.$container);

        var me = this;
        this.$header.click(function(ev){

            //alert("Info: " + JSON.stringify(me.solution_index));
            switch(ev.target.dataset.action)
            {
                case "add":
                    var index = me.cage.cloneSolution(me.solution_index);
                    var note = new Note(Game.current_notes, index);
                    Game.current_notes.add(note);
                    note.draw();
                    //paint all duplicate terms red
                    Game.current_notes.setDuplicates();
                    break;
                case "random":
                    var index = me.cage.randomizeSolution(me.solution_index);
                    var note = new Note(Game.current_notes, index);
                    Game.current_notes.add(note);
                    note.draw();
                    //paint all duplicate terms red
                    Game.current_notes.setDuplicates();
                    break;
                case "remove":
                    me.cage.removeSolution(me.solution_index);
                    Game.current_notes.remove(me.getIndex());
                    break;
                case "promote":
                    //Remove the selected solution from the cage returning removed data
                    var solutions_obj = me.cage.removeSolution(me.solution_index);

                    //Remove the selected note from the list
                    Game.current_notes.remove(me.getIndex());

                    //Insert the selected solution to the cage at index 1 (current solution)
                    // using data from promoted item
                    me.cage.insertCurrent(solutions_obj);

                    //Create a new note using the values from the old current item
                    //Note the old current item is pushed down to index 2
                    var note = new Note(Game.current_notes, 1);
                    //Insert this note at index 0 in the list
                    Game.current_notes.insertCurrent(note);

                    //Update the game solution array with the new values
                    Game.setPromotedValues(solutions_obj, me.cage);
                    Game.current_notes.redrawSolutions();
                    Game.current_notes.setDuplicates();

                    break;
            }

        });
    }

    Note.prototype.setDuplicates = function()
    {
        //Make temporary solution array
        var temp = Solution.clone(Game.solution);
        //console.log(JSON.stringify(temp));
        //update the solution array (temp)
        for(var i=0; i < this.expressions.length; i++) {
            var exp = this.expressions[i];
            temp[exp.component.y][exp.component.x][1] = exp.component.val;
        }
        var res = scanTempForDuplicates(temp);
        for(var i=0; i < this.expressions.length; i++)
        {
            var color = "black";
            var exp = this.expressions[i];
            if(isSet(res, exp.component.x, exp.component.y))
            {
                color = "red";
            }
            if(exp.component.symbol != "")
            {
                exp.drawExpression(exp.component.symbol, false, color);
            }
        }
    }

    Note.prototype.setIndex = function(index)
    {
        this.index = index;
        this.solution_index = index + 1;
    }

    Note.prototype.getIndex = function()
    {
        return this.index;
    }

    Note.prototype.removeNode = function()
    {
        this.$header.remove();
        this.$div.remove();
    }

    Note.prototype.getEquation = function()
    {
        return this.notes.cage.getEquation(0);
    }

    Note.prototype.draw = function () {
        var eq = this.cage.getEquation(this.solution_index);
        //console.log("Equation [" + i + "]" + JSON.stringify(eq));
        //Get the parent component first
        var p_component = eq.components[0];

        //console.log("Parent component:" +  JSON.stringify(p_component));
        var pop = Math_ops.matrix[p_component.op].symbol;
        for(var j=1; j < eq.components.length; j++)
        {
            drawExpressionOperator(this.line_height, this.$div, "(");
            var component = eq.components[j];
            //console.log("Child component:" +  JSON.stringify(component));
            var cop = Math_ops.matrix[component.op].symbol;
            for(var k=0; k < component.terms.length; k++)
            {
                var exp = new Expression(this, true, component.terms[k]);
                this.expressions.push(exp);

                var term = component.terms[k].symbol;
                if(term === "")
                {
                    exp.drawExpression("  ", true);
                }
                else
                {
                    exp.drawExpression(term, false);
                }
                if(k < component.terms.length-1)
                {
                    drawExpressionOperator(this.line_height, this.$div, cop);
                }
            }
            drawExpressionOperator(this.line_height, this.$div, ")");
            if(j < eq.components.length-1)
            {
                drawExpressionOperator(this.line_height, this.$div, pop);
            }
            else if(p_component.terms.length > 0)
            {
                drawExpressionOperator(this.line_height, this.$div, pop);
            }
        }
        for(var j=0; j < p_component.terms.length; j++)
        {
            var exp = new Expression(this, true, p_component.terms[j]);
            this.expressions.push(exp);
            var term = p_component.terms[j].symbol;
            if(term === "")
            {
                exp.drawExpression("  ", true);
            }
            else
            {
                exp.drawExpression(term, false);
            }
            if(j < p_component.terms.length-1)
            {
                drawExpressionOperator(this.line_height, this.$div, pop);
            }
        }
    }


    //Constructor
    function Expression(note, isSelectable, component) {
        this.note = note;
        this.line_height = note.line_height;
        this.$container = note.$div;
        this.isSelectable = isSelectable;
        this.component = component;
        this.SCALE_FACTOR = 1.5; //The larger this factor the smaller the letter
        if(this.isSelectable)
        {
            this.$eq = $('<div class="expression_term selectable exp_deselected">').appendTo(this.$container);
        }
        else
        {
            this.$eq = $('<div class="expression_term">').appendTo(this.$container);
        }
        this.$canvas = null;
        this.canvas = null;
        this.ctx = null;
        var me = this;
        this.$eq.click(function(ev){

            //alert("The answer is: " + JSON.stringify(me.component));
            //me.note.notes.x = me.component.x;
            //me.note.notes.y = me.component.y;
            me.note.notes.current_expression = me;

            if (me.note.notes.current_selection) {
                me.note.notes.current_selection.addClass("exp_deselected");
                me.note.notes.current_selection.removeClass("exp_selected");
            }
            me.note.notes.current_selection = me.$eq;
            me.note.notes.current_selection.addClass("exp_selected");
            me.note.notes.current_selection.removeClass("exp_deselected");
        });
    }

    Expression.prototype.update = function(n)
    {
        this.note.cage.updateUserSolution(this.component.x, this.component.y, n, this.note.solution_index);
    }

    Expression.prototype.setColor = function(color)
    {
        this.ctx.fillStyle = color;
    }

    Expression.prototype.drawColor = function(str, color) {
        //Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        str = CQ(str).simplify().toString();
        str = Utl.replaceAll(str, "**", "^");
        box = getCanvasBox(str);
        this.ctx.fillStyle = color;
        drawExpressionTerm(this.ctx, box, this.line_height, this.SCALE_FACTOR);
    }

    Expression.prototype.drawExpression = function(str, isEmpty, color) {

        if(!color)
        {
            color = "black";
        }
        //Remove old content
        if(this.$canvas)
        {
            this.$canvas.remove();
            this.$canvas = null;
            this.canvas = null;
            this.ctx = null;
        }
        if(!isEmpty) {
            str = CQ(str).simplify().toString();
            str = Utl.replaceAll(str, "**", "^");
        }

        box = getCanvasBox(str);
        var scale = this.line_height / this.SCALE_FACTOR / box.height;
        var bw = box.width * scale;
        var bh = box.height * scale;
        this.$canvas = $('<canvas width="' + bw + 'px" height="' + this.line_height + 'px"></canvas>').appendTo(this.$eq);
        this.canvas = this.$canvas.get(0);
        this.ctx = this.canvas.getContext('2d');

        if(isEmpty)
        {
            this.ctx.font = this.line_height * .5 + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.textBaseline = "top";
            this.ctx.fillText(str, 0, this.line_height * .3);
        }
        else
        {
            this.ctx.fillStyle = color;
            drawExpressionTerm(this.ctx, box, this.line_height, this.SCALE_FACTOR);
        }
    }

    return {Notes: Notes, Note: Note};
})();
