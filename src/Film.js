//场景的初始化参数默认值
var StageOption = {
    width: 640,
    height: 1136,
    speed: 0.1,
    turnIn: "",
    turnOut: "",
    onStart: function () { },
    onEnd: function () { },
};
//插件对象
var FilmJS = (function () {
    //初始化
    function FilmJS(id) {
        if (id === void 0) { id = "game_box"; }
        //画板的宽
        this.winWidth = 640;
        //画板的高
        this.winHeight = 1136;
        //画板的引擎对象
        this.renderer = null;
        //画板的容器
        this.container = null;
        //场景列表
        this.stageList = [];
        //当前使用的场景
        this.currStage = 0;
        //表演结束
        this.onEnd = function () { };
        // 获取窗口宽度
        if (window.innerWidth)
            this.winWidth = window.innerWidth;
        else if ((document.body) && (document.body.clientWidth))
            this.winWidth = document.body.clientWidth;
        // 获取窗口高度
        if (window.innerHeight)
            this.winHeight = window.innerHeight;
        else if ((document.body) && (document.body.clientHeight))
            this.winHeight = document.body.clientHeight;
        //初始化引擎
        this.renderer = PIXI.autoDetectRenderer(this.winWidth, this.winHeight, {
            transparent: true,
            view: document.getElementById(id)
        });
        //初始化影棚
        this.container = new PIXI.Container();
    }
    //加入新的场景
    FilmJS.prototype.add = function (stage) {
        this.stageList.push(stage);
    };
    //联合表演
    FilmJS.prototype.pool = function () {
        console.log(this.currStage);
        var that = this;
        var pre = this.stageList[this.currStage - 1];
        pre.end();
        var curr = this.stageList[this.currStage];
        if (curr) {
            curr.onComplete = function () {
                that.currStage++;
                that.pool();
            };
            curr.play();
        }
        else {
            console.log("pool");
            this.onEnd();
        }
        var next = this.stageList[this.currStage + 1];
        if (next) {
            next.ready(this.container);
        }
    };
    //准备表演
    FilmJS.prototype.start = function () {
        console.log(this.stageList);
        var that = this;
        //刷新容器的方法
        function loop() {
            requestAnimationFrame(loop);
            that.renderer.render(that.container);
            TWEEN.update();
        }
        loop();
        var stage = this.stageList[this.currStage];
        stage.onComplete = function () {
            that.currStage++;
            that.pool();
        };
        stage.ready(this.container);
    };
    //播放
    FilmJS.prototype.action = function () {
        var that = this;
        var stage = this.stageList[this.currStage];
        stage.onComplete = function () {
            that.currStage++;
            that.pool();
        };
        stage.play();
        var stage2 = this.stageList[this.currStage + 1];
        if (stage2) {
            stage2.ready(this.container);
        }
    };
    //设置默认值
    FilmJS.extend = function (first, second) {
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!result.hasOwnProperty(id)) {
                result[id] = second[id];
            }
        }
        return result;
    };
    //加载图片资源
    FilmJS.loadImage = function (imglist, process, complate) {
        //let resultList = [];
        //let currIndex = 0;
        //for (var i = 0; i < imglist.length; i++) {
        //    (function (src: string) {
        //        var img = new Image();
        //        img.index = i;
        //        img.onload = function () {
        //            img.isSuccess = true;
        //            process && process(currIndex, imglist.length);
        //            currIndex++;
        //            if (currIndex >= imglist.length) complate && complate();
        //        }
        //        img.onerror = function () {
        //            resultList[img.index] = null;
        //            currIndex++;
        //            if (currIndex >= imglist.length) complate && complate();
        //        }
        //        img.src = imglist[i];
        //        resultList[i] = img;
        //    })(imglist[i]);
        //}
        //return resultList;
        //开始加载
        PIXI.loader.add(imglist)
            .on("progress", process)
            .load(complate && complate());
    };
    return FilmJS;
}());
//场景对象
var FilmStage = (function () {
    function FilmStage(opt) {
        this.options = {};
        this.onComplete = function () { };
        this.options = FilmJS.extend(opt, StageOption);
    }
    FilmStage.prototype._setOffset = function () {
        switch (this.options.turnIn) {
            case "right":
                this.clip.x = this.options.width;
                this.clip.y = 0;
                break;
            case "left":
                this.clip.x = -this.options.width;
                this.clip.y = 0;
                break;
            default:
                this.clip.x = 0;
                this.clip.y = 0;
                break;
        }
    };
    //开场准备
    FilmStage.prototype.ready = function (container) {
        console.log(this.options.resource);
        FilmJS.loadImage(this.options.resource, function () { }, function () {
        });
        var list = [];
        for (var i = 0; i < this.options.resource.length; i++) {
            var texture = PIXI.Texture.fromImage(this.options.resource[i]);
            list.push(texture);
        }
        this.clip = new PIXI.extras.AnimatedSprite(list);
        this.clip.width = this.options.width;
        this.clip.height = this.options.height;
        this._setOffset();
        this.clip.loop = false;
        this.clip.animationSpeed = this.options.speed;
        this.clip.onComplete = this.onComplete;
        container.addChild(this.clip);
        this.clip.gotoAndStop(0);
    };
    //播放
    FilmStage.prototype.play = function () {
        console.log("播放：" + this.options.name);
        var that = this;
        this.clip.onComplete = this.onComplete;
        if (this.clip.x != 0 || this.clip.y != 0) {
            var obj = {
                x: this.clip.x,
                y: this.clip.y
            };
            var anim = new TWEEN.Tween(obj).to({ x: 0, y: 0 }, 1000).onUpdate(function () {
                that.clip.x = this.x;
                that.clip.y = this.y;
            }).onComplete(function () {
                that.clip.play();
                that.options.onStart();
            }).start();
        }
        else {
            this.clip.play();
            that.options.onStart();
        }
    };
    //结束
    FilmStage.prototype.end = function () {
        console.log("播放结束:" + this.options.name);
        var that = this;
        var obj = {
            x: this.clip.x,
            y: this.clip.y,
        };
        var end = {};
        switch (this.options.turnOut) {
            case "left":
                end = { x: -this.options.width, y: 0 };
                break;
            case "right":
                end = { x: this.options.width, y: 0 };
                break;
            default:
                end = { x: 0, y: 0 };
                break;
        }
        var anim = new TWEEN.Tween(obj).to(end, 1000).onUpdate(function () {
            that.clip.x = this.x;
        }).onComplete(function () {
            that.options.onEnd();
        }).start();
        console.log(anim);
        setTimeout(function () {
            that.clip.destroy();
        }, 2000);
    };
    return FilmStage;
}());
//# sourceMappingURL=Film.js.map