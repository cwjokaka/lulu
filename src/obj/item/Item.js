/*
* name;
*/
var Item = (function (_super) {

    function Item() {}


    Laya.class(Item, "Item", _super);

    var _proto = Item.prototype;

    // 类名
    _proto.className = 'Item';
    // 动画前缀
    _proto.aniPre = 'item_';
    // 宽度体型修正
    _proto.widthFix = 5;
    // 高度体型修正
    _proto.heightFix = 5;

    _proto.init = function(opts) {
        _super.call(this, opts);
        // _super.prototype.init.call(this, opts);
        opts = opts || {};
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 3;
        this.score = opts.score || 1;
        this.body = new Laya.Animation();
        this.addChild(this.body);
        this.playAction("fly");
        var bound = this.body.getBounds();
        var newBound = bound.clone();
        newBound.setTo(newBound.x + this.widthFix, newBound.y + this.heightFix, newBound.width - 2 * this.widthFix, newBound.height - 2 * this.heightFix);
        this.setBounds(newBound);
    }

    // 默认移动方式
    _proto.move = function() {
        this.y += this.vy;
    }

    /**
     * 被机体撞击时触发
     * from: 撞击源
     */
    _proto.impactedBy = function(from) {
        this.removeSelf();
        Laya.Pool.recover(this.className, this);
    }

    // 移动与回收
    _proto.moveAndRecover = function() {
        this.move();
        if (this.y > SysConfig.SCREEN_HEIGHT + 30) {
            this.removeSelf();
            Laya.Pool.recover(this.className, this);
        }
    }

    /**
     * 播放动画
     */
    _proto.playAction = function(action){
        this.action = action;
        this.body.play(0, true, this.aniPre + this.action);
        //获取动画大小区域t
        this.bound = this.body.getBounds();
        //设置机身居中
        this.body.pos(-this.bound.width/2, -this.bound.height/2);
    }

    return Item;
}(Laya.Sprite));