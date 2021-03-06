import { Laya } from "Laya";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { BlurEffect } from "./BlurShader/BlurEffect";

export class PostProcess_Blur {
	/**
	 *@private
	 */
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Shader3D.debugMode = true;
		BlurEffect.init();
		//加载场景
		Scene3D.load("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);

			//获取场景中的相机
			this.camera = (scene.getChildByName("MainCamera") as Camera);
			//加入摄像机移动控制脚本
			this.camera.addComponent(CameraMoveScript);
			(this.camera as Camera).clearFlag = CameraClearFlags.Sky;
			(this.camera as Camera).cullingMask ^=2;
			//this.camera.active = false;
			(this.camera as Camera).enableHDR = false;
			var mainCamera:Camera = (scene.getChildByName("BlurCamera") as Camera);// MainCamera//(this.camera as Camera).getChildAt(0) as Camera;
			mainCamera.clearFlag = CameraClearFlags.Nothing;
			mainCamera.cullingMask = 2;
			mainCamera.renderingOrder = 1;
			mainCamera.enableHDR = false;
			(this.camera as Camera).addChild(mainCamera);
			mainCamera.transform.localMatrix = new Matrix4x4();

			//增加后期处理
			this.postProcess = new PostProcess();

			var blurEffect:BlurEffect = new BlurEffect();
			this.postProcess.addEffect(blurEffect);
			this.camera.postProcess = this.postProcess;
			
			//设置模糊参数
			blurEffect.downSampleNum =6;
			blurEffect.blurSpreadSize = 1;
			blurEffect.blurIterations = 1;

			//加载UI
			this.loadUI();
		}));
	}

	/**
	 *@private
	 */
	loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			var button: Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "关闭高斯模糊")));
			button.size(200, 40);
			button.labelBold = true;
			button.labelSize = 30;
			button.sizeGrid = "4,4,4,4";
			button.scale(Browser.pixelRatio, Browser.pixelRatio);
			button.pos(Laya.stage.width / 2 - button.width * Browser.pixelRatio / 2, Laya.stage.height - 60 * Browser.pixelRatio);
			button.on(Event.CLICK, this, function (): void {
				var enableHDR: boolean = !!this.camera.postProcess;
				if (enableHDR)
				{
					button.label = "开启高斯模糊";
					this.camera.postProcess = null;

				}
				else{
					button.label = "关闭高斯模糊";
					this.camera.postProcess = this.postProcess;
				}
					
				
			});

		}));
	}
}

