window.AdStatus = Object.freeze({
    LOADING: 0,
    LOADED: 1,
    ERROR: 2
});

window.DXType = Object.freeze({
    LEFT: -1,
    CENTER_HORIZONTAL: 0,
    RIGHT: 1
});

window.DYType = Object.freeze({
    TOP: -1,
    CENTER_HORIZONTAL: 0,
    BOTTOM: 1
});


window.BaseAd = (function() {
    function BaseAd(_name,_codeId) {
        this.name = _name;
        this.codeId = _codeId;
    }

    // 在构造函数的原型上添加方法
    BaseAd.prototype.show = function( dx , dy , offsetx , offsety ) {
        dx = dx || 0
        dy = dy || 0;
        offsetx = offsetx || 0;
        offsety = offsety || 0;
    };

    // BaseAd.prototype.show = function() {
        
    // };

    BaseAd.prototype.hide = function() {
        
    };
    return BaseAd;
})();


window.Banner = (function() {

        function Banner(codeIds) {
            BaseAd.call(this, "Banner",""); // 调用父类构造函数
        
            this.status = AdStatus.ERROR
            this.isShowing = false;
            this.dx = 0;
            this.dy = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.index = 0;
            this.type = 0;
            this.codeId = "";
            this.codeIds = codeIds;
            this.view = null;
           // this.load();
        }

        Banner.prototype = Object.create(BaseAd.prototype);
        Banner.prototype.constructor = Banner;

        Banner.prototype.getElement = function () {
            var element = this.codeIds[this.index]; // 获取当前索引的元素
            this.index = (this.index + 1) % this.codeIds.length; // 索引递增，到达尾部时重置为 0
            console.log(" element = "+element);
            return element;
        };
        Banner.prototype.setType =  function(_type ) {
            _type = _type || 0
            this.type = _type
        }

        Banner.prototype.load =  function() {
            this.status = AdStatus.LOADING
            this.codeId = this.getElement();
            console.log("Banner show codeId = "+this.codeId)
            this.view = null
            // wx.createBannerAd({
            //     adUnitId: this.codeId, // 必填，从微信公众平台获取
            //     style: {
            //         left: 0,
            //         top: 0,
            //         // width: 350,
            //         // height: 50
            //     }
            // });
            // this.loadlistener = ()=>{
            //     console.log('Banner LOADED');
            //     this.status = AdStatus.LOADED;
            //     if (this.isShowing) {
            //         this.show(this.dx, this.dy, this.offsetX, this.offsetY);
            //     }
            // }
            if(this.view)
                this.view.onResize((res) => {
                // 计算居中的 left 值
                    console.log('Banner onResize w = '+res.width+" h = "+res.height);
                // const left = (window.screenGameWidth - res.width) / 2;

                console.log('Banner onResize window.screenGameWidth = '+window.screenGameWidth+" window.screenGameHeight = "+window.screenGameHeight);
                // // 更新广告位置
                    if(this.dy == DYType.BOTTOM){

                        this.view.style.top = window.screenGameHeight - res.height - 5 + this.offsetY; // 底部对齐

                    }else  if(this.dy == DYType.CENTER_HORIZONTAL){

                        this.view.style.top = (window.screenGameHeight - res.height) / 2 + this.offsetY; // 中部部对齐

                    }else  if(this.dy == DYType.TOP){

                        this.view.style.top = 5; //顶部对齐

                    }
                    if(this.dx == DXType.LEFT){

                        this.view.style.left = 0  + this.offsetX ;

                    }else  if(this.dx == DXType.CENTER_HORIZONTAL){

                        this.view.style.left = (window.screenGameWidth - res.width) / 2  + this.offsetX;

                    }else  if(this.dx == DXType.RIGHT){

                        this.view.style.left =  window.screenGameWidth - res.width   + this.offsetX;

                    }

                   
              });

            if(this.view)  
                this.view.onLoad( ()=>{
                    console.log('Banner LOADED');
                    this.status = AdStatus.LOADED;
                    if (this.isShowing) {
                        this.show(this.dx, this.dy, this.offsetX, this.offsetY);
                    }
                })

            // this.errorlistener = ()=>{
            //     console.log('Banner ERROR');
            //     this.status = AdStatus.ERROR;
            //     this.destroyAd();
            // }
           C
                this.view.onError(()=>{
                    console.log('Banner ERROR');
                    this.status = AdStatus.ERROR;
                    this.destroyAd();
                })

        };

        Banner.prototype.destroyAd  =  function() {
            if(this.view){
                this.view.hide()
                this.view.offLoad();
                this.view.offError();
                this.view.offResize();
                this.view.destroy()
                this.view = null;
            }
            this.isShowing = false;
            this.status = AdStatus.ERROR;
        }

        Banner.prototype.show =  function(  _dx,   _dy,   _offsetX,   _offsetY) {
            this.isShowing = true;
            this.dx = _dx;
            this.dy = _dy;
            this.offsetX = _offsetX;
            this.offsetY = _offsetY;
            console.log(" this.dx = "+ this.dx)
            console.log(" this.dy = "+ this.dy)
            console.log(" this.offsetX = "+ this.offsetX)
            console.log(" this.offsetY = "+ this.offsetY)
            if (this.status == AdStatus.LOADED) {

                if(this.view){
                    this.view.show().then(() => {
                        console.log('Banner广告显示成功');
                    }).catch(err => {
                        console.error('Banner广告显示失败', err);
                        // 处理显示失败的情况，例如提示用户或重新加载广告
                        this.destroyAd();
                    });
                }
        
            } else {
                this.load();
            }
        }

        // Banner.prototype.show() = function(){
        //     this.showWithOffset(0,0,0,0)
        // }

        Banner.prototype.hide = function() {
            this.destroyAd();
        }



    return Banner;
})();

