/*
enchant();
window.onload = function(){
	var w = 460; 
	var h = 460;
	var game = new Game(w, h);
    game.fps = 60;
	game.preload('http://jsrun.it/assets/k/1/7/X/k17X3.gif','http://jsrun.it/assets/l/P/W/m/lPWmO.gif', "http://jsrun.it/assets/c/Y/M/y/cYMy7.png");
	game.onload = function(){
		var ball = new Sprite(11, 11);
		ball.image = game.assets['http://jsrun.it/assets/k/1/7/X/k17X3.gif'];
		ball.x = 20;
		ball.y = 200;
		ball.dx = 4;
		ball.dy = 4;
        ball.wait = 0;
		ball.addEventListener('enterframe', function(){
			this.x += this.dx;
			this.y += this.dy;
			if(0 > this.x || w-20 < this.x) this.dx = - this.dx;
			if(0 > this.y || h-20 < this.y) this.dy = - this.dy;
			if(ball.intersect(pad)){
			    this.dy = - this.dy;
		    }
		});
		
		game.rootScene.addChild(ball);
		
		var pad = new Sprite(60,8);
		pad.image = game.assets['http://jsrun.it/assets/l/P/W/m/lPWmO.gif'];
		pad.x = 210;
		pad.y = 420;
		pad.nx = 210;
		pad.addEventListener('enterframe', function(){
			pad.moveTo(this.nx, this.y);			
		});
		
		game.rootScene.addChild(pad);
		
		var blocks = new Group();
		
		for(var i=0; i< 8;i++){
			var bw = 0;
			for(var j=0;j<26;j++){
				var block = new Sprite(16, 16);
				block.image = game.assets['http://jsrun.it/assets/c/Y/M/y/cYMy7.png'];
				block.x = 16 + bw;
				block.y = 16 * i;
				
				
				block.addEventListener('enterframe', function(){
                		if(this.intersect(ball)){
						ball.dy = - ball.dy;   
						this.remove();
					}
				});
				blocks.addChild(block);
				bw = bw + 16;
			}
		}

		game.rootScene.addChild(blocks);
		
		
		game.rootScene.addEventListener("touchmove", function(e) {
			pad.nx = e.x - (pad.width/2);	
		});		
			
	}
	
	game.start();

}
*/


