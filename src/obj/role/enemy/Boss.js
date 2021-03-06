/*
* name;
*/
var Boss = (function (_super) {
    function Boss() {
    }

    Laya.class(Boss, "Boss", _super);

    var _proto = Boss.prototype;

    // 类名
    _proto.className = 'Boss';
    // 动画前缀
    _proto.aniPre = 'enemy4_';
    // 宽度体型修正
    _proto.widthFix = 20;
    // 高度体型修正
    _proto.heightFix = 20;

    // 状态枚举
    _proto.stateEnum = {
        SHOW: 0,
        ALIVE: 1,
        HURT: 2,
        DEATH: 3
    };

    // 炮口(偏移量)
    _proto.fireHoles = {
        main: [0, 0],
        right: [-50, 0],
        left: [50, 0]
    }

    // 默认最大生命值
    _proto.maxHp = 150;

     // 物品掉落区间
    _proto.itemDropZone = [
        {from: 0, to: 0.01, item: ItemBoom},
        {from: 0.03, to: 0.10, item: ItemBullet},
        {from: 0.10, to: 0.23, item: ItemHp},
        {from: 0.23, to: 1, item: ItemUpgrade}
    ];

    // 攻击方式
    _proto.attackMode = [
        [
            {bullet: TrebleBulletGroup, delay: 60, repeat: 2, fireHoles: ['main']},
            {bullet: TrebleBulletGroup, delay: 60, repeat: 2, fireHoles: ['left']},
            {bullet: TrebleBulletGroup, delay: 60, repeat: 2, fireHoles: ['right']},
            {bullet: EnemyBullet, delay: 30, repeat: 6, fireHoles: ['main']},
            {bullet: EnemyBullet, delay: 15, repeat: 5, fireHoles: ['main']},
            {bullet: RingBulletGroup, delay: 30, repeat: 10, angleOffset: 5, fireHoles: ['main']},
            {bullet: RingBulletGroup, delay: 30, repeat: 10, angleOffset: -5, fireHoles: ['main']},
        ],
        [

        ]
    ]

    /**
     * 初始化
     */
    _proto.init = function(opts) {
        this.maxHp = this.maxHp * GameHolder.gameData.appearBossIndex* 2;
        opts.hp =  this.maxHp;
        opts.maxHp =  this.maxHp;
        console.log(" this.hp " +  this.maxHp);
        _super.call(this, opts);
        _super.prototype.init.call(this, opts);
        opts = opts || {};
        this.vy = opts.vy || 1;
        this.vx = opts.vx || 1;
        this.dir = 1;
        this.state = this.stateEnum.SHOW;
        this.width = this.body.getBounds().width;
        this.score = 1000;
        this.curForm = 0;
        this.curAttackIndex = 0;
        this.curRepeatCount = 1;
    }

    // 移动
    _proto.move = function() {
        switch(this.state) {
            case this.stateEnum.SHOW:
                this.y += this.vy;
                if (this.y > 200) {
                    this.state = this.stateEnum.ALIVE;
                }
                break;
            case this.stateEnum.ALIVE:
            case this.stateEnum.HURT:
                this.x += this.vx * this.dir;
                if (this.x <= this.width / 2 || this.x >= SysConfig.SCREEN_WIDTH - this.width / 2 ){
                    this.dir = -this.dir;
                }
                break;
            case this.stateEnum.DEATH:
                    //清空子弹
                    for(var i = 0; i < ObjectHolder.enemyBulletBox.numChildren; i++) {
                        ObjectHolder.enemyBulletBox.getChildAt(i).recover();
                    }
                    GameHolder.playState = GameHolder.playStateEnum.BOSS_ENDING;
                //GameHolder.increaseScore(this.score);
                break;
            default:
                break;
        }
    }
    /**
     * 物品掉落
     */
    _proto.dropItem = function() {
        for(var j=0; j < 20; j++){
            var ran = Math.random();
            for(var i in this.itemDropZone) {
                if(ran >= this.itemDropZone[i].from && ran <= this.itemDropZone[i].to){
                    var item = Laya.Pool.getItemByClass(this.itemDropZone[i].item.className, this.itemDropZone[i].item);
                    item.init({x: 30 + Math.random()*(SysConfig.SCREEN_WIDTH - 30), y: -800 * Math.random(), vy: 3});
                    ObjectHolder.itemBox.addChild(item);
                    break;
                }
            }            
        }
    }

    // 攻击
    _proto.attack = function() {
        switch(this.state) {
            case this.stateEnum.SHOW:
                break;
            case this.stateEnum.ALIVE:
            case this.stateEnum.HURT:
                var nowFrame = Laya.timer.currFrame;
                if (this.attackFrame <= nowFrame) {
                    var curAttack = this.attackMode[this.curForm][this.curAttackIndex];
                    if (this.curRepeatCount++ >= curAttack.repeat) {
                        this.curRepeatCount = 1;
                        if (++this.curAttackIndex >= this.attackMode[this.curForm].length) {
                            this.curAttackIndex = 0;
                        }
                    }
                    var fireHoles = curAttack.fireHoles;
                    for (var fireHole of fireHoles) {
                        var fireOffset = this.fireHoles[fireHole];
                        
                        var bulletClass = curAttack.bullet;
                        var bullet = Laya.Pool.getItemByClass(bulletClass.prototype.className, bulletClass);
                        bullet.init({
                            x: this.x + fireOffset[0],
                            y: this.y + fireOffset[1],
                            vy: (Math.random() + 1) * 2,
                            curRepeat: this.curRepeatCount,
                            angleOffset: curAttack.angleOffset
                        });
                        ObjectHolder.enemyBulletBox.addChild(bullet);
                    }
                    this.attackFrame = nowFrame + curAttack.delay;
                }
                break;
            case this.stateEnum.DEATH:
                break;
        }
    }

    /**
     * 被攻击时触发
     * from: 攻击源
     */
    _proto.hitBy = function(from) {
        switch (this.state) {
            case this.stateEnum.SHOW:
                break;
            case this.stateEnum.ALIVE:
            case this.stateEnum.HURT:
                this.hp -= from.atk;
                if (this.bar) {
                    this.bar.setValue(this.hp);
                }
                if(this.hp > 0){
                    this.state = this.stateEnum.HURT;
                    this.playAction('hit');
                } else {
                    this.state = this.stateEnum.DEATH;
                    //掉落奖励
                    this.dropItem();
                    GameHolder.increaseScore(this.score);
                    this.playAction('down');
                }
                break;
            case this.stateEnum.DEATH:
                break;
            default:
                console.error('hitBy未知的敌机状态:', this.state);
        }
    }

    /**
     * 被机体撞击时触发
     * from: 撞击源
     */
    _proto.impactedBy = function(from) {
        
    }


    return Boss;
}(Enemy));