window.InsertAd = (function() {

    function InsertAd(codeIds) {
        BaseAd.call(this, "InsertAd",""); // 调用父类构造函数
    
        this.status = AdStatus.ERROR
        this.isShowing = false;
        this.index = 0;
        
        this.codeIds = codeIds;
  
        this.createView();

    }



    InsertAd.prototype = Object.create(BaseAd.prototype);
    InsertAd.prototype.constructor = InsertAd;

    // InsertAd.prototype.getElement = function () {
    //     var element = this.codeIds[this.index]; // 获取当前索引的元素
    //     this.index = (this.index + 1) % this.codeIds.length; // 索引递增，到达尾部时重置为 0
    //     console.log(" element = "+element);
    //     return element;
    // };

    InsertAd.prototype.getElement = function () {
        var element = this.codeIds[this.index]; // 获取当前索引的元素
        this.index = (this.index + 1) % this.codeIds.length; // 索引递增，到达尾部时重置为 0
        console.log(" element = "+element);
        return element;
    };

    InsertAd.prototype.createView = function(){
        this.codeId = this.getElement();
        this.view = null
        // wx.createInterstitialAd({
        //     adUnitId: this.codeId, // 必填，从微信公众平台获取
        // });
        // this.loadlistener = ()=>{
        //     console.log("InsertAd LOADED")
        //     this.status = AdStatus.LOADED;
        //     if (this.isShowing) {
        //         this.show();
        //     }
        // }
        if(this.view)
            this.view.onLoad( ()=>{
                console.log("InsertAd LOADED")
                this.status = AdStatus.LOADED;
                if (this.isShowing) {
                    this.show();
                }
            })
        // this.errorlistener = ()=>{
        //     console.log("InsertAd ERROR")
        //     this.status = AdStatus.ERROR;
        //     this.isShowing = false;
        //    // this.load();
        // }
        if(this.view)
            this.view.onError( (err)=>{
                console.log("InsertAd ERROR")
                console.error('插屏广告加载失败', err);
            // this.status = AdStatus.ERROR;
            // this.isShowing = false;
                this.destroyAd();
                this.createView();
            })
        // this.offCloselistener = ()=>{
        //     this.status = AdStatus.ERROR;
        //     this.isShowing = false;
        //   //  this.load();
        // }
        if(this.view)
            this.view.onClose(()=>{
                this.status = AdStatus.ERROR;
                this.isShowing = false;
            //  this.load();
            })
        this.load();
    }

    InsertAd.prototype.load =  function() {
        this.status = AdStatus.LOADING
       // this.codeId = this.getElement();
        if(this.view){
            console.log("InsertAd load codeId = "+this.codeId)
            this.view.load()
        }
        

    };
    InsertAd.prototype.destroyAd  =  function() {
        // console.log(this.view)
        if(this.view){
      
            this.view.offLoad();
            this.view.offError();
            this.view.offClose();
            this.view.destroy()
            this.view = null;
        }
        this.isShowing = false;
        this.status = AdStatus.ERROR;
      
    }
    InsertAd.prototype.show =  function() {
        this.isShowing = true;
        console.log(" InsertAd this.status "+this.status)
        if (this.status == AdStatus.LOADED) {
           
            if(this.view){
                console.log(" InsertAd this.show ")
                this.view.show().then(() => {
                    console.log('插屏广告显示成功');
                }).catch((err) => {
                    console.error('插屏广告显示失败', err.errCode);
                    // 处理显示失败的情况，例如提示用户或重新加载广告
                    this.status = AdStatus.ERROR;
                    this.isShowing = false;
                   // this.load();
                    this.destroyAd();
                    this.createView();
                });
            }
    
        }   else {
            this.load();
        }
    }
    InsertAd.prototype.hide = function() {
         this.destroyAd();
    }

    return InsertAd;
})();

