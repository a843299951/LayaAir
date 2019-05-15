import { Config } from "./../../Config";
import { LayaGL } from "../layagl/LayaGL"
	import { Context } from "../resource/Context"
	import { HTMLCanvas } from "../resource/HTMLCanvas"
	import { PlatformInfo } from "../utils/PlatformInfo"
	import { WebGL } from "../webgl/WebGL"
	import { WebGLContext } from "../webgl/WebGLContext"
	import { BlendMode } from "../webgl/canvas/BlendMode"
	import { Shader2D } from "../webgl/shader/d2/Shader2D"
	import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
	import { Value2D } from "../webgl/shader/d2/value/Value2D"
	import { SubmitBase } from "../webgl/submit/SubmitBase"
	import { Buffer2D } from "../webgl/utils/Buffer2D"
import { Stage } from "../display/Stage";
	
	/**
	 * @private
	 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
	 */
	export class Render {
		/** @private */
		 static _context:Context;
		/** @private 主画布。canvas和webgl渲染都用这个画布*/
		 static _mainCanvas:HTMLCanvas;
        /** @private */
        static gStage:Stage=null;
         
		 static supportWebGLPlusCulling:boolean = false;
		 static supportWebGLPlusAnimation:boolean = false;
		 static supportWebGLPlusRendering:boolean = false;
		/**是否是加速器 只读*/
		 static isConchApp:boolean = false;
		/** 表示是否是 3D 模式。*/
		 static is3DMode:boolean;
		
		/**
		 * 初始化引擎。
		 * @param	width 游戏窗口宽度。
		 * @param	height	游戏窗口高度。
		 */
		constructor(width:number, height:number, mainCanv:HTMLCanvas){
			Render._mainCanvas = mainCanv;
			//创建主画布。改到Browser中了，因为为了runtime，主画布必须是第一个
			Render._mainCanvas.source.id = "layaCanvas";
			Render._mainCanvas.source.width = width;
			Render._mainCanvas.source.height = height;
			if (Render.isConchApp)
			{
				document.body.appendChild(Render._mainCanvas.source);
			}
			
			this.initRender(Render._mainCanvas, width, height);
			window.requestAnimationFrame(loop);
			function loop(stamp:number):void {
				Render.gStage._loop();
				window.requestAnimationFrame(loop);
			}
			Render.gStage.on("visibilitychange", this, this._onVisibilitychange);
		}
		
		/**@private */
		private _timeId:number = 0;
		
		/**@private */
		private _onVisibilitychange():void {
			if (!Render.gStage.isVisibility) {
				this._timeId = window.setInterval(this._enterFrame, 1000);
			} else if (this._timeId != 0) {
				window.clearInterval(this._timeId);
			}
		}
		
		 initRender(canvas:HTMLCanvas, w:number, h:number):boolean { 
				function getWebGLContext(canvas:any):WebGLContext {
					var gl:WebGLContext;
					var names:any[] = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
					if (!Config.useWebGL2) {
						names.shift();
					}
					for (var i:number = 0; i < names.length; i++) {
						try {
							gl = canvas.getContext(names[i], {stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer});//antialias为true,premultipliedAlpha为false,IOS和部分安卓QQ浏览器有黑屏或者白屏底色BUG
						} catch (e) {
						}
						if (gl) {
							(names[i] === 'webgl2') && (WebGL._isWebGL2 = true,PlatformInfo.isWebGL2Render=true);
							new LayaGL();
							return gl;
						}
					}
					return null;
				}
				var gl:WebGLContext = LayaGL.instance = WebGLContext.mainContext = getWebGLContext(Render._mainCanvas.source);
				if (!gl)
					return false;
				canvas.size(w, h);	//在ctx之后调用。
				WebGLContext.__init__(gl);
				Context.__init__();
				SubmitBase.__init__();
				
				var ctx:Context = new Context();
				ctx.isMain = true;
				Render._context = ctx;
				canvas._setContext(ctx);
				
				WebGL.shaderHighPrecision = false;
				try {//某些浏览器中未实现此函数，使用try catch增强兼容性。
					var precisionFormat:any = gl.getShaderPrecisionFormat(WebGLContext.FRAGMENT_SHADER, WebGLContext.HIGH_FLOAT);
					precisionFormat.precision ? WebGL.shaderHighPrecision = true : WebGL.shaderHighPrecision = false;
				} catch (e) {
				}
				//TODO 现在有个问题是 gl.deleteTexture并没有走WebGLContex封装的
				LayaGL.instance = gl;
				ShaderDefines2D.__init__();
				Value2D.__init__();
				Shader2D.__init__();
				Buffer2D.__int__(gl);
				BlendMode._init_(gl);
				return true;
		}		
		
		/**@private */
		private _enterFrame(e:any = null):void {
			Render.gStage._loop();
		}
		
		/** 目前使用的渲染器。*/
		 static get context():Context {
			return Render._context;
		}
		
		/** 渲染使用的原生画布引用。 */
		 static get canvas():any {
			return Render._mainCanvas.source;
		}
	}
{
			Render.isConchApp = ((window as any).conch != null);
			if (Render.isConchApp)  {
				Render.supportWebGLPlusCulling = true;
				Render.supportWebGLPlusAnimation = true;
				Render.supportWebGLPlusRendering = true;
				PlatformInfo.supportWebGLPlusRendering = true;
			}
		}
		
