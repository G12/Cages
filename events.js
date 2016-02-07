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

var GameEvents = {

    g_auto_save:false,
    g_save_as_object:false,

    g_width:null,
    g_tool_bar_height:null,
    g_toggle_functions:null,

    //Number button size control
    //FONT_SIZE_FACTOR: .64,
    BUTTON_HEIGHT_FACTOR: .75,
    HEIGHT_ADJUSTMENT: 3,
    DROP_MIN:.75,
    DROP_MAX:.8,

    //Controls toggling of notes window
    g_restore: null,

    saveCallback:null, //User supplied callback function see
    //////////////////////////////////////////  From game.js //////////////////////////////////////////

    drawOverLay: function (solution, size) {
        $("#overlay_table").html("");
        var $table = $("#overlay_table");
        for (var y = 0; y < size; y++) {
            var $tr = $("<tr>").appendTo($table);
            for (var x = 0; x < size; x++) {
                var n = Game.solution[y][x][1];
                n = n ? n : "";

                var w = Math.round(GameEvents.g_width / size);
                var h = w - GameEvents.HEIGHT_ADJUSTMENT;
                //Canvas width and height slightly smaller than td
                //var h2 = h*.95;

                var style = 'style="height:' + h + 'px; width:' + w + 'px;"';

                var $td = $('<td ' + style + ' >').appendTo($tr);

                var $canvas = $('<canvas class="cell_canvas" width="' + w + 'px" height="' + h + 'px" data-x="' + x + '" data-y="' + y + '"></canvas>').appendTo($td);

                var canvas = $canvas.get(0);

                GameEvents.drawCanvasCell(canvas, x, y);
            }
        }
    },

    drawCanvasCell: function (canvas, x, y, color) {
        var ctx = canvas.getContext('2d');

        //Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //For pageMaker display all operands
        var n = Game.solution[y][x][1];
        if (n) {
            n = n ? n : "";

            var strExpression = "";
            if (n) {
                strExpression = Game.getNumberSetExpressionByIndex(n);
                strExpression = Utl.replaceAll(strExpression, "**", "^");
            }
            var h = Math.round(GameEvents.g_width / Game.getSize());

            ctx.fillStyle = color;

            var type = Game.number_set.type;
            var DROP_CONST = GameEvents.DROP_MIN; // .75;
            if (type == 1) {
                //Drop expression lower for symbolic type
                DROP_CONST = GameEvents.DROP_MAX; // .8;
            }
            var SCALE_FACTOR = 2.5; //The larger this factor the smaller the letter
            var LEFT_CONSTANT = .32;

            GameEvents.drawCanvasBox(ctx, h, SCALE_FACTOR, DROP_CONST, LEFT_CONSTANT, strExpression);

        }
    },

    drawCanvasBox: function (ctx, h, scale_factor, drop_constant, left_constant, strExpression) {
        var root = cvm.parse.parser.parse(strExpression);
        var box = cvm.layout.ofExpr(root).box();
        root.box = box;

        //Scale using box.height and h
        var scale = h / scale_factor / box.height;

        //Make adjustemts using height h
        var left = left_constant * h / scale;
        var bottom = drop_constant * h / scale;

        //console.log("scale:" + scale);
        //var bw = box.width*scale;
        //var bh = box.height*scale;

        ctx.save();
        ctx.scale(scale, scale);
        box.drawOnCanvas(ctx, left, bottom);
        ctx.restore();
    },

    drawNumberButtons: function (size) {
        var td_h = GameEvents.g_tool_bar_height * GameEvents.BUTTON_HEIGHT_FACTOR;
        var td_w = td_h + td_h * .2;
        var style = 'style="height:' + td_h + 'px; width:' + td_w + 'px; line-height:' + td_h + 'px; " ';
        $("#numbers_buttons_table").html("");
        var $table = $("#numbers_buttons_table");
        var $tr = $("<tr>").appendTo($table);
        for (var i = 1; i <= size; i++) {
            var $td = $('<td class="number_button" ' + style + ' >').appendTo($tr);
            var $canvas = $('<canvas class="cell_canvas" width="' + td_h + 'px" height="' + td_h + 'px" data-n="' + i + '" ></canvas>').appendTo($td);
            var canvas = $canvas.get(0);
            GameEvents.drawNumberCell(canvas, i, td_h);
        }
    },

    drawNumberCell: function (canvas, n, h) {
        var type = Game.number_set.type;
        var ctx = canvas.getContext('2d');

        strExpression = Game.getNumberSetExpressionByIndex(n);
        strExpression = Utl.replaceAll(strExpression, "**", "^");

        ctx.fillStyle = "black";
        var root = cvm.parse.parser.parse(strExpression);
        var box = cvm.layout.ofExpr(root).box();
        root.box = box;
        var SCALE_FACTOR = 1.3; //The larger this factor the smaller the letter

        //Scale using box.height and h
        var scale = h / SCALE_FACTOR / box.height;
        var bw = box.width * scale;
        var bh = box.height * scale;
        var margin_factor = bh / bw; //The wider the expression the smaller the margin

        //Make adjustemts using height h
        var left = .1 * h / scale * margin_factor;

        var DROP_CONST = .75;
        var bottom = DROP_CONST * h / scale;

        ctx.scale(scale, scale);
        box.drawOnCanvas(ctx, left, bottom);

    },

    ////////////////////////////////////////////////  Game Play  /////////////////////////////////////

    shuffle: function () {
        $("#hint").html("");
        //Game.operation_set = g_operationSet;
        Game.shuffle();
        Game.setOperationValues();
        Game.reDraw(canvas);
        GameEvents.drawOverLay(Game.solution, Game.getSize());

        currentGame.time.reset();
        //Start the timer now
        currentGame.time.start();
        g_gameOn = true;

    },
    drawPreview: function(obj, canvas_id) {
      var canvas = document.getElementById(canvas_id);
      //Cannot do anything without a canvas
      if (canvas.getContext) {

        GameEvents.hide("#notes_window");
        GameEvents.show("#canvas-wrap");

        //Restore the size and key, and Expand properties on the compressed object
        obj = Game.expand(obj);
        var size = obj.size;

        var ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); //Default

        var scale = Math.round(GameEvents.g_width / obj.size);
        ctx.scale(scale, scale);
        var length = obj.size * scale + 2;
        $("#canvas-wrap").height(length);
        $("#canvas-wrap").width(length);

        //Minimum requirements for a Game
        Game.init(ctx, size, obj);

        //Generate the solution - If there is a key then the saved solution will be generated
        //using the key
        var key = Game.shuffle(obj.key, obj.solution);

        //Using the expanded saved object copy all properties to the
        //static Game
        Game.restore(obj);

        //Iterate through Cages setting appropriate operation values
        Game.setOperationValues();

        Game.reDraw(canvas);

      }
      else {
        alert("preview_canvas element not available");
      }
    },
    drawPage: function (obj) {

        //g_operationSet = obj.operation_set;
        //Game.operation_set = obj.operation_set;
        var canvas = document.getElementById('canvas');
        //Cannot do anything without a canvas
        if (canvas.getContext) {
            //If notes page was active close it now
            GameEvents.hide("#notes_window");
            GameEvents.show("#canvas-wrap");

            //Restore the size and key, and Expand properties on the compressed object
            obj = Game.expand(obj);
            var size = obj.size;

            var ctx = canvas.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0); //Default

            var scale = Math.round(GameEvents.g_width / obj.size);
            ctx.scale(scale, scale);
            var length = obj.size * scale + 2;
            $("#canvas-wrap").height(length);
            $("#canvas-wrap").width(length);

            //Minimum requirements for a Game
            Game.init(ctx, size, obj);

            //Generate the solution - If there is a key then the saved solution will be generated
            //using the key
            var key = Game.shuffle(obj.key, obj.solution);

            //Using the expanded saved object copy all properties to the
            //static Game
            Game.restore(obj);

            //Iterate through Cages setting appropriate operation values
            Game.setOperationValues();

            Game.reDraw(canvas);

            GameEvents.drawOverLay(Game.solution, Game.getSize());

            GameEvents.drawNumberButtons(Game.getSize());

            //Record the original state of the game
            History_Stack.addState();

        }
        else {
            alert("canvas element not available");
        }
    },

    startTimer: function(seconds)
    {
      seconds = seconds || null;

      currentGame.time.reset();

      if (seconds !== null) {
        currentGame.time.start(seconds*1000);
      }else {
        //Start the timer now
        currentGame.time.start();
      }

      g_gameOn = true;

    },

    updateOnStateChanged: function (str) {
        var state = JSON.parse(str);
        Game.updateSolutions(state);
        var count = Game.scanSuccess().count;
        $("#hint").html("Hint: " + count + " correct");
        GameEvents.drawOverLay(Game.solution, Game.getSize());
    },

    scanForDuplicates: function () {

        //Scan for duplicates
        var res1 = Game.scanDuplicates(Game.solution, false);
        var tranny = Solution.transpose(Game.solution);
        var res2 = Game.scanDuplicates(tranny, true);
        var res = res1.concat(res2);

        $("#overlay table td canvas").each(function () {

            var x = this.dataset.x;
            var y = this.dataset.y;

            //Set all number values to black first
            GameEvents.drawCanvasCell(this, x, y, CONST.COLOR_GOOD);

            for (var i = 0; i < res.length; i++) {
                //If number is duplicated change to red
                if (res[i][0] == y && res[i][1] == x) {
                    GameEvents.drawCanvasCell(this, x, y, CONST.COLOR_BAD);
                }
            }
        });
        return res;
    },

    winningSolution: function () {
        //Check for winner - Fast
        var obj = Game.scanSuccess();
        $("#hint").html("Hint: " + obj.count + " correct");
        var square = Game.getSize() * Game.getSize();
        //TODO uncomment after testing phase
        //if (obj.count === square) {
        //    return true;
        //}else if(obj.set_count === square)
        //{
        //Test remaining cages using solution processing - Slow
        if (Game.scanEccentrics()) {
            return true;
        }
        //}
        //TODO end of comment section for testing
    },

    setSaveCallback: function(saveCallback)
    {
        GameEvents.saveCallback = saveCallback;
    },

    doSuccessProccessing: function (exitNotes)
    {
        if(exitNotes) {
            $("#cartoucheToolNotes").click();
        }

        currentGame.time.stop();
        g_gameOn = false;
        currentGame.complete = true;

        //clean up any red letters
        GameEvents.scanForDuplicates();

        alert("WINNER! Your time: " + currentGame.time.getTimeStr());

        //Clear the history
        History_Stack.clear();

        //Clear selection
        if (Game.current_selection) {
            $(Game.current_selection).addClass("deselected");
            $(Game.current_selection).removeClass("selected");
        }
        //Clear current selection ? maybe
        Game.current_selection = null;

        GameEvents.saveGame(CONST.G_SAVE_GAME, currentGame.complete);

    },

    saveGame: function(saveMode, game_complete)
    {
        //alert("GameEvents.saveCallback" + JSON.stringify(GameEvents.saveCallback));
        if(GameEvents.saveCallback)
        {
          var obj = Game.compress(saveMode);
          if(GameEvents.g_save_as_object)
          {
            GameEvents.saveCallback(obj, saveMode, game_complete);
          }
          else {

            var strCages = JSON.stringify(obj);
            GameEvents.saveCallback(strCages, saveMode, game_complete);
          }
        }
        else
        {
          alert("GameEvents.saveCallback is not set");
        }
    },

    updateGame: function (cage, x, y, n, exitNotes) {
        //Update the user solution array and the global solution
        //and Update the History stack
        cage.updateUserSolution(x, y, parseInt(n));

        GameEvents.drawCanvasCell(Game.current_selection, x, y, CONST.COLOR_GOOD)

        if (GameEvents.winningSolution()) {
            GameEvents.doSuccessProccessing(exitNotes);
        }

        //returns the array of duplicated vals if needed
        return GameEvents.scanForDuplicates();
    },

    loadJQueryEvents: function () {

        $("#numbers_buttons_table").click(function (e) {
            e.preventDefault();
            //If a game cell is selected
            if (Game.current_selection) {
                var x = Game.current_selection.dataset.x;
                var y = Game.current_selection.dataset.y;

                var cage = Game.getCage(x, y);

                var n = e.target.dataset.n;

                //If Notes page is not showing
                if (!Game.current_notes) {

                    //If n equals current value then erase
                    if (Game.solution[y][x][1] == n) {
                        //Update the user solution array and the global solution
                        //and Update the History stack
                        cage.updateUserSolution(x, y, null);
                        GameEvents.drawCanvasCell(Game.current_selection, x, y)

                        //Check for winner - Fast
                        var count = Game.scanSuccess().count;
                        $("#hint").html("Hint: " + count + " correct");

                        GameEvents.scanForDuplicates();

                        //Alaways save game after this
                        if(GameEvents.g_auto_save)
                        {
                          GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                        }

                        return;
                    }

                    GameEvents.updateGame(cage, x, y, n, false);

                    //Alaways save game after this
                    if(GameEvents.g_auto_save)
                    {
                      GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                    }


                }
                else //Notes page is showing
                {
                    var x = Game.current_notes.current_expression.component.x;
                    var y = Game.current_notes.current_expression.component.y;
                    var strExpression = Game.getNumberSetExpressionByIndex(n);
                    strExpression = Utl.replaceAll(strExpression, "**", "^");
                    Game.current_notes.current_expression.drawExpression(strExpression, false);

                    if (Game.current_notes.current_expression.note.solution_index == 1) {
                        //Update the playing board
                        GameEvents.updateGame(cage, x, y, n, false);

                        //Alaways save game after this
                        if(GameEvents.g_auto_save)
                        {
                          GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                        }

                    }
                    else {
                        Game.current_notes.current_expression.update(n);
                    }
                    //paint all duplicate terms red
                    Game.current_notes.setDuplicates();
                }
            }
        });

        $("#overlay table").click(function (e) {
            if (Game.current_selection) {
                $(Game.current_selection).addClass("deselected");
                $(Game.current_selection).removeClass("selected");
            }
            if ("CANVAS" == e.target.tagName) {
                Game.current_selection = e.target;
                $(Game.current_selection).addClass("selected");
                $(Game.current_selection).removeClass("deselected");
            }
        });


        //Floating number padd research
        var table_timeoutId = 0;

        $("#overlay table").mousedown(function(e) {
          table_timeoutId = setTimeout(function(){
            if (Game.current_selection) {
              $(Game.current_selection).addClass("deselected");
              $(Game.current_selection).removeClass("selected");
            }
            if ("CANVAS" == e.target.tagName) {
              Game.current_selection = e.target;
              $(Game.current_selection).addClass("selected");
              $(Game.current_selection).removeClass("deselected");
            }
            var n = prompt("Enter Number Code");
            if (n != null)
            {
              if(n < 1 || n > Game.number_set.set.length)
              {
                return;
              }
              //If a game cell is selected
              if (Game.current_selection) {
                var x = Game.current_selection.dataset.x;
                var y = Game.current_selection.dataset.y;
                var cage = Game.getCage(x, y);
                //If n equals current value then erase
                if (Game.solution[y][x][1] == n) {
                  //Update the user solution array and the global solution
                  //and Update the History stack
                  cage.updateUserSolution(x, y, null);
                  GameEvents.drawCanvasCell(Game.current_selection, x, y)

                  //Check for winner - Fast
                  var count = Game.scanSuccess().count;
                  $("#hint").html("Hint: " + count + " correct");

                  GameEvents.scanForDuplicates();
                  //Alaways save game after this
                  if(GameEvents.g_auto_save)
                  {
                    GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                  }
                  return;
                }
                GameEvents.updateGame(cage, x, y, n, false);
                //Alaways save game after this
                if(GameEvents.g_auto_save)
                {
                  GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                }
              }
            }
          }, 1000);
        }).bind('mouseup mouseleave', function(e) {
          clearTimeout(table_timeoutId);
        });


        ///////////////////////////////////////////  Function Legend //////////////////////////////////////
        $("#cartoucheFunctionLegend").click(function (e) {
            e.preventDefault();
            if (GameEvents.g_toggle_functions) {
                //var leg = $("#cartoucheFunctionLegend").height();
                var h = $("#cartoucheNumbersAndToolsContainer").height();

                $("#cartoucheNumbersAndToolsContainer").removeClass("tool_container_tan");
                $("#cartoucheNumbersAndToolsContainer").addClass("no_color");

                GameEvents.hide("#button_wrap");
                GameEvents.hide("#cartoucheToolsContainer");
                GameEvents.hide("#view_function_text");
                GameEvents.show("#view_function_image");
                $("#view_function_image").height(h);
                GameEvents.g_toggle_functions = !GameEvents.g_toggle_functions;
            } else {
                $("#view_function_image").height(0);

                $("#cartoucheNumbersAndToolsContainer").removeClass("no_color");
                $("#cartoucheNumbersAndToolsContainer").addClass("tool_container_tan");

                GameEvents.show("#button_wrap");
                GameEvents.show("#cartoucheToolsContainer");
                GameEvents.show("#view_function_text");
                GameEvents.hide("#view_function_image");
                GameEvents.g_toggle_functions = !GameEvents.g_toggle_functions;
            }
        });

        ///////////////////////////////////////////  Menu Bar Links  ///////////////////////////////////////

        $("#cartoucheToolUndo").click(function (e) {
            e.preventDefault();
            //If Notes page is not showing
            if (!Game.current_notes) {
              //alert("cartoucheToolUndo");
              var str = History_Stack.getNext();
              if (str) {
                console.log(str);
                GameEvents.updateOnStateChanged(str);

                //Alaways save game after this
                if(GameEvents.g_auto_save)
                {
                  GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                }

              }
            }
        });

        $("#cartoucheToolRedo").click(function (e) {
            e.preventDefault();
            //If Notes page is not showing
            if (!Game.current_notes) {
              //alert("cartoucheToolRedo");
              var str = History_Stack.getPrevious();
              if (str) {
                console.log(str);
                GameEvents.updateOnStateChanged(str);

                //Alaways save game after this
                if(GameEvents.g_auto_save)
                {
                  GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                }

              }
            }
        });

        $("#cartoucheToolEraser").click(function (e) {
            e.preventDefault();
            //If Notes page is not showing
            if (!Game.current_notes) {
              if (Game.current_selection) {
                var x = Game.current_selection.dataset.x;
                var y = Game.current_selection.dataset.y;
                var cage = Game.getCage(x, y);

                //Update the user solution array and the global solution
                //and Update the History stack
                cage.updateUserSolution(x, y, null);
                GameEvents.drawCanvasCell(Game.current_selection, x, y)

                //Check for winner - Fast
                var count = Game.scanSuccess().count;
                $("#hint").html("Hint: " + count + " correct");

                GameEvents.scanForDuplicates();

                //Alaways save game after this
                if (GameEvents.g_auto_save) {
                  GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                }

                return;
              }
            }
        });

        $("#cartoucheToolNotes").click(function (e) {
            e.preventDefault();
            if (!Game.current_selection)return;
            if (GameEvents.g_restore) {
                GameEvents.hide("#notes_window");
                GameEvents.show("#canvas-wrap");
                Game.current_notes = null;

                //Redraw the board on note promotion
                GameEvents.drawOverLay(Game.solution, Game.getSize());

                GameEvents.scanForDuplicates();

                if (GameEvents.winningSolution()) {
                    GameEvents.doSuccessProccessing(false);
                }
                else {

                  //Alaways save game after this
                  if(GameEvents.g_auto_save)
                  {
                    GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                  }

                }

            }
            else {
                GameEvents.hide("#canvas-wrap");
                GameEvents.show("#notes_window");

                var x = Game.current_selection.dataset.x;
                var y = Game.current_selection.dataset.y;
                var h = GameEvents.g_tool_bar_height * GameEvents.BUTTON_HEIGHT_FACTOR;

                var cage = Game.getCage(x, y);

                Game.current_notes = new Display_Objects.Notes(cage, h);

                Game.current_notes.drawPage();

                Game.current_notes.setDuplicates();

            }
            GameEvents.g_restore = !GameEvents.g_restore;
        });

        $("#cartoucheToolQuestion").click(function (e) {
            e.preventDefault();
            alert("cartoucheToolQuestion");
        });

        $("#cartoucheToolRestart").click(function (e) {
            e.preventDefault();
            //alert("cartoucheToolRestart");
            if (confirm("RESET Game\nThis will erase your progress. Are you sure?")) {
                Game.resetGame(true);
                $("#hint").html("");
                GameEvents.drawOverLay(Game.solution, Game.getSize());

                //Alaways save game after this
                if(GameEvents.g_auto_save)
                {
                  GameEvents.saveGame(CONST.G_SAVE_GAME, false);
                }
            }
        });
    },

    //////////////////////////////////////////////////   Utilities   ///////////////////////////////////
    show: function show(id) {
        $(id).removeClass("hide");
        $(id).addClass("show");
    },

    hide: function (id) {
        $(id).removeClass("show");
        $(id).addClass("hide");
    }

}
