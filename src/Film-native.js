var FilmJS2;
(function (FilmJS2) {
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
    //设置默认值
    function extend(first, second) {
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
    }
    //加载图片资源
    function loadImage(imglist, process, complate) {
        var resultList = [];
        var currIndex = 0;
        for (var i = 0; i < imglist.length; i++) {
            (function (src, index) {
                var img = new Image();
                img.onload = function () {
                    //img.isSuccess = true;
                    process && process(currIndex, imglist.length);
                    currIndex++;
                    if (currIndex >= imglist.length)
                        complate && complate();
                };
                img.onerror = function () {
                    resultList[index] = null;
                    currIndex++;
                    if (currIndex >= imglist.length)
                        complate && complate();
                };
                img.src = imglist[index];
                resultList[index] = img;
            })(imglist[i], i);
        }
        return resultList;
    }
    //插件对象
    var Screen = (function () {
        //初始化
        function Screen(id) {
            if (id === void 0) { id = "game_box"; }
            //画板的宽
            this.winWidth = 640;
            //画板的高
            this.winHeight = 1136;
            //画板的引擎对象
            this.renderer = null;
            //画板的容器
            this.container = null;
            this.canvas = null;
            this.ctx = null;
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
            ////初始化引擎
            //this.renderer = PIXI.autoDetectRenderer(this.winWidth, this.winHeight, {
            //    transparent: true,
            //    view: document.getElementById(id)
            //});
            ////初始化影棚
            //this.container = new PIXI.Container();
            //
            var canvas = document.getElementById(id);
            canvas.width = this.winWidth;
            canvas.height = this.winHeight;
            this.ctx = canvas.getContext("2d");
        }
        //加入新的场景
        Screen.prototype.add = function (stage) {
            this.stageList.push(stage);
        };
        //联合表演
        Screen.prototype.pool = function () {
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
        Screen.prototype.start = function () {
            var that = this;
            //刷新容器的方法
            function loop() {
                requestAnimationFrame(loop);
                //that.renderer.render(that.container);
                TWEEN.update();
            }
            loop();
            var stage = this.stageList[this.currStage];
            stage.onComplete = function () {
                that.currStage++;
                that.pool();
            };
            stage.ready(this.ctx);
        };
        //播放
        Screen.prototype.action = function () {
            var that = this;
            var stage = this.stageList[this.currStage];
            stage.onComplete = function () {
                that.currStage++;
                that.pool();
            };
            stage.play();
            var stage2 = this.stageList[this.currStage + 1];
            if (stage2) {
                stage2.ready(this.ctx);
            }
        };
        return Screen;
    }());
    FilmJS2.Screen = Screen;
    //场景对象
    var Stage = (function () {
        function Stage(opt) {
            this.options = {};
            this.onComplete = function () { };
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
        Stage.prototype.ready = function (container) {
            var that = this;
            this.resource = loadImage(this.options.resource, function () { }, function () {
                container.drawImage(that.resource[0], that.x, that.y, that.width, that.height);
            });
        };
        Stage.prototype._play = function () {
        };
        //播放
        Stage.prototype.play = function () {
            console.log("播放：" + this.options.name);
            var that = this;
            if (this.x != 0 || this.y != 0) {
                var animation = new TWEEN.Tween({ x: this.x, y: this.y })
                    .to({ x: 0, y: 0 }, 1000).onComplete(function () {
                    that._play();
                })
                    .start();
            }
            else {
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
        };
        //结束
        Stage.prototype.end = function () {
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
        return Stage;
    }());
    FilmJS2.Stage = Stage;
})(FilmJS2 || (FilmJS2 = {}));