//Webフォント
WebFontConfig = {
    google: { families: [ 'Passion+One::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
enchant();
//右の画面の端
var RIGHT_END = 500;
//下の画面の端
var BOTTOM_END = 600; 
window.onload = function(){
    var game = new Core(RIGHT_END,BOTTOM_END);
    game.blockList = [];
    game.itemList = [];
    game.ballList = [];
    game.onload = function(){
        //シーン生成
        var scene = game.rootScene;
        //スコア表示のラベル
        var score = new Label();
        score.moveTo(30,530);
        score.text = "Score:0";
        score.font = "50px 'Passion One'";
        scene.addChild(score);
        //CLEAR表示のラベル
        var game_clear = new Label();
        game_clear.moveTo(30,480);
        game_clear.text = "CLEAR";
        game_clear.font = "50px 'Passion One'";
        //GAME OVER表示のラベル
        var game_over = new Label();
        game_over.moveTo(30,480);
        game_over.text = "GAME OVER";
        game_over.font = "50px 'Passion One'";
        //キーを割り当てる
        game.keybind(32,"space");
        game.keybind('Z'.charCodeAt(0), 'a');
        //ブロックを生成
        for(var i = 30;i < RIGHT_END - 30 ;i = i + 30){
            for(var j = 30;j < BOTTOM_END / 2 ;j = j + 30){
                var block = new Entity();
                block.x = i;
                block.y = j;
                block.width = 20;
                block.height = 20;
                block.backgroundColor = "black";
                scene.addChild(block );
                game.blockList.push(block);
            }
        }
        //バーを生成
        var bar = new Entity();
        bar.x = 220;
        bar.y = 450;
        bar.width = 60;
        bar.height = 10;
        bar.backgroundColor = "red";
        scene.addChild(bar);
        
        //バーの動くスピード
        var SPEED = 8;
        var MOVE_RANGE_X = game.width - bar.width;
        //バーのイベント
        bar.addEventListener('enterframe',function(e){
            //戦車を十字キーで左右に移動
            if (game.input.left) this.x -= SPEED;
	        if (game.input.right) this.x += SPEED;
            
            //移動可能範囲を制限
            var right =MOVE_RANGE_X;
            var left = 0;
            
            if(this.x<left){this.x = 0;}
            else if(this.x>right) {this.x = right;}
        });
       
        //弾丸を生成
        var bullet = new Entity();
        bullet.x = 245;
        bullet.y = 440;
        bullet.width = 8;
        bullet.height = 8;
        bullet .backgroundColor = "green";
        bullet.className = "bullet";
        scene.addChild(bullet);
        //var bullet = new Entity();
        //bullet.x = 245;
        //bullet.y = 440;
        //bullet.width = 8;
        //bullet.height = 8;
        //bullet .backgroundColor = "blue";
        //bullet.className = "bullet";
        //scene.addChild(bullet);
        //x軸方向の移動量
        bullet.ax = 0;
        //y軸方向の移動量
        bullet.ay = 0;
        //スコアカウンター
        var cnt = 0;
        var start_cnt = 0;
        //spaceキーを押すと実行される関数
        var StartKey = function(e){
            start_cnt = start_cnt + 1;
            //一回だけ実行
            if(start_cnt == 2){bullet.ay = 8;}
        };
        //spaceキーを押すと弾丸を発射
        game.addEventListener("spacebuttondown",StartKey);
        //アイテムを生成
        var item = new Entity();
        item.x = 410;
        item.y = 280;
        item.width = 30;
        item.height = 10;
        item.backgroundColor = "green";
        item.ax = 0;
        item.ay = 0;
        
        //弾丸のイベント
        bullet.addEventListener('enterframe', function(e) {
            //スタートする前だけ実行
            if(start_cnt === 0){
                //弾丸を十字キーで左右に移動
                if (game.input.left) this.x -= SPEED;
                if (game.input.right) this.x += SPEED;
                
                //移動可能範囲を制限
                var right =game.width - bar.width/2 - this.width/2;
                var left = bar.width/2 - this.width/2;
                
                if(this.x<left){this.x = left;}
                else if(this.x>right) {this.x = right;}
            }
            this.x += this.ax;
            this.y -= this.ay;
            //壁の当たり判定
            var rightEnd = game.width-this.width;
            if (this.x > rightEnd) {//右の壁
              this.x = rightEnd*2-this.x;
              this.ax *= -1;
            }else if(this.x < 0){//左の壁
                this.ax *= -1;
            }else if(this.y < 0){//上の壁
                this.ay *= -1;
            }
            //ブロックの数
            var len=game.blockList.length;
            //弾丸のブロックに対してのあたり判定
            for(var i = 0;i<len;i++){
                if(this.intersect(game.blockList[i])){
                    //移動量を逆方向にする
                    this.ay *= -1;
                    scene.removeChild(game.blockList[i]);
                    game.blockList[i] = 0;
                    cnt = cnt + 1;
                    score.text = "Score:"+ cnt;
                   
                }
            }
            //GAME CLEARの判定:すべてのブロックが壊れたとき
            if(cnt >= len){
                //CLEARの文字表示
                scene.addChild(game_clear);
                //弾丸を非表示
                scene.removeChild(bullet);
            }
            //GAME OVERの判定:弾丸が画面外に出たとき
            if(this.y > BOTTOM_END){scene.addChild(game_over);}
            //弾丸のバーに対してのあたり判定
            if(this.intersect(bar)){
                var t = this.x - (bar.x + bar.width/2);
                //バーの右半分に衝突
                if(t>0){this.ax = t*0.1;}
                //バーの左半分に衝突
                if(t<0){this.ax = t*0.1;}
                //this.ｙ= -this.ｙ;
                this.ay *= -1;
            }
        });
    };
    game.start();
};
