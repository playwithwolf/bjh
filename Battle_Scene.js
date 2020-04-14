"use strict";
var Bjh = window.Bjh = window.Bjh || {};
(function(Bjh) 
{
    var Image = Laya.Image;
    var Button = Laya.Button;
    var Label = Laya.Label;
    var ProgressBar = Laya.ProgressBar;
    var Sprite3D = Laya.Sprite3D;
    var Scene = Laya.Scene;
    var Vector3 = Laya.Vector3;
    var Event = Laya.Event;

    var ResourceManager = Laya.ResourceManager;

    var _stage = Laya.stage;
    var _loader = Laya.loader;
    var _timer = Laya.timer;

    var BattleScene = (function() 
    {
        var _super = Bjh.BaseScene;
        Laya.class(BattleScene, "Bjh.BattleScene", _super);
		var p = BattleScene.prototype;  

        var SHOW_CAM_POS = false;
        var FAST_FINISH_TEST = false;
        var SHOW_REQ_STAT = false;

        var SUPER_BTN_H = 170;//190;

        function BattleScene(props) 
        {
            _super.prototype.constructor.call(this);
            
           

            var scene_data = props.data;
            var message = props.message;
            
            this.sceneData = scene_data;            

            this.sceneName = "BattleScene";
            this.battleName = scene_data.name;        
            this.battleType = message.battleType;    
            
            (function()
            {
                var vip_open_lv = Bjh.VipData.GetVipItemOpenLevel("value21");
                var vip_open = (Bjh.Player.vip >= vip_open_lv);
                var player_data = Bjh.VipData.GetItemData(1568);
                var player_open_lv = player_data.openLevel;
                var player_open = (Bjh.Player.level >= player_open_lv);
                this._unlimitSkip = (vip_open || player_open);
                this._freeSkipLeft = message.freeSkipLeft;
                this._freeSkipText = GameText[40210].Format(vip_open_lv, player_open_lv);
            }).call(this);
            
            
           	this._hasAutoSuperFeature = true;//message.autoFightShow;
            

            this._hasSpeedUpFeature = true;

            this._nodeSuperButton = new Sprite();

            if (Bjh.Porting.effConfig.fuben.hasFog)
            {
                this.InitScene3D(scene_data.scenePath, scene_data.skyPath, scene_data.fogArgs, true);
            } else
            {
                this.InitScene3D(scene_data.scenePath, scene_data.skyPath, null, true);
            }
            this.layer3d.name = "BattleScene.layer3d";

            this.camera.active = true;
            var scale = Bjh.Env.gameWidth / (Bjh.Env.gameHeight / 16 * 9);
            if( scale > 1 ) 
                scale = 1;
            this.camera.fieldOfView = 30 / scale;

            this.camera.clearColor = scene_data.cameraClearColor;
            if (SHOW_CAM_POS)
            {
                this.camera.addComponent(Bjh.CameraMoveScript);      
            }      

            if (SHOW_REQ_STAT)
            {
                var label_flag = new Label();
                label_flag.text = "";
                label_flag.color = "#FFFFFF";
                label_flag.fontSize = 28;
                label_flag.pos(0, 0);
                this.fgUI.addChild(label_flag);
                this.labelFlag = label_flag;
            }

            this.battleManager = new Bjh.BattleManager(this);
            this.battleManager.Init(scene_data, message);
            // console.log(message);            

            this._arrDeepClearUrl = scene_data.GetResList();
            this.UpdateDisplayHero();

            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                var cryChild = new Bjh.CryChild();
                cryChild.Init(0);
                cryChild.SetLocalPosition(-2.383, 0.2, 77.482);
                cryChild.SetLocalScale(1.8);
                cryChild.SetLocalEuler(0, 180, 0);         
                this.layer3d.addChild(cryChild);       
                this._dragon = cryChild;
            }

            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                Bjh.SoundAdapter.PlayMusic("guideBattle3",1);
            } else
            {
                if( this.battleType == 2 )  //Pvp
                {
                    Bjh.SoundAdapter.PlayMusic("battlePvP", 1);
                }
               	
                else
                {
                    Bjh.SoundAdapter.PlayMusic("battle1", 1);
                }  
            }             
        }

        p.SetCameraTrans = function(pos, euler)
        {
            this.camera.SetLocalPosition(pos);
            this.camera.SetLocalEuler(euler);
        };

        p.UpdateDisplayHero = function()
        {
            //我方.
            this.battleManager.listMyHero.ForEach(this, function(actor, index)
            {
                this.layer3d.addChild(actor);
            });
            
            //敌方.
            this.battleManager.listEnemyHero.ForEach(this, function(actor, index)
            {
                this.layer3d.addChild(actor);
            });
        };

        p.InitUI = function()
        {
            _super.prototype.InitUI.call(this);

            _stage.on(Event.RESIZE, this, this._OnResize);

            var battle_panel_y = 0 + window.bangSize;
            var show_box = (this.battleManager.message.battleType != Bjh.BattleType.Pvp);
            this.battlePanel = Bjh.UIUtils.addBattlePanel(this.fgUI, 0, battle_panel_y, 400, show_box);              

            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                this.battlePanel.visible = false;
            }                 

            if (SHOW_CAM_POS)
            {
                var camera_pos = new Label();
                camera_pos.text = "camera_pos";
                camera_pos.color = "#FF0000";
                camera_pos.fontSize = 30;
                camera_pos.pos(0, 0);
                this.cameraPos = camera_pos;
                this.fgUI.addChild(camera_pos);

                var camera_rot = new Label();
                camera_rot.text = "camera_rot";
                camera_rot.color = "#FF0000";
                camera_rot.fontSize = 30;
                camera_rot.pos(0, 30);
                this.cameraRot = camera_rot;
                this.fgUI.addChild(camera_rot);
            }
            
            var game_w = Bjh.Env.gameWidth;
            var game_h = Bjh.Env.gameHeight;
            var btn_w = 124;
            var btn_h = SUPER_BTN_H;            

            var btn_y = game_h - btn_h;
            var list_pos = null;
            var hero_count = this.battleManager.listMyHero.Count();
            if(window.testScreen)
            {
                var average = 14;
                if (hero_count == 1)
                {
                    list_pos = 
                    [
                        {x:game_w / 2, y:0},
                    ];
                } else if (hero_count == 2)
                {
                    list_pos = 
                    [
                        {x:game_w / average * 7, y:0},
                        {x:game_w / average * 8, y:0},
                    ];
                } else if (hero_count == 3)
                {
                    list_pos = 
                    [
                        {x:game_w / average * 7, y:0},
                        {x:game_w / average * 6, y:0},
                        {x:game_w / average * 8, y:0},
                    ];
                } else if (hero_count == 4)
                {
                    list_pos = 
                    [
                        {x:game_w / average * 7, y:0},
                        {x:game_w / average * 8, y:0},
                        {x:game_w / average * 6, y:0},
                        {x:game_w / average * 9, y:0},
                    ];
                } else if (hero_count == 5)
                {
                    list_pos = 
                    [
                        {x:game_w / average * 7, y:0},
                        {x:game_w / average * 6, y:0},
                        {x:game_w / average * 8, y:0},
                        {x:game_w / average * 5, y:0},
                        {x:game_w / average * 9, y:0},
                    ];
                }
            }
            else
            {
                if (hero_count == 1)
                {
                    list_pos = 
                    [
                        {x:(game_w / 2), y:0},
                    ];
                } else if (hero_count == 2)
                {
                    list_pos = 
                    [
                        {x:(game_w / 8 * 3), y:0},
                        {x:(game_w / 8 * 5), y:0},
                    ];
                } else if (hero_count == 3)
                {
                    list_pos = 
                    [
                        {x:(game_w / 4), y:0},
                        {x:(game_w / 2), y:0},
                        {x:(game_w / 4 * 3), y:0},
                    ];
                } else if (hero_count == 4)
                {
                    list_pos = 
                    [
                        {x:(game_w / 8 * 1), y:0},
                        {x:(game_w / 8 * 3), y:0},
                        {x:(game_w / 8 * 5), y:0},
                        {x:(game_w / 8 * 7), y:0},
                    ];
                } else if (hero_count == 5)
                {
                    list_pos = 
                    [
                        {x:(game_w / 10 * 1), y:0},
                        {x:(game_w / 10 * 3), y:0},
                        {x:(game_w / 10 * 5), y:0},
                        {x:(game_w / 10 * 7), y:0},
                        {x:(game_w / 10 * 9), y:0}
                    ];
                }
            }
            
            this._arrSuperButton = [];
            this.battleManager.listMyHero.ForEach(this, function(actor, index)
            {
                var pos = list_pos[index];
                var btn_super = this._CreateSuperSkillButton(actor, pos.x, pos.y, btn_w, btn_h);
                btn_super.anchorX = 0.5;
                btn_super.anchorY = 1;  
                this._nodeSuperButton.addChild(btn_super);      
                this._nodeSuperButton.y = game_h;          
                if (Bjh.Device.isIphoneX&&window.ua.indexOf('micromessenger') == -1)
                {
                    this._nodeSuperButton.y -= 25;
                } 
                btn_super.on(Event.CLICK, this, this._SuperSkill, [btn_super.actor]);
                this.fgUI.addChild(this._nodeSuperButton);
                this._arrSuperButton.push(btn_super);
            });
            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                this.HideSuperSkillPanel();
            } 
            //录屏按钮
            var btn_video_x = game_w - 15;
            var btn_video_y = 15 + window.bangSize;

            var btn_video = new Image("total_"+ window.language +"/img_siege_pause.png");            
            btn_video.anchorX = 1;
            btn_video.pos(btn_video_x, btn_video_y);
            Bjh.UIUtils.scale(btn_video);
            btn_video.on(Event.CLICK, this, this.startVideo);

            var btn_stopVideo = new Image("total_"+ window.language +"/img_siege_exit.png");            
            btn_stopVideo.anchorX = 1;
            btn_stopVideo.pos(btn_video_x, btn_video_y);
            Bjh.UIUtils.scale(btn_stopVideo);
            btn_stopVideo.on(Event.CLICK, this, this.stopVideo);
            if (window.isGameRecorderManager)
            {
                this.fgUI.addChild(btn_video); 
                this.fgUI.addChild(btn_stopVideo);  
                btn_video.visible = true;
                btn_stopVideo.visible = false;
            }                
            this._btnVideo = btn_video;    
            this._btnStopVideo = btn_stopVideo;    
             
            //暂停按键.
            var btn_pause_x = game_w - 15;
            var btn_pause_y = 15 + window.bangSize;

            if (window.HANDLE_MINIGAME_CLOSE)
            {
                btn_pause_y += 80;
            }
            var btn_pause = new Image("total_"+ window.language +"/img_siege_pause.png");            
            btn_pause.anchorX = 1;
            btn_pause.pos(btn_pause_x, btn_pause_y);
            Bjh.UIUtils.scale(btn_pause);
            btn_pause.on(Event.CLICK, this, this.PauseDialog);
            if (!Bjh.GuideManager.isGuide 
                && (this.battleManager.message.dId != 1000) 
                && (this.battleManager.message.dId != 1006)
                && (this.battleManager.message.dId != 1004)
                && (this.battleManager.message.dId != 1013))
            {
                this.fgUI.addChild(btn_pause);  //无剧情，才显示.
            }                
            this._btnPause = btn_pause;       

            

            if ( this._hasSpeedUpFeature) //加速功能
            {
                var btn_speed_y = 215 + window.bangSize;;
                if (window.HANDLE_MINIGAME_CLOSE)
                {
                    btn_speed_y += 80;
                }
                var btn_speed_on = new Image("total_"+ window.language +"/img_speedup.png");
                
                btn_speed_on.anchorX = 1;
                btn_speed_on.anchorY = 0;
                btn_speed_on.pos(game_w - 15, btn_speed_y);
                Bjh.UIUtils.scale(btn_speed_on);
                btn_speed_on.on(Event.CLICK, this, this._SetSpeedUp, [true, false]);
                
                this._btnSpeedUpOn = btn_speed_on;

                var btn_speed_off = new Image("total_"+ window.language +"/img_speedup_selected.png");
                btn_speed_off.anchorX = 1;
                btn_speed_off.anchorY = 0;
                
                btn_speed_off.pos(game_w - 15, btn_speed_y);
                Bjh.UIUtils.scale(btn_speed_off);
                btn_speed_off.on(Event.CLICK, this, this._SetSpeedUp, [false, false]);
                if (!Bjh.GuideManager.isGuide)
                {            
                    this.fgUI.addChild(btn_speed_on);      
                    this.fgUI.addChild(btn_speed_off);  
                }
                this._btnSpeedUpOff = btn_speed_off;                

                if( Bjh.Player.speedUpCanUse ) //达成条件
                {
                    if( Bjh.Player.speedUpSelected )
                        this._SetSpeedUp(true,true);
                    else
                        this._SetSpeedUp(false,true);
                }
                else
                {
                    this._btnSpeedUpOff.visible = false;
                    this._SetSpeedUp(false,true);
                }
            }             

            if ( this._hasAutoSuperFeature) //自动战斗
            {
                var btn_auto_y = 115 + window.bangSize;
                if (window.HANDLE_MINIGAME_CLOSE)
                {
                    btn_auto_y += 80;
                }
                var btn_auto_on = new Image("total_"+ window.language +"/img_autofight.png");
                
                btn_auto_on.anchorX = 1;
                btn_auto_on.anchorY = 0;
                btn_auto_on.pos(game_w - 15, btn_auto_y);
                Bjh.UIUtils.scale(btn_auto_on);
                btn_auto_on.on(Event.CLICK, this, this._SetAutoSuper, [true, false]);
                  
                this._btnAutoSuperOn = btn_auto_on;

                var btn_auto_off = new Image("total_"+ window.language +"/img_autofight_selected.png");
                btn_auto_off.anchorX = 1;
                btn_auto_off.anchorY = 0;
                
                btn_auto_off.pos(game_w - 15, btn_auto_y);
                Bjh.UIUtils.scale(btn_auto_off);
                btn_auto_off.on(Event.CLICK, this, this._SetAutoSuper, [false, false]);
                if (!Bjh.GuideManager.isGuide)
                {           
                    this.fgUI.addChild(btn_auto_on);     
                    this.fgUI.addChild(btn_auto_off); 
                }                
                 
                this._btnAutoSuperOff = btn_auto_off;                

                //this._SetAutoSuper(this.battleManager.GetAutoSuper());
                if( Bjh.Player.autoFightCanUse ) //达成条件
                {
                    if( Bjh.Player.autoFightSelected )
                        this._SetAutoSuper(true, true);
                    else
                        this._SetAutoSuper(false, true);
                }
                else
                {
                    this._btnAutoSuperOff.visible = false;
                    this._SetAutoSuper(false, true);
                }

            }

           

            if (this.battleType == Bjh.BattleType.Hunt)
            {
                var hp_bar_boss = new ProgressBar("total_"+ window.language +"/progress_boss.png");
                hp_bar_boss.sizeGrid = "0,21,0,21";
                hp_bar_boss.anchorX = 0.5;
                hp_bar_boss.anchorY = 0;
                hp_bar_boss.pos(game_w / 2, 160);
                Bjh.UIUtils.scale(hp_bar_boss);
                hp_bar_boss.width = 360;
                hp_bar_boss.value = 1;
                this.fgUI.addChild(hp_bar_boss);  
                this._hpBarBoss = hp_bar_boss;

                var label_hp_bar_boss = new Label();
                label_hp_bar_boss.text = "100%";
                label_hp_bar_boss.color = "#FFFFFF";
                label_hp_bar_boss.fontSize = 24;
                label_hp_bar_boss.anchorX = 0.5;
                label_hp_bar_boss.anchorY = 0;
                label_hp_bar_boss.pos(hp_bar_boss.width / 2, 7);
                hp_bar_boss.addChild(label_hp_bar_boss);  
                this._labelHpBarBoss = label_hp_bar_boss;

                this.SetHpBarBossValue(this.battleManager.message.battle.startHp);
            }

            if (FAST_FINISH_TEST)
            {                             
                btn_h /= 2;

                var btn_win = new Button();
                btn_win.pos(game_w - btn_w , (btn_h + 10) * 1);
                btn_win.size(btn_w, btn_h);
                btn_win.graphics.drawRect(0, 0, btn_w, btn_h, "#808080");
                btn_win.label = "胜利";
                btn_win.labelSize = 40;
                btn_win.labelColors = "#FF0000,#00FF00,#0000FF,#808080";
                btn_win.clickHandler = Handler.create(this, this._TestWin, [0], false);
                this.fgUI.addChild(btn_win);

                var btn_lose = new Button();
                btn_lose.pos(game_w - btn_w , (btn_h + 10) * 2);
                btn_lose.size(btn_w, btn_h);
                btn_lose.graphics.drawRect(0, 0, btn_w, btn_h, "#808080");
                btn_lose.label = "失败";
                btn_lose.labelSize = 40;
                btn_lose.labelColors = "#FF0000,#00FF00,#0000FF,#808080";
                btn_lose.clickHandler = Handler.create(this, this._TestLose, [0], false);
                this.fgUI.addChild(btn_lose);               
            }            

            var img_boss_warning = new Image("total_"+ window.language +"/bossshow.png");
            img_boss_warning.anchorX = 0.5;
            img_boss_warning.anchorY = 0.5;
            img_boss_warning.pos(game_w * 0.5, 300);
            Bjh.UIUtils.scale(img_boss_warning);
            
            this.fgUI.addChild(img_boss_warning);  
            img_boss_warning.visible = false;
            this._imgBossWarning = img_boss_warning;

            this._UpdateUI(true);     
        };

        p._OnResize = function()
        {
            if (this._nodeSuperButton)
            {
                this._nodeSuperButton.y = Bjh.Env.gameHeight;
                if (Bjh.Device.isIphoneX&&window.ua.indexOf('micromessenger') == -1)
                {
                    this._nodeSuperButton.y -= 25;
                } 
            }
            if (this._arrSuperButton)
            {
                this._arrSuperButton.forEach(function(btn_super)
                {
                    btn_super.UpdateEffect();
                }, this);
            }
        };

        p.Rebuild = function(props)
        {
            this.curState = Bjh.SceneState.Normal;

            var scene_data = props.data;
            var message = props.message;
            
            this.sceneData = scene_data;            

            this.sceneName = "BattleScene";
            this.battleName = scene_data.name;        
            this.battleType = message.battleType;    

            this.battleManager.Rebuild(this, scene_data, message);

            this._nodeSuperButton = new Sprite();

            this._arrDeepClearUrl = this._arrDeepClearUrl.concat(scene_data.GetResList());
            this._arrDeepClearUrl = Array.Unique(this._arrDeepClearUrl);
            this.UpdateDisplayHero();


            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                Bjh.SoundAdapter.PlayMusic("guideBattle3", 1);
            } else
            {
                if( this.battleType == Bjh.BattleType.Pvp )  //Pvp
                {
                    Bjh.SoundAdapter.PlayMusic("battlePvP", 1);
                } else
                {
                    Bjh.SoundAdapter.PlayMusic("battle1", 1);
                }  
            }      

            this._RebuildUI();
        };

        p._RebuildUI = function()
        {
            var show_box = (this.battleManager.message.battleType != Bjh.BattleType.Pvp);
            this.battlePanel = Bjh.UIUtils.addBattlePanel(this.fgUI, 0, 0, 400, show_box);  

            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld))
            {
                this.battlePanel.visible = false;
            }                    

            if (SHOW_CAM_POS)
            {
                var camera_pos = new Label();
                camera_pos.text = "camera_pos";
                camera_pos.color = "#FF0000";
                camera_pos.fontSize = 30;
                camera_pos.pos(0, 0);
                this.cameraPos = camera_pos;
                this.fgUI.addChild(camera_pos);

                var camera_rot = new Label();
                camera_rot.text = "camera_rot";
                camera_rot.color = "#FF0000";
                camera_rot.fontSize = 30;
                camera_rot.pos(0, 30);
                this.cameraRot = camera_rot;
                this.fgUI.addChild(camera_rot);
            }

            var game_w = Bjh.Env.gameWidth;
            var game_h = Bjh.Env.gameHeight;
            var btn_w = 124;
            var btn_h = SUPER_BTN_H;            

            var btn_y = game_h - btn_h;
            var list_pos = null;
            var hero_count = this.battleManager.listMyHero.Count();
            if (hero_count == 1)
            {
                list_pos = 
                [
                    {x:(game_w / 2), y:0},
                ];
            } else if (hero_count == 2)
            {
                list_pos = 
                [
                    {x:(game_w / 8 * 3), y:0},
                    {x:(game_w / 8 * 5), y:0},
                ];
            } else if (hero_count == 3)
            {
                list_pos = 
                [
                    {x:(game_w / 4), y:0},
                    {x:(game_w / 2), y:0},
                    {x:(game_w / 4 * 3), y:0},
                ];
            } else if (hero_count == 4)
            {
                list_pos = 
                [
                    {x:(game_w / 8 * 1), y:0},
                    {x:(game_w / 8 * 3), y:0},
                    {x:(game_w / 8 * 5), y:0},
                    {x:(game_w / 8 * 7), y:0},
                ];
            } else if (hero_count == 5)
            {
                list_pos = 
                [
                    {x:(game_w / 10 * 1), y:0},
                    {x:(game_w / 10 * 3), y:0},
                    {x:(game_w / 10 * 5), y:0},
                    {x:(game_w / 10 * 7), y:0},
                    {x:(game_w / 10 * 9), y:0}
                ];
            }
            this._arrSuperButton = [];
            this.battleManager.listMyHero.ForEach(this, function(actor, index)
            {
                var pos = list_pos[index];
                var btn_super = this._CreateSuperSkillButton(actor, pos.x, pos.y, btn_w, btn_h);
                btn_super.anchorX = 0.5;
                btn_super.anchorY = 1; 
                this._nodeSuperButton.addChild(btn_super);   
                this._nodeSuperButton.y = game_h;   
                if (Bjh.Device.isIphoneX&&window.ua.indexOf('micromessenger') == -1)
                {
                    this._nodeSuperButton.y -= 25;
                }             
                btn_super.on(Event.CLICK, this, this._SuperSkill, [btn_super.actor]);
                this.fgUI.addChild(this._nodeSuperButton);
                this._arrSuperButton.push(btn_super);
            });

            if (!Bjh.GuideManager.isGuide)
            {
                var btn_pause = new Image("total_"+ window.language +"/img_siege_pause.png");
                btn_pause.anchorX = 1;
                btn_pause.pos(game_w - 15, 15 + window.bangSize);
                btn_pause.on(Event.CLICK, this, this.PauseDialog);
                this.fgUI.addChild(btn_pause);  
                this._btnPause = btn_pause;
            }            

           
            if (this._hasSpeedUpFeature)
            {
                var btn_speed_y = 215 + window.bangSize;
                if (window.HANDLE_MINIGAME_CLOSE)
                {
                    btn_speed_y += 80;
                }
                var btn_speed_on = new Image("total_"+ window.language +"/img_autofight.png");
                btn_speed_on.anchorX = 1;
                btn_speed_on.anchorY = 0;
                btn_speed_on.pos(game_w - 15, btn_speed_y);
                btn_speed_on.on(Event.CLICK, this, this._SetSpeedUp, [true,false]);

                this._btnSpeedUpOn = btn_speed_on;

                var btn_speed_off = new Image("total_"+ window.language +"/img_autofight_selected.png");
                btn_speed_off.anchorX = 1;
                btn_speed_off.anchorY = 0;
                btn_speed_off.pos(game_w - 15, btn_auto_y);
                btn_speed_off.on(Event.CLICK, this, this._SetSpeedUp, [false,false]);
 

                if (!Bjh.GuideManager.isGuide)
                {            
                    this.fgUI.addChild(btn_speed_on);      
                    this.fgUI.addChild(btn_speed_off);  
                }

                this._btnSpeedUpOff = btn_speed_off;                
                if( Bjh.Player.speedUpCanUse ) //达成条件
                {
                    if( Bjh.Player.speedUpSelected )
                        this._SetSpeedUp(true,true);
                    else
                        this._SetSpeedUp(false,true);
                }
                else
                {
                    this._SetSpeedUp(false,true);
                }                
            }   

            if (this._hasAutoSuperFeature)
            {
                var btn_auto_y = 115 + window.bangSize;
                if (window.HANDLE_MINIGAME_CLOSE)
                {
                    btn_auto_y += 80;
                }
                var btn_auto_on = new Image("total_"+ window.language +"/img_autofight.png");
                btn_auto_on.anchorX = 1;
                btn_auto_on.anchorY = 0;
                btn_auto_on.pos(game_w - 15, btn_auto_y);
                btn_auto_on.on(Event.CLICK, this, this._SetAutoSuper, [true, false]);
                this.fgUI.addChild(btn_auto_on);  
                this._btnAutoSuperOn = btn_auto_on;

                var btn_auto_off = new Image("total_"+ window.language +"/img_autofight_selected.png");
                btn_auto_off.anchorX = 1;
                btn_auto_off.anchorY = 0;
                btn_auto_off.pos(game_w - 15, btn_auto_y);
                btn_auto_off.on(Event.CLICK, this, this._SetAutoSuper, [false, false]);
                this.fgUI.addChild(btn_auto_off);  

                if (!Bjh.GuideManager.isGuide)
                {            
                    this.fgUI.addChild(btn_auto_on);      
                    this.fgUI.addChild(btn_auto_off);  
                }

                this._btnAutoSuperOff = btn_auto_off;                

                //this._SetAutoSuper(this.battleManager.GetAutoSuper());
                if( Bjh.Player.autoFightCanUse ) //达成条件
                {
                    if( Bjh.Player.autoFightSelected )
                        this._SetAutoSuper(true,true);
                    else
                        this._SetAutoSuper(false,true);
                }
                else
                {
                    this._SetAutoSuper(false,true);
                }                
            }

         

            if (this.battleType == Bjh.BattleType.Hunt)
            {
                var hp_bar_boss = new ProgressBar("total_"+ window.language +"/progress_boss.png");
                hp_bar_boss.sizeGrid = "0,21,0,21";
                hp_bar_boss.anchorX = 0.5;
                hp_bar_boss.anchorY = 0;
                hp_bar_boss.pos(game_w / 2, 160);
                hp_bar_boss.width = 360;
                hp_bar_boss.value = 1;
                this.fgUI.addChild(hp_bar_boss);  
                this._hpBarBoss = hp_bar_boss;

                var label_hp_bar_boss = new Label();
                label_hp_bar_boss.text = "100%";
                label_hp_bar_boss.color = "#FFFFFF";
                label_hp_bar_boss.fontSize = 24;
                label_hp_bar_boss.anchorX = 0.5;
                label_hp_bar_boss.anchorY = 0;
                label_hp_bar_boss.pos(hp_bar_boss.width / 2, 7);
                hp_bar_boss.addChild(label_hp_bar_boss);  
                this._labelHpBarBoss = label_hp_bar_boss;

                this.SetHpBarBossValue(this.battleManager.message.battle.startHp);
            }

            if (FAST_FINISH_TEST)
            {                             
                btn_h /= 2;

                var btn_win = new Button();
                btn_win.pos(game_w - btn_w , (btn_h + 10) * 1);
                btn_win.size(btn_w, btn_h);
                btn_win.graphics.drawRect(0, 0, btn_w, btn_h, "#808080");
                btn_win.label = "胜利";
                btn_win.labelSize = 40;
                btn_win.labelColors = "#FF0000,#00FF00,#0000FF,#808080";
                btn_win.clickHandler = Handler.create(this, this._TestWin, [0], false);
                this.fgUI.addChild(btn_win);

                var btn_lose = new Button();
                btn_lose.pos(game_w - btn_w , (btn_h + 10) * 2);
                btn_lose.size(btn_w, btn_h);
                btn_lose.graphics.drawRect(0, 0, btn_w, btn_h, "#808080");
                btn_lose.label = "失败";
                btn_lose.labelSize = 40;
                btn_lose.labelColors = "#FF0000,#00FF00,#0000FF,#808080";
                btn_lose.clickHandler = Handler.create(this, this._TestLose, [0], false);
                this.fgUI.addChild(btn_lose);               
            }

            var img_boss_warning = new Image("total_"+ window.language +"/bossshow.png");
            img_boss_warning.anchorX = 0.5;
            img_boss_warning.anchorY = 0.5;
            img_boss_warning.pos(game_w * 0.5, 300);
            this.fgUI.addChild(img_boss_warning);  
            img_boss_warning.visible = false;
            this._imgBossWarning = img_boss_warning;

            this._UpdateUI(true);  
        };

        p.HideSuperSkillPanel = function()
        {
            this._nodeSuperButton.visible = false;
        };

        p.MoveSuperSkillButton = function()
	    {		
            var timeLine = new TimeLine();
            timeLine.dndMark = "MoveSuperSkillButton";
            this._nodeSuperButton.visible = true;
            this._nodeSuperButton.y = SUPER_BTN_H;
            timeLine.addLabel("move",0).to(this._nodeSuperButton,{y:0},2000);
            timeLine.play(1, false);
        }  

        p._CreateSuperSkillButton = function(actor, x, y, w, h)
        {
            var head = Bjh.UIUtils.addBattleHeroHead(this._nodeSuperButton, x, y, actor.tid, actor.quality);                   
            head.actor = actor;
            head.allow = true;      //允许高亮.
            head.hideCount = 0;     //阻止高亮的条件数.
            head.isHpEmpty = false; //血条空.
            head.isMpFull = false;  //怒气满.
            head.OnHpChanged = function(rate)
            {
                // console.log(">>OnHpChanged:[" + this.actor.name + "] : [" + this.m_hp.value + "]->[" + rate + "]");
                this.m_hp.value = rate;
                if (rate <= 0)
                {
                    this.gray = true;
                    this.isHpEmpty = true;
                    this._Update();
                }
            };
            head.OnMpChanged = function(rate)
            {
                // console.log(">>OnMpChanged:[" + this.actor.name + "] : [" + this.m_power.value + "]->[" + rate + "]");
                this.m_power.value = rate;
                var mp_full = (rate == 1);
                if (!this.isMpFull && mp_full)
                {
                    Bjh.SoundAdapter.PlaySound("SuperReady");
                    if (this.actor.isMyGroup && this.actor.battleManager.scene.battleType == Bjh.BattleType.Dungeon)                         
                    {
                        // console.log("SuperReady");
                        if (this.actor.battleManager.message.dId == 1001   //开关.
                            && !Bjh.GuideManager.checkPhaseGuide(Bjh.GuideStep.ReleaseSkill)    //没有触发过ReleaseSkill.
                            && !Bjh.GuideManager.isGuiding(Bjh.GuideStep.ReleaseSkill)          //没有正在执行ReleaseSkill.
                            && !Bjh.GuideManager.isGuiding(Bjh.GuideStep.ReleaseSkill_2)        //没有正在执行ReleaseSkill_2.
                            && !Bjh.GuideManager.isGuiding(Bjh.GuideStep.GuideWorld)            //没有正在执行GuideWorld.
                            && !Bjh.GuideManager.isGuiding(Bjh.GuideStep.SuoErJoinFight)       //没有正在执行SuoErJoinFight.
                            && !Bjh.GuideManager.isGuiding(Bjh.GuideStep.SuoErJoinFight_2)     //没有正在执行SuoErJoinFight_2.
                            )
                        {
                            Bjh.GuideManager.startPhaseGuide(Bjh.GuideStep.ReleaseSkill, 1);
                            Bjh.GuideManager.nextStep(Bjh.GuideStep.ReleaseSkill, Bjh.Guide_ReleaseSkill.Click_hero, true, null, this);  
                        }
                    }
                }
                this.isMpFull = mp_full;                

                this._Update();
            };
            head.OnEffectAllow = function(hide_count)
            {
                head.hideCount += hide_count;

                this._Update();
            };
            head._Update = function()
            {                
                //this.m_highlight.visible = (this.allow && this.isMpFull);
                if (this.isHpEmpty)
                {
                    this._DeleteEffect();
                    return;
                }
                if (this.allow && this.isMpFull && this.hideCount == 0)
                {
                    this._ShowEffect();
                } else    
                {
                    this._DeleteEffect();
                }
            };

            head._ShowEffect = function()
            {                
                var eff_url = Bjh.Porting.resPath + "/UIEffect/E_UI_jinengBtn.lh";
                // this.actor.battleManager.scene._arrDeepClearUrl.push(eff_url);
                var scale = Bjh.Env.gameWidth / (Bjh.Env.gameHeight / 16 * 9);
                if(window.isPC){
                    scale=1;
                }
                Bjh.UIUtils.showUIParticle(this.m_effect, eff_url, scale);         
            };

            head._DeleteEffect = function()
            {
                //console.log("deleteParticle");
                //删除特效
                Bjh.UIUtils.removeUIParticle(this.m_effect);
            };

            head.UpdateEffect = function()
            {
                this._DeleteEffect();
                this._Update();
            };
            actor.SetBattleActorListener(head);
            actor.Modify();
            return head;
        };

        p.SetHeadHighLight = function(is_on)
        {
            for (var i = 0, len = this._arrSuperButton.length; i < len; i++)
            {
                var btn = this._arrSuperButton[i];
                btn.allow = is_on;
                btn._Update();
            }
        };

        p.GetHead = function(hero_id)
        {
            var finded = this._arrSuperButton.find(function(btn)
            {
                return btn.actor.tid == hero_id;
            }, this);
            return finded;
        };        

        p.SetBtnPauseVisible = function(visible)
        {
            if (!this._btnPause)
            {
                return;
            }
            this._btnPause.visible = visible;   
        };

        p.SetBtnPauseEnable = function(enable)
        {
            if (!this._btnPause)
            {
                return;
            }
            this._btnPause.disabled = !enable;            
        };

        p.SetBtnFastFinishVisible = function(visible)
        {
            if (!this._btnFastFinish)
            {
                return;
            }
            this._btnFastFinish.visible = visible;   
        };
        
        p.SetBtnAutoFightVisible = function(visible)
        {
            if (!this._btnAutoSuperOn)
            {
                return;
            }
            this._btnAutoSuperOn.visible = visible;  
            this._btnAutoSuperOff.visible = visible;    
        };   

        p.SetBtnSpeedUpVisible = function(visible)
        {
            if (!this._btnSpeedUpOn)
            {
                return;
            }
            this._btnSpeedUpOn.visible = visible;  
            this._btnSpeedUpOff.visible = visible;    
        };               

        p.SetBtnFastFinishEnable = function(enable)
        {
            if (!this._btnFastFinish)
            {
                return;
            }
            this._btnFastFinish.disabled = !enable;
            // this._fastTickBg.visible = !enable;    //按钮灰，计时显.

            if (enable)
            {                
                if (this.battleManager.message.dId == 1001)
                {
                    if (!this.commonHand)
                    {
                        this.commonHand = new CommonGuideUI();
                        this.commonHand.pos(40, 50);
                        this.commonHand.skewY = -180;
                        this.commonHand.ani1.play();
                        if(this._btnFastFinish.existence)
                        {
                            this._btnFastFinish.addChild(this.commonHand);  
                        }
                        
                    }
                }
            } else
            {
                if (this.commonHand)
                {
                    this.commonHand.removeSelf();
                    this.commonHand = null;
                } 
            }
        };

        p.SetHpBarBossValue = function(value)
        {
            this._hpBarBoss.value = value;
            if (value == 1 || value == 0)
            {
                this._labelHpBarBoss.text = (value * 100) + "%";
            } else
            {
                this._labelHpBarBoss.text = (value * 100).toFixed(2) + "%";
            }
        };

        p._SetAutoSuper = function(is_on, first)
        {
            if (this.battleType == Bjh.BattleType.Pvp)
            {
                Bjh.UIUtils.prompt(GameText[90000]);
                return;
            }

            if( !Bjh.Player.autoFightCanUse ) //达成条件
            {
                if(!first)
                    Bjh.UIUtils.prompt("VIP6或领主30级可使用自动战斗");
                this.battleManager.SetAutoSuper(false);
                return;
            }
            else
            {
                Bjh.Player.autoFightSelected = is_on;
            } 


            this._btnAutoSuperOn.visible = !is_on;  //开启状态，隐藏按钮.
            this._btnAutoSuperOff.visible = is_on;  

            this.battleManager.SetAutoSuper(is_on);
        };

        p._SetSpeedUp = function(is_on, first)
        {
            if( !Bjh.Player.speedUpCanUse ) //达成条件
            {
                if(!first)
                    Bjh.UIUtils.prompt("VIP7或领主40级可使用快速战斗");
                this.battleManager.SetSpeedUp(false);
                return;
            }
            else
            {
                Bjh.Player.speedUpSelected = is_on;
            } 


            this._btnSpeedUpOn.visible = !is_on;  //开启状态，隐藏按钮.
            this._btnSpeedUpOff.visible = is_on;  

            this.battleManager.SetSpeedUp(is_on);
        };        

        p.SetBossWarningVisible = function(visible)
        {
            this._imgBossWarning.visible = visible;
        };

        p._FastFinishBattle = function()
        {
            if (this.battleType == Bjh.BattleType.Dungeon)
            {
                if (this._unlimitSkip || this._freeSkipLeft > 0)     //如果开启了无限制跳过，或者还有剩余免费次数.
                {
                    this.SetBtnPauseVisible(false);
                    this.SetBtnFastFinishVisible(false);
                    this.battleManager.FastFinishBattle();                
                } else
                {                    
                    Bjh.UIUtils.prompt(this._freeSkipText);
                }
            }
        };

        p._TestWin = function()
        {
            this.battleManager.TestFinishBattle(true);
        };

        p._TestLose = function()
        {
            this.battleManager.TestFinishBattle(false);
        };
        p.startVideo = function()
        {
	 
                window.SDK_startVideo();
                btn_video.visible = false;
                btn_stopVideo.visible = true;
             
        }
        p.stopVideo =function()
        {
            window.SDK_stopVideo();
            btn_video.visible = true;
            btn_stopVideo.visible = false;
        }
        p.PauseDialog = function()
        {            
            var type = -1;
            switch (this.battleType)
            {
                case Bjh.BattleType.Dungeon:
                    type = 24;
                    break;

                case Bjh.BattleType.Pvp:
                    if (this.battleManager.isReplayMode)
                    {
                        type = 24;
                    } else
                    {
                        type = 34;
                    }
                    break;

                case Bjh.BattleType.Hunt:
                    type = 24;
                    break;
            }
            this.pauseDialog = Bjh.UIUtils.warnWindowById(type, this,[], "_ExitPause", "_ResumePause");
            _timer.frameOnce(2, this, function()
            {
                _timer.scale = 0;   
            });
        };

        p._ExitPause = function()
        {
            _timer.scale = battleSpeed;

            if (this.battleType == Bjh.BattleType.Pvp && !this.battleManager.isReplayMode)
            {
                this.battleManager.GiveUpBattle();
                MouseManager.instance.disableMouseEvent = true;
                return;
            }

            //放弃战斗时.
            if (Bjh.GuideManager.isGuiding(Bjh.GuideStep.ReleaseSkill))   //结束引导.
            {
                Bjh.GuideManager.nextStep(Bjh.GuideStep.ReleaseSkill, Bjh.Guide_ReleaseSkill.Click_hero, false);  
            }             
            
            //直接回副本地图
            if( this.battleType == Bjh.BattleType.Dungeon )
            {
                this.battleManager.GiveUpBattle();
                if( Bjh.Player.heroEquipmentSaoDangFight ) //从英雄装备进扫荡界面进挑战
                {                    
                    var req = new QUERY_DUNGEON_REQ();                
                    req.dId = this.battleManager.message.dId;
                    req.from = 0;
                    Bjh.Network.send(req);  
                                                        
                }
                else
                {
                    var fuben_data = Bjh.FubenData.GetFubenData(this.battleManager.message.dId);                  
                    var req = new QUERY_DUNGEON_CHARPTER_REQ();
                    req.dtype = fuben_data.type;   
                    req.cId = fuben_data.charpterId;
                    Bjh.Network.send(req);
                    return; 
                }
                
            }
            var handler = new Handler(this, function(message)
            {
                Bjh.UIManager.showFunction(true); 
                switch (this.battleType)
                {
                    case Bjh.BattleType.Pvp:                        
                        var req = new QUERY_ARENA_REQ();
                        Bjh.Network.send(req);  
                        break;

                    case Bjh.BattleType.Hunt:
                        break;
                }
            }, [this.battleManager.message], true);

            Bjh.Mainmenu.firstToCity = true;
            Bjh.Mainmenu.openCityFromBattle(handler);                               
        };

        p._ResumePause = function()
        {
            _timer.scale = battleSpeed;
            this.pauseDialog = null;
            Bjh.Player.synPlayerData();
        };

        p._SuperSkill = function(actor)
        {
            if (actor.GetMpRate() != 1)
                return;
            if (this.battleManager.GetAutoSuper())
            {
                return;
            }   
            Bjh.Player.clientOperationLog('副本战斗放大招' + actor.name); 
            this.battleManager.ExecuteSuperSkill(actor, true);    
        };

        p.OnFrameUpdate = function(frame_tick)
        {
            if (!this.battleManager)	//胡闹补丁.
			{
				// console.log(">>litao:BattleScene.OnFrameUpdate()");
				Bjh.Mainmenu.loadingToCity(null);
			}
            // console.log(this.sceneName + " : " + frame_tick);
            if (SHOW_CAM_POS)
            {
                this.cameraPos.text = this.camera.transform.localPosition.ToString();
                this.cameraRot.text = this.camera.transform.localRotation.ToEuler().ToString();            
            }

            this.battleManager.SetBattleTick(frame_tick);
            this.battleManager.Update();   

            this._UpdateUI(false);        
        };

        p.OnTimeUpdate = function(time_tick)
        {
            // this.battleManager.SetBattleTick(time_tick);
        };

        p._UpdateUI = function(is_force)
        {
            var wave_status = this.battleManager.GetWaveStatus();
            var is_wave_ticking = wave_status.isTicking;
            if (is_wave_ticking || is_force)
            {
                

               this.battlePanel.m_time.text = Bjh.UIUtils.formatTime(wave_status.tick * 0.001, false);  
            }
            this.battlePanel.m_num.text = wave_status.dropCount;
            this.battlePanel.m_level.text = (wave_status.curWaveIdx + 1) + "/" + wave_status.waveCount;

           
        };

        p.OnClose = function()
        {                       
            
            
            _stage.off(Event.RESIZE, this, this._OnResize);

            this._nodeSuperButton = null;
            this._arrSuperButton = null;

            this.battleManager.Clean();
            this.battleManager = null;

            this.pauseDialog = null;

            if (this._cameraScript && this._cameraScript.Clean)
            {
                this._cameraScript.Clean();
            }
            this._cameraScript = null;            

 
            if (this._dragon)
            {
                this._dragon.Clean();
                this._dragon = null;
            }
            
            //ls文件自身必须释放，因为ls文件不支持clone，使用的是内存原版，并且被操作过，不适合重复使用.
            if (Bjh.Porting.effConfig.keepBattleRes && this.battleType == Bjh.BattleType.Dungeon)
            {
                var arr_cache_res_url = Bjh.Player.fubenResCache.GetCacheResList();                
                this._arrDeepClearUrl = Array.Exclude(this._arrDeepClearUrl, arr_cache_res_url);
            }
            this.Clean3DBase(true);
            
            Bjh.Particle3D.ClearPool(Bjh.Porting.resPath + "/UIEffect/E_UI_jinengBtn.lh");
            Bjh.Particle3D.ClearPool(Bjh.Porting.resPath + "/UIEffect/E_UI_zhandoushengli.lh");
            Bjh.Particle3D.ClearPool(Bjh.Porting.resPath + "/UIEffect/E_UI_star.lh");
            Bjh.Particle3D.ClearPool(Bjh.Porting.resPath + "/UIEffect/E_UI_star_1.lh");
            Bjh.Particle3D.ClearPool(Bjh.Porting.resPath + "/UIEffect/E_UI_star_2.lh");

             

            ResourceManager.currentResourceManager._resources = [];
        };

        return BattleScene;
    }());
    Bjh.BattleScene = BattleScene;
})(Bjh || (Bjh = {}));