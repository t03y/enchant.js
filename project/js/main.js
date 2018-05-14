enchant();
var SCREEN_WIDTH    = 320;
var SCREEN_HEIGHT   = 320;
var CHARA_IMAGE     = "http://enchantjs.com/assets/images/chara1.gif";

/*
 * メイン処理
 */
window.onload = function() {
    // ゲームオブジェクトを生成
    game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
    // 画像読み込み
    game.preload(CHARA_IMAGE);
    
    // ロード完了時の処理
    game.onload = function() {
        // 背景色を変更
        game.rootScene.backgroundColor = "#aaa";
        
        // バーチャルキーパッドを生成
        apad = new APad();
        apad.moveTo(0, 220);
        game.rootScene.addChild(apad);
        
        // 画像を生成, 表示
        sprite = new Sprite(32, 32);
        sprite.image = game.assets[CHARA_IMAGE];
        sprite.moveTo(50, 50);
        
        // 更新処理
        sprite.onenterframe = function() {
            // アナログパッドの入力情報に応じて移動
            if (apad.isTouched === true) {
                this.x += apad.vx*4;
                this.y += apad.vy*4;
            }
        };
        game.rootScene.addChild(sprite);
    };
    
    // ゲーム開始
    game.start();
};