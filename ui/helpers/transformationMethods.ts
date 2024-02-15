import Pixelbin, { transformations } from "@pixelbin/core";

export const watermarkRemover = transformations.WatermarkRemoval.remove;
export const detectWatermarks = transformations.WatermarkDetection.detect;
export const eraseBg = transformations.EraseBG.bg;
export const upscale = transformations.SuperResolution.upscale;
export const aiBackgroundGenerator = transformations.BackgroundGenerator.bg;
export const aIProductTagging = transformations.ProductTagging.tag;

export const detect = transformations.DetectBackgroundType.detect;
export const artifactRemoval = transformations.Artifact.remove;

// export const AI Shadow Generator =  transformations.
// export const  =  transformations.
// export const  =  transformations.
// export const  =  transformations.
// export const  =  transformations.
// export const  =  transformations.
// export const  =  transformations.
