//使用typescript编译
declare var PIXI: any;
declare var TWEEN: any;

//场景的接口
interface iStage {
    //事件
    onComplete: () => void;
    //方法
    ready: (container) => void;
    play: () => void;
    end: () => void;
}
//场景的初始化参数
interface iStageOption {
    //资源列表
    resource?: Array<string>,
    name?: string;
    //资源宽高
    width?: number;
    height?: number;
    speed?: number;
    turnIn?: string;
    turnOut?: string;
    //事件
    onStart?: () => void;
    onEnd?: () => void;
}
//场景的初始化参数默认值
let StageOption = {
    width: 640,
    height: 1136,
    speed: 0.1,
    turnIn: "",
    turnOut: "",
    onStart: function () { },
    onEnd: function () { },
}

//插件对象
class FilmJS {
    //画板的宽
    protected winWidth: number = 640;
    //画板的高
    protected winHeight: number = 1136;
    //画板的引擎对象
    private renderer = null;
    //画板的容器
    private container = null;
    //场景列表
    private stageList: Array<FilmStage> = [];
    //当前使用的场景
    private currStage: number = 0;

    //表演结束
    public onEnd: () => void = function () { };

    //初始化
    constructor(id: string = "game_box") {
        // 获取窗口宽度
        if (window.innerWidth) this.winWidth = window.innerWidth;
        else if ((document.body) && (document.body.clientWidth)) this.winWidth = document.body.clientWidth;
        // 获取窗口高度
        if (window.innerHeight) this.winHeight = window.innerHeight;
        else if ((document.body) && (document.body.clientHeight)) this.winHeight = document.body.clientHeight;
        //初始化引擎
        this.renderer = PIXI.autoDetectRenderer(this.winWidth, this.winHeight, {
            transparent: true,
            view: document.getElementById(id)
        });
        //初始化影棚
        this.container = new PIXI.Container();

    }
    //加入新的场景
    add(stage: FilmStage) {
        this.stageList.push(stage);
    }
    //联合表演
    private pool() {
        console.log(this.currStage);
        let that = this;
        let pre = this.stageList[this.currStage - 1];
        pre.end();
        let curr = this.stageList[this.currStage];
        if (curr) {
            curr.onComplete = function () {
                that.currStage++;
                that.pool();
            }
            curr.play();
        } else {
            console.log("pool");
            this.onEnd();
        }
        let next = this.stageList[this.currStage + 1];
        if (next) {
            next.ready(this.container);
        }
    }
    //准备表演
    start() {
        console.log(this.stageList);
        let that = this;
        //刷新容器的方法
        function loop() {
            requestAnimationFrame(loop);
            that.renderer.render(that.container);
            TWEEN.update();
        }
        loop();
        let stage = this.stageList[this.currStage];
        stage.onComplete = function () {
            that.currStage++;
            that.pool();
        }
        stage.ready(this.container);
    }
    //播放
    action() {
        let that = this;
        let stage = this.stageList[this.currStage];
        stage.onComplete = function () {
            that.currStage++;
            that.pool();
        }
        stage.play();
        let stage2 = this.stageList[this.currStage + 1];
        if (stage2) {
            stage2.ready(this.container);

        }
    }
    //设置默认值
    static extend<T, U>(first: T, second: U): T & U {
        let result = <T & U>{};
        for (let id in first) {
            (<any>result)[id] = (<any>first)[id];
        }
        for (let id in second) {
            if (!result.hasOwnProperty(id)) {
                (<any>result)[id] = (<any>second)[id];
            }
        }
        return result;
    }
    //加载图片资源
    static loadImage(imglist: Array<string>, process?: (index, count) => void, complate?: () => void) {
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
    }
}
//场景对象
class FilmStage implements iStage {
    public options: iStageOption = {};
    private clip: any;
    public onComplete: () => void = function () { };

    constructor(opt: iStageOption) {
        this.options = FilmJS.extend(opt, StageOption);
    }
    private _setOffset() {
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
    }
    //开场准备
    ready(container) {
        console.log(this.options.resource)
        FilmJS.loadImage(this.options.resource, function () { }, function () {
        });
        let list = [];
        for (var i = 0; i < this.options.resource.length; i++) {
            let texture = PIXI.Texture.fromImage(this.options.resource[i]);
            list.push(texture);
        }

        this.clip = new PIXI.extras.AnimatedSprite(list);
        this._setOffset();
        this.clip.loop = false;
        this.clip.animationSpeed = this.options.speed;
        this.clip.onComplete = this.onComplete;
        container.addChild(this.clip);
        this.clip.gotoAndStop(0);
    }
    //播放
    play() {
        console.log("播放：" + this.options.name);
        let that = this;
        this.clip.onComplete = this.onComplete;
        if (this.clip.x != 0 || this.clip.y != 0) {
            let obj = {
                x: this.clip.x,
                y: this.clip.y
            }
            var anim = new TWEEN.Tween(obj).to({ x: 0, y: 0 }, 1000).onUpdate(function () {
                that.clip.x = this.x;
                that.clip.y = this.y;
            }).onComplete(function () {
                that.clip.play();
                that.options.onStart();
            }).start();
        } else {
            this.clip.play();
            that.options.onStart();
        }
    }
    //结束
    end() {
        console.log("播放结束:" + this.options.name);
        let that = this;
        let obj = {
            x: this.clip.x,
            y: this.clip.y,
        }
        var end = {}
        switch (this.options.turnOut) {
            case "left":
                end = { x: -this.options.width, y: 0 }
                break;
            case "right":
                end = { x: this.options.width, y: 0 }
                break;
            default:
                end = { x: 0, y: 0 }
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
    }
}