window.RewardAd = (function() {
    function RewardAd(codeIds) {
        BaseAd.call(this, "RewardAd",""); // 调用父类构造函数
    
        this.status = AdStatus.ERROR
        this.isShowing = false;
        this.success = false;
        this.index = 0;
        this.codeIds = codeIds;
        this.createView()
    }

    RewardAd.prototype = Object.create(BaseAd.prototype);
    RewardAd.prototype.constructor = RewardAd;

    RewardAd.prototype.getElement = function () {
        var element = this.codeIds[this.index]; // 获取当前索引的元素
        this.index = (this.index + 1) % this.codeIds.length; // 索引递增，到达尾部时重置为 0
        console.log(" element = "+element);
        return element;
    };


    RewardAd.prototype.createView = function(){
        this.codeId = this.getElement();
        this.view = null
        
        // wx.createRewardedVideoAd({
        //     adUnitId: this.codeId, // 必填，从微信公众平台获取
        // });

        if(this.view)  
            this.view.onLoad( ()=>{
                this.status = AdStatus.LOADED;
                console.log("RewardAd LOADED")
                if (this.isShowing) {
                    this.show();
                }
            })
       
        if(this.view)    
            this.view.onError((err)=>{
                this.status = AdStatus.ERROR;
                console.error('激励广告加载失败', err);
                var adJson = {
                        "errcode":2,
                        "plat":"WEIXIN",
                        "msg":"广告展示失败",
                        "adtype":2,
                        "adcontrol":2,
                        "rewardadsucess":"false"
                }
                var jsonString = JSON.stringify(adJson);

                window.SDKInterface?.adCallback?.(jsonString)

                this.destroyAd();
            // this.load();
            })

            if(this.view)  
                this.view.onClose((res)=>{

                    if (res && res.isEnded) {
                        // 用户完整观看了视频，可以下发奖励
                    // console.log('用户完整观看了视频，可以下发奖励');
                        // 这里可以调用下发奖励的逻辑

                        var adJson = {
                                "errcode":1,
                                "plat":"WEIXIN",
                                "msg":"广告关闭",
                                "adtype":2,
                                "adcontrol":1,
                                "rewardadsucess":"true"
                        }
                        var jsonString = JSON.stringify(adJson);
                        window.SDKInterface.adCallback(jsonString)

                    } else {
                        // 用户未完整观看视频，不下发奖励
                    // console.log('用户未完整观看视频，不下发奖励');
                        var adJson = {
                            "errcode":1,
                            "plat":"WEIXIN",
                            "msg":"广告关闭",
                            "adtype":2,
                            "adcontrol":1,
                            "rewardadsucess":"false"
                        }
                        var jsonString = JSON.stringify(adJson);
                        window.SDKInterface?.adCallback?.(jsonString)
                    }
                    this.isShowing = false;
                    this.status = AdStatus.ERROR;
                    this.load();
                })
        this.load();
    }

    RewardAd.prototype.load =  function() {
        this.status = AdStatus.LOADING
        //this.codeId = createSequentialElementExtractor(this.codeIds);
        if(this.view){
            this.view.load();
        }

    };

    RewardAd.prototype.destroyAd  =  function() {
        if(this.view){
 
            this.view.offLoad();
            this.view.offError();
            this.view.offClose();
            this.view.destroy()
            this.view = null;
        }
        this.isShowing = false;
        this.status = AdStatus.ERROR;
        this.createView()
    }


    RewardAd.prototype.show =  function() {
        this.isShowing = true;
        console.log('激励广告显示this.status = '+this.status);
        if (this.status == AdStatus.LOADED) {

            if(this.view){
                this.view.show().then(() => {
                    console.log('激励广告显示成功');

                    var adJson = {
                        "errcode":3,
                        "plat":"WEIXIN",
                        "msg":"广告展示成功",
                        "adtype":2,
                        "adcontrol":2,
                        "rewardadsucess":"false"
                    }
                    var jsonString = JSON.stringify(adJson);
        
                    window.SDKInterface?.adCallback?.(jsonString)


                }).catch(err => {
                    console.error('激励广告显示成功', err);
                    // 处理显示失败的情况，例如提示用户或重新加载广告
                    this.status = AdStatus.ERROR;
                    this.isShowing = false;
                    var adJson = {
                        "errcode":2,
                        "plat":"WEIXIN",
                        "msg":"广告展示失败",
                        "adtype":2,
                        "adcontrol":2,
                        "rewardadsucess":"false"
                    }
                    var jsonString = JSON.stringify(adJson);
        
                    window.SDKInterface?.adCallback?.(jsonString)
                   // this.load();
                   this.destroyAd();
                });
            }
    
        } else if (this.status == AdStatus.LOADING) {

        } else {
            this.load();
        }
    }

    RewardAd.prototype.hide = function() {
        this.destroyAd();
    }

    return RewardAd;
})();

// const accountInfo = wx.getAccountInfoSync();
// const version = accountInfo.miniProgram.version; // 获取小程序版本号
// console.log("ooooooooooooooooooooo = "+version);