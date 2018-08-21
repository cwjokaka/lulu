/*
* 对象管理者
*/
var ObjectHolder = (function () {
    var ObjectHolder = {}

    ObjectHolder.init = function(opts) {
        this.background = new Background();
        this.enemyBox = new Laya.Sprite();
        this.bulletBox = new Laya.Sprite();
        this.itemBox = new Laya.Sprite();
        this.hero = new Laya.Sprite();
    }

    ObjectHolder.reset = function() {
        this.background.destroy();
        this.background = new Background();
        this.enemyBox.destroy();
        this.enemyBox = new Laya.Sprite();
        this.bulletBox.destroy();
        this.bulletBox = new Laya.Sprite();
        this.itemBox.destroy();
        this.itemBox = new Laya.Sprite();
        this.hero.destroy();
        this.hero = new Laya.Sprite();
    }

    return ObjectHolder;
}());
