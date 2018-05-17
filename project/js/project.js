enchant();
//右の画面の端
var RIGHT_END = 500;
//下の画面の端
var BOTTOM_END = 600;
window.onload = function() {
    var game = new Game(RIGHT_END,BOTTOM_END);
    game.onload = function() {
        var numX = 0;
        var numY = 0;
        var block = new Array();
      for(numY = 0;numY<4;numY++){
          for(numX = 0;numX<5;numX++){
                var x = 5+80*numX;
                var y = 5+15*numY;
		    block[numX+numY] = new Block(x, y);
          }
       }
    };
    Block = enchant.Class.create(Sprite, {
		initialize: function(x, y, frame) {
			Sprite.call(this, 50, 10);
			this.image = game.assets["block_frames.png"];
			this.x = x;
			this.y = y;
			this.frame = frame
            game.rootScene.addChild(this);
		}
	});
}