enchant();

window.onload = function(){
	var game = new Core(480, 360);
	game.fps = 30;
	game.numRows = 4;    //行
	game.numColumns = 9; //列
	game.preload(
			"img/left_wall.png",
			"img/right_wall.png",
			"img/upper_wall.png",
			"img/block_frames.png",
			"img/paddle.png",
			"img/ball.png",
			"img/message_frames.png");
			//"audio/rattle.mp3");

	var Background = enchant.Class.create(Sprite, {
		initialize: function() {
			var w = game.width,
				h = game.height,
				centerX = w*0.5;
			Sprite.call(this, w, h);
			var bgImage = new Surface(w, h),
				ctx = bgImage.context;           //短い別名をつけて呼び出しを楽にする
			var gradient = ctx.createLinearGradient(
					centerX, 0, centerX, h);     //線形グラデーションを作る
			gradient.addColorStop(0.0, "black"); //開始は黒
			gradient.addColorStop(1.0, "white"); //終わりは白
			ctx.beginPath();                     //パスをリセット
			ctx.rect(0, 0, w, h);                //四角形を描画する
			ctx.closePath();                     //パスを閉じる
			ctx.fillStyle = gradient;            //グラデーションを塗りつぶし
			ctx.fill();                          //塗りつぶす
			this.image = bgImage;
		}
	});

	var Wall = enchant.Class.create(Sprite, {   //左・右・上の壁
		initialize: function(loc) {             
			var obj = {
				left:  { rect: [0, 0, 7, 354], direction: "right" },
				right: { rect: [game.width-7, 0, 7, 354], direction: "left" },
				upper: { rect: [7, 0, 471, 7], direction: "down" }
			};
			var r = obj[loc].rect,
				left = r[0], top = r[1], width = r[2], height = r[3];
			Sprite.call(this, width, height);
			this.x = left;
			this.y = top;
			this.image = game.assets["img/"+loc+"_wall.png"];
			this.reboundDirection = obj[loc].direction;
		}
	});

	var Ball = enchant.Class.create(Sprite, {
		//ボール、少し小さな（ボールが外接円になるような）衝突矩形を持つ
		initialize: function() {
			Sprite.call(this, 16, 15);
			this.image = game.assets["img/ball.png"];
			var rSize = parseInt(this.width*0.8);          //0.8は適当
			this.collisionRect = new Sprite(rSize, rSize); //衝突判定用矩形
			game.rootScene.addChild(this.collisionRect);
			this.reset();

			this.addEventListener("enterframe", function() {
				this.mx = Math.sin(this.angle)*this.speed;
				this.my = Math.cos(this.angle)*this.speed;
				this.moveBy(this.mx, this.my);
				this.collisionRect.moveBy(this.mx, this.my);
				var that = this;
				//ブロック以外との衝突判定
				game.collidables.forEach(function(sprite, idx, arr) {
					if ( that.collisionRect.intersect(sprite) ) {
						that.rebound(sprite.reboundDirection);
					}
				});
				//画面の下へ落ちて、ゲームオーバー
				if (this.y > game.height) {
					//ロードエラー(deffered error)が出るためコメントアウト
					//game.assets["audio/rattle.mp3"].clone().play();
					showMessage("game_over");
				}
			});
		},
		rebound: function(direction) {
			//各方向へ反発させる
			var mv;
			if (direction == "left" || direction == "right") {
				this.angle *= -1;
				mv = 2*this.mx;
				this.x -= mv
				this.collisionRect.x -= mv;
				return;
			}

			if (direction == "down" || direction == "up") {
				this.angle = Math.PI-this.angle;
			} else {
				//角度変化あり
				var v = Math.random()*20*Math.PI/180;
				if (direction == "va_down") {
					this.angle = Math.PI-this.angle+v;
				} else if (direction == "va_up") {
					this.angle = Math.PI-this.angle-v;
				}
			}
			mv = 2*this.my;
			this.y -= mv;
			this.collisionRect.y -= mv;
		},
		reset: function() {
			this.x = game.width*0.5-8;
			this.y = game.height*0.6;
			this.angle = getRaisedAngle();
			this.speed = 3*(60/game.fps);
			this.mx = this.my = 0;
			var rSize = this.collisionRect.width;
			this.collisionRect.moveTo(this.x+(this.width-rSize)*0.5,
			                          this.y+(this.height-rSize)*0.5);
		},
		speedup: function() {
			this.speed += 1;
		}
	});

	var Block = enchant.Class.create(Sprite, {
		initialize: function(x, y, frame) {
			Sprite.call(this, 50, 10);
			this.image = game.assets["img/block_frames.png"];
			this.x = x;
			this.y = y;
			this.frame = frame
		}
	});

	var Blocks = enchant.Class.create(Group, {
		initialize: function() {
			Group.call(this);
			var blockW = 50,
				blockH = 10,
				firstX = (game.width-blockW*game.numColumns)*0.5,
				firstY = (game.height-blockH*game.numRows)*0.2;
			for (var row = 0; row < game.numRows; row++) {
				for (var col = 0; col < game.numColumns; col++) {
					var x = firstX+blockW*col,
						y = firstY+blockH*row;
					this.addChild( new Block(x, y, row) );
				}
			}
			this.addEventListener("enterframe", function() {
				var bs = this.childNodes,
					ball = game.ball;
				for (var i in bs) {
					var block = bs[i];
					//もしボールと衝突したら
					if ( ball.collisionRect.intersect(block) ) {
						var ballCY = ball.y+ball.hegiht*0.5;
						var blockCY = block.y+block.height*0.5;
						var direction = (ballCY < blockCY) ? "va_up" : "va_down";
						ball.rebound(direction);
						this.removeChild(block);
						//縦列の半分ずつ消したら、スピードアップ
						if ( bs.length%parseInt(game.numColumns*0.5) === 0 ) {
							ball.speedup();
						}
						game.info.increaseScore();
					}
				}
				//ブロックを全て消したら
				if (bs.length === 0) {
					showMessage("stage_clear");
				}
			});
		}
	});

	var Paddle = enchant.Class.create(Sprite, {
		initialize: function() {
			Sprite.call(this, 75, 10);
			this.speed = 4*(60/game.fps);
			this.image = game.assets["img/paddle.png"];
			this.leftMoveBoundary = this.width*0.25;  //左移動を開始する境界
			this.rightMoveBoundary = this.width*0.75; //右移動を開始する境界
			this.reboundDirection = "va_up";
			this.reset();
			var that = this;
			game.rootScene.addEventListener("touchmove", function(evt) {
				if (evt.x < that.x+that.leftMoveBoundary) {
					that.x -= that.speed;
				} else if (evt.x > that.x+that.rightMoveBoundary) {
					that.x += that.speed;
				}
			});
		},
		reset: function() {
			this.x = game.width*0.5-parseInt(this.width*0.5);
			this.y = game.height-parseInt(this.height*0.5);
		}
	});

	var Message = enchant.Class.create(Sprite, {
		//ゲームオーバー・ステージクリアを表示するクラス
		initialize: function() {
			Sprite.call(this, 127, 30);
			this.image = game.assets["img/message_frames.png"];
			this.x = (game.width-this.width)*0.5;
			this.y = (game.height-this.height)*0.5;
			this._frmIdx = { game_over: 0, stage_clear: 1 };
			this.tl.hide();
		},
		change: function(state) {
			this.frame = this._frmIdx[state];
		}
	});

	var Information = enchant.Class.create(Group, {
		//スコア・ステージ数を表示するラベルをまとめたクラス
		initialize: function() {
			Group.call(this);
			var that = this;
			[ ["score",     [200, 10] ],
			  ["highScore", [10, 10] ],
			  ["stage",     [400, 10] ] ].forEach(
				function(a, i, arr) {
					var key = a[0],
						pos = a[1];
					var label = new Label();
					label.color = "white";
					label.font = "16px sans-serif";
					label.x = pos[0];
					label.y = pos[1];
					that[key] = label;
					that.addChild(label);
				}
			);
			this._removedBlocks = 0;
			this.resetStage();
			this.resetScore();
			this.resetHighScore();
		},
		increaseScore: function() {
			this._removedBlocks += 1;
			this._score += this._removedBlocks*10;
			this._updateScore();
			if (this._score > this._highScore) {
				this._highScore = this._score;
				this._updateHighScore();
			}
		},
		increaseStage: function() {
			this._removedBlocks = 0;
			this._stage += 1;
			this._updateStage();
		},
		resetScore: function() {
			this._score = 0;
			this._updateScore();
		},
		resetHighScore: function() {
			this._highScore = 0;
			this._updateHighScore();
		},
		resetStage: function() {
			this._removedBlocks = 0;
			this._stage = 1;
			this._updateStage();
		},
		_updateScore: function() {
			this.score.text = "Score: "+this._score;
		},
		_updateHighScore: function() {
			this.highScore.text = "High Score: "+this._highScore;
		},
		_updateStage: function() {
			this.stage.text = "Stage: "+this._stage;
		}
	});

	function getRaisedAngle() {
		//立った（水平でない）角度を返す
		while (true) {
			var angle = Math.random()*2*Math.PI;
			if (Math.abs( Math.sin(angle) ) < 0.7) return angle;
		}
	}

	function showMessage(state) {
		//動きのある物体をシーンから削除
		[game.paddle, game.ball, game.blocks].forEach(function(e, i, arr) {
			game.rootScene.removeChild(e);
		});
		//メッセージを表示後、ゲーム再開
		game.message.change(state);
		game.message.tl.fadeIn(30).delay(60).then(function() {
			this.tl.hide();
			restart(state);
		});
	}

	function restart(state) {
		//ゲーム再開処理
		[game.paddle, game.ball].forEach(function(e, i, arr) {
			e.reset();
			game.rootScene.addChild(e);
		});
		game.blocks = new Blocks();
		game.rootScene.addChild(game.blocks);
		switch (state) {
		case "game_over":
			game.info.resetScore();
			game.info.resetStage();
			break;
		case "stage_clear":
			game.info.increaseStage();
			break;
		default:
			throw "must not happen";
		}
	}

	game.onload = function(){
		game.rootScene.addChild( new Background() );
		game.collidables = []; //ブロック以外のボールと衝突する物体

		["left", "right", "upper"].forEach(function(val, idx, arr) {
			var wall = new Wall(val);
			game.rootScene.addChild(wall);
			game.collidables.push(wall);
		});

		var paddle = new Paddle();
		game.rootScene.addChild(paddle);
		game.paddle = paddle;
		game.collidables.push(paddle);

		var blocks = new Blocks();
		game.rootScene.addChild(blocks);
		game.blocks = blocks;

		var ball = new Ball();
		game.rootScene.addChild(ball);
		game.ball = ball;

		var message = new Message();
		game.rootScene.addChild(message);
		game.message = message;

		var info = new Information();
		game.rootScene.addChild(info);
		game.info = info;
	};

	game.start();
};