;(function() {

  var sheet = new Image();
  sheet.src = 'sheet.png';

  sheet.onload = init;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var width = 96;
  var height = 184;

  canvas.width = width;
  canvas.height = height;

  canvas.style.height = '80%'; // scale to somewhat fit screen

  document.getElementById('app').appendChild(canvas);

  var Art = {
    bg: {x: 0, y: 0, w: 96, h: 184},
    blocks: []
  };

  // load block sprites
  var bw = 8; // block width
  var bh = 8; // block height
  for (var i = 0; i < 8; i++) {
    var block = {x: i * bw, y: 192, w: bw, h: bh};
    Art.blocks.push(block);
  };

  function init() {
    var bg = Art.bg;
    ctx.drawImage(sheet, bg.x, bg.y, bg.w, bg.h, 0, 0, width, height);


    // test block sprites
    //for (var i = 0; i < 10; i++) {
    //  var b = Art.blocks[i % 8];
    //  ctx.drawImage(sheet, b.x, b.y, b.w, b.h, 8 + 8 * i, 160, b.w, b.h);
    //};

    var boardWidth = 10; // 80 / 8 (block width)
    var boardHeight = 20; // 160 / 8
    var board = [];
    function resetBoard() {
      board = [];
      for (var i = 0; i < boardWidth; i++) {
        board[i] = [];
        for (var j = 0; j < boardHeight; j++) {
          board[i][j] = 0; // empty
        }
      };
    }
    resetBoard();

    // test rendering blocks from board
    //for (var i = 0; i < 10; i++) {
    //  board[i][19] = i + 1;
    //};

    var offset = {x: 8, y: 8};
    function drawBlock(subImg, i, j) {
      //console.log("drawing");
      var b = Art.blocks[subImg % 8];
      var x = offset.x + i * 8;
      var y = offset.y + j * 8;
      ctx.drawImage(sheet, b.x, b.y, b.w, b.h, x, y, b.w, b.h);
    };

    // render blocks on the board
    function render() {
      // clear rect before rendering (just draw the background)
      //ctx.clearRect(0, 0, width, height);
      var bg = Art.bg;
      ctx.drawImage(sheet, bg.x, bg.y, bg.w, bg.h, 0, 0, width, height);

      for (var i = 0; i < boardWidth; i++) {
        for (var j = 0; j < boardHeight; j++) {
          var n = board[i][j];
          if (n < 1) // skip empty block
            continue;
          var subImg = (n - 1);
          drawBlock(subImg, i, j);
        }
      };

      // draw shape (the active shape player controls)
      if (shape) {
        for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            var b = shape.board[i][j];
            if (b > 0) {
              drawBlock(b, shape.x + i, shape.y + j);
            } else {
              // debugging
              //drawBlock(0, shape.x + i, shape.y + j);
            }
          }
        };
      };
    };
    render();

    // shapes size 4x4 (max size)
    var shapes = {
      0:[ // type 0
      "0000" +
      "1111" +
      "0000" +
      "0000",

      "0010" +
      "0010" +
      "0010" +
      "0010"
      ],
      1:[
      "0000" +
      "1110" +
      "0010" +
      "0000",

      "0010" +
      "0010" +
      "0110" +
      "0000",

      "0000" +
      "1000" +
      "1110" +
      "0000",

      "1100" +
      "1000" +
      "1000" +
      "0000",
      ],
      2:[
      "0000" +
      "0010" +
      "1110" +
      "0000",

      "0010" +
      "0010" +
      "0110" +
      "0000",

      "0000" +
      "1110" +
      "1000" +
      "0000",

      "1100" +
      "0100" +
      "0100" +
      "0000",
      ],
      3:[
        "1100" +
        "1100" +
        "0000" +
        "0000"
      ],
      4:[
      "0000" +
      "0110" +
      "1100" +
      "0000",

      "0100" +
      "0110" +
      "0010" +
      "0000"
      ],
      5:[
      "0000" +
      "1110" +
      "0100" +
      "0000",

      "1000" +
      "1100" +
      "1000" +
      "0000",

      "0000" +
      "0100" +
      "1110" +
      "0000",

      "0100" +
      "1100" +
      "0100" +
      "0000",
      ],
      6:[
      "0000" +
      "1100" +
      "0110" +
      "0000",

      "0010" +
      "0110" +
      "0100" +
      "0000"
      ]
    };



    var shape = null;
    function Shape(type) {
      this.x = 5 - 2; // middle horizontally
      this.y = 0; // top
      this.type = type; // also block color

      this.index = 0; // rotation index

      this.board = [];
      for (var i = 0; i < 4; i++) {
        this.board[i] = [];
        for (var j = 0; j < 4; j++) {
          this.board[i][j] = 0; // empty
        }
      };

      // save shape information based on type
      this.myShapes = shapes[type];
    };
    Shape.prototype = {
      update: function () {
        // clear board first
        for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            this.board[i][j] = 0; // empty
          }
        };

        var str = this.myShapes[this.index];
        var yy = 0;
        for (var i = 0; i < (4*4); i++) {
          var charAt = str[i];
          if (charAt != '0') {
            this.board[i % 4][(i / 4) | 0] = this.type + 1;
          }
        };
      },
      collides: function () { // check for collision
        for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            var b = this.board[i][j];
            var xx = this.x + i;
            var yy = this.y + j;

            try {
              var _b = board[xx][yy];
            } catch (err) {
              console.log("catch collides");
              if (b !== 0)
                return true;
            };

            //if (typeof board[xx][yy] == 'undefined') {
            //  console.log("blocked!");
            //};

            if (this.type == 0 && i == 0 && j == 0) {
              console.log(b);
            };

            if (b !== 0) {
              if (yy >= boardHeight ||
                  (board[xx][yy] !== 0)) {
                    return true;
                  }

            }
          }
        };
        return false;
      },
      keyboard: function (kb) {
        if (kb.keyState[kb.keys.UP]) {
          this.rotateLeft();
        };

        if (kb.keyState[kb.keys.DOWN]) {
          this.rotateRight();
        };

        if (kb.keyState[kb.keys.LEFT]) {
          this.moveLeft();
          if (this.collides()) {
            //console.log("back to right");
            this.moveRight();
          }
        };

        if (kb.keyState[kb.keys.RIGHT]) {
          this.moveRight();
          if (this.collides()) {
            this.moveLeft();
          }
        };
      },
      moveUp: function () {
        this.y--;
      },
      moveDown: function () {
        this.y += 1;
        if (this.collides()) {
          // go back to previous non collided position
          this.moveUp();
          // add the shapes blocks to the board,
          for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
              var b = this.board[i][j];
              if (b <= 0)
                continue;
              var xx = this.x + i;
              var yy = this.y + j;
              board[xx][yy] = b + 1;
            }
          };

          // check if there's a filled line
          var done = false;
          while (!done) {
            done = true;
            for (j = 0; j < boardHeight; j++) {
              var filled = true;
              for (i = 0; i < boardWidth; i++) {
                if (board[i][j] == 0) {
                  filled = false;
                }
              }
              if (filled) {
                done = false;

                // delete the filled line
                for (var i = 0; i < boardWidth; i++) {
                  board[i][j] = 0;
                }

                // and move the rest above down 1 step
                for (var y = j - 1; y > 0; y--) {
                  for (var i = 0; i < boardWidth; i++) {
                    var b = board[i][y];
                    board[i][y+1] = b;
                  }
                };

              }
            }
          };

          // check if game over
          if (this.y < 1) {
            console.log("Game Over");
            setTimeout(function() {
              resetBoard();
              var n = (Math.random() * 7) | 0;
              shape = new Shape(n);
              shape.update();
            }, 3000);
          } else {
            var n = (Math.random() * 7) | 0;
            shape = new Shape(n);
            shape.update();
          }


        };
      },
      moveRight: function () {
        this.x++
      },
      moveLeft: function () {
        this.x--
      },
      rotateLeft: function () {
        //console.log("rotate left");
        this.index--;
        if (this.index < 0) {
          this.index += this.myShapes.length;
        }
        this.update();
        if (this.collides()) {
          this.rotateRight(); // rotate back
        }
      },
      rotateRight: function () {
        this.index++;
        if (this.index >= this.myShapes.length) {
          this.index -= this.myShapes.length;
        }
        this.update();
        if (this.collides()) {
          this.rotateLeft(); // rotate back
        }
      }
    };

    var n = (Math.random() * 7) | 0;
    shape = new Shape(n);
    shape.update();
    render();

    // keyboard input
    function Keyboard () {
      this.keyState = {};
      var self = this;

      window.onkeydown = function (e) {
        self.keyState[e.keyCode] = true;
      };
      window.onkeyup = function (e) {
        self.keyState[e.keyCode] = false;
      };

      this.keys = {};
      this.keys.LEFT = 37;
      this.keys.RIGHT = 39;
      this.keys.UP = 38;
      this.keys.DOWN = 40;
    };
    var keyboard = new Keyboard();

    // advance the step (move down active shape)
    var steps = 0;
    var stepFPS = 10;
    var msPerStep = 1000 / stepFPS;
    function step() {
      steps++;

      if (shape) {
        shape.keyboard(keyboard);
        shape.moveDown();
      };

      render();
      setTimeout(step, msPerStep);
    };
    setTimeout(step, msPerStep);

  };

})();












