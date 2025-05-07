
window.GC = function(){
 
}
window.已授权 = false;
window.已授权朋友圈 = false;
window.appver = "1.0.0"
console.log("baijie version 1.0.80 1.0.5");
 

window.roleId = ""
 
window.pay_type = 0;

window.tg = window.Telegram.WebApp;
window.tg.ready(); // 初始化完成
window.tg.expand(); //全屏

window.getDevInfo = function(obj){
 
  // console.log(' baijie test getDevInfo !!!!!! ');
  const initDataUnsafe =  window.tg.initDataUnsafe || {};

  // 获取用户基本信息
  const user = initDataUnsafe.user;
  lan = "en"
  //lan = user.language_code;

  var jso = "{\"tianluDevID\":\""+( user?.id || "" )+"\",\"country\":\"CN\",\"vendor\":\"telegramweb\",\"lan\":\""+( user?.language_code || "en" )+"\",\"bundleID\":\"telegramweb\",\"subChannelID\":\"telegramweb\",\"channelID\":\"telegramweb\",\"paytype\":\"0\"}";

   window.SDKInterface.deviceInfoCallback(jso);
 
}

window.entergame = function(){
  window.TLJSINITOK = true
  console.log("enterGame")
  window.initWXAds(
    // ["adunit-1c966258ea138ed5","adunit-fc076741afb20dbd","adunit-45e96722b3aa095d","adunit-680cb52f516ac04c","adunit-149120b76025be9b"], //banner
    // ["adunit-c82dd046a014dbaa"],                                                                                                         //插屏
    // ["adunit-f425e6c177d03d96","adunit-68887b03ae472c04","adunit-dcfbe1a45ae262f8"]                                                      //激励视频         
    null,
    null,
    
    ["adunit-c212442b321a4d09","adunit-4a5791c0ab03f922","adunit-814e740c7b3a69eb"], 
   
  )
  //window.createWXGameClub();
  // window.getUserGameClubData((json)=>{
  //   console.log(" ---------------- ")
  //   console.log(JSON.stringify(json))
  // });
}



window.login_telegramweb = function(){

  console.log("login_telegramweb ");
 
  const initData = window.tg.initData || '';
  const initDataUnsafe =  window.tg.initDataUnsafe || {};

  // 获取用户基本信息
  const user = initDataUnsafe.user;
  console.log("用户信息id：", user.id);
  console.log("原始 initData：", window.Telegram.WebApp.initData);

    var loginJson = {
      "logintype": "TelegramWeb",
      "t3token": window.Telegram.WebApp.initData,
      "t3userid": user.id,
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://nodejsgoogle.onrender.com/telegramVerify', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('验证成功:', JSON.parse(xhr.responseText));
            } else {
                console.error('验证失败:', xhr.status, xhr.responseText);
            }
        }
    };

    const data = {
        t3token: initData,
        t3userid: user.id
    };

    xhr.send(JSON.stringify(data));



    var jsonString = JSON.stringify(loginJson);
    console.log("Login = " +JSON.stringify(jsonString));
    window.SDKInterface.telegramwebLoginCallback(jsonString)
  
}

window.enterSelectGameServer = function(){
    console.log(' enterSelectGameServer !!!!!! ');
   
    window.loginErrorReTryTime = 0;
    window.loginErrorReTryTime2 = 0;
}

window.Pay = function(orderJsonStr){
    var orderJson = JSON.parse(orderJsonStr);
    var data = {
          'orderId':orderJson.orderid,
          'appver':window.appver,
          'goods':orderJson.goodName,
          'money':orderJson.money,
          'ext':orderJson.buyid,
          'uid':window.tgesdkInfo.uid,
          'token':window.tgesdkInfo.token,
          'roleId':orderJson.roleid,
          'roleName':orderJson.roleName,
          'level':orderJson.roleLevel,
          'serverId':orderJson.zoneid,
          'goodsId':orderJson.goodId,
          'goodsDecs':orderJson.goodName,
          'serverName':orderJson.zoneName,
          'num':"1",
          'vip':orderJson.vip,
          //'power':1
     };
    
}


window.ShowOfficialAccounts = function(){
 
}


window.ShowOfficialAccountsForPay = function(){
 
}

window.finishedTutorial  = function(){
 
}

