!(function(win, undefined) {

    //初始化一个影片对象
    var FilmJS = function(canvasID) {
        this.winWidth = 640;
        this.winHeight = 1136;

        function init() {
            // 获取窗口宽度
            if (window.innerWidth) this.winWidth = window.innerWidth;
            else if ((document.body) && (document.body.clientWidth)) this.winWidth = document.body.clientWidth;
            // 获取窗口高度
            if (window.innerHeight) this.winHeight = window.innerHeight;
            else if ((document.body) && (document.body.clientHeight)) this.winHeight = document.body.clientHeight;

            this.renderer = PIXI.autoDetectRenderer(this.winWidth, this.winHeight, {
                transparent: true,
                view: document.getElementById(canvasID)
            });
        }

        init();
    }

    FilmJS.prototype.add = function() {
        var container = new PIXI.Container();
    }

    //影片的场景对象
    FilmJS.Stage = function() {}


    win.FilmJS = FilmJS;
})(window, undefined)


var film = new FilmJS("game_box");

var stage1 = new FilmJS.Stage({
    resource:["images/"],
    width:640,
    height:1136,
    speed:0.1,
    turnType:"left",
    onStart:function(){
        console.log("场景1开始");
    },
    onEnd:function(){}
});

film.add(stage1);
