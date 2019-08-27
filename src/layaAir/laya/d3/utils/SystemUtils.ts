import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";

export class SystemUtils {
    /**
     * 是否支持纹理格式。
     * @param format 纹理格式。 
     */
    static supportTextureFormat(format: number): boolean {
        switch (format) {
            case BaseTexture.FORMAT_R32G32B32A32:
                if (!LayaGL.layaGPUInstance._isWebGL2 && !LayaGL.layaGPUInstance._oesTextureFloat)
                    return false;
                else
                    return true;
            default:
                return true;
        }
    }

    /**
     * 是否支持渲染纹理格式。
     * @param format 渲染纹理格式。
     */
    static supportRenderTextureFormat(format: number): boolean {
        switch (format) {
            case BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:
                if (!LayaGL.layaGPUInstance._isWebGL2 && !LayaGL.layaGPUInstance._oesTextureHalfFloat && !LayaGL.layaGPUInstance._oesTextureHalfFloatLinear)
                    return false;
                else
                    return true;
            default:
                return true;
        }
    }
}