window.loginErrorReTryTime = 0;
window.loginErrorReTryTime2 = 0;
window.statistics = function(jsonStr){
      
       var statisticsJson = JSON.parse(jsonStr);
       window.roleId = statisticsJson.roleid || ""
       console.log("statisticsJson.id = "+statisticsJson.id);
       console.log("statisticsJson jsonStr = "+jsonStr);
      if(statisticsJson.id=="role_create"){
          
          var data = {
            'appver' : window.appver,
            'uid' : window.tgesdkInfo.uid,
            'token':window.tgesdkInfo.token,
            'roleId':statisticsJson.roleid,
            'roleName':statisticsJson.username,
            'roleLevel':"1",
            'roleCTime':statisticsJson.roleCTime,
            'type':2,
            'serverName':statisticsJson.zoneName,
            'serverId':statisticsJson.zoneid,
          };
          // window.TGESDK.setdata(data,function (res) {
          //     console.log(res);
          // });
          console.log("baijie setdata jsonStr = "+JSON.stringify(data));
      } else if(statisticsJson.id=="login_game_server_2" && statisticsJson.success){
             var data = {
                'appver' : window.appver,
                'uid': window.tgesdkInfo.uid,
                'server':statisticsJson.zoneid,
                'roleLevel':"1",
                'role':statisticsJson.username,
                'roleId':statisticsJson.roleid
            };
            // window.TGESDK.entry(data,function (res) {
            //     console.log(res);
            // });
            console.log("baijie entry jsonStr = "+JSON.stringify(data));
            window.loginErrorReTryTime = 0;
            window.loginErrorReTryTime2 = 0;

      }else if(statisticsJson.id=="show_login_ui"){

          console.log(' baijie test defaultLogin !!!!!! ');
             
          try{
              var data = {
                'appver' : window.appver
              };
              window.TGESDK.loginsuccess(data,function (res) {
                  console.log("loginsuccess");
                  console.log(res);
              });

              var data = {
                  'appver' : window.appver,
                  'uid':window.tgesdkInfo.uid,
                  'server':statisticsJson.zoneid,
                  'roleLevel':1,
                  'role':statisticsJson.username,
                  'roleId':statisticsJson.roleid,
                  'power':1
              };
              // window.TGESDK.loginView(data,function (res) {
              //     console.log(res);
              // });
              
              
              console.log("baijie loginView jsonStr = "+JSON.stringify(data));

          }catch(ex){
                if( window.loginErrorReTryTime < 3){
                   window.loginErrorReTryTime+1;
                   setTimeout(() => {
                    console.log('reLoginAll')
                    window.reLoginAll()
                  }, 500);
                }
          }

           if(false){
              setTimeout(() => {
                window.createUserInfoButton([0,0,100,100],()=>{
                  console.log("nickname = "+window.wxName)
                })
              }, 2000);
           }
      }else if(statisticsJson.id=="user_charge_2"){
          var pay_type = statisticsJson.pay_type
          var pay_amount = statisticsJson.pay_amount
          console.log("baijie user_charge_2 user_charge_2 user_charge_2 user_charge_2 user_charge_2 user_charge_2 pay_amount = "+pay_amount);
          window.tgeReportPay(pay_amount);
      }else if(statisticsJson.id=="finish_tutorial"){
          console.log("baijie reportTutorial reportTutorial reportTutorial reportTutorial reportTutorial reportTutorial ");
          // TGESDK.reportTutorial({},function(res){
          //   console.log("baijie reportTutorial = "+JSON.stringify(res));
          // })
      }


    
  
}

function getRandomElement(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
 }

 //adCallback
window.initWXAds = function(bannerIds,insertIds,rewardIds){

  // window.banner = new window.Banner(["adunit-1c966258ea138ed5","adunit-fc076741afb20dbd","adunit-45e96722b3aa095d","adunit-680cb52f516ac04c","adunit-149120b76025be9b"])

  // window.insertAd = new window.InsertAd(["adunit-1c966258ea138ed5","adunit-c82dd046a014dbaa","adunit-c82dd046a014dbaa"]);
 
  // window.rewardAd = new window.RewardAd(["adunit-f425e6c177d03d96","adunit-68887b03ae472c04","adunit-dcfbe1a45ae262f8"]);
  if(bannerIds!=null)
    window.banner = new window.Banner(bannerIds)
  if(insertIds!=null)
    window.insertAd = new window.InsertAd(insertIds);
  if(rewardIds!=null)
    window.rewardAd = new window.RewardAd(rewardIds);

}

 window.playAD = function(){
  console.log("playAD window.rewardAd = "+window.rewardAd)
   if(typeof(window.rewardAd)=='undefined'){
      return false;
   }
   window.rewardAd.show();
   return true;
 }

 window.showBanner = function(){
  window.banner?.hide();
  window.banner?.show(window.DXType.CENTER_HORIZONTAL,window.DYType.BOTTOM,0,0)
 }

 window.hideBanner = function(){
  window.banner?.hide();
 }

 window.showInterstitial = function(){
  window.insertAd?.show();
 }


 

//IOS充值很重要
window.tgeReportPay = function(data){
  
}


window.addFavorites = function(){
    
}


window.createUserInfoButton = function(xywh, onClickCallBack){
  
}
 
window.openAuthSetting = function(callback) {
  console.log(" openAuthSetting !!!! ");
   
}


window.getGameClubData = function(key,callback) {
  
}

 
window.getUserGameClubData = function(callback){
 
 
}


window.miyGameClub = null
window.createWXGameClub = function(){
 
}

window.showGameClubBtn = function(){
  
}

window.hideGameClubBtn = function(){
 
}


window.miyaTransparentGameClub = null
window.miyaTransparentGameClubTapCallBack = null
window.showGameClub = false
window.createTransparentGameClubButton = function(x,y,w,h,callBack){
 
}

window.showTransparentGameClubBtn = function(){
  
}

window.hideTransparentGameClubBtn = function(){
   
}

 

window.deleteDirectoryRecursively = function(dirPath) {
   
  }



window.cleanResourceCache = function(){
 
}


window.totalSize = 0;
 
window.getTotalCacheSize = async function (dirPath) {
 
};
 
window.bytesToMegabytes=function(bytes) {
 
}


window.reLoginAll = function(){
 
}
 
