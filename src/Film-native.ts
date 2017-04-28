//使用typescript编译
declare var PIXI: any;
declare var TWEEN: any;


namespace FilmJS2 {
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
    //设置默认值
    function extend<T, U>(first: T, second: U): T & U {
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
    function loadImage(imglist: Array<string>, process?: (index, count) => void, complate?: () => void) {
        let resultList = [];
        let currIndex = 0;
        for (var i = 0; i < imglist.length; i++) {
            (function (src: string, index: number) {
                var img = new Image();
                img.onload = function () {
                    //img.isSuccess = true;
                    process && process(currIndex, imglist.length);
                    currIndex++;
                    if (currIndex >= imglist.length) complate && complate();
                }
                img.onerror = function () {
                    resultList[index] = null;
                    currIndex++;
                    if (currIndex >= imglist.length) complate && complate();
                }
                img.src = imglist[index];
                resultList[index] = img;
            })(imglist[i], i);
        }
        return resultList;
    }
    //插件对象
    export class Screen {
        //画板的宽
        protected winWidth: number = 640;
        //画板的高
        protected winHeight: number = 1136;
        //画板的引擎对象
        private renderer = null;
        //画板的容器
        private container = null;
        private canvas = null;
        private ctx = null;
        //场景列表
        private stageList: Array<Stage> = [];
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
            ////初始化引擎
            //this.renderer = PIXI.autoDetectRenderer(this.winWidth, this.winHeight, {
            //    transparent: true,
            //    view: document.getElementById(id)
            //});
            ////初始化影棚
            //this.container = new PIXI.Container();
            //
            let canvas: any = document.getElementById(id);
            canvas.width = this.winWidth;
            canvas.height = this.winHeight;
            this.ctx = canvas.getContext("2d");
        }
        //加入新的场景
        add(stage: Stage) {
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
            let that = this;
            //刷新容器的方法
            function loop() {
                requestAnimationFrame(loop);
                //that.renderer.render(that.container);
                TWEEN.update();
            }
            loop();
            let stage = this.stageList[this.currStage];
            stage.onComplete = function () {
                that.currStage++;
                that.pool();
            }
            stage.ready(this.ctx);
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
                stage2.ready(this.ctx);

            }
        }
    }
    //场景对象
    export class Stage implements iStage {
        public options: iStageOption = {};
        private clip: any;
        private resource;
        private x: number;
        private y: number;
        private width: number;
        private height: number;
        public onComplete: () => void = function () { };

        constructor(opt: iStageOption) {
            this.options = extend(opt, StageOption);
            this.width = opt.width;
            this.height = opt.height;
            switch (opt.turnIn) {
                case "right":
                    this.x = opt.width;
                    this.y = 0;
                    break;
                case "left":
                    this.x = -opt.width;
                    this.y = 0;
                    break;
                default:
                    this.x = 0;
                    this.y = 0;
                    break;
            }
        }
        //开场准备
        ready(container) {
            let that = this;
            this.resource = loadImage(this.options.resource, function () { }, function () {
                container.drawImage(that.resource[0], that.x, that.y, that.width, that.height);
            });
        }
        private _play() {

        }

        //播放
        play() {
            console.log("播放：" + this.options.name);
            let that = this;
            if (this.x != 0 || this.y != 0) {
                let animation = new TWEEN.Tween({ x: this.x, y: this.y })
                    .to({ x: 0, y: 0 }, 1000).onComplete(function () {
                        that._play();
                    })
                    .start();
            } else {
                that._play();
            }


            //this.clip.onComplete = this.onComplete;
            //if (this.clip.x != 0 || this.clip.y != 0) {
            //    let obj = {
            //        x: this.clip.x,
            //        y: this.clip.y
            //    }
            //    var anim = new TWEEN.Tween(obj).to({ x: 0, y: 0 }, 1000).onUpdate(function () {
            //        that.clip.x = this.x;
            //        that.clip.y = this.y;
            //    }).onComplete(function () {
            //        that.clip.play();
            //        that.options.onStart();
            //    }).start();
            //} else {
            //    this.clip.play();
            //    that.options.onStart();
            //}
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
}