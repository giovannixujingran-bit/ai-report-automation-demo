import { WORKFLOW_MAPPING } from "./workflow_mapping.js";
import { QUIET_LUXURY_WORKFLOW as QL_WF_DATA } from "./quietLuxuryWorkflow.js";

// 运行时环境变量（由 src/config/env.js 注入，见 env.example.js）
const ENV = (typeof window !== "undefined" && window.__PAIR_ENV__) || {};

if (!ENV.COMFY_API_KEY) {
  console.warn(
    "[appConfig] COMFY_API_KEY 未设置。请确认 src/config/env.js 存在且已填写。" +
    " 首次部署：cp src/config/env.example.js src/config/env.js"
  );
}

export const APP_CONFIG = Object.freeze({
  COMFY_HOST: ENV.COMFY_HOST || "http://127.0.0.1:8188/",
  CMS_UPLOAD_ENDPOINT: ENV.CMS_UPLOAD_ENDPOINT || "",
  RACK_PROXY_BASE_URL: ENV.RACK_PROXY_BASE_URL || "http://127.0.0.1:8787",
  RACK_PROXY_ENDPOINT: "/api/rack-image",
  // CMS 上传已开放匿名访问；保持空值避免附带 token
  CMS_API_TOKEN: ENV.CMS_API_TOKEN || "",
  NODE_CHAPTER_ID: WORKFLOW_MAPPING.WF1.CHAPTER_ID,
  NODE_IMAGE_COUNT: WORKFLOW_MAPPING.WF1.IMAGE_COUNT,
  NODE_SHOWTEXT: WORKFLOW_MAPPING.WF1.SHOW_TEXT,
  NODE_IMAGE_BATCH: WORKFLOW_MAPPING.WF1.IMAGE_BATCH,
  NODE_LOAD_IMAGES: WORKFLOW_MAPPING.WF1.LOAD_IMAGES,
  MAX_CHAPTERS: 8,
  MAX_IMAGES_PER_CHAPTER: 8,
  API_KEY: ENV.COMFY_API_KEY || "",
  WF2: {
    NODE_LLM: WORKFLOW_MAPPING.WF2.GEMINI_NODE,
    NODE_INTERMEDIATE_TEXT: WORKFLOW_MAPPING.WF2.INTERMEDIATE_TEXT,
    NODE_SYSTEM_PROMPT: WORKFLOW_MAPPING.WF2.SYSTEM_PROMPT,
    NODE_CONCAT: WORKFLOW_MAPPING.WF2.TEXT_CONCAT,
    NODE_SHOWTEXT: WORKFLOW_MAPPING.WF2.SHOW_TEXT
  }
});

export const BASE_WORKFLOW = {
  "1": {
    "inputs": { "prompt": ["34", 0], "model": "gemini-2.5-pro", "seed": 427173962752343, "images": ["32", 0] },
    "class_type": "GeminiNode",
    "_meta": { "title": "Google Gemini" }
  },
  "17": { "inputs": { "images": ["32", 0] }, "class_type": "PreviewImage", "_meta": { "title": "Preview Image" } },
  "18": { "inputs": { "text": ["1", 0] }, "class_type": "ShowText|pysssss", "_meta": { "title": "Show Text 🐍" } },
  "19": { "inputs": { "text": "" }, "class_type": "TextInput_", "_meta": { "title": "System Prompt" } },
  "32": {
    "inputs": {
      "inputcount": ["88", 0],
      "image_1": ["64", 0],
      "image_2": ["65", 0],
      "image_3": ["66", 0],
      "image_4": ["67", 0],
      "image_5": ["68", 0],
      "image_6": ["69", 0],
      "image_7": ["70", 0],
      "image_8": ["71", 0]
    },
    "class_type": "ImageBatchMulti",
    "_meta": { "title": "Image Batch Multi" }
  },
  "33": { "inputs": { "text": "" }, "class_type": "TextInput_", "_meta": { "title": "章节图片URL" } },
  "34": {
    "inputs": { "separator": "，", "text1": ["89", 0], "text2": ["19", 0] },
    "class_type": "CR Text Concatenate",
    "_meta": { "title": "🔤 CR Text Concatenate" }
  },
  "55": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "56": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "57": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "58": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "59": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "60": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "61": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "63": { "inputs": { "image": "placeholder.png" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "64": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["55", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "65": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["56", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "66": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["57", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "67": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["58", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "68": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["59", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "69": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["60", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "70": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["61", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "71": {
    "inputs": {
      "side_length": 1024,
      "side": "Longest",
      "upscale_method": "nearest-exact",
      "crop": "disabled",
      "image": ["63", 0]
    },
    "class_type": "DF_Image_scale_to_side",
    "_meta": { "title": "Image scale to side" }
  },
  "88": { "inputs": { "Number": "0" }, "class_type": "Int", "_meta": { "title": "章节图片数量" } },
  "89": {
    "inputs": { "separator": "", "text1": ["90", 0], "text2": ["33", 0] },
    "class_type": "CR Text Concatenate",
    "_meta": { "title": "🔤 CR Text Concatenate" }
  },
  "90": { "inputs": { "text": "" }, "class_type": "TextInput_", "_meta": { "title": "章节ID" } }
};

export const WORKFLOW2 = {
  "2": { "inputs": { "prompt": ["6", 0], "model": "gemini-2.5-pro", "seed": 42 }, "class_type": "GeminiNode", "_meta": { "title": "Google Gemini" } },
  "3": { "inputs": { "text": "" }, "class_type": "TextInput_", "_meta": { "title": "中间合并数据文案" } },
  "4": { "inputs": { "text": "" }, "class_type": "TextInput_", "_meta": { "title": "System Prompt-2" } },
  "6": { "inputs": { "separator": "", "text1": ["4", 0], "text2": ["3", 0] }, "class_type": "CR Text Concatenate", "_meta": { "title": "🔤 CR Text Concatenate" } },
  "7": { "inputs": { "text": ["2", 0] }, "class_type": "ShowText|pysssss", "_meta": { "title": "完成趋势文案" } }
};

export const QUIET_LUXURY_WORKFLOW = QL_WF_DATA;
