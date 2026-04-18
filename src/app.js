import { REPORT_CONFIGS, DEFAULT_REPORT_TYPE } from "../config.js?v=20260325-theme-sync-audit";
import { APP_CONFIG, BASE_WORKFLOW, WORKFLOW2, QUIET_LUXURY_WORKFLOW } from "./config/appConfig.js";
import { STYLE_PLANNING_WORKFLOWS } from "./config/stylePlanningWorkflows.js";
import { CONSUMER_PORTRAIT_WORKFLOW } from "./config/consumerPortraitWorkflow.js";
import { getStylePlanningConfig } from "./config/stylePlanningMapping.js";
import { getThemeThemePlanningConfig } from "./config/themeThemePlanningMapping.js?v=20260326-theme-global-summary-fix";
console.log("[App] Loaded. Version timestamp: " + Date.now());
// import { state, persistState } from './config/state.js'; // REMOVED: Duplicate declaration
import { WORKFLOW_MAPPING } from "./config/workflow_mapping.js";
import { createApiClient } from "./api/client.js";
import { TemplateService } from "./services/templateService.js";
import { CmsUploadService } from "./services/cmsUploadService.js";
import { createI18n } from "./i18n/index.js";

// [Merge Workflows at Runtime]
STYLE_PLANNING_WORKFLOWS.consumerPortrait = CONSUMER_PORTRAIT_WORKFLOW;

import { DraftService } from "./services/draftService.js";

const CONFIG = APP_CONFIG;
const apiClient = createApiClient(CONFIG);
const templateService = new TemplateService({ reportConfigs: REPORT_CONFIGS });
const cmsUploadService = new CmsUploadService({
    endpoint: CONFIG.CMS_UPLOAD_ENDPOINT,
    token: CONFIG.CMS_API_TOKEN
});
const draftService = new DraftService(); // Initialize DraftService
window.uploadFileToCMS = async (file) => {
    try {
        const res = await cmsUploadService.uploadImages([file]);
        if (Array.isArray(res) && res.length > 0) return res[0].url;
        if (res && res.url) return res.url;
        return null;
    } catch (e) {
        console.error("Global uploadFileToCMS error:", e);
        throw e;
    }
};
const AUTO_DRAFT_INTERVAL_SECONDS = 30;
const AUTO_DRAFT_TITLE = "自动保存草稿";
const AUTO_DRAFT_ID_STORAGE_KEY = "pop-ai-auto-draft-id-v1";
let __autoDraftTimer = null;
let __autoDraftSaving = false;
let __autoDraftLastSignature = "";
let __autoDraftId = "";
let __autoDraftInitDone = false;
const LOCALE_STORAGE_KEY = "pop-ai-locale";
const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || "zh";
const RACK_COLOR_DISPLAY_CHAPTER_ID = "rack-color-display-page";
const RACK_RESULT_KEY = "rack_generated_image";
const RACK_SOURCE_IMAGE_LIMIT = 14;
const THEME_THEME_TEXT_PROXY_ENDPOINT = "/api/theme-story-text";
const RACK_IMAGE_SOURCE = "rack_image";
const RACK_MODE_KEY = "rack_display_mode";
const RACK_MODE_RACK = "rack";
const RACK_MODE_FLOOR = "floor_rack";
const RACK_MODE_WALL = "wall_minimal";
const RACK_MODE_METAL = "metal_arc";
const RACK_MODE_CORNER = "corner_l_shape";
const RACK_PROMPT_KEY_BY_MODE = Object.freeze({
    [RACK_MODE_RACK]: "rack_prompt_rack",
    [RACK_MODE_FLOOR]: "rack_prompt_floor",
    [RACK_MODE_WALL]: "rack_prompt_wall",
    [RACK_MODE_METAL]: "rack_prompt_metal",
    [RACK_MODE_CORNER]: "rack_prompt_corner"
});
const RACK_PROMPT_FILE_BY_MODE = Object.freeze({
    [RACK_MODE_RACK]: "prompts/ai挂杆.txt",
    [RACK_MODE_FLOOR]: "prompts/ai落地衣架.txt",
    [RACK_MODE_WALL]: "prompts/ai极简墙面风.txt",
    [RACK_MODE_METAL]: "prompts/ai金属风.txt",
    [RACK_MODE_CORNER]: "prompts/aiL型转角空间.txt"
});
const RACK_PROMPT_REMOVED_PHRASES = Object.freeze([
    'A clean black "pop-ai design" logo in a minimalist sans-serif font is displayed on the right wall.'
]);
const RACK_METAL_LEGACY_BLOCK = `A continuous curved metal clothing rack runs along the wall following the arc of the space

The rack is installed at a diagonal slanted tilt angled from left lower to right higher creating a dynamic inclined display

Garments are hung following the tilt direction forming a natural cascading arrangement along the slope

All garments are evenly spaced with consistent hanger alignment maintaining clean and organized presentation`;
const RACK_METAL_UPDATED_BLOCK = `A continuous curved metal clothing rack runs along the wall following the arc of the space
The clothing rack itself remains perfectly horizontal and level

Garments are displayed in a slanted hanging arrangement on the horizontal rack
Each garment is angled diagonally while hanging creating a deliberate tilted styling presentation
The hangers remain attached to the horizontal rack but the garments lean at a controlled angle rather than hanging vertically straight down
The garments form a visually dynamic diagonal display while maintaining neat spacing and clean order`;
const RACK_METAL_LEGACY_CONSTRAINTS = `Do not change clothing design
Do not change color
Do not restyle outfits
Do not alter order
Do not add extra garments`;
const RACK_METAL_UPDATED_CONSTRAINTS = `Do not change clothing design
Do not change color
Do not restyle outfits
Do not alter order
Do not add extra garments
Do not tilt the rack
Keep the rack horizontal
Only the garments are slanted`;
const RACK_METAL_LEGACY_ENHANCEMENT = `diagonal slanted clothing rack tilt left lower to right higher cascading garments strict order preservation symmetrical layout`;
const RACK_METAL_UPDATED_ENHANCEMENT = `horizontal rack with diagonally slanted garments tilted hanging styling dynamic fashion display strict order preservation symmetrical layout`;
const rackPromptTemplateCache = new Map();
const LEGACY_SPECIAL_COMPOSITION_CHAPTER_IDS = new Set(["style-outfit-page", "keyItemsDirectory"]);
const REPORT_TYPE_STYLE_PLANNING = "style_planning";
const REPORT_TYPE_THEME_THEME_PLANNING = "theme_theme_planning";
const PLANNING_REPORT_TYPES = new Set([REPORT_TYPE_STYLE_PLANNING, REPORT_TYPE_THEME_THEME_PLANNING]);
const THEME_THEME_PREVIEW_VIEWPORT = Object.freeze({ width: 1366, height: 980 });
const THEME_THEME_DIRECTORY_SYNC_CONFIG = Object.freeze({
    themeItems: Object.freeze({
        directoryId: "themeItemsDirectory",
        detailPrefix: "themeItemDetail",
        fieldPrefix: "item",
        maxCount: 6,
        name: "主题单品"
    }),
    keyItems: Object.freeze({
        directoryId: "keyItemsDirectory",
        detailPrefix: "patternDetail",
        fieldPrefix: "item",
        maxCount: 6,
        name: "主题元素"
    })
});
const THEME_THEME_DYNAMIC_PAGE_GROUPS = Object.freeze({
    themeItems: Object.freeze({
        type: "themeItems",
        firstId: "themeItemDetail1",
        ids: Object.freeze([
            "themeItemDetail1",
            "themeItemDetail2",
            "themeItemDetail3",
            "themeItemDetail4",
            "themeItemDetail5",
            "themeItemDetail6"
        ]),
        title: "单品细节"
    }),
    themeEvent: Object.freeze({
        type: "themeEvent",
        firstId: "theme-event",
        ids: Object.freeze(["theme-event", "theme-event-continued", "theme-event-3", "theme-event-4"]),
        title: "主题事件"
    }),
    groupStyling: Object.freeze({
        type: "groupStyling",
        firstId: "group-styling-page",
        ids: Object.freeze(["group-styling-page", "group-styling-page-2", "group-styling-page-3", "group-styling-page-4"]),
        title: "组货搭配"
    }),
    rackDisplay: Object.freeze({
        type: "rackDisplay",
        firstId: "rack-color-display-page",
        ids: Object.freeze([
            "rack-color-display-page",
            "rack-color-display-page-2",
            "rack-color-display-page-3",
            "rack-color-display-page-4"
        ]),
        title: "挂杆陈列"
    }),
    themeVisualEditorial: Object.freeze({
        type: "themeVisualEditorial",
        firstId: "theme-visual-editorial",
        ids: Object.freeze(["theme-visual-editorial", "theme-visual-editorial-2", "theme-visual-editorial-3", "theme-visual-editorial-4"]),
        title: "形象大片"
    }),
    visualDisplay: Object.freeze({
        type: "visualDisplay",
        firstId: "visual-display-page",
        ids: Object.freeze(["visual-display-page", "visual-display-page-2", "visual-display-page-3"]),
        title: "视觉陈列"
    })
});

function matchDynamicPageGroupId(chapterId, config) {
    const id = String(chapterId || "");
    if (!id || !config) return false;
    if (Array.isArray(config.ids)) return config.ids.includes(id);
    if (config.pattern instanceof RegExp) return config.pattern.test(id);
    return false;
}

function getDynamicPageGroupConfigByType(type, reportType = state?.currentReportType) {
    switch (type) {
        case "keyItem":
            return { type, firstId: "keyItem1", pattern: /^keyItem\d+$/, title: "单品细节" };
        case "patternDetail":
            return { type, firstId: "patternDetail1", pattern: /^patternDetail\d+$/, title: "图案细节" };
        case "brandDetail":
            return { type, firstId: "brandDetail1", pattern: /^brandDetail\d+$/, title: "品牌推荐" };
        default:
            if (isThemeThemePlanningType(reportType)) {
                return THEME_THEME_DYNAMIC_PAGE_GROUPS[type] || null;
            }
            return null;
    }
}

function getDynamicPageGroupType(chapterId, reportType = state?.currentReportType) {
    const id = String(chapterId || "");
    if (/^keyItem\d+$/.test(id)) return "keyItem";
    if (/^patternDetail\d+$/.test(id)) return "patternDetail";
    if (/^brandDetail\d+$/.test(id)) return "brandDetail";
    if (isThemeThemePlanningType(reportType) && isThemeThemeItemDetailId(id)) return "themeItems";
    if (!isThemeThemePlanningType(reportType)) return "";
    const match = Object.values(THEME_THEME_DYNAMIC_PAGE_GROUPS).find((config) => config.ids.includes(id));
    return match ? match.type : "";
}

function findNextInactiveDynamicPageIndex(type, reportType = state?.currentReportType) {
    const groupConfig = getDynamicPageGroupConfigByType(type, reportType);
    if (!groupConfig) return -1;
    return state.chapters.findIndex((chapter) =>
        matchDynamicPageGroupId(chapter?.id, groupConfig) && chapter?.isActive === false
    );
}

function isStylePlanningType(reportType = state?.currentReportType) {
    return reportType === REPORT_TYPE_STYLE_PLANNING;
}

function isThemeThemePlanningType(reportType = state?.currentReportType) {
    return reportType === REPORT_TYPE_THEME_THEME_PLANNING;
}

function isThemeThemeItemDetailId(chapterId) {
    return /^themeItemDetail\d+$/.test(String(chapterId || ""));
}

function isThemeThemeElementDetailId(chapterId) {
    return /^patternDetail\d+$/.test(String(chapterId || ""));
}

function isThemeThemeDetailId(chapterId) {
    return isThemeThemeItemDetailId(chapterId) || isThemeThemeElementDetailId(chapterId);
}

function shouldSyncDynamicDirectory(type, reportType = state?.currentReportType) {
    if (["keyItem", "patternDetail", "brandDetail"].includes(type)) return true;
    return isThemeThemePlanningType(reportType) && type === "themeItems";
}

function isPlanningReportType(reportType = state?.currentReportType) {
    return PLANNING_REPORT_TYPES.has(reportType);
}

function getPreferredLivePreviewViewport(reportType = state?.currentReportType) {
    if (isThemeThemePlanningType(reportType)) {
        return THEME_THEME_PREVIEW_VIEWPORT;
    }
    return null;
}

function cleanupLivePreviewViewport(cleanupKey) {
    if (!cleanupKey) return;
    const cleanup = window[cleanupKey];
    if (typeof cleanup === "function") {
        try {
            cleanup();
        } catch (err) {
            console.warn("[Preview] Failed to cleanup viewport adapter:", err);
        }
    }
    window[cleanupKey] = null;
}

function attachLivePreviewViewport(iframe, container, reportType = state?.currentReportType, cleanupKey = "") {
    if (!iframe) return;
    if (cleanupKey) cleanupLivePreviewViewport(cleanupKey);

    const resetLayout = () => {
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.maxWidth = "none";
        iframe.style.maxHeight = "none";
        iframe.style.transform = "none";
        iframe.style.transformOrigin = "";
        iframe.style.border = "none";
    };

    const viewport = getPreferredLivePreviewViewport(reportType);
    if (!viewport || !container) {
        resetLayout();
        return;
    }

    const applyLayout = () => {
        const containerWidth = container.clientWidth || 0;
        const containerHeight = container.clientHeight || 0;
        if (!containerWidth || !containerHeight) return;

        const scaleWidth = Math.min(containerWidth / viewport.width, 1);
        const scaleHeight = Math.min(containerHeight / viewport.height, 1);
        const shouldFillThemeThemeStep1Preview =
            isThemeThemePlanningType(reportType)
            && cleanupKey === "__cleanupStep1LivePreviewViewport"
            && scaleWidth <= scaleHeight;

        const scale = shouldFillThemeThemeStep1Preview
            ? scaleWidth
            : Math.min(scaleWidth, scaleHeight, 1);
        const iframeHeight = shouldFillThemeThemeStep1Preview
            ? Math.max(viewport.height, Math.ceil(containerHeight / Math.max(scale, 0.0001)))
            : viewport.height;
        const scaledWidth = viewport.width * scale;
        const scaledHeight = iframeHeight * scale;
        const left = Math.max((containerWidth - scaledWidth) / 2, 0);
        const top = isThemeThemePlanningType(reportType)
            ? 0
            : Math.max((containerHeight - scaledHeight) / 2, 0);

        iframe.style.position = "absolute";
        iframe.style.top = `${top}px`;
        iframe.style.left = `${left}px`;
        iframe.style.width = `${viewport.width}px`;
        iframe.style.height = `${iframeHeight}px`;
        iframe.style.maxWidth = "none";
        iframe.style.maxHeight = "none";
        iframe.style.transformOrigin = "top left";
        iframe.style.transform = `scale(${scale})`;
        iframe.style.border = "none";
        iframe.style.background = "#fff";
    };

    const handleResize = () => applyLayout();
    const handleLoad = () => applyLayout();
    let resizeObserver = null;

    if (typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(() => applyLayout());
        resizeObserver.observe(container);
    }

    iframe.addEventListener("load", handleLoad);
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(applyLayout);
    setTimeout(applyLayout, 0);

    const cleanup = () => {
        if (resizeObserver) resizeObserver.disconnect();
        iframe.removeEventListener("load", handleLoad);
        window.removeEventListener("resize", handleResize);
    };

    if (cleanupKey) {
        window[cleanupKey] = cleanup;
    }
}

function configureStep1LivePreviewContainerLayout(container, reportType = state?.currentReportType) {
    if (!container) return;
    if (isThemeThemePlanningType(reportType)) {
        container.style.flex = "1";
        container.style.height = "";
        container.style.minHeight = "0";
        container.style.aspectRatio = "";
        container.style.alignSelf = "stretch";
        return;
    }
    container.style.flex = "1";
    container.style.height = "";
    container.style.minHeight = "";
    container.style.aspectRatio = "";
    container.style.alignSelf = "";
}

function configureStep1LivePreviewPanelLayout(panel, reportType = state?.currentReportType) {
    if (!panel) return;
    panel.style.alignSelf = "stretch";
    panel.style.height = "";
    panel.style.maxHeight = "";
}

function getReportStructure(reportType = state?.currentReportType) {
    const structure = REPORT_CONFIGS[reportType]?.structure;
    return Array.isArray(structure) ? structure : [];
}

const THEME_EVENT_FIXED_KICKER_BY_CHAPTER = Object.freeze({
    "theme-event": Object.freeze(["01", "02"]),
    "theme-event-continued": Object.freeze(["03", "04"]),
    "theme-event-3": Object.freeze(["05", "06"]),
    "theme-event-4": Object.freeze(["07", "08"])
});

function getThemeEventFixedKickerNumbers(chapterId) {
    return THEME_EVENT_FIXED_KICKER_BY_CHAPTER[String(chapterId || "")] || null;
}

function stripThemeEventKickerPrefix(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.replace(/^\s*0?\d{1,2}\s*[-–—:：、.．)）]?\s*/u, "").trim();
}

function formatThemeEventKickerValue(value, fixedNumber) {
    const num = String(fixedNumber || "").trim();
    if (!num) return String(value || "").trim();
    const body = stripThemeEventKickerPrefix(value);
    return body ? `${num} ${body}` : `${num} `;
}

function normalizeThemeEventCustomData(chapterId, customData) {
    if (!customData || typeof customData !== "object") return customData;
    const fixedNumbers = getThemeEventFixedKickerNumbers(chapterId);
    if (!fixedNumbers) return customData;
    const currentPageTitle = String(customData.page_title || "").trim();
    if (!currentPageTitle || currentPageTitle === "主题故事") {
        customData.page_title = "主题事件";
    }
    fixedNumbers.forEach((fixedNumber, index) => {
        const key = `block${index + 1}_kicker`;
        customData[key] = formatThemeEventKickerValue(customData[key], fixedNumber);
    });
    return customData;
}

function normalizeThemeThemePlanningLegacyLabels(chapterId, customData) {
    if (!customData || typeof customData !== "object") return customData;
    const normalizedChapterId = String(chapterId || "");
    if (/^theme-visual-editorial(?:-\d+)?$/.test(normalizedChapterId)) {
        const currentNote = String(customData.note || "").trim();
        const mergedLegacyNote = [customData.note1, customData.note2]
            .map((value) => String(value || "").trim())
            .filter(Boolean)
            .join("\n\n");
        if (mergedLegacyNote && (!currentNote || currentNote === "请在此输入整体说明...")) {
            customData.note = mergedLegacyNote;
        }
    }
    if (normalizedChapterId === "visual-display-page") {
        const currentNote = String(customData.note || "").trim();
        const mergedLegacyNote = [customData.note1_desc, customData.note2_desc]
            .map((value) => String(value || "").trim())
            .filter(Boolean)
            .join("\n\n");
        if (mergedLegacyNote && (!currentNote || currentNote === "请在此输入整体说明...")) {
            customData.note = mergedLegacyNote;
        }
    }
    if (normalizedChapterId === "theme-story-panel") {
        const currentPageTitle = String(customData.page_title || "").trim();
        if (currentPageTitle === "主题叙事" || currentPageTitle === "主题故事") {
            customData.page_title = "留白漫游";
        }
    }
    normalizeThemeEventCustomData(chapterId, customData);
    return customData;
}

function applyChapterCustomDataDefaults(chapter, reportType = state?.currentReportType) {
    if (!chapter || typeof chapter !== "object" || typeof chapter.id !== "string") return chapter;
    const structure = getReportStructure(reportType);
    const struct = structure.find((item) => item && item.id === chapter.id);
    if (!struct || !Array.isArray(struct.fields) || !struct.fields.length) return chapter;
    if (!chapter.customData || typeof chapter.customData !== "object") {
        chapter.customData = {};
    }
    struct.fields.forEach((field) => {
        if (!field || !field.key || field.default === undefined) return;
        if (chapter.customData[field.key] === undefined) {
            chapter.customData[field.key] = field.default;
        }
    });
    normalizeThemeThemePlanningLegacyLabels(chapter.id, chapter.customData);
    return chapter;
}

function getPlanningNavConfig(reportType = state?.currentReportType) {
    if (isThemeThemePlanningType(reportType)) {
        return {
            global: new Set(["theme-origin"]),
            summary: new Set(["cover-page", "toc-page", "conclusion-page"]),
            order: ["content", "global", "summary"]
        };
    }

    return {
        global: new Set(["style-page", "consumer-page"]),
        summary: new Set(["cover-page", "toc-page", "conclusion-page", "recommendation-page"]),
        order: ["content", "global", "summary"]
    };
}

function getPlanningNavGroupForChapter(chapter, reportType = state?.currentReportType) {
    const chapterId = String(chapter?.id || "");
    const navConfig = getPlanningNavConfig(reportType);
    if (navConfig.summary.has(chapterId)) return "summary";
    if (navConfig.global.has(chapterId)) return "global";
    return "content";
}

function getPlanningOrderedVisibleChapterIndexes(reportType = state?.currentReportType) {
    const visibleChapters = state.chapters
        .map((ch, idx) => ({ ch, idx }))
        .filter(({ ch }) => ch && ch.isActive !== false);
    const navConfig = getPlanningNavConfig(reportType);

    return navConfig.order.flatMap((group) =>
        visibleChapters
            .filter(({ ch }) => getPlanningNavGroupForChapter(ch, reportType) === group)
            .map(({ idx }) => idx)
    );
}

function getPlanningExportFilePrefix(reportType = state?.currentReportType) {
    if (isThemeThemePlanningType(reportType)) {
        return "Theme_Theme_Planning_Report";
    }
    return "Style_Planning_Report";
}

function getThemeThemePlanningReservedMessage(chapterId, actionLabel = "AI功能") {
    const config = getThemeThemePlanningConfig(chapterId);
    const chapterName = config?.name || chapterId || "当前章节";
    return `${chapterName}${actionLabel}待接入`;
}

const THEME_THEME_PLANNING_RUNTIME_FALLBACKS = Object.freeze({
    "cover-page": Object.freeze({
        name: "封面",
        workflow: "withJson",
        prompt: "prompts/主题企划提示词/01封面.txt",
        reserved: false
    }),
    "toc-page": Object.freeze({
        name: "目录",
        workflow: "withJson",
        prompt: "prompts/主题企划提示词/02总目录.txt",
        reserved: false
    }),
    "theme-origin": Object.freeze({
        name: "灵感来源",
        workflow: "withJson",
        prompt: "prompts/主题企划提示词/03灵感来源.txt",
        reserved: false
    }),
    "conclusion-page": Object.freeze({
        name: "总结展望",
        workflow: "withJson",
        prompt: "prompts/主题企划提示词/26总结展望.txt",
        reserved: false
    })
});

function resolveThemeThemePlanningConfig(chapterId) {
    const config = getThemeThemePlanningConfig(chapterId);
    if (config && !config.reserved) {
        return config;
    }
    return THEME_THEME_PLANNING_RUNTIME_FALLBACKS[String(chapterId || "")] || config;
}

function markThemeThemePlanningReserved(chapter, actionLabel = "AI功能", shouldAlert = true) {
    if (!chapter) return;
    chapter.status = getThemeThemePlanningReservedMessage(chapter.id, actionLabel);
    persistState();
    render();
    if (window.postToPreview) window.postToPreview(true);
    if (shouldAlert) {
        alert("主题-主题企划模板的 AI / ComfyUI 功能待接入。");
    }
}

function normalizeRackMode(value) {
    const mode = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (mode === RACK_MODE_FLOOR) return RACK_MODE_FLOOR;
    if (mode === RACK_MODE_WALL) return RACK_MODE_WALL;
    if (mode === RACK_MODE_METAL) return RACK_MODE_METAL;
    if (mode === RACK_MODE_CORNER) return RACK_MODE_CORNER;
    return RACK_MODE_RACK;
}

function getRackPromptFieldKey(mode) {
    const normalizedMode = normalizeRackMode(mode);
    return RACK_PROMPT_KEY_BY_MODE[normalizedMode] || RACK_PROMPT_KEY_BY_MODE[RACK_MODE_RACK];
}

function sanitizeRackPromptText(value, mode = "") {
    let text = typeof value === "string" ? value.replace(/\r\n?/g, "\n") : "";
    RACK_PROMPT_REMOVED_PHRASES.forEach((phrase) => {
        if (!phrase) return;
        text = text.replace(phrase, "");
    });
    if (normalizeRackMode(mode) === RACK_MODE_METAL) {
        text = text
            .replace(RACK_METAL_LEGACY_BLOCK, RACK_METAL_UPDATED_BLOCK)
            .replace(RACK_METAL_LEGACY_CONSTRAINTS, RACK_METAL_UPDATED_CONSTRAINTS)
            .replace(RACK_METAL_LEGACY_ENHANCEMENT, RACK_METAL_UPDATED_ENHANCEMENT);
    }
    return text.replace(/\n{3,}/g, "\n\n").trim();
}

function getRackModeFromChapter(chapter) {
    if (!chapter || typeof chapter !== "object") return RACK_MODE_RACK;
    const customData = chapter.customData && typeof chapter.customData === "object" ? chapter.customData : {};
    return normalizeRackMode(customData[RACK_MODE_KEY]);
}

function getRackPromptFromChapter(chapter, mode) {
    if (!chapter || typeof chapter !== "object") return "";
    const customData = chapter.customData && typeof chapter.customData === "object" ? chapter.customData : {};
    const fieldKey = getRackPromptFieldKey(mode);
    const rawPrompt = typeof customData[fieldKey] === "string" ? customData[fieldKey] : "";
    const sanitizedPrompt = sanitizeRackPromptText(rawPrompt, mode);
    if (sanitizedPrompt !== rawPrompt && chapter.customData && typeof chapter.customData === "object") {
        chapter.customData[fieldKey] = sanitizedPrompt;
    }
    return sanitizedPrompt;
}

function setRackPromptForChapter(chapter, mode, promptText) {
    if (!chapter || typeof chapter !== "object") return;
    if (!chapter.customData || typeof chapter.customData !== "object") chapter.customData = {};
    const fieldKey = getRackPromptFieldKey(mode);
    chapter.customData[fieldKey] = sanitizeRackPromptText(typeof promptText === "string" ? promptText : "", mode);
    persistState();
}

async function getRackPromptTemplate(mode) {
    const normalizedMode = normalizeRackMode(mode);
    if (!rackPromptTemplateCache.has(normalizedMode)) {
        const promptFile = RACK_PROMPT_FILE_BY_MODE[normalizedMode] || RACK_PROMPT_FILE_BY_MODE[RACK_MODE_RACK];
        rackPromptTemplateCache.set(
            normalizedMode,
            (async () => {
                try {
                    return sanitizeRackPromptText(String(await fetchTextNoCache(promptFile)).trim(), normalizedMode);
                } catch (error) {
                    console.warn("[Rack] Failed to load prompt template:", promptFile, error);
                    return "";
                }
            })()
        );
    }
    return await rackPromptTemplateCache.get(normalizedMode);
}

async function applyRackPromptTemplateToChapter(chapter, mode, { force = false } = {}) {
    if (!chapter || typeof chapter !== "object") return "";
    const normalizedMode = normalizeRackMode(mode);
    const templatePrompt = await getRackPromptTemplate(normalizedMode);
    if (!templatePrompt) return getRackPromptFromChapter(chapter, normalizedMode);
    const currentPrompt = getRackPromptFromChapter(chapter, normalizedMode);
    if (force || !String(currentPrompt || "").trim()) {
        setRackPromptForChapter(chapter, normalizedMode, templatePrompt);
        return templatePrompt;
    }
    return currentPrompt;
}

function setRackModeForChapter(chapter, mode) {
    if (!chapter || typeof chapter !== "object") return;
    if (!chapter.customData || typeof chapter.customData !== "object") chapter.customData = {};
    chapter.customData[RACK_MODE_KEY] = normalizeRackMode(mode);
    persistState();
}

function getConfiguredChapterFieldDefault(chapterId, fieldKey) {
    const structure = getReportStructure();
    if (!Array.isArray(structure) || !chapterId || !fieldKey) return "";
    const chapterConfig = structure.find(item => item && item.id === chapterId);
    if (!chapterConfig || !Array.isArray(chapterConfig.fields)) return "";
    const fieldConfig = chapterConfig.fields.find(field => field && field.key === fieldKey);
    return typeof fieldConfig?.default === "string" ? fieldConfig.default.trim() : "";
}

function getExpectedDetailPageEnTitle(chapterId) {
    const configuredTitle = getConfiguredChapterFieldDefault(chapterId, "page_en_title");
    if (configuredTitle) return configuredTitle;
    const match = /^(keyItem|patternDetail)(\d+)$/.exec(String(chapterId || ""));
    if (!match) return "";
    const pageNumber = String(Math.max(1, parseInt(match[2], 10) || 1)).padStart(2, "0");
    return match[1] === "keyItem" ? `Key Item Detail ${pageNumber}` : `Pattern Trend ${pageNumber}`;
}

function normalizeAutoDetailPageEnTitle(chapter) {
    if (!chapter || typeof chapter !== "object") return;
    const expectedTitle = getExpectedDetailPageEnTitle(chapter.id);
    if (!expectedTitle) return;
    if (!chapter.customData || typeof chapter.customData !== "object") chapter.customData = {};
    const currentTitle = typeof chapter.customData.page_en_title === "string"
        ? chapter.customData.page_en_title.trim()
        : "";
    const autoTitlePattern = chapter.id.startsWith("keyItem")
        ? /^Key Item Detail\s+\d{1,2}$/i
        : /^Pattern Trend\s+\d{1,2}$/i;
    if (!currentTitle || autoTitlePattern.test(currentTitle)) {
        chapter.customData.page_en_title = expectedTitle;
    }
}

const ICONS = {
    folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    load: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    export: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    queue: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` // [🔄 New] Queue Icon
};

const CURRENT_VERSION = "v2.3.0";

const translations = {
    zh: {
        brand: { title: "AI 报告系统", version: `公开演示版 ${CURRENT_VERSION}` },
        sidebar: {
            reportLabel: "报告类型:",
            languageLabel: "界面语言:",
            clearAllChapters: "清空所有章节",
            clearAllChaptersConfirm: "确定清空所有章节内容？仅清除编辑区内容。",
            draftBox: `${ICONS.folder}草稿箱`
        }, // Added draftBox
        languages: { zh: "中文", en: "English" },
        steps: {
            step1: { title: "步骤 1", desc: "上传并生成章节" },
            step2: { title: "步骤 2", desc: "全局汇编" },
            step3: { title: "步骤 3", desc: "查看HTML" }
        },
        step3: {
            title: "步骤 3 · 查看HTML",
            hintEmpty: "提示：尚无步骤 2 的最终JSON。请先到步骤2生成。",
            hintLoaded: "已加载最终JSON：章节数 {{count}} · 可预览与导出 HTML",
            back: "← 返回步骤2",
            preview: "刷新预览",
            download: "导出报告HTML",
            openNew: "新窗口打开"
        },
        status: {
            comfyConnected: "✔ 已连接 AI 服务",
            comfyError: "✘ 无法连接 AI 服务，请检查本地配置",
            proxyConnected: "✔ 已连接 API 代理",
            proxyError: "✘ 无法连接 API 代理，请检查代理服务"
        },
        draft: {
            modalTitle: "草稿箱 (Draft Box)",
            newDraft: "新建草稿",
            importDraft: "导入备份",
            empty: "暂无草稿",
            loadConfirm: "读取草稿将覆盖当前工作区，确定吗？",
            deleteConfirm: "确定删除该草稿吗？",
            saveSuccess: "草稿已保存",
            loadSuccess: "草稿已读取",
            importSuccess: "草稿已导入"
        }
    },
    en: {
        brand: { title: "AI Report System", version: `${CURRENT_VERSION} demo build` },
        sidebar: {
            reportLabel: "Report Type:",
            languageLabel: "UI Language:",
            clearAllChapters: "Clear All Chapters",
            clearAllChaptersConfirm: "Clear all chapter content? This only clears editor content.",
            draftBox: `${ICONS.folder}Draft Box`
        },
        languages: { zh: "Chinese", en: "English" },
        steps: {
            step1: { title: "Step 1", desc: "Upload & generate chapters" },
            step2: { title: "Step 2", desc: "Assemble report" },
            step3: { title: "Step 3", desc: "Review HTML" }
        },
        step3: {
            title: "Step 3 · Review HTML",
            hintEmpty: "Tip: No final JSON yet. Please finish Step 2 first.",
            hintLoaded: "Loaded final JSON: {{count}} chapters · ready to preview/export HTML",
            back: "← Back to Step 2",
            preview: "Refresh preview",
            download: "Export report HTML",
            openNew: "Open in new window"
        },
        status: {
            comfyConnected: "✔ Connected to AI service",
            comfyError: "✘ Unable to reach AI service, please verify local settings",
            proxyConnected: "✔ API proxy connected",
            proxyError: "✘ Unable to reach API proxy, please verify the proxy service"
        },
        draft: {
            modalTitle: "Draft Box",
            newDraft: "New Draft",
            importDraft: "Import Backup",
            empty: "No drafts yet",
            loadConfirm: "Loading draft will overwrite current workspace. Continue?",
            deleteConfirm: "Delete this draft?",
            saveSuccess: "Draft saved",
            loadSuccess: "Draft loaded",
            importSuccess: "Draft imported"
        }
    }
};

const i18n = createI18n({ defaultLocale: savedLocale, resources: translations });
const toViewUrl = (filename) => apiClient.buildViewUrl(filename);

// ===== 4. 全局状态 =====
const STATE_STORAGE_KEY = "pop-ai-chapters-v2";

let state = { step: 1, currentIndex: 0, chapters: [], reportIntermediate: null, reportFinal: null, currentReportType: DEFAULT_REPORT_TYPE, navFilter: 'content' };
const runtimeGenerationLocks = Object.create(null);
const getGenerationLockKey = (chapterId, source = 'standard') => `${chapterId || 'unknown'}::${source || 'standard'}`;
const isChapterGenerating = (chapterId, source = 'standard') => !!runtimeGenerationLocks[getGenerationLockKey(chapterId, source)];
const setChapterGenerating = (chapterId, source = 'standard', active = true) => {
    const key = getGenerationLockKey(chapterId, source);
    if (active) runtimeGenerationLocks[key] = true;
    else delete runtimeGenerationLocks[key];
};

function sanitizeRestoredBlobUrl(value) {
    const text = typeof value === "string" ? value.trim() : "";
    return /^blob:/i.test(text) ? "" : value;
}

function sanitizeRestoredImageAsset(asset) {
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) return asset;
    const next = { ...asset };
    const rawUrl = typeof next.url === "string" ? next.url.trim() : "";
    const rawPreview = typeof next.preview === "string" ? next.preview.trim() : "";
    if (/^blob:/i.test(rawUrl) || /^blob:/i.test(rawPreview)) {
        return null;
    }
    return next;
}

function sanitizeRestoredChapterTransientUrls(chapter) {
    if (!chapter || typeof chapter !== "object") return chapter;

    if (typeof chapter.urlListStr === "string") {
        chapter.urlListStr = chapter.urlListStr
            .split(/\r?\n/)
            .map((item) => {
                const text = String(item || "").trim();
                return /^blob:/i.test(text) ? "" : text;
            })
            .join("\n");
    }

    ["mainImageUrls", "detailImageUrls"].forEach((key) => {
        if (!Array.isArray(chapter[key])) return;
        chapter[key] = chapter[key].map((value) => sanitizeRestoredBlobUrl(value) || "");
    });

    ["mainImages", "detailImages", "images"].forEach((key) => {
        if (!Array.isArray(chapter[key])) return;
        chapter[key] = chapter[key].map((asset) => sanitizeRestoredImageAsset(asset));
    });

    if (chapter.customData && typeof chapter.customData === "object") {
        Object.keys(chapter.customData).forEach((key) => {
            const value = chapter.customData[key];
            if (typeof value === "string" && /^blob:/i.test(value.trim())) {
                chapter.customData[key] = "";
            }
        });
    }

    return chapter;
}

function sanitizeRestoredStateTransientUrls(rootState) {
    if (!rootState || typeof rootState !== "object") return rootState;

    if (Array.isArray(rootState.chapters)) {
        rootState.chapters = rootState.chapters.map((chapter) => sanitizeRestoredChapterTransientUrls(chapter));
    }

    if (rootState.reportTypeDrafts && typeof rootState.reportTypeDrafts === "object") {
        Object.values(rootState.reportTypeDrafts).forEach((snapshot) => {
            if (snapshot && Array.isArray(snapshot.chapters)) {
                snapshot.chapters = snapshot.chapters.map((chapter) => sanitizeRestoredChapterTransientUrls(chapter));
            }
        });
    }

    return rootState;
}

(() => {
    let saved = null;
    try {
        saved = localStorage.getItem(STATE_STORAGE_KEY) || sessionStorage.getItem(STATE_STORAGE_KEY);
    } catch (e) {
        console.warn("[Init] Unable to read persisted state", e);
    }
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            sanitizeRestoredStateTransientUrls(parsed);
            state = { ...state, ...parsed };
        }
    } catch (e) {
        console.warn("[Init] Failed to parse persisted state", e);
    }
})();


// [Fix] Migrate legacy 'quiet_luxury' type to 'style_planning' to restore UI/Config
if (state.currentReportType === 'quiet_luxury' && !REPORT_CONFIGS['quiet_luxury']) {
    console.warn("[Migration] Updating report type: quiet_luxury -> style_planning");
    state.currentReportType = 'style_planning';
}
if (!REPORT_CONFIGS[state.currentReportType]) {
    state.currentReportType = DEFAULT_REPORT_TYPE;
}

function getDefaultChapterIndexForReport(reportType, chapters) {
    if (!Array.isArray(chapters) || chapters.length === 0) return 0;
    if (isStylePlanningType(reportType)) {
        const idx = chapters.findIndex(ch => ch && ch.id === 'atmosphere-page');
        return idx >= 0 ? idx : 0;
    }
    if (isThemeThemePlanningType(reportType)) {
        const idx = chapters.findIndex(ch => ch && ch.id === 'theme-origin');
        return idx >= 0 ? idx : 0;
    }
    return 0;
}

function getLegacyStylePlanningChapterNumber(chapterId, fallbackIndex = state.currentIndex) {
    const resolvedFallback = Number.isInteger(fallbackIndex) ? fallbackIndex : -1;
    if (state.currentReportType !== "style_planning") return resolvedFallback >= 0 ? (resolvedFallback + 1) : null;

    const structure = REPORT_CONFIGS.style_planning?.structure;
    if (!Array.isArray(structure) || !structure.length) return resolvedFallback >= 0 ? (resolvedFallback + 1) : null;

    const indexInStructure = structure.findIndex(item => item && item.id === chapterId);
    const currentIndex = indexInStructure >= 0 ? indexInStructure : resolvedFallback;
    if (currentIndex < 0) return null;

    const rackIndex = structure.findIndex(item => item && item.id === RACK_COLOR_DISPLAY_CHAPTER_ID);
    if (rackIndex >= 0 && currentIndex === rackIndex) return null;

    let legacyNumber = currentIndex + 1;
    if (rackIndex >= 0 && currentIndex > rackIndex) legacyNumber -= 1;

    // Keep legacy chapter 4 reserved (historical style-trend page) so prompts/workflow IDs stay aligned.
    const consumerIndex = structure.findIndex(item => item && item.id === "consumer-page");
    if (consumerIndex >= 0 && currentIndex >= consumerIndex) legacyNumber += 1;

    return legacyNumber;
}

function isLegacySpecialCompositionChapter(chapter) {
    return !!(chapter && LEGACY_SPECIAL_COMPOSITION_CHAPTER_IDS.has(chapter.id));
}

function isThemePlanningGroupStylingChapterId(chapterId) {
    return /^group-styling-page(?:-\d+)?$/.test(String(chapterId || ""));
}

function isThemePlanningRackDisplayChapterId(chapterId) {
    return /^rack-color-display-page(?:-\d+)?$/.test(String(chapterId || ""));
}

function shouldMigrateThemePlanningGroupStylingSlots(chapterConfig, existingChapter, targetSlotCount) {
    if (!isThemeThemePlanningType(state.currentReportType)) return false;
    if (!isThemePlanningGroupStylingChapterId(chapterConfig?.id)) return false;
    if (!existingChapter || targetSlotCount < 20) return false;

    const legacyMaxImages = Number(existingChapter.maxImages);
    if (legacyMaxImages === 16) return true;

    return Array.isArray(existingChapter.mainImages) && existingChapter.mainImages.length === 16;
}

// 初始化章节
// 初始化章节 - Robust Merge Implementation
function ensureChaptersSchema() {
    const reportConfig = REPORT_CONFIGS[state.currentReportType] || {};
    const structure = reportConfig.structure;
    const targetLength = structure ? structure.length : CONFIG.MAX_CHAPTERS;

    if (structure) {
        // 1. Create a map of existing chapters for data preservation
        const oldChaptersMap = new Map((state.chapters || []).map(c => [c.id, c]));

        // 2. Rebuild state.chapters based on the current structure (source of truth for order/config)
        state.chapters = structure.map(s => {
            const existing = oldChaptersMap.get(s.id);
            const mainSlotCount = Number.isInteger(s?.maxImages) && s.maxImages > 0
                ? s.maxImages
                : CONFIG.MAX_IMAGES_PER_CHAPTER;

            // 3. Determine 'isActive'
            let isActive = true; // Default
            if (existing && existing.isActive !== undefined) {
                // Keep user's previous visibility state if known
                isActive = existing.isActive;
            } else {
                // Initialize default visibility for specific dynamic sections
                if (s.id.startsWith('keyItem')) {
                    isActive = (s.id === 'keyItem1' || s.id === 'keyItemsDirectory');
                } else if (s.id === 'themeItemsDirectory' || s.id.startsWith('themeItemDetail')) {
                    isActive = (s.id === 'themeItemDetail1' || s.id === 'themeItemsDirectory');
                } else if (s.id.startsWith('patternDetail')) {
                    isActive = (s.id === 'patternDetail1');
                } else if (s.id.startsWith('brandDetail')) {
                    isActive = (s.id === 'brandDetail1');
                } else if (isThemeThemePlanningType(state.currentReportType)) {
                    const dynamicType = getDynamicPageGroupType(s.id, REPORT_TYPE_THEME_THEME_PLANNING);
                    const dynamicGroup = dynamicType
                        ? getDynamicPageGroupConfigByType(dynamicType, REPORT_TYPE_THEME_THEME_PLANNING)
                        : null;
                    if (dynamicGroup) {
                        isActive = (s.id === dynamicGroup.firstId);
                    }
                }
            }

            // [ ✨ Refactor: Split Images Migration Logic ✨ ]
            let mainImages = existing ? (existing.mainImages || []) : [];
            let detailImages = existing ? (existing.detailImages || []) : [];
            let mainImageUrls = existing ? (existing.mainImageUrls || []) : [];
            let detailImageUrls = existing ? (existing.detailImageUrls || []) : [];

            // Case A: Migration from legacy 'images' and 'urlListStr'
            if (existing && !existing.mainImages && Array.isArray(existing.images) && existing.images.length > 0) {
                mainImages = existing.images.slice(0, mainSlotCount);
                detailImages = existing.images.slice(mainSlotCount);
            }
            if (mainImages.length > mainSlotCount) {
                detailImages = [
                    ...mainImages.slice(mainSlotCount),
                    ...(Array.isArray(detailImages) ? detailImages : [])
                ];
                mainImages = mainImages.slice(0, mainSlotCount);
            }
            // Ensure mainImages has expected slots
            while (mainImages.length < mainSlotCount) mainImages.push(null);
            // Case B: Initialization
            if (mainImages.length === 0) {
                mainImages = Array(mainSlotCount).fill(null);
            }

            // Case A (Urls): Migration from legacy 'urlListStr'
            if (existing && (!existing.mainImageUrls || existing.mainImageUrls.length === 0) && existing.urlListStr) {
                const legacyUrls = (existing.urlListStr || "").split(/\r?\n/).map(s => s.trim());
                mainImageUrls = legacyUrls.slice(0, mainSlotCount);
                detailImageUrls = legacyUrls.slice(mainSlotCount).filter(u => u !== "");
            }
            if (mainImageUrls.length > mainSlotCount) {
                detailImageUrls = [
                    ...mainImageUrls.slice(mainSlotCount).filter(Boolean),
                    ...(Array.isArray(detailImageUrls) ? detailImageUrls : [])
                ];
                mainImageUrls = mainImageUrls.slice(0, mainSlotCount);
            }
            while (mainImageUrls.length < mainSlotCount) mainImageUrls.push("");
            // Case B (Urls): Initialization
            if (mainImageUrls.length === 0) {
                mainImageUrls = Array(mainSlotCount).fill("");
            }

            const shouldMigrateGroupStylingSlots = shouldMigrateThemePlanningGroupStylingSlots(s, existing, mainSlotCount);
            if (shouldMigrateGroupStylingSlots) {
                mainImages = [...Array(4).fill(null), ...mainImages].slice(0, mainSlotCount);
                mainImageUrls = [...Array(4).fill(""), ...mainImageUrls].slice(0, mainSlotCount);
            }

            const customData = existing ? { ...(existing.customData || {}) } : {};
            normalizeAutoDetailPageEnTitle({ id: s.id, customData });
            if (isThemeThemePlanningType(state.currentReportType)) {
                normalizeThemeThemePlanningLegacyLabels(s.id, customData);
            }

            let legacyImages = existing ? (existing.images || []) : [];
            let legacyUrlListStr = existing ? (existing.urlListStr || "") : "";
            if (shouldMigrateGroupStylingSlots) {
                if (Array.isArray(legacyImages) && legacyImages.length) {
                    legacyImages = [...Array(4).fill(null), ...legacyImages].slice(0, mainSlotCount);
                }
                if (typeof legacyUrlListStr === "string" && legacyUrlListStr.trim()) {
                    const shiftedUrls = legacyUrlListStr.split(/\r?\n/);
                    legacyUrlListStr = [...Array(4).fill(""), ...shiftedUrls].slice(0, mainSlotCount).join("\n");
                }
            }

            return {
                id: s.id,
                title: s.title, // Always sync title from config
                enTitle: s.enTitle, // Sync EN title if exists
                isActive: isActive,
                // [New Fields]
                mainImages,
                detailImages,
                mainImageUrls,
                detailImageUrls,
                // Preserve data or initialize empty
                images: legacyImages,
                urlListStr: legacyUrlListStr,
                keywords: existing ? (existing.keywords || "") : "",
                summary: existing ? (existing.summary || "") : "",
                status: existing ? (existing.status || "未生成") : "未生成",
                inspiration: existing ? (existing.inspiration || "") : "",
                generatedData: existing ? existing.generatedData : null,
                customData,
                hasUserInput: existing ? !!existing.hasUserInput : false,
                isUnlocked: (() => {
                    if (existing && existing.isUnlocked !== undefined) return existing.isUnlocked;
                    // [Modified] Remove locking status for Style Planning template as requested
                    // const lockedGroup2 = ['cover-page', 'toc-page', 'conclusion-page', 'recommendation-page'];
                    // if (lockedGroup1.includes(s.id) || lockedGroup2.includes(s.id)) return false;
                    return true;
                })(),
                // Sync constraints
                maxImages: s.maxImages || CONFIG.MAX_IMAGES_PER_CHAPTER,
                desc: s.desc || "",
                // Preserve additional fields for key items
                detailImagesConfig: s.detailImages || null // Keep config separate
            };
        });

    } else {
        // Fallback for non-structured reports (Legacy Mode)
        if (!Array.isArray(state.chapters) || state.chapters.length !== targetLength) {
            state.chapters = Array.from({ length: targetLength }, (_, i) => ({
                id: `chapter-${i + 1}`,
                isActive: true,
                isUnlocked: true,
                mainImages: Array(6).fill(null),
                detailImages: [],
                mainImageUrls: Array(6).fill(""),
                detailImageUrls: [],
                images: [],
                urlListStr: "",
                title: "",
                keywords: "",
                summary: "",
                status: "未生成",
                inspiration: "",
                generatedData: null,
                hasUserInput: false
            }));
        }
    }

    if (![1, 2, 3].includes(state.step)) state.step = 1;
    if (!Number.isInteger(state.currentIndex)) state.currentIndex = 0;
    if (state.currentIndex < 0) state.currentIndex = 0;
    if (state.currentIndex >= state.chapters.length) {
        state.currentIndex = Math.max(0, state.chapters.length - 1);
    }
}

function cloneReportTypeScopedValue(value) {
    if (value === undefined) return value;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch (_) {
        return value;
    }
}

function ensureReportTypeDraftStore() {
    if (!state.reportTypeDrafts || typeof state.reportTypeDrafts !== "object") {
        state.reportTypeDrafts = {};
    }
    return state.reportTypeDrafts;
}

function saveCurrentReportTypeSnapshot() {
    const reportType = state.currentReportType;
    if (!reportType) return;
    const store = ensureReportTypeDraftStore();
    store[reportType] = {
        chapters: cloneReportTypeScopedValue(state.chapters || []),
        currentIndex: state.currentIndex,
        navFilter: state.navFilter || "content",
        reportIntermediate: cloneReportTypeScopedValue(state.reportIntermediate),
        reportFinal: cloneReportTypeScopedValue(state.reportFinal),
        visibilityFixed: !!state._visibilityFixed_v2,
        themeElementVisibilityFixed: !!state._themeElementVisibilityFixed_v1,
        themeDynamicVisibilityFixed: !!state._themeDynamicVisibilityFixed_v2
    };
}

function restoreReportTypeSnapshot(reportType) {
    const snapshot = ensureReportTypeDraftStore()[reportType];
    if (!snapshot) {
        state.chapters = [];
        state.currentIndex = 0;
        state.navFilter = "content";
        state.reportIntermediate = null;
        state.reportFinal = null;
        state._visibilityFixed_v2 = false;
        state._themeElementVisibilityFixed_v1 = false;
        state._themeDynamicVisibilityFixed_v2 = false;
        ensureChaptersSchema();
        return;
    }

    state.chapters = Array.isArray(snapshot.chapters) ? snapshot.chapters : [];
    state.currentIndex = Number.isInteger(snapshot.currentIndex) ? snapshot.currentIndex : 0;
    state.navFilter = snapshot.navFilter || "content";
    state.reportIntermediate = snapshot.reportIntermediate || null;
    state.reportFinal = snapshot.reportFinal || null;
    state._visibilityFixed_v2 = !!snapshot.visibilityFixed;
    state._themeElementVisibilityFixed_v1 = !!snapshot.themeElementVisibilityFixed;
    state._themeDynamicVisibilityFixed_v2 = !!snapshot.themeDynamicVisibilityFixed;
    ensureChaptersSchema();
}
ensureChaptersSchema();
if (isPlanningReportType(state.currentReportType) && state.currentIndex <= 0) {
    state.currentIndex = getDefaultChapterIndexForReport(state.currentReportType, state.chapters);
}

const sidebarEl = document.getElementById("sidebar");
const contentPanelEl = document.getElementById("contentPanel");
const stepsNavEl = document.getElementById("stepsNav");
const chaptersNavEl = document.getElementById("chaptersNav");
const fileInputEl = document.getElementById("hiddenFileInput");
const languageSelectEl = document.getElementById("languageSelect");

function buildClearedChapterState(chapter) {
    const current = chapter && typeof chapter === "object" ? chapter : {};
    const mainSlots = (Array.isArray(current.mainImages) && current.mainImages.length)
        ? current.mainImages.length
        : 6;
    const mainUrlSlots = (Array.isArray(current.mainImageUrls) && current.mainImageUrls.length)
        ? current.mainImageUrls.length
        : mainSlots;

    return {
        ...current,
        title: current.title,
        images: [],
        urlListStr: "",
        keywords: "",
        summary: "",
        status: "未生成",
        inspiration: "",
        generatedData: null,
        customData: {},
        mainImages: Array(mainSlots).fill(null),
        detailImages: [],
        mainImageUrls: Array(mainUrlSlots).fill(""),
        detailImageUrls: [],
        hasUserInput: false
    };
}

function clearAllChapterEditorContent() {
    const confirmText = i18n.t("sidebar.clearAllChaptersConfirm", "确定清空所有章节内容？仅清除编辑区内容。");
    if (!confirm(confirmText)) return;

    state.chapters = (Array.isArray(state.chapters) ? state.chapters : []).map(buildClearedChapterState);
    if (state.currentIndex >= state.chapters.length) {
        state.currentIndex = Math.max(0, state.chapters.length - 1);
    }

    persistState();
    render();
    if (window.postToPreview) window.postToPreview(true);
}

function getAutoDraftSnapshot() {
    try {
        const serialized = JSON.stringify(state);
        return {
            signature: serialized,
            payload: JSON.parse(serialized)
        };
    } catch (err) {
        console.warn("[Draft] Failed to snapshot state for autosave:", err);
        return null;
    }
}

async function runAutoDraftSave(reason = "interval") {
    if (__autoDraftSaving) return;
    const snapshot = getAutoDraftSnapshot();
    if (!snapshot) return;

    const { signature, payload } = snapshot;
    if (reason === "interval" && signature === __autoDraftLastSignature) return;

    __autoDraftSaving = true;
    try {
        if (!__autoDraftId) {
            try {
                __autoDraftId = localStorage.getItem(AUTO_DRAFT_ID_STORAGE_KEY) || "";
            } catch (err) {
                __autoDraftId = "";
            }
        }

        if (__autoDraftId) {
            try {
                await draftService.updateDraft(__autoDraftId, payload, AUTO_DRAFT_TITLE);
            } catch (err) {
                __autoDraftId = await draftService.saveDraft(AUTO_DRAFT_TITLE, payload);
            }
        } else {
            __autoDraftId = await draftService.saveDraft(AUTO_DRAFT_TITLE, payload);
        }

        if (__autoDraftId) {
            try {
                localStorage.setItem(AUTO_DRAFT_ID_STORAGE_KEY, __autoDraftId);
            } catch (err) {
                // Ignore localStorage failures
            }
        }
        __autoDraftLastSignature = signature;
    } catch (err) {
        console.warn("[Draft] Autosave failed:", err);
    } finally {
        __autoDraftSaving = false;
    }
}

function ensureAutoDraftScheduler() {
    if (__autoDraftInitDone) return;
    __autoDraftInitDone = true;

    try {
        __autoDraftId = localStorage.getItem(AUTO_DRAFT_ID_STORAGE_KEY) || "";
    } catch (err) {
        __autoDraftId = "";
    }

    const intervalMs = Math.max(5, Number(AUTO_DRAFT_INTERVAL_SECONDS) || 30) * 1000;
    __autoDraftTimer = window.setInterval(() => {
        runAutoDraftSave("interval");
    }, intervalMs);

    // First autosave shortly after init to guarantee a baseline draft exists.
    setTimeout(() => runAutoDraftSave("init"), 1500);

    window.addEventListener("beforeunload", () => {
        // best-effort final save
        runAutoDraftSave("beforeunload");
    });
}

// [ ✨ Draft Box UI Logic ✨ ]
function initDraftBox() {
    ensureAutoDraftScheduler();

    let sidebarActionWrap = document.getElementById("sidebarUtilityActions");
    if (!sidebarActionWrap) {
        sidebarActionWrap = document.createElement("div");
        sidebarActionWrap.id = "sidebarUtilityActions";
        sidebarActionWrap.style.display = "flex";
        sidebarActionWrap.style.flexDirection = "column";
        sidebarActionWrap.style.gap = "12px";
        sidebarActionWrap.style.marginTop = "12px";
        const langContainer = document.querySelector(".language-selector");
        if (langContainer && langContainer.parentNode) {
            langContainer.parentNode.insertBefore(sidebarActionWrap, langContainer.nextSibling);
        } else {
            sidebarEl.appendChild(sidebarActionWrap);
        }
    }

    let clearBtn = document.getElementById("btnClearAllChapters");
    if (!clearBtn) {
        clearBtn = document.createElement("button");
        clearBtn.id = "btnClearAllChapters";
        clearBtn.className = "btn-ghost";
        clearBtn.type = "button";
        clearBtn.style.width = "100%";
        clearBtn.style.justifyContent = "center";
        clearBtn.style.display = "flex";
        clearBtn.style.alignItems = "center";
        clearBtn.style.color = "#d84c4c";
        clearBtn.style.borderColor = "rgba(216, 76, 76, 0.35)";
        clearBtn.textContent = i18n.t("sidebar.clearAllChapters", "清空所有章节");
    }
    clearBtn.onclick = clearAllChapterEditorContent;
    clearBtn.style.marginTop = "0";
    if (clearBtn.parentNode !== sidebarActionWrap) {
        sidebarActionWrap.appendChild(clearBtn);
    }

    // 1. Create Draft Button in Sidebar (if not exists)
    let draftBtn = document.getElementById("btnDraftBox");
    if (!draftBtn) {
        draftBtn = document.createElement("button");
        draftBtn.id = "btnDraftBox";
        draftBtn.className = "btn-ghost";
        draftBtn.type = "button";
        draftBtn.style.width = "100%";
        draftBtn.style.justifyContent = "center"; // [Fix] Center alignment
        draftBtn.style.display = "flex";
        draftBtn.style.alignItems = "center";
        draftBtn.innerHTML = i18n.t("sidebar.draftBox", `${ICONS.folder}草稿箱`); // Removed space
    }
    draftBtn.style.marginTop = "0";
    if (draftBtn.parentNode !== sidebarActionWrap) {
        sidebarActionWrap.appendChild(draftBtn);
    }

    // 2. Create Modal DOM
    let modalOverlay = document.querySelector(".draft-modal-overlay");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.className = "draft-modal-overlay";
        modalOverlay.innerHTML = `
            <div class="draft-modal">
                <div class="draft-header">
                    <h3 data-i18n="draft.modalTitle">草稿箱 (Draft Box)</h3>
                    <div style="display:flex;gap:8px">
                        <input type="file" id="importDraftInput" accept=".json" style="display:none">
                        <button class="btn-secondary btn-sm" id="btnImportDraft" data-i18n="draft.importDraft">导入备份</button>
                        <button class="btn-primary btn-sm" id="btnNewDraft" data-i18n="draft.newDraft">新建草稿</button>
                        <button class="btn-icon" id="btnCloseDraft">${ICONS.close}</button>
                    </div>
                </div>
                <div class="draft-body">
                    <div class="draft-list" id="draftList"></div>
                </div>
            </div>
            `;
        document.body.appendChild(modalOverlay);

        // Bind Events
        document.getElementById("btnCloseDraft").onclick = () => modalOverlay.classList.remove("visible");
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove("visible");
        };

        document.getElementById("btnNewDraft").onclick = async () => {
            const title = prompt("请输入草稿标题:", `未命名草稿 - ${new Date().toLocaleTimeString()}`);
            if (title) {
                await draftService.saveDraft(title, state);
                renderDraftList();
                alert(i18n.t("draft.saveSuccess", "草稿已保存"));
            }
        };

        document.getElementById("btnImportDraft").onclick = () => document.getElementById("importDraftInput").click();
        document.getElementById("importDraftInput").onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await draftService.importDraft(file);
                renderDraftList();
                alert(i18n.t("draft.importSuccess", "草稿已导入"));
            } catch (err) {
                alert("导入失败: " + err.message);
            }
            e.target.value = "";
        };
    }

    // 3. Render List Function
    async function renderDraftList() {
        const listEl = document.getElementById("draftList");
        listEl.innerHTML = '<div style="padding:20px;text-align:center">Loading...</div>';
        try {
            const drafts = await draftService.getAllDrafts();
            listEl.innerHTML = "";
            if (drafts.length === 0) {
                listEl.innerHTML = `<div class="draft-empty" data-i18n="draft.empty">暂无草稿</div>`;
                return;
            }

            drafts.forEach(draft => {
                const item = document.createElement("div");
                item.className = "draft-item";
                const dateStr = new Date(draft.updatedAt).toLocaleString();
                const chapterCount = (draft.data.chapters || []).filter(c => c.status === "已生成").length;

                item.innerHTML = `
        <div class="draft-info">
                        <div class="draft-title">${draft.title}</div>
                        <div class="draft-meta">${dateStr} · ${chapterCount} 章节</div>
                    </div>
            <div class="draft-actions">
                <button class="btn-icon" title="读取 (Load)" onclick="window.loadDraft('${draft.id}')">${ICONS.load}</button>
                <button class="btn-icon" title="导出 (Export)" onclick="window.exportDraft('${draft.id}')">${ICONS.export}</button>
                <button class="btn-icon danger" title="删除 (Delete)" onclick="window.deleteSavedDraft('${draft.id}')">${ICONS.delete}</button>
            </div>
                `;
                listEl.appendChild(item);
            });
        } catch (e) {
            listEl.innerHTML = `<div style="color:red">Error loading drafts: ${e.message}</div>`;
        }
    }

    // 4. Expose Global Actions (for onclick handlers)
    window.loadDraft = async (id) => {
        if (!confirm(i18n.t("draft.loadConfirm", "读取草稿将覆盖当前工作区，确定吗？"))) return;
        try {
            const drafts = await draftService.getAllDrafts();
            const draft = drafts.find(d => d.id === id);
            if (draft) {
                state = draft.data;
                ensureChaptersSchema(); // Ensure schema compatibility
                persistState();
                render();
                modalOverlay.classList.remove("visible");
                alert(i18n.t("draft.loadSuccess", "草稿已读取"));
            }
        } catch (e) {
            alert("读取失败: " + e.message);
        }
    };

    window.deleteSavedDraft = async (id) => {
        if (!confirm(i18n.t("draft.deleteConfirm", "确定删除该草稿吗？"))) return;
        await draftService.deleteDraft(id);
        renderDraftList();
    };

    window.exportDraft = async (id) => {
        const drafts = await draftService.getAllDrafts();
        const draft = drafts.find(d => d.id === id);
        if (draft) {
            const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `draft - ${draft.title} - ${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // 5. Open Modal Action
    draftBtn.onclick = () => {
        modalOverlay.classList.add("visible");
        renderDraftList();
    };
}

function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const fallback = el.dataset.i18nFallback || el.textContent;
        el.textContent = i18n.t(key, fallback);
    });
}

applyStaticTranslations();

if (languageSelectEl) {
    languageSelectEl.value = i18n.getLocale();
    languageSelectEl.addEventListener("change", () => {
        const changed = i18n.setLocale(languageSelectEl.value);
        if (changed) {
            localStorage.setItem(LOCALE_STORAGE_KEY, i18n.getLocale());
        }
    });
}

i18n.onChange(() => {
    applyStaticTranslations();
    if (languageSelectEl) {
        languageSelectEl.value = i18n.getLocale();
    }
    const clearBtn = document.getElementById("btnClearAllChapters");
    if (clearBtn) clearBtn.textContent = i18n.t("sidebar.clearAllChapters", "清空所有章节");
    // Update Draft Button Text
    const draftBtn = document.getElementById("btnDraftBox");
    if (draftBtn) draftBtn.innerHTML = i18n.t("sidebar.draftBox", `${ICONS.folder}草稿箱`);

    localStorage.setItem(LOCALE_STORAGE_KEY, i18n.getLocale());
    render();
});

// ============= 关键修复：持久化时不保存 preview，且超限降级 =============
let __storageMode = 'local';
/* =========================================================
   [ ✨ Real-time Preview Helpers ✨ ]
   ========================================================= */

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function getCurrentTemplatePath() {
    const type = state.currentReportType;
    if (REPORT_CONFIGS[type]) {
        return REPORT_CONFIGS[type].templateFile;
    }
    return "";
}

function isLiveTemplate() {
    // Only "Quiet Luxury" and "Style Planning" enabling the live preview split-view
    return state.currentReportType === 'quiet_luxury' || isPlanningReportType(state.currentReportType);
}

function ensureLiveIframe() {
    if (!isLiveTemplate()) return null;
    let iframe = document.getElementById('previewIframe') || document.getElementById('sp-preview-frame');
    return iframe;
}

// [Refactor] Core Preview Render Function (No Debounce)
function renderPreviewCore(forceUpdateAll = false) {
    const isLive = isLiveTemplate();
    console.log("[DEBUG] renderPreviewCore called", { forceUpdateAll, isLive, ts: Date.now() });

    if (!isLive) return;
    const iframe = ensureLiveIframe();
    if (!iframe || !iframe.contentWindow) {
        console.warn("[DEBUG] renderPreviewCore: iframe not ready or missing", { id1: !!document.getElementById('previewIframe'), id2: !!document.getElementById('sp-preview-frame'), ts: Date.now() });
        return;
    }

    const timestamp = Date.now(); // Force update timestamp

    if (forceUpdateAll) {
        state.chapters.forEach((ch, idx) => {
            try {
                const data = JSON.parse(JSON.stringify(ch));
                iframe.contentWindow.postMessage({
                    type: 'UPDATE_CHAPTER_DATA',
                    index: idx,
                    data,
                    timestamp
                }, '*');
            } catch (error) {
                console.warn('[Preview] Failed to sync chapter to iframe:', ch?.id, error);
            }
        });
        return;
    }

    // Optimization: Update current chapter
    const idx = state.currentIndex;
    const ch = state.chapters[idx];
    if (ch && idx >= 0) {
        try {
            const data = JSON.parse(JSON.stringify(ch));
            iframe.contentWindow.postMessage({
                type: 'UPDATE_CHAPTER_DATA',
                index: idx,
                data,
                timestamp
            }, '*');
            console.log(`[App] Sent UPDATE_CHAPTER_DATA for chapter ${ch.id}`, { index: idx, ts: timestamp });
        } catch (error) {
            console.warn('[Preview] Failed to sync current chapter to iframe:', ch?.id, error);
        }
    }
}

const pushLivePreview = debounce(renderPreviewCore, 150);
let livePreviewNavigationSequence = 0;
let themeThemeStep1PreviewAutoFollowEnabled = true;

function cancelLivePreviewChapterNavigation() {
    livePreviewNavigationSequence += 1;
}

function attachLivePreviewManualScrollGuard(iframe, cleanupKey = "", activeSteps = [1]) {
    if (!iframe) return;
    if (cleanupKey) cleanupLivePreviewViewport(cleanupKey);

    let boundWindow = null;
    let boundDocument = null;
    const handleManualWheel = () => {
        const allowedSteps = Array.isArray(activeSteps) ? activeSteps : [activeSteps];
        if (!(isLiveTemplate() && allowedSteps.includes(state.step))) return;
        cancelLivePreviewChapterNavigation();
        if (state.step === 1 && isThemeThemePlanningType(state.currentReportType)) {
            themeThemeStep1PreviewAutoFollowEnabled = false;
        }
    };

    const unbindFrameWheel = () => {
        if (boundDocument) {
            boundDocument.removeEventListener("wheel", handleManualWheel);
            boundDocument = null;
        }
        if (!boundWindow) return;
        boundWindow.removeEventListener("wheel", handleManualWheel);
        boundWindow = null;
    };

    const bindFrameWheel = () => {
        unbindFrameWheel();
        const frameWindow = iframe.contentWindow;
        const frameDocument = iframe.contentDocument || (frameWindow ? frameWindow.document : null);
        if (!frameWindow) return;
        try {
            frameWindow.addEventListener("wheel", handleManualWheel, { passive: true });
            if (frameDocument) {
                frameDocument.addEventListener("wheel", handleManualWheel, { passive: true });
                boundDocument = frameDocument;
            }
            boundWindow = frameWindow;
        } catch (error) {
            console.warn("[Preview] Failed to bind manual scroll guard:", error);
        }
    };

    const handleLoad = () => bindFrameWheel();
    iframe.addEventListener("load", handleLoad);
    bindFrameWheel();

    const cleanup = () => {
        unbindFrameWheel();
        iframe.removeEventListener("load", handleLoad);
    };

    if (cleanupKey) {
        window[cleanupKey] = cleanup;
    }
}

function schedulePreviewRender() {
    renderPreviewCore(false);
}

function refreshThemeColorLivePreviewIfNeeded(chapter = state?.chapters?.[state.currentIndex]) {
    if (!isLiveTemplate()) return;
    if (!isThemeThemePlanningType(state.currentReportType)) return;
    if (!chapter || chapter.id !== "page4") return;
    forceHydrateLivePreview(true);
}

function forceHydrateLivePreview(forceUpdateAll = true) {
    const sendAll = () => renderPreviewCore(true);
    const sendCurrent = () => renderPreviewCore(false);
    if (forceUpdateAll) {
        sendAll();
        window.setTimeout(sendAll, 40);
        window.setTimeout(sendCurrent, 90);
        window.setTimeout(sendAll, 180);
        window.setTimeout(sendCurrent, 260);
        return;
    }
    sendCurrent();
    window.setTimeout(sendCurrent, 40);
    window.setTimeout(sendCurrent, 180);
}

function tryDirectScrollLivePreview(iframe, chapterId) {
    if (!iframe || !chapterId) return false;
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument || (win ? win.document : null);
    if (!win || !doc) return false;

    try {
        const target = doc.getElementById(chapterId);
        if (!target) return false;
        const style = typeof win.getComputedStyle === "function" ? win.getComputedStyle(target) : null;
        if (style && (style.display === "none" || style.visibility === "hidden")) {
            return false;
        }
        const currentY =
            win.scrollY ||
            win.pageYOffset ||
            doc.documentElement.scrollTop ||
            (doc.body ? doc.body.scrollTop : 0) ||
            0;
        const rect = target.getBoundingClientRect();
        const targetY = Math.max(rect.top + currentY, 0);
        win.scrollTo(0, targetY);
        if (typeof win.requestAnimationFrame === "function") {
            win.requestAnimationFrame(() => win.scrollTo(0, targetY));
        }
        return true;
    } catch (error) {
        console.warn("[Preview] Direct iframe scroll failed:", error);
        return false;
    }
}

function syncLivePreviewChapterNavigation(index = state.currentIndex, options = {}) {
    if (!isLiveTemplate()) return;

    const iframe = ensureLiveIframe();
    if (!iframe || !iframe.contentWindow) return;

    const targetIndex = Number.isInteger(index) ? index : state.currentIndex;
    const targetChapterId = (() => {
        const chapter = Array.isArray(state?.chapters) ? state.chapters[targetIndex] : null;
        return chapter && typeof chapter.id === "string" ? chapter.id : "";
    })();
    const forceUpdateAll = options.forceUpdateAll !== undefined
        ? !!options.forceUpdateAll
        : isThemeThemePlanningType(state.currentReportType);
    const respectManualPreviewScroll = options.respectManualPreviewScroll !== undefined
        ? !!options.respectManualPreviewScroll
        : true;

    if (
        respectManualPreviewScroll &&
        state.step === 1 &&
        isThemeThemePlanningType(state.currentReportType) &&
        !themeThemeStep1PreviewAutoFollowEnabled
    ) {
        forceHydrateLivePreview(forceUpdateAll);
        return;
    }

    const navigationSequence = ++livePreviewNavigationSequence;

    forceHydrateLivePreview(forceUpdateAll);

    const scrollToTarget = () => {
        if (navigationSequence !== livePreviewNavigationSequence) return;
        const liveIframe = ensureLiveIframe();
        if (!liveIframe || !liveIframe.contentWindow) return;
        tryDirectScrollLivePreview(liveIframe, targetChapterId);
        liveIframe.contentWindow.postMessage({
            type: 'SCROLL_TO_CHAPTER',
            index: targetIndex,
            chapterId: targetChapterId
        }, '*');
    };

    const keepTargetAnchored = (remainingChecks = 18) => {
        if (navigationSequence !== livePreviewNavigationSequence || remainingChecks <= 0) return;
        const liveIframe = ensureLiveIframe();
        const liveDoc = liveIframe ? (liveIframe.contentDocument || (liveIframe.contentWindow ? liveIframe.contentWindow.document : null)) : null;
        const targetNode = liveDoc && targetChapterId ? liveDoc.getElementById(targetChapterId) : null;
        const targetTop = targetNode ? targetNode.getBoundingClientRect().top : Number.NaN;
        if (!Number.isFinite(targetTop) || Math.abs(targetTop) > 8) {
            scrollToTarget();
        }
        window.setTimeout(() => keepTargetAnchored(remainingChecks - 1), 400);
    };

    scrollToTarget();
    [60, 180, 360, 600].forEach((delay) => {
        window.setTimeout(scrollToTarget, delay);
    });
    window.setTimeout(() => keepTargetAnchored(), 900);
}

function refreshPreviewAfterAiGenerate(forceUpdateAll = true) {
    if (state.step === 1 && isLiveTemplate()) {
        const iframe = document.getElementById("previewIframe");
        const templateFile = getCurrentTemplatePath();
        if (iframe && templateFile) {
            const shouldReloadPreviewTemplate =
                iframe.dataset.reportType !== state.currentReportType ||
                iframe.dataset.templateFile !== templateFile;
            iframe.dataset.reportType = state.currentReportType;
            iframe.dataset.templateFile = templateFile;
            if (shouldReloadPreviewTemplate) {
                iframe.src = `${templateFile}?chIdx=${state.currentIndex}&v=${Date.now()}`;
            } else if (iframe.contentWindow) {
                syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll });
            }
        } else {
            forceHydrateLivePreview(forceUpdateAll);
        }
        return;
    }
    forceHydrateLivePreview(forceUpdateAll);
}

window.postToPreview = pushLivePreview;
window.schedulePreviewRender = schedulePreviewRender;
function extractImageUrlFromChapterAsset(img) {
    if (!img) return "";
    if (typeof img === "string") return img.trim();
    if (typeof img.url === "string" && img.url.trim()) return img.url.trim();
    if (typeof img.preview === "string" && img.preview.trim()) return img.preview.trim();
    return "";
}

function getFirstChapterImageUrlForAutoSync(chapter) {
    if (!chapter || typeof chapter !== "object") return "";

    const objectImageSources = [chapter.images, chapter.mainImages, chapter.detailImages];
    for (const source of objectImageSources) {
        if (!Array.isArray(source)) continue;
        for (const img of source) {
            const url = extractImageUrlFromChapterAsset(img);
            if (url) return url;
        }
    }

    const stringImageSources = [chapter.mainImageUrls, chapter.detailImageUrls];
    for (const source of stringImageSources) {
        if (!Array.isArray(source)) continue;
        for (const url of source) {
            if (typeof url === "string" && url.trim()) return url.trim();
        }
    }

    const customData = chapter.customData || {};
    const keyMatch = Object.keys(customData)
        .filter(k => /^detail_\d+_\d+$/.test(k))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const key of keyMatch) {
        const val = customData[key];
        if (typeof val === "string" && val.trim()) return val.trim();
    }

    return "";
}

function isAutoManagedRecommendationAsset(asset) {
    return !!(asset && typeof asset === "object" && (asset.autoManagedRecommendation === true || asset.cmsStatus === "auto"));
}

function cloneRecommendationAssetForSync(asset, { autoManaged = false } = {}) {
    const url = extractImageUrlFromChapterAsset(asset);
    if (!url) return null;

    const base = (asset && typeof asset === "object" && !Array.isArray(asset))
        ? { ...asset }
        : {};
    const next = {
        ...base,
        url,
        preview: (typeof base.preview === "string" && base.preview.trim()) ? base.preview.trim() : url
    };

    if (autoManaged) {
        next.cmsStatus = "auto";
        next.autoManagedRecommendation = true;
        if (typeof next.uploadStatus !== "string") next.uploadStatus = "";
    }

    return next;
}

function getRecommendationSlotAssets(chapter, limit = 6) {
    const slotCount = Number.isInteger(chapter?.maxImages) && chapter.maxImages > 0 ? chapter.maxImages : limit;
    const hasMainImages = Array.isArray(chapter?.mainImages)
        && chapter.mainImages.some(img => !!extractImageUrlFromChapterAsset(img));
    const source = hasMainImages
        ? chapter.mainImages
        : (Array.isArray(chapter?.images) ? chapter.images : []);

    return Array.from({ length: slotCount }, (_, idx) => source[idx] || null);
}

function getRecommendationSlotUrls(chapter, limit = 6) {
    return getRecommendationSlotAssets(chapter, limit).map(asset => extractImageUrlFromChapterAsset(asset) || "");
}

function hasManualRecommendationImages(chapter, limit = 6) {
    return getRecommendationSlotAssets(chapter, limit).some(asset => {
        const url = extractImageUrlFromChapterAsset(asset);
        if (!url) return false;
        return !isAutoManagedRecommendationAsset(asset);
    });
}

function syncRecommendationChapterSlots(chapter, slotAssets, { autoManaged = false, forceUrlList = false } = {}) {
    const slotCount = Number.isInteger(chapter?.maxImages) && chapter.maxImages > 0 ? chapter.maxImages : 6;
    const normalizedSlots = Array.from({ length: slotCount }, (_, idx) => {
        const normalized = cloneRecommendationAssetForSync(slotAssets[idx], { autoManaged });
        return normalized ? normalized : null;
    });

    chapter.mainImages = normalizedSlots.map(asset => (asset ? { ...asset } : null));
    chapter.images = normalizedSlots.map(asset => (asset ? { ...asset } : null));
    syncFormalImageUrls(chapter, { force: forceUrlList });

    return normalizedSlots.filter(Boolean).length;
}

function syncRecommendationFromChapters() {
    const recommendationChapter = state.chapters.find(ch => ch && ch.id === "recommendation-page");
    if (!recommendationChapter) return 0;
    if (isThemeThemePlanningType(state.currentReportType)) {
        return getRecommendationSlotUrls(recommendationChapter, recommendationChapter.maxImages || 6).filter(Boolean).length;
    }
    const slotCount = Number.isInteger(recommendationChapter.maxImages) && recommendationChapter.maxImages > 0
        ? recommendationChapter.maxImages
        : 6;

    const excludeIds = new Set([
        "cover-page",
        "toc-page",
        "themeItemsDirectory",
        "keyItemsDirectory",
        "patternsDirectory",
        "brandsDirectory",
        "conclusion-page",
        "recommendation-page"
    ]);
    const isDynamicDetailId = (id) => /^(keyItem|patternDetail|brandDetail)\d+$/.test(String(id || ""))
        || isThemeThemeItemDetailId(id);

    const sourceChapters = state.chapters.filter(ch => {
        if (!ch || typeof ch.id !== "string") return false;
        if (ch.isActive === false) return false;
        if (excludeIds.has(ch.id)) return false;
        if (isDynamicDetailId(ch.id)) return false;
        return true;
    });

    const nextImages = [];
    for (const chapter of sourceChapters) {
        const url = getFirstChapterImageUrlForAutoSync(chapter);
        if (!url) continue;
        nextImages.push({
            url,
            preview: url,
            uploadStatus: "",
            cmsStatus: "auto",
            autoManagedRecommendation: true
        });
        if (nextImages.length >= slotCount) break;
    }

    const editorSlotUrls = getRecommendationSlotUrls(recommendationChapter, slotCount);
    const previewSlotUrls = Array.from({ length: slotCount }, (_, idx) => {
        const asset = Array.isArray(recommendationChapter.images) ? recommendationChapter.images[idx] : null;
        return extractImageUrlFromChapterAsset(asset) || "";
    });

    if (hasManualRecommendationImages(recommendationChapter, slotCount)) {
        if (JSON.stringify(previewSlotUrls) !== JSON.stringify(editorSlotUrls)) {
            syncRecommendationChapterSlots(
                recommendationChapter,
                getRecommendationSlotAssets(recommendationChapter, slotCount),
                { autoManaged: false, forceUrlList: false }
            );
        }
        return editorSlotUrls.filter(Boolean).length;
    }

    const nextSlotUrls = Array.from({ length: slotCount }, (_, idx) => nextImages[idx]?.url || "");
    const hasExistingAutoSlots = getRecommendationSlotAssets(recommendationChapter, slotCount)
        .filter(asset => !!extractImageUrlFromChapterAsset(asset))
        .every(isAutoManagedRecommendationAsset);

    if (
        JSON.stringify(editorSlotUrls) === JSON.stringify(nextSlotUrls)
        && JSON.stringify(previewSlotUrls) === JSON.stringify(nextSlotUrls)
        && hasExistingAutoSlots
    ) {
        return nextImages.length;
    }

    syncRecommendationChapterSlots(recommendationChapter, nextImages, { autoManaged: true, forceUrlList: true });
    recommendationChapter.status = recommendationChapter.status || "已同步";
    return nextImages.length;
}

/**
 * 统一的目录同步函数
 * 支持三种类型: keyItems, patterns, brands
 * @param {string} type - 'keyItems' | 'patterns' | 'brands'
 * @returns {number} - 同步的项目数量
 */
function syncDirectoryFromDetails(type) {
    const config = isThemeThemePlanningType(state.currentReportType)
        ? THEME_THEME_DIRECTORY_SYNC_CONFIG
        : {
            keyItems: {
                directoryId: 'keyItemsDirectory',
                detailPrefix: 'keyItem',
                fieldPrefix: 'item',
                maxCount: 8,
                name: '关键单品'
            },
            patterns: {
                directoryId: 'patternsDirectory',
                detailPrefix: 'patternDetail',
                fieldPrefix: 'pattern',
                maxCount: 8,
                name: '关键图案'
            },
            brands: {
                directoryId: 'brandsDirectory',
                detailPrefix: 'brandDetail',
                fieldPrefix: 'brand',
                maxCount: 8,
                name: '品牌推荐'
            }
        };

    const cfg = config[type];
    if (!cfg) {
        console.warn(`[同步] 未知的同步类型: ${type}`);
        return 0;
    }

    // 找到目录章节
    const directoryChapterIndex = state.chapters.findIndex(ch => ch.id === cfg.directoryId);
    if (directoryChapterIndex === -1) {
        console.warn(`[同步] 未找到${cfg.name}目录章节 (${cfg.directoryId})`);
        return 0;
    }

    const directoryChapter = state.chapters[directoryChapterIndex];

    // 找到所有激活的详情章节
    // 严格检查: 只包含 isActive === true 的章节,并且排除目录页本身
    const detailChapters = state.chapters.filter(ch =>
        ch.id.startsWith(cfg.detailPrefix) &&
        ch.id !== cfg.directoryId &&  // 排除目录页本身!
        ch.isActive === true
    ).sort((a, b) => {
        // 按照数字顺序排序
        const numA = parseInt(a.id.replace(cfg.detailPrefix, '')) || 0;
        const numB = parseInt(b.id.replace(cfg.detailPrefix, '')) || 0;
        return numA - numB;
    });

    console.log(`[同步] 找到 ${detailChapters.length} 个激活的${cfg.name}细节页`);

    // 初始化customData
    if (!directoryChapter.customData) {
        directoryChapter.customData = {};
    }

    // 清空旧数据
    for (let i = 1; i <= cfg.maxCount; i++) {
        directoryChapter.customData[`${cfg.fieldPrefix}${i}_title`] = '';
        directoryChapter.customData[`${cfg.fieldPrefix}${i}_intro`] = '';
        directoryChapter.customData[`${cfg.fieldPrefix}${i}_image`] = '';
    }

    // 同步每个项目的标题和简介
    detailChapters.forEach((chapter, index) => {
        const itemNum = index + 1;

        // 同步标题（兼容历史键 brand_name）
        const title = chapter.customData?.page_title || chapter.customData?.brand_name || chapter.title || `${cfg.name} ${itemNum}`;
        directoryChapter.customData[`${cfg.fieldPrefix}${itemNum}_title`] = title;

        // 同步简介（兼容历史键 intro）
        const intro = chapter.customData?.page_intro || chapter.customData?.intro || chapter.summary || '';
        directoryChapter.customData[`${cfg.fieldPrefix}${itemNum}_intro`] = intro;

        // 同步详情页第一张有效图片作为目录缩略图
        directoryChapter.customData[`${cfg.fieldPrefix}${itemNum}_image`] = getFirstChapterImageUrlForAutoSync(chapter);

        console.log(`[同步] ${cfg.name}${itemNum}: ${title.substring(0, 20)}...`);
    });

    // 更新状态
    directoryChapter.status = '已同步';

    console.log(`[同步] ${cfg.name}目录已更新`);

    return detailChapters.length;
}

/**
 * 兼容旧函数名
 */
function syncKeyItemsDirectory() {
    return syncDirectoryFromDetails('keyItems');
}
// ===============================================================

function getDirectorySyncTypeForChapterId(chapterId, reportType = state?.currentReportType) {
    const id = String(chapterId || "");
    if (/^keyItem\d+$/.test(id)) return "keyItems";
    if (isThemeThemePlanningType(reportType) && isThemeThemeItemDetailId(id)) return "themeItems";
    if (/^patternDetail\d+$/.test(id)) {
        return isThemeThemePlanningType(reportType) ? "keyItems" : "patterns";
    }
    if (/^brandDetail\d+$/.test(id)) return "brands";
    return "";
}

function syncDirectoryForChapter(chapterId, reportType = state?.currentReportType) {
    const syncType = getDirectorySyncTypeForChapterId(chapterId, reportType);
    if (syncType) {
        syncDirectoryFromDetails(syncType);
    }
    return syncType;
}
// ===============================================================

// [Deleted legacy comments]

function persistState() {
    console.log("[DEBUG] persistState called");
    // [Auto] Recommendation page thumbnails read from corresponding chapters.
    syncRecommendationFromChapters();
    saveCurrentReportTypeSnapshot();

    // [Sync] Ensure ch.images is always in sync with split main/detail arrays
    state.chapters.forEach(ch => {
        if (Array.isArray(ch.mainImages)) {
            // [Modified] Respect configuration by not enforcing strict limit here

            const details = Array.isArray(ch.detailImages) ? ch.detailImages : [];

            // Reconstruct consistent ch.images
            ch.images = [...ch.mainImages, ...details];
        }
    });

    // [ 🔄 新增开始：清理 reportFinal 中的 preview 🔄 ]
    let cleanReportFinal = state.reportFinal; // 1. 复制 state.reportFinal

    // 2. 检查 dynamics_images 数组是否存在
    if (cleanReportFinal && Array.isArray(cleanReportFinal.dynamics_images)) {

        // 3. 创建一个新的 reportFinal 对象
        cleanReportFinal = {
            ...cleanReportFinal, // 复制所有字段 (如 title, intro 等)

            // 4. 覆盖 dynamics_images 字段，只保留需要的数据
            dynamics_images: cleanReportFinal.dynamics_images.map(img => ({
                name: img.name || null,
                url: img.url || null,
                uploadStatus: img.uploadStatus || null,
                cmsStatus: img.cmsStatus || null
                // 明确地不保存 'preview' 字段
            }))
        };
    }
    // [ 🔄 新增结束 🔄 ]


    const toSave = {
        ...state,
        reportFinal: cleanReportFinal, // <-- 🔄 修改：使用清理过的 cleanReportFinal

        chapters: state.chapters.map(ch => {
            // [Sync] Key Items Panel Composition to ch.images (Indices 16-18) for transform support
            if (ch.id === 'ch8' || ch.id === 'ch9') {
                const compKeys = ['comp_img_bg1', 'comp_img_bg2', 'comp_img_overlay'];
                compKeys.forEach((key, i) => {
                    const url = ch.customData?.[key];
                    const imgIdx = 16 + i;
                    if (url) {
                        if (!ch.images[imgIdx] || ch.images[imgIdx].url !== url) {
                            if (!ch.images) ch.images = [];
                            ch.images[imgIdx] = {
                                url: url,
                                preview: url,
                                transform: ch.images[imgIdx]?.transform || null
                            };
                        }
                    } else if (ch.images && ch.images[imgIdx]) {
                        ch.images[imgIdx] = null;
                    }
                });
            }

            return {
                id: ch.id,
                urlListStr: ch.urlListStr,
                mainImageUrls: ch.mainImageUrls || [],
                detailImageUrls: ch.detailImageUrls || [],
                title: ch.title,
                keywords: ch.keywords || "",
                summary: ch.summary || "",
                status: ch.status || "未生成",
                generatedData: ch.generatedData,
                // [ ✨ Save New Fields ✨ ]
                mainImages: (ch.mainImages || []).map(img => img ? {
                    name: img.name || null,
                    url: img.url || null,
                    uploadStatus: img.uploadStatus || null,
                    cmsStatus: img.cmsStatus || null,
                    transform: img.transform || null,
                    imgName: img.imgName || null
                } : null),
                detailImages: (ch.detailImages || []).map(img => img ? {
                    name: img.name || null,
                    url: img.url || null,
                    uploadStatus: img.uploadStatus || null,
                    cmsStatus: img.cmsStatus || null,
                    imgName: img.imgName || null
                } : null),
                // Legacy support
                images: (ch.images || []).map(img => img ? {
                    name: img.name || null,
                    url: img.url || null,
                    uploadStatus: img.uploadStatus || null,
                    cmsStatus: img.cmsStatus || null,
                    transform: img.transform || null
                } : null),
                inspiration: ch.inspiration || "",
                hasUserInput: !!ch.hasUserInput,
                isActive: ch.isActive !== undefined ? ch.isActive : true,
                isUnlocked: ch.isUnlocked !== undefined ? ch.isUnlocked : true,
                customData: ch.customData || {}
            };
        })
    };
    try {
        localStorage.setItem('pop-ai-chapters-v2', JSON.stringify(toSave));
        __storageMode = 'local';
    } catch (e) {
        console.warn('localStorage 超限，尝试降级到 sessionStorage', e);
        try {
            sessionStorage.setItem('pop-ai-chapters-v2', JSON.stringify(toSave));
            __storageMode = 'session';
        } catch (e2) {
            console.warn('sessionStorage 也不可用，降级为内存会话', e2);
            __storageMode = 'memory';
        }
        const hint = document.getElementById('envHint');
        if (hint) {
            hint.textContent = '💡 本地存储已达上限，当前改为会话(内存)保存。建议减少图片数量或使用桌面版 Chrome/Edge。';
            hint.style.color = '#b45309';
        }
    }

    // [ 🔄 Auto-sync All Directories 🔄 ]
    // 如果当前编辑的是任何详情页，自动同步到对应的目录
    const currentChapter = state.chapters[state.currentIndex];
    if (currentChapter) {
        let syncType = null;
        // 判断当前章节类型并确定同步类型
        if (currentChapter.id.startsWith('keyItem') && currentChapter.id !== 'keyItemsDirectory') {
            syncType = 'keyItems';
        } else if (isThemeThemePlanningType(state.currentReportType) && currentChapter.id.startsWith('themeItemDetail')) {
            syncType = 'themeItems';
        } else if (currentChapter.id.startsWith('patternDetail')) {
            syncType = isThemeThemePlanningType(state.currentReportType) ? 'keyItems' : 'patterns';
        } else if (currentChapter.id.startsWith('brandDetail')) {
            syncType = 'brands';
        }

        // 如果是详情页, 同步到目录 (在刷新前执行)
        if (syncType) {
            syncDirectoryFromDetails(syncType);
        }
    }

    // Keep style-planning chapter dots in sync with live input.
    if (isPlanningReportType(state.currentReportType) && state.step === 1 && chaptersNavEl) {
        renderChaptersNav();
    }

    // [ 🔄 Trigger Real-time Preview Update 🔄 ]
    pushLivePreview(true);
}
// ===============================================================

function setStep(n) {
    if (isPlanningReportType(state.currentReportType) && state.step === 2 && n !== 2) {
        try {
            if (typeof window._beforeLeaveStylePlanningStep2 === 'function') {
                window._beforeLeaveStylePlanningStep2();
            }
        } catch (err) {
            console.warn('[SP] Failed to flush Step 2 preview state before leaving:', err);
        }
    }
    state.step = n;
    persistState();
    render();
}

function renderSteps() {
    stepsNavEl.innerHTML = "";

    // [Quiet Luxury] 2-Step Workflow
    if (state.currentReportType === 'quiet_luxury' || isPlanningReportType(state.currentReportType)) {
        const steps = [
            { title: "步骤 1", desc: "编辑章节" },
            { title: "步骤 2", desc: "预览与导出" }
        ];

        steps.forEach((s, i) => {
            const b = document.createElement("button");
            b.className = "step-btn" + (state.step === (i + 1) ? " active" : "");
            b.textContent = `${s.title} · ${s.desc}`;
            b.onclick = () => setStep(i + 1);
            stepsNavEl.appendChild(b);
        });
        return;
    }

    // [Standard]
    const stepMeta = [
        { titleKey: "steps.step1.title", descKey: "steps.step1.desc", fallbackTitle: "步骤 1", fallbackDesc: "上传并生成章节" },
        { titleKey: "steps.step2.title", descKey: "steps.step2.desc", fallbackTitle: "步骤 2", fallbackDesc: "全局汇编" },
        { titleKey: "steps.step3.title", descKey: "steps.step3.desc", fallbackTitle: "步骤 3", fallbackDesc: "查看HTML" }
    ];
    stepMeta.forEach((meta, idx) => {
        const title = i18n.t(meta.titleKey, meta.fallbackTitle);
        const desc = i18n.t(meta.descKey, meta.fallbackDesc);
        const b = document.createElement("button");
        b.className = "step-btn" + (state.step === idx + 1 ? " active" : "");
        b.textContent = `${title} · ${desc}`;
        b.onclick = () => setStep(idx + 1);
        stepsNavEl.appendChild(b);
    });
}
// [ 🔄 Chapter Reordering Logic 🔄 ]
function handleChapterReorder(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    // 1. Reorder Array
    const movedChapter = state.chapters.splice(fromIndex, 1)[0];
    state.chapters.splice(toIndex, 0, movedChapter);

    // 2. Regenerate IDs & Update Data
    state.chapters.forEach((ch, idx) => {
        const newId = `chapter-${idx + 1}`;
        ch.id = newId;
        if (ch.generatedData) {
            ch.generatedData.chapter_id = newId;
        }
    });

    // 3. Sync to Intermediate/Final Report
    // Sync Intermediate
    if (state.reportIntermediate && state.reportIntermediate.chapters) {
        // Re-map based on current chapters to ensure order and IDs are synced
        state.reportIntermediate.chapters = state.chapters
            .filter(ch => ch.generatedData)
            .map(ch => ch.generatedData);
    }

    // Sync Final
    if (state.reportFinal) {
        if (state.reportFinal.chapter_order) {
            state.reportFinal.chapter_order = state.chapters.map(ch => ch.id);
        }
        if (state.reportFinal.generated_chapters_content) {
            state.reportFinal.generated_chapters_content = state.chapters
                .filter(ch => ch.generatedData)
                .map(ch => ch.generatedData);
        }
    }

    // 4. Update Current Index if needed
    if (state.currentIndex === fromIndex) {
        state.currentIndex = toIndex;
    } else if (state.currentIndex > fromIndex && state.currentIndex <= toIndex) {
        state.currentIndex--;
    } else if (state.currentIndex < fromIndex && state.currentIndex >= toIndex) {
        state.currentIndex++;
    }

    persistState();
    render();
}

// [ ✨ Nav Filter Logic ✨ ]
window.setNavFilter = (filter) => {
    // If clicking the same filter, stay on it (or toggle to 'all' if you prefer, 
    // but user wants default to be content, so we keep it simple)
    state.navFilter = filter;
    persistState();
    render();
};

function getNextStylePlanningChapterTarget() {
    const orderedIndexes = getPlanningOrderedVisibleChapterIndexes(state.currentReportType);
    if (!orderedIndexes.length) return null;

    const currentPosition = orderedIndexes.indexOf(state.currentIndex);
    if (currentPosition >= 0) {
        const nextIndex = orderedIndexes[currentPosition + 1];
        if (nextIndex === undefined) return null;
        return {
            index: nextIndex,
            filter: getPlanningNavGroupForChapter(state.chapters[nextIndex], state.currentReportType)
        };
    }

    const fallbackIndex = orderedIndexes.find((idx) => idx > state.currentIndex);
    if (fallbackIndex === undefined) return null;
    return {
        index: fallbackIndex,
        filter: getPlanningNavGroupForChapter(state.chapters[fallbackIndex], state.currentReportType)
    };
}

function hasMeaningfulContent(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number" || typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.some(hasMeaningfulContent);
    if (typeof value === "object") return Object.values(value).some(hasMeaningfulContent);
    return false;
}

function chapterHasUserInput(ch) {
    if (!ch || typeof ch !== "object") return false;
    if (ch.hasUserInput) return true;

    const configTitle = (REPORT_CONFIGS[state.currentReportType]?.structure || []).find(s => s.id === ch.id)?.title || "";
    const titleChanged = (ch.title || "").trim() !== "" && (ch.title || "").trim() !== configTitle.trim();

    return (
        titleChanged ||
        hasMeaningfulContent(ch.keywords) ||
        hasMeaningfulContent(ch.summary) ||
        hasMeaningfulContent(ch.inspiration) ||
        hasMeaningfulContent(ch.urlListStr) ||
        hasMeaningfulContent(ch.mainImageUrls) ||
        hasMeaningfulContent(ch.detailImageUrls) ||
        hasMeaningfulContent(ch.mainImages) ||
        hasMeaningfulContent(ch.detailImages) ||
        hasMeaningfulContent(ch.images) ||
        hasMeaningfulContent(ch.customData) ||
        hasMeaningfulContent(ch.generatedData) ||
        (ch.status && ch.status !== "未生成")
    );
}

function chapterHasMeaningfulDynamicContent(chapter) {
    if (!chapter || typeof chapter !== "object") return false;
    const hasNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";
    return (
        (Array.isArray(chapter.images) && chapter.images.some(Boolean)) ||
        (Array.isArray(chapter.mainImages) && chapter.mainImages.some(Boolean)) ||
        (Array.isArray(chapter.detailImages) && chapter.detailImages.some(Boolean)) ||
        (Array.isArray(chapter.mainImageUrls) && chapter.mainImageUrls.some(hasNonEmptyString)) ||
        (Array.isArray(chapter.detailImageUrls) && chapter.detailImageUrls.some(hasNonEmptyString)) ||
        hasNonEmptyString(chapter.urlListStr) ||
        hasMeaningfulContent(chapter.summary) ||
        hasMeaningfulContent(chapter.keywords) ||
        hasMeaningfulContent(chapter.inspiration) ||
        hasMeaningfulContent(chapter.customData) ||
        hasMeaningfulContent(chapter.generatedData)
    );
}

function renderChaptersNav() {
    chaptersNavEl.innerHTML = "";
    const isPlanningNav = isPlanningReportType(state.currentReportType);
    const dynamicSeq = {
        themeItems: 0,
        keyItem: 0,
        patternDetail: 0,
        brandDetail: 0,
        themeEvent: 0,
        groupStyling: 0,
        rackDisplay: 0,
        themeVisualEditorial: 0,
        visualDisplay: 0
    };
    const dynamicTitleBase = (() => {
        const defaults = {
            themeItems: "单品细节",
            keyItem: "单品细节",
            patternDetail: "图案细节",
            brandDetail: "品牌推荐",
            themeEvent: "主题事件",
            groupStyling: "组货搭配",
            rackDisplay: "挂杆陈列",
            themeVisualEditorial: "形象大片",
            visualDisplay: "视觉陈列"
        };
        const out = { ...defaults };
        Object.keys(dynamicSeq).forEach((type) => {
            const groupConfig = getDynamicPageGroupConfigByType(type, state.currentReportType);
            if (!groupConfig) return;
            const seed = state.chapters.find(c => c && matchDynamicPageGroupId(c.id, groupConfig));
            const raw = seed && seed.title ? String(seed.title).trim() : "";
            if (!raw) return;
            const cleaned = raw
                .replace(/\s*[（(]续页[)）]\s*$/u, "")
                .replace(/\s*0?\d+\s*$/u, "")
                .trim();
            if (cleaned) out[type] = cleaned;
        });
        return out;
    })();
    const detectDynamicGroup = (chapter) => {
        const id = String(chapter?.id || "");
        if (id === "themeItemsDirectory" || id === "keyItemsDirectory" || id === "patternsDirectory" || id === "brandsDirectory") return "";
        const byId = getDynamicPageGroupType(id, state.currentReportType);
        if (byId) return byId;

        const title = String(chapter?.title || "").trim();
        if (/^单品细节\s*\d+$/i.test(title) || /^key\s*item\s*\d+$/i.test(title)) return "keyItem";
        if (/^图案细节\s*\d+$/i.test(title) || /^pattern\s*(trend|detail)?\s*\d+$/i.test(title)) return "patternDetail";
        if (/^品牌推荐\s*\d+$/i.test(title) || /^brand\s*(rec|recommendation)?\s*\d+$/i.test(title)) return "brandDetail";
        return "";
    };

    // 1. [ ✨ Nav Filter Buttons: Style Planning only ✨ ]
    if (isPlanningNav) {
        const activeFilter = state.navFilter || 'content';
        const filterGroup = document.createElement("div");
        filterGroup.className = "nav-filter-group";
        filterGroup.innerHTML = `
            <div style="font-size: 11px; color: var(--text-tertiary); margin-bottom: 6px; padding-left: 2px;">请按顺序生成</div>
            <div style="display: flex; gap: 6px; width: 100%;">
                <button class="filter-btn ${activeFilter === 'content' ? 'active' : ''}" onclick="setNavFilter('content')">一、内容</button>
                <button class="filter-btn ${activeFilter === 'global' ? 'active' : ''}" onclick="setNavFilter('global')">二、全局</button>
                <button class="filter-btn ${activeFilter === 'summary' ? 'active' : ''}" onclick="setNavFilter('summary')">三、总结</button>
            </div>
        `;
        chaptersNavEl.appendChild(filterGroup);
    }

    // [Dynamic Visibility] Only show active chapters
    let visibleChapters = state.chapters.map((ch, idx) => ({ ch, idx })).filter(item => item.ch.isActive);

    // 2. [ ✨ Apply Nav Filters (Style Planning only) ✨ ]
    if (isPlanningNav) {
        const activeFilter = state.navFilter || 'content';
        if (activeFilter === 'summary') {
            visibleChapters = visibleChapters.filter(v => getPlanningNavGroupForChapter(v.ch, state.currentReportType) === 'summary');
        } else if (activeFilter === 'global') {
            visibleChapters = visibleChapters.filter(v => getPlanningNavGroupForChapter(v.ch, state.currentReportType) === 'global');
        } else if (activeFilter === 'content') {
            visibleChapters = visibleChapters.filter(v => getPlanningNavGroupForChapter(v.ch, state.currentReportType) === 'content');
        }
    }

    visibleChapters.forEach(({ ch, idx }) => {
        const item = document.createElement("div");
        const isLocked = ch.isUnlocked === false;
        const hideStatusDot = isPlanningNav && chapterHasUserInput(ch);
        item.className = "chapter-item" + (idx === state.currentIndex && state.step === 1 ? " active" : "") + (isLocked ? " locked" : "");
        let displayTitle = ch.title || ch.id;
        const dynamicGroup = detectDynamicGroup(ch);
        if (dynamicGroup) {
            const prefix = dynamicGroup;
            dynamicSeq[prefix] = (dynamicSeq[prefix] || 0) + 1;
            const seqText = String(dynamicSeq[prefix]).padStart(2, "0");
            displayTitle = `${dynamicTitleBase[prefix] || displayTitle} ${seqText}`;
        }

        // Build inner HTML with possible Add/Delete buttons
        let controls = "";
        const lockIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; opacity:0.6;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

        if (state.step === 1) {
            const allowDynamicPageControls = isStylePlanningType(state.currentReportType) || isThemeThemePlanningType(state.currentReportType);
            if (allowDynamicPageControls && dynamicGroup) {
                const groupConfig = getDynamicPageGroupConfigByType(dynamicGroup, state.currentReportType);
                const nextIdx = findNextInactiveDynamicPageIndex(dynamicGroup, state.currentReportType);
                if (groupConfig && ch.id === groupConfig.firstId && nextIdx !== -1) {
                    controls = `<button class="nav-control-btn add" data-type="${dynamicGroup}" title="添加页面">+</button>`;
                } else if (groupConfig && ch.id !== groupConfig.firstId) {
                    controls = `<button class="nav-control-btn remove" data-type="${dynamicGroup}" title="删除页面">-</button>`;
                }
            }
        }

        item.innerHTML = `
            <div style="display:flex; align-items:center;">
                ${isLocked ? lockIcon : ""}
                <span>${idx + 1}. ${displayTitle}</span>
            </div>
            <div style="display:flex; align-items:center; gap:4px;">
                ${controls}
                <span class="chapter-status${hideStatusDot ? ' is-hidden' : ''}" style="${ch.status === '已生成' ? 'background: var(--ok)' : ''}"></span>
            </div>
        `;

        // Click to select or unlock
        item.onclick = (e) => {
            if (e.target.classList.contains('nav-control-btn')) return;

            // [ ✨ Chapter Locking Logic ✨ ]
            if (ch.isUnlocked === false) {
                const navConfig = getPlanningNavConfig(state.currentReportType);
                const lockedGroup1 = Array.from(navConfig.global);
                const lockedGroup2 = Array.from(navConfig.summary);

                if (lockedGroup1.includes(ch.id)) {
                    if (confirm("这些章节包含核心趋势分析。确定解锁并编辑吗？")) {
                        ch.isUnlocked = true;
                        persistState();
                        render();
                    }
                } else if (lockedGroup2.includes(ch.id)) {
                    // Check if Group 1 (Global) is completed
                    const g1Chapters = state.chapters.filter(c => lockedGroup1.includes(c.id));
                    const allG1Done = g1Chapters.every(c => c.status === '已生成');
                    if (!allG1Done) {
                        alert("请先完成全局章节 (第2部分) 的生成后再解锁总结页。");
                        return;
                    }
                    if (confirm("这些是总结性章节。确定解锁并编辑吗？")) {
                        ch.isUnlocked = true;
                        persistState();
                        render();
                    }
                }
                return;
            }

            if (state.step === 1) {
                state.currentIndex = idx;
                persistState();
                render();
                if (isThemeThemePlanningType(state.currentReportType)) {
                    themeThemeStep1PreviewAutoFollowEnabled = true;
                }
                syncLivePreviewChapterNavigation(idx);
            }
        };

        // Handle Add/Delete Button Clicks
        if (controls) {
            const btnAdd = item.querySelector('.nav-control-btn.add');
            if (btnAdd) {
                btnAdd.onclick = (e) => {
                    e.stopPropagation();
                    const type = btnAdd.dataset.type;
                    const nextIdx = findNextInactiveDynamicPageIndex(type, state.currentReportType);
                    if (nextIdx !== -1) {
                        state.chapters[nextIdx].isActive = true;
                        applyChapterCustomDataDefaults(state.chapters[nextIdx], state.currentReportType);
                        if (shouldSyncDynamicDirectory(type, state.currentReportType)) {
                            normalizeAutoDetailPageEnTitle(state.chapters[nextIdx]);
                            syncDirectoryForChapter(state.chapters[nextIdx].id);
                        }
                        state.currentIndex = nextIdx;
                        persistState();
                        render();
                        postToPreview(true);
                    }
                };
            }

            const btnRemove = item.querySelector('.nav-control-btn.remove');
            if (btnRemove) {
                btnRemove.onclick = (e) => {
                    e.stopPropagation();
                    const type = btnRemove.dataset.type;
                    if (confirm(`确定要删除 ${ch.title} 吗？`)) {
                        ch.isActive = false;
                        ch.images = [];
                        ch.customData = {};
                        ch.status = "未生成";
                        ch.hasUserInput = false;

                        if (state.currentIndex === idx) {
                            const prevVisible = [...visibleChapters].reverse().find(v => v.idx < idx);
                            state.currentIndex = prevVisible ? prevVisible.idx : 0;
                        }

                        if (shouldSyncDynamicDirectory(type, state.currentReportType)) {
                            syncDirectoryForChapter(ch.id);
                        }
                        persistState();
                        render();
                        postToPreview(true);
                    }
                };
            }
        }

        // Drag & Drop Events
        if (state.step === 1) {
            item.setAttribute("draggable", "true");

            item.ondragstart = (e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", idx);
                item.classList.add("dragging");
            };

            item.ondragend = () => {
                item.classList.remove("dragging");
                document.querySelectorAll(".chapter-item").forEach(el => el.classList.remove("drag-over"));
            };

            item.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                item.classList.add("drag-over");
            };

            item.ondragleave = () => {
                item.classList.remove("drag-over");
            };

            item.ondrop = (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                const toIndex = idx;
                handleChapterReorder(fromIndex, toIndex);
            };
        }

        chaptersNavEl.appendChild(item);
    });
}

function bindChapterInputTouchTracking() {
    if (!contentPanelEl) return;
    const markTouched = (event) => {
        if (!isPlanningReportType(state.currentReportType) || state.step !== 1) return;
        const target = event.target;
        if (!target || typeof target.matches !== "function") return;
        if (!target.matches("input, textarea, select")) return;
        const type = String(target.getAttribute("type") || "").toLowerCase();
        if (["hidden", "button", "submit", "reset"].includes(type)) return;
        const ch = state.chapters[state.currentIndex];
        if (!ch || ch.hasUserInput) return;
        ch.hasUserInput = true;
        renderChaptersNav();
    };
    contentPanelEl.addEventListener("input", markTouched, true);
    contentPanelEl.addEventListener("change", markTouched, true);
}
bindChapterInputTouchTracking();

const envHintEl = document.getElementById("envHint");
const apiProxyHintEl = document.getElementById("apiProxyHint");

function setServiceHint(el, text, color) {
    if (!el) return;
    el.style.display = "inline-flex";
    el.textContent = text;
    el.style.color = color;
}

function getProxyHealthBaseCandidates() {
    const configuredBase = String(CONFIG.RACK_PROXY_BASE_URL || "http://127.0.0.1:8787").trim().replace(/\/+$/, "");
    const candidates = [];
    const addCandidate = (raw) => {
        const clean = String(raw || "").trim().replace(/\/+$/, "");
        if (!clean || candidates.includes(clean)) return;
        candidates.push(clean);
    };

    addCandidate(configuredBase);
    if (/127\.0\.0\.1/i.test(configuredBase)) addCandidate(configuredBase.replace(/127\.0\.0\.1/ig, "localhost"));
    if (/localhost/i.test(configuredBase)) addCandidate(configuredBase.replace(/localhost/ig, "127.0.0.1"));
    try {
        const host = (typeof window !== "undefined" && window.location && window.location.hostname)
            ? window.location.hostname.trim()
            : "";
        if (host) {
            const parsed = new URL(configuredBase);
            parsed.hostname = host;
            addCandidate(parsed.origin);
        }
    } catch (err) {
        console.warn("[Status] Failed to build proxy host fallback:", err);
    }
    return candidates;
}

async function pingApiProxy() {
    const candidates = getProxyHealthBaseCandidates();
    let lastError = null;
    for (const base of candidates) {
        try {
            const resp = await fetch(`${base}/health`, {
                method: "GET",
                headers: { Accept: "application/json" }
            });
            if (!resp.ok) {
                lastError = new Error(`health ${resp.status}`);
                continue;
            }
            const payload = await resp.json().catch(() => ({}));
            if (payload && payload.ok) return true;
            lastError = new Error("proxy health returned not ok");
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error("proxy offline");
}

(async function checkServiceConnections() {
    if (apiProxyHintEl) {
        try {
            await pingApiProxy();
            setServiceHint(apiProxyHintEl, i18n.t("status.proxyConnected", "✔ 已连接 API 代理"), "#22c55e");
        } catch (err) {
            setServiceHint(apiProxyHintEl, i18n.t("status.proxyError", "✘ 无法连接 API 代理，请检查代理服务"), "#b91c1c");
        }
    }

    if (envHintEl) {
        try {
            await apiClient.ping();
            setServiceHint(envHintEl, i18n.t("status.comfyConnected", "✔ 已连接 ComfyUI"), "#22c55e");
        } catch (e) {
            setServiceHint(envHintEl, i18n.t("status.comfyError", "✘ 无法连接 ComfyUI，请检查 IP/端口 与 CORS 设置"), "#b91c1c");
        }
    }
})();

function extractUrlsFromText(text) {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const urls = [];
    for (const line of lines) { const m = line.match(urlRegex); if (m && m[1]) urls.push(m[1]); }
    return Array.from(new Set(urls)).slice(0, CONFIG.MAX_IMAGES_PER_CHAPTER);
}
function parseModelJson(text) {
    let t = (text || "").trim();
    if (t.startsWith("```")) t = t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    if (!t.startsWith("{")) return { raw: text };
    const start = t.indexOf("{"), end = t.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
    try { return JSON.parse(t); } catch (e) { return { raw: text }; }
}
function buildNoCacheUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return raw;
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}t=${Date.now()}`;
}
async function fetchTextNoCache(url) {
    const finalUrl = buildNoCacheUrl(url);
    const resp = await fetch(finalUrl, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Failed to fetch text: ${url}`);
    return resp.text();
}
async function fetchJsonNoCache(url) {
    const finalUrl = buildNoCacheUrl(url);
    const resp = await fetch(finalUrl, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Failed to fetch json: ${url}`);
    return resp.json();
}
function getMergedStylePlanningChapterCustomData(chapterId) {
    const structure = getReportStructure();
    const struct = structure.find(item => item && item.id === chapterId);
    const chapter = Array.isArray(state?.chapters)
        ? state.chapters.find(item => item && item.id === chapterId)
        : null;
    const merged = {};
    if (struct && Array.isArray(struct.fields)) {
        struct.fields.forEach((field) => {
            if (!field || !field.key) return;
            if (field.default !== undefined) merged[field.key] = field.default;
        });
    }
    if (chapter && chapter.customData && typeof chapter.customData === "object") {
        Object.assign(merged, chapter.customData);
    }
    return merged;
}
function normalizeThemeHex(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
}
function normalizePantoneToken(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    return raw.replace(/^PANTONE\s*<br>\s*/i, "").replace(/^PANTONE\s+/i, "").trim().toUpperCase();
}
function formatPantoneToken(value) {
    const code = normalizePantoneToken(value);
    return code ? `PANTONE<br>${code}` : "";
}
function getReadOnlyFieldValue(field) {
    if (!field || !field.readOnly) return "";
    return field.default || "";
}
function buildThemeColorPaletteEntries() {
    const customData = getMergedStylePlanningChapterCustomData("page4");
    return Array.from({ length: 7 }, (_, idx) => {
        const slot = idx + 1;
        return {
            slot,
            cnName: String(customData[`color${slot}_cn`] || "").trim(),
            enName: String(customData[`color${slot}_en`] || "").trim(),
            hex: normalizeThemeHex(customData[`color${slot}`]),
            pantone: normalizePantoneToken(customData[`color${slot}_code`]),
            pantoneFormatted: formatPantoneToken(customData[`color${slot}_code`])
        };
    }).filter(entry => entry.cnName || entry.enName || entry.hex || entry.pantone);
}
function splitThemeColorNames(value, separator) {
    return String(value == null ? "" : value)
        .split(separator)
        .map(part => part.trim())
        .filter(Boolean);
}
function sanitizeColorDirectionThemePalette(parsed) {
    if (!parsed || typeof parsed !== "object" || parsed.raw) return parsed;
    const palette = buildThemeColorPaletteEntries();
    if (!palette.length) return parsed;

    const byHex = new Map();
    const byPantone = new Map();
    const byCn = new Map();
    const byEn = new Map();
    palette.forEach((entry) => {
        if (entry.hex) byHex.set(entry.hex, entry);
        if (entry.pantone) byPantone.set(entry.pantone, entry);
        if (entry.cnName) byCn.set(entry.cnName, entry);
        if (entry.enName) byEn.set(entry.enName.toLowerCase(), entry);
    });

    const pickEntry = (prefix, index, cnNames, enNames) => {
        const hex = normalizeThemeHex(parsed[`${prefix}_c${index}_hex`]);
        if (hex && byHex.has(hex)) return byHex.get(hex);

        const pantone = normalizePantoneToken(parsed[`${prefix}_c${index}_Code`]);
        if (pantone && byPantone.has(pantone)) return byPantone.get(pantone);

        const cnName = String(cnNames[index - 1] || "").trim();
        if (cnName && byCn.has(cnName)) return byCn.get(cnName);

        const enName = String(enNames[index - 1] || "").trim().toLowerCase();
        if (enName && byEn.has(enName)) return byEn.get(enName);

        return palette[(index - 1) % palette.length];
    };

    const buildSide = (prefix, cnKey, enKey) => {
        const cnNames = splitThemeColorNames(parsed[cnKey], "+");
        const enNames = splitThemeColorNames(parsed[enKey], "&");
        const entries = Array.from({ length: 5 }, (_, idx) => pickEntry(prefix, idx + 1, cnNames, enNames));
        return {
            entries,
            cnText: entries.map(entry => entry.cnName).filter(Boolean).join(" + "),
            enText: entries.map(entry => entry.enName).filter(Boolean).join(" & ")
        };
    };

    const left = buildSide("l", "left_desc", "left_en_desc");
    const right = buildSide("r", "right_desc", "right_en_desc");

    const sanitized = {
        ...parsed,
        page_title: parsed.page_title || "色彩方向",
        left_desc: left.cnText,
        left_en_desc: left.enText,
        right_desc: right.cnText,
        right_en_desc: right.enText
    };

    left.entries.forEach((entry, idx) => {
        const slot = idx + 1;
        sanitized[`l_c${slot}_hex`] = entry.hex;
        sanitized[`l_c${slot}_Code`] = entry.pantoneFormatted;
    });
    right.entries.forEach((entry, idx) => {
        const slot = idx + 1;
        sanitized[`r_c${slot}_hex`] = entry.hex;
        sanitized[`r_c${slot}_Code`] = entry.pantoneFormatted;
    });

    return sanitized;
}
function normalizeBrandLabel(raw) {
    if (raw === undefined || raw === null) return "";
    let s = String(raw).trim();
    if (!s) return "";
    s = s.replace(/^["'`]+|["'`]+$/g, "").trim();
    s = s.replace(/^(brand|品牌)\s*[:：]\s*/i, "").trim();
    if (!s) return "";
    if (/^请在此输入/.test(s)) return "";
    if (/^(n\/a|null|none|unknown|未识别|未知)$/i.test(s)) return "";
    if (/^(img|image|item|detail|图)\s*\d*$/i.test(s)) return "";
    if (/^\d+$/.test(s)) return "";
    if (s.length > 48) return "";
    // English brand names use uppercase in current template style.
    if (/[a-zA-Z]/.test(s) && !/[\u4e00-\u9fa5]/.test(s)) return s.toUpperCase();
    return s;
}
function getFilenameFromAny(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";
    const stripped = raw.split("#")[0].split("?")[0];
    const last = stripped.split("/").pop() || stripped;
    try {
        return decodeURIComponent(last);
    } catch (_) {
        return last;
    }
}
function extractBrandsFromModelOutput(parsed, slotCount = 6) {
    const brands = Array(slotCount).fill("");
    if (!parsed || typeof parsed !== "object") return brands;

    const writeSlot = (idx, value) => {
        const i = Number(idx);
        if (!Number.isFinite(i) || i < 1 || i > slotCount) return;
        const normalized = normalizeBrandLabel(value);
        if (normalized) brands[i - 1] = normalized;
    };

    for (let i = 1; i <= slotCount; i++) {
        const direct = parsed[`img${i}_brand`] || parsed[`brand${i}`] || parsed[`brand_${i}`] || parsed[`image${i}_brand`];
        if (direct) writeSlot(i, direct);
    }

    Object.entries(parsed).forEach(([key, value]) => {
        const m = String(key).match(/(?:img|image|图)\s*[_-]?(\d+)\s*[_-]?(?:brand|品牌)|(?:brand|品牌)\s*[_-]?(\d+)/i);
        if (!m) return;
        const idx = parseInt(m[1] || m[2], 10);
        if (!brands[idx - 1]) {
            if (value && typeof value === "object") {
                writeSlot(idx, value.brand || value.name || value.title || "");
            } else {
                writeSlot(idx, value);
            }
        }
    });

    const fillByArrayLike = (src) => {
        if (Array.isArray(src)) {
            src.forEach((val, idx) => {
                if (idx >= slotCount || brands[idx]) return;
                if (val && typeof val === "object") {
                    writeSlot(idx + 1, val.brand || val.name || val.title || "");
                } else {
                    writeSlot(idx + 1, val);
                }
            });
            return;
        }
        if (typeof src === "string") {
            src.split(/[,\n\r，、|;/]+/).forEach((val, idx) => {
                if (idx >= slotCount || brands[idx]) return;
                writeSlot(idx + 1, val);
            });
            return;
        }
        if (src && typeof src === "object") {
            Object.entries(src).forEach(([k, v]) => {
                const m = String(k).match(/(\d+)/);
                if (!m) return;
                const idx = parseInt(m[1], 10);
                if (!brands[idx - 1]) writeSlot(idx, v && typeof v === "object" ? (v.brand || v.name || v.title || "") : v);
            });
        }
    };

    fillByArrayLike(parsed.brand_labels);
    fillByArrayLike(parsed.brand_names);
    fillByArrayLike(parsed.brandNames);
    fillByArrayLike(parsed.brands);
    fillByArrayLike(parsed.image_brands);
    fillByArrayLike(parsed.img_brands);

    if (typeof parsed.raw === "string" && parsed.raw.trim()) {
        const lines = parsed.raw.split(/\r?\n/);
        lines.forEach(line => {
            const m = line.match(/(?:img|image|图)\s*[_-]?(\d+).{0,8}?(?:brand|品牌)\s*[:：]\s*([^\n,;，；]+)/i);
            if (!m) return;
            writeSlot(parseInt(m[1], 10), m[2]);
        });
    }

    return brands;
}
function fillKeyItemBrandLabels(ch, parsed, slotCount = 6) {
    if (!ch || typeof ch.id !== "string" || !/^keyItem\d+$/.test(ch.id)) return;
    if (!ch.customData) ch.customData = {};

    const modelBrands = extractBrandsFromModelOutput(parsed, slotCount);

    for (let i = 1; i <= slotCount; i++) {
        const key = `img${i}_brand`;
        const fromModel = normalizeBrandLabel(modelBrands[i - 1]);
        ch.customData[key] = fromModel || "";
    }
}
function minifyJson(obj) { try { return JSON.stringify(obj); } catch (e) { return ""; } }
function imageStatusBadgeText(img) {
    if (!img) return "";
    const comfy = img.uploadStatus;
    const cms = img.cmsStatus;
    if (comfy && comfy !== "ok") {
        if (comfy === "fail") return "Comfy失败";
        return "Comfy中...";
    }
    if (cms) {
        if (cms === "ok") return "✔";
        if (cms === "fail") return "CDN失败";
        return "CDN中...";
    }
    if (comfy === "ok") return "CDN中...";
    return cms === "ok" ? "✔" : "上传中...";
}
function isKeyItemDetailChapter(ch) {
    return !!(ch && typeof ch.id === "string" && ch.id.startsWith("keyItem") && ch.id !== "keyItemsDirectory");
}
function isKeyItemDetailField(ch, key) {
    return isKeyItemDetailChapter(ch) && typeof key === "string" && /^detail_\d+(?:_\d+)?$/.test(key);
}
function shouldSkipComfyForUpload({ chapter, type = "", key = "" } = {}) {
    if (!chapter) return false;
    if (String(type).toLowerCase() === "detail" && isKeyItemDetailChapter(chapter)) return true;
    if (isKeyItemDetailField(chapter, key)) return true;
    return false;
}
function looksLikeTemporaryUrls(text) {
    if (!text) return true;
    const lower = text.toLowerCase();
    if (lower.includes("view?filename=")) return true;
    if (lower.includes("127.0.0.1") || lower.includes("192.168") || lower.includes("localhost")) return true;
    if (CONFIG.COMFY_HOST) {
        const host = CONFIG.COMFY_HOST.replace(/^https?:\/\//i, "").toLowerCase();
        if (host && lower.includes(host)) return true;
    }
    return false;
}
function syncFormalImageUrls(ch, { force = false } = {}) {
    if (!ch) return false;

    // 1. Sync Main Image Urls
    if (Array.isArray(ch.mainImages)) {
        const slotCount = Math.max(
            Number.isInteger(ch.maxImages) && ch.maxImages > 0 ? ch.maxImages : 0,
            ch.mainImages.length
        );
        if (!Array.isArray(ch.mainImageUrls)) ch.mainImageUrls = Array(slotCount).fill("");
        while (ch.mainImageUrls.length < slotCount) ch.mainImageUrls.push("");
        for (let idx = 0; idx < slotCount; idx++) {
            const img = ch.mainImages[idx];
            if (img && img.url) {
                const current = ch.mainImageUrls[idx];
                if (force || !current || looksLikeTemporaryUrls(current) || current !== img.url) {
                    ch.mainImageUrls[idx] = img.url;
                }
            } else {
                ch.mainImageUrls[idx] = "";
            }
        }
    }

    // 2. Sync Detail Image Urls
    if (Array.isArray(ch.detailImages)) {
        ch.detailImageUrls = ch.detailImages.map(img => img ? (img.url || "") : "");
    }

    // 3. Legacy Migration Sync (urlListStr)
    const allLinks = [
        ...(ch.mainImageUrls || []).filter(u => u && !looksLikeTemporaryUrls(u)),
        ...(ch.detailImageUrls || []).filter(u => u && !looksLikeTemporaryUrls(u))
    ];
    if (force || !ch.urlListStr || looksLikeTemporaryUrls(ch.urlListStr)) {
        ch.urlListStr = allLinks.join("\n");
        return true;
    }
    return false;
}
function getUrlArray(str, max) {
    const lines = (str || "").split(/\r?\n/).map(s => s.trim());
    const arr = lines.slice(0, max);
    while (arr.length < max) arr.push("");
    return arr;
}
function serializeUrlArray(arr) {
    const copy = [...arr];
    while (copy.length && !copy[copy.length - 1]) copy.pop();
    return copy.join("\n");
}
function setUrlValue(ch, index, value) {
    if (!ch) return;
    const arr = getUrlArray(ch.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
    arr[index] = value.trim();
    ch.urlListStr = serializeUrlArray(arr);
}
function getMainUrlSlotCount(ch) {
    if (!ch) return 0;
    const counts = [];
    if (Array.isArray(ch.mainImages) && ch.mainImages.length) counts.push(ch.mainImages.length);
    if (Array.isArray(ch.mainImageUrls) && ch.mainImageUrls.length) counts.push(ch.mainImageUrls.length);
    if (!counts.length) {
        const fallback = Number.isInteger(ch.maxImages) && ch.maxImages > 0 ? ch.maxImages : 0;
        if (fallback > 0) counts.push(fallback);
    }
    return counts.length ? Math.max(...counts) : 0;
}
function setDetailUrlValue(ch, detailIndex, value) {
    if (!ch || !Number.isInteger(detailIndex) || detailIndex < 0) return;
    const mainSlotCount = getMainUrlSlotCount(ch);
    setUrlValue(ch, mainSlotCount + detailIndex, value || "");
}
function setUrlForImageIndex(ch, index, url) {
    if (!ch || typeof index !== "number" || index < 0) return false;
    const arr = getUrlArray(ch.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
    const current = (arr[index] || "").trim();
    const shouldWrite = !current || looksLikeTemporaryUrls(current);
    if (!shouldWrite && current === url) return false;
    if (!shouldWrite) return false;
    arr[index] = url;
    ch.urlListStr = serializeUrlArray(arr);
    return true;
}
function normalizeExportImageUrl(value) {
    const url = typeof value === "string" ? value.trim() : "";
    if (!url) return "";
    if (/^blob:/i.test(url)) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^data:image\//i.test(url)) return url;
    return "";
}
function collectExportableImages(chapterState) {
    if (!chapterState || typeof chapterState !== "object") return [];
    const source = Array.isArray(chapterState.images) ? chapterState.images : [];
    const out = [];
    source.forEach((img) => {
        if (!img || typeof img !== "object") return;
        const id = normalizeExportImageUrl(img.url || img.id || img.preview || "");
        if (!id) return;
        const alt = (typeof img.imgName === "string" && img.imgName.trim())
            ? img.imgName.trim()
            : ((typeof img.name === "string" && img.name.trim()) ? img.name.trim() : "");
        out.push({ id, alt });
    });
    return out;
}
function mergeExportChaptersWithStateImages(reportChapters, stateChapters) {
    const base = Array.isArray(reportChapters) ? reportChapters : [];
    const source = Array.isArray(stateChapters) ? stateChapters : [];
    if (!base.length || !source.length) return base;

    const byId = new Map();
    source.forEach((ch) => {
        const id = (ch && typeof ch.id === "string") ? ch.id.trim() : "";
        if (id) byId.set(id, ch);
    });

    return base.map((ch, idx) => {
        if (!ch || typeof ch !== "object") return ch;
        const chapterId = typeof ch.chapter_id === "string" ? ch.chapter_id.trim() : "";
        const stateChapter = (chapterId && byId.get(chapterId)) || source[idx];
        if (!stateChapter || typeof stateChapter !== "object") return ch;

        const latestImages = collectExportableImages(stateChapter);
        if (!latestImages.length) return ch;

        const oldImages = Array.isArray(ch.images) ? ch.images : [];
        const mergedImages = latestImages.map((img, imageIdx) => {
            const prev = oldImages[imageIdx];
            const prevAlt = (prev && typeof prev.alt === "string") ? prev.alt.trim() : "";
            return { id: img.id, alt: img.alt || prevAlt || "" };
        });

        return {
            ...ch,
            images: mergedImages
        };
    });
}
function reorderArray(arr, from, to) {
    const list = arr;
    if (from === to || from < 0 || to < 0 || from >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to > list.length ? list.length : to, 0, item);
}
function enableImageReorder(gridEl, ch, customMoveHandler) {
    if (!gridEl || (!ch && !customMoveHandler)) return;
    const INTERNAL_DRAG_MIME = "application/x-codex-slot-index";

    // Support Custom Move (for Dynamics) or Standard Chapter images
    const getImages = () => customMoveHandler ? (ch.images || []) : (ch.images || []);
    // ^ Note: For customMoveHandler, ch might be a config object, rely on handler.
    // Actually, for standard ch: ch.images is the array.
    // For dynamics: customMoveHandler handles logic, we just need indices.

    let dragFrom = null;
    const slots = Array.from(gridEl.querySelectorAll(".img-slot"));

    slots.forEach((slot, idx) => {
        // Determine if slot has draggable content
        // If standard: idx < ch.images.length
        // If dynamics: check slot class or assumed index
        const isStandard = !customMoveHandler && ch && Array.isArray(ch.images);
        const hasImg = isStandard ? (idx < ch.images.length) : slot.classList.contains("has-img");

        slot.draggable = hasImg;
        slot.dataset.index = idx;

        slot.addEventListener("dragstart", (e) => {
            if (!hasImg) {
                e.preventDefault();
                return;
            }
            dragFrom = idx;
            e.dataTransfer.effectAllowed = "move";
            try { e.dataTransfer.setData(INTERNAL_DRAG_MIME, String(idx)); } catch (_) { }
            e.dataTransfer.setData("text/plain", `codex-slot:${idx}`); // Firefox fallback
            setTimeout(() => slot.classList.add("dragging"), 0);
        });

        slot.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (dragFrom === null) return;
            e.dataTransfer.dropEffect = "move"; // Explicitly visual 'move'
            slot.classList.add("drag-over");
        });

        slot.addEventListener("dragleave", () => {
            slot.classList.remove("drag-over");
        });

        slot.addEventListener("drop", (e) => {
            // Recover drag source from dataTransfer if needed.
            if (dragFrom === null) {
                try {
                    const rawInternal = e.dataTransfer.getData(INTERNAL_DRAG_MIME);
                    if (rawInternal !== '') dragFrom = parseInt(rawInternal, 10);
                } catch (_) { }
                if (dragFrom === null || Number.isNaN(dragFrom)) {
                    const rawTxt = e.dataTransfer.getData("text/plain") || "";
                    const m = rawTxt.match(/(?:^codex-slot:)?(\d+)$/);
                    dragFrom = m ? parseInt(m[1], 10) : null;
                }
            }

            // Internal Reorder Drop
            if (dragFrom !== null) {
                e.preventDefault();
                e.stopPropagation();
                slot.classList.remove("drag-over");

                const from = dragFrom;
                const to = idx;

                if (from === to) return;

                if (customMoveHandler) {
                    customMoveHandler(from, to);
                } else if (isStandard) {
                    const imgs = ch.images;
                    // Clamp 'to' within bounds of existing images
                    const maxIdx = imgs.length - 1;
                    const targetIdx = to > maxIdx ? maxIdx : to;

                    reorderArray(imgs, from, targetIdx);

                    // Sync URLs
                    const urls = getUrlArray(ch.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
                    if (urls.length) reorderArray(urls, from, targetIdx);
                    ch.urlListStr = serializeUrlArray(urls);

                    // [Fix] Sync Split Arrays (mainImages) so persistState doesn't revert the change
                    if (ch.mainImages) {
                        const maxM = ch.mainImages.length - 1;
                        if (maxM >= 0) {
                            const tM = targetIdx > maxM ? maxM : targetIdx;
                            reorderArray(ch.mainImages, from, tM);
                        }
                    }
                    if (ch.mainImageUrls) {
                        const maxU = ch.mainImageUrls.length - 1;
                        if (maxU >= 0) {
                            const tU = targetIdx > maxU ? maxU : targetIdx;
                            reorderArray(ch.mainImageUrls, from, tU);
                        }
                    }

                    // Sync Generated Data if exists
                    if (ch.generatedData && Array.isArray(ch.generatedData.images)) {
                        if (ch.generatedData.images.length === imgs.length) {
                            reorderArray(ch.generatedData.images, from, targetIdx);
                        }
                    }

                    ch.status = "图片已更新，待生成";
                    persistState();
                    render();
                }

                dragFrom = null; // Reset
                return;
            }

            // External File Drop (Handled by slot's own click/upload logic usually, 
            // but we need to ensure we don't block it if we are not reordering)
        });

        slot.addEventListener("dragend", () => {
            slot.classList.remove("dragging");
            document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
            dragFrom = null;
        });
    });
}
function setButtonLoading(btn, isLoading, text) {
    if (!btn) return;
    if (isLoading) {
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.classList.add("is-loading");
        if (text) btn.textContent = text;
    } else {
        btn.disabled = false;
        btn.classList.remove("is-loading");
        if (btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
    }
}

function syncGenerateButtonLoading(btn, chapterId, source = 'standard') {
    if (!btn) return;
    if (isChapterGenerating(chapterId, source)) {
        setButtonLoading(btn, true, "生成中...");
    } else {
        setButtonLoading(btn, false);
    }
}

// ===== Step1：上传/生成单章节 =====
function openFileDialog(targetIndex = null, type = 'main') {
    fileInputEl.multiple = true; // [Fix] Enable batch selection
    fileInputEl.onchange = () => {
        const files = Array.from(fileInputEl.files || []).filter(f => f.type.startsWith("image/"));
        handleFilesUploaded(files, targetIndex, type);
        fileInputEl.value = "";
    };
    fileInputEl.click();
}

function setupDragDrop(el) {
    el.ondragover = e => { e.preventDefault(); el.classList.add("hover"); };
    el.ondragleave = () => el.classList.remove("hover");
    el.ondrop = e => {
        e.preventDefault();
        el.classList.remove("hover");
        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));

        // [Key Fix] Check if dropped on a specific slot
        const slot = e.target.closest('.img-slot');
        let targetIdx = null;
        let type = 'main';
        if (slot) {
            if (slot.dataset.index !== undefined) targetIdx = parseInt(slot.dataset.index);
            if (slot.dataset.type) type = slot.dataset.type;
        }

        handleFilesUploaded(files, targetIdx, type);
    };
}

const COMP_KEYS = ['comp_img_bg1', 'comp_img_bg2', 'comp_img_overlay'];

// [Strict Item Grid Emulation]
// [Strict Item Grid Emulation]
function openCompFileDialog(targetIndex = 0) {
    const el = document.getElementById("hiddenFileInput");
    if (!el) { console.error("[PanelComp] fileInput not found!"); return; }

    // Reset handlers
    el.onchange = null;
    el.removeAttribute("multiple");

    // Allow multiple files if not targeting last slot specifically? 
    // Standard grid allows multiple. Let's allow multiple.
    el.setAttribute("multiple", "true");
    el.value = ""; // clear

    el.onchange = (e) => {
        const files = Array.from(el.files || []).filter(f => f.type.startsWith("image/"));
        if (files.length) {
            handleCompImageUpload(files, targetIndex);
        }
        el.removeAttribute("multiple"); // Cleanup
    };

    el.click();
}

function handleCompDrop(e, targetIndex) {
    e.preventDefault();
    e.target.closest('.img-slot')?.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length) handleCompImageUpload(files, targetIndex);
}

function deleteCustomImage(key) {
    const ch = state.chapters[state.currentIndex];
    if (ch && ch.customData) {
        // [Sync] Also remove from ch.images if it's a composition key
        const compIdx = COMP_KEYS.indexOf(key);
        if (compIdx !== -1 && (ch.id === 'ch8' || ch.id === 'ch9')) {
            const imgIdx = 16 + compIdx;
            if (ch.images && ch.images[imgIdx]) {
                ch.images[imgIdx] = null;
            }
        }

        delete ch.customData[key];
        delete ch.customData[key + '_comfy_name'];
        persistState();
        render();
        if (window.postToPreview) window.postToPreview();
    }
}

// Alias for backward compatibility if needed, but we'll use deleteCustomImage
const deleteCompImage = deleteCustomImage;

/**
 * Handle image uploads for customData fields (e.g. comp_img_bg, detail_1_1)
 * Supports both single and batch uploads.
 * @param {File|File[]|FileList} filesOrFile 
 * @param {string|string[]} keys Single key or array of keys sequentially
 */
async function handleCustomImageUploadBatch(filesOrFile, keys) {
    const ch = state.chapters[state.currentIndex];
    if (!ch) return;
    if (!ch.customData) ch.customData = {};

    let files = [];
    if (filesOrFile instanceof File) files = [filesOrFile];
    else if (filesOrFile instanceof FileList || Array.isArray(filesOrFile)) files = Array.from(filesOrFile);

    if (!files.length) return;

    // [Fix] Preserve Scroll
    const editor = document.getElementById("step1-editor-panel");
    const initialScrollTop = editor ? editor.scrollTop : 0;
    const initialWindowScroll = window.scrollY || document.documentElement.scrollTop;

    const targetKeys = Array.isArray(keys) ? keys : [keys];

    // 1. Sync Phase: Set Blobs
    files.forEach((file, i) => {
        const key = targetKeys[i];
        if (!key) return;
        const blobUrl = URL.createObjectURL(file);
        ch.customData[key] = blobUrl;
        delete ch.customData[key + '_comfy_name'];

        // [Special Sync for ch8/9 model images]
        if (['ch8', 'ch9'].includes(ch.id) && COMP_KEYS.includes(key)) {
            if (!ch.images) ch.images = [];
            const slotIdx = COMP_KEYS.indexOf(key);
            const imgIdx = 16 + slotIdx;
            ch.images[imgIdx] = { preview: blobUrl, url: blobUrl, transform: null, imgName: file.name || "" };
        }
    });

    persistState();
    render();

    // Restore Scroll
    if (initialWindowScroll > 0) window.scrollTo(0, initialWindowScroll);
    if (editor) editor.scrollTop = initialScrollTop;

    // 2. Async Phase
    const uploadPromises = files.map(async (file, i) => {
        const key = targetKeys[i];
        if (!key) return;
        const skipComfy = shouldSkipComfyForUpload({ chapter: ch, key });

        // 2a. Comfy (skip for keyItem detail uploads)
        let comfyPromise = Promise.resolve(null);
        if (!skipComfy) {
            comfyPromise = uploadToComfy(file).then(name => {
                if (name) {
                    ch.customData[key + '_comfy_name'] = name;
                    if (['ch8', 'ch9'].includes(ch.id) && COMP_KEYS.includes(key)) {
                        const imgIdx = 16 + COMP_KEYS.indexOf(key);
                        if (ch.images[imgIdx]) ch.images[imgIdx].name = name;
                    }
                    persistState();
                    renderSilently();
                }
            }).catch(err => console.warn("[UPLOAD] Comfy failed", err));
        }

        // 2b. CMS
        const cmsPromise = uploadToCms(file).then(res => {
            const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
            if (url) {
                ch.customData[key] = url;
                if (['ch8', 'ch9'].includes(ch.id) && COMP_KEYS.includes(key)) {
                    const imgIdx = 16 + COMP_KEYS.indexOf(key);
                    if (ch.images[imgIdx]) {
                        ch.images[imgIdx].url = url;
                        ch.images[imgIdx].preview = url;
                    }
                }
                persistState();
                renderSilently();
                if (window.schedulePreviewRender) window.schedulePreviewRender();
            }
        }).catch(err => console.warn("[UPLOAD] CMS failed", err));

        return skipComfy ? cmsPromise : Promise.all([comfyPromise, cmsPromise]);
    });

    await Promise.all(uploadPromises);
}

function renderSilently() {
    console.log("[DEBUG] renderSilently called");
    const editor = document.getElementById("step1-editor-panel");
    const sTop = editor ? editor.scrollTop : 0;
    const wScroll = window.scrollY || document.documentElement.scrollTop;
    render();
    const restoreScroll = () => {
        if (wScroll > 0) window.scrollTo(0, wScroll);
        const e2 = document.getElementById("step1-editor-panel");
        if (e2) e2.scrollTop = sTop;
    };
    restoreScroll();
    requestAnimationFrame(restoreScroll);
    setTimeout(restoreScroll, 60);
    setTimeout(restoreScroll, 180);
}

// [Modified] Existing handler to use the new generic batch logic
function handleCompImageUpload(filesOrFile, startKeyOrIndex = 0) {
    let startIndex = 0;
    if (typeof startKeyOrIndex === 'number') startIndex = startKeyOrIndex;
    else if (typeof startKeyOrIndex === 'string') {
        startIndex = COMP_KEYS.indexOf(startKeyOrIndex);
        if (startIndex === -1) startIndex = 0;
    }
    const targetKeys = COMP_KEYS.slice(startIndex);
    handleCustomImageUploadBatch(filesOrFile, targetKeys);
}

// [Global Export]
window.openCompFileDialog = openCompFileDialog;
window.handleCompDrop = handleCompDrop;
window.deleteCompImage = deleteCompImage;
window.deleteCustomImage = deleteCustomImage;

// [Fix] Add missing global handlers for Detail Images
window.handleBatchDetailChange = function (event, prefix) {
    const files = Array.from(event.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;

    // Keys: suffix _1, _2, _3
    // e.g. detail_1 -> detail_1_1, detail_1_2, detail_1_3
    const keys = [1, 2, 3].map(i => `${prefix}_${i}`);

    // Call generic batch handler
    handleCustomImageUploadBatch(files, keys);

    // Reset input
    event.target.value = '';
};

window.deleteCustomDetailImage = function (key) {
    if (confirm('确定要删除这张图片吗？')) {
        deleteCustomImage(key);
    }
};

// [Modified] Accept targetIndex for specific slot targeting
// [ ✨ Split Image Handling: Main vs Detail ✨ ]
// [Modified] Accept targetIndex for specific slot targeting
// [ ✨ Split Image Handling: Main vs Detail ✨ ]
function handleFilesUploaded(files, targetIndex = null, type = 'main') {
    if (!files.length) return;
    const ch = state.chapters[state.currentIndex];
    console.log(`[DEBUG] handleFilesUploaded`, {
        chapterId: ch.id,
        type,
        filesCount: files.length,
        targetIndex
    });
    console.log(`[Upload] Type: ${type}, Files: ${files.length}, Target: ${targetIndex}`);

    // Track all upload operations
    const uploadPromises = [];

    files.forEach((file, loopIdx) => {
        const skipComfy = shouldSkipComfyForUpload({ chapter: ch, type });
        const blobUrl = URL.createObjectURL(file);
        let uploadSlotIndex = -1;
        const obj = {
            preview: blobUrl,
            name: null,
            url: blobUrl,
            uploadStatus: skipComfy ? "" : "pending",
            cmsStatus: "pending",
            imgName: file.name || ""
        };

        if (type === 'main') {
            const limit = ch.maxImages || 6;
            const idx = targetIndex !== null ? targetIndex + loopIdx : ch.mainImages.findIndex(img => !img);
            if (idx === -1 || idx >= limit) {
                console.warn(`[Upload-Main] Skipped index ${idx} (Limit: ${limit})`);
                return;
            }
            uploadSlotIndex = idx;

            if (!ch.mainImages) ch.mainImages = [];
            ch.mainImages[idx] = obj;

            if (!Array.isArray(ch.mainImageUrls)) ch.mainImageUrls = Array(limit).fill("");
            ch.mainImageUrls[idx] = blobUrl;
            setUrlValue(ch, idx, blobUrl);

            // [Sync] Update Master ch.images (0-5)
            if (!ch.images) ch.images = [];
            ch.images[idx] = obj;

            if (isThemeThemeDetailId(ch.id)) {
                fillPatternDetailBrandLabels(ch, null, limit, { forceSlots: [idx + 1] });
            }

        } else if (type === 'detail') {
            // detail: Index or Append
            const idx = targetIndex !== null ? targetIndex + loopIdx : (ch.detailImages ? ch.detailImages.length : 0);
            uploadSlotIndex = idx;

            // Ensure array sizes
            if (!Array.isArray(ch.detailImages)) ch.detailImages = [];

            // Expand strictly
            while (ch.detailImages.length <= idx) ch.detailImages.push(null);
            ch.detailImages[idx] = obj;

            if (!Array.isArray(ch.detailImageUrls)) ch.detailImageUrls = [];
            while (ch.detailImageUrls.length <= idx) ch.detailImageUrls.push("");
            ch.detailImageUrls[idx] = blobUrl;
            setDetailUrlValue(ch, idx, blobUrl);

            console.log(`[Upload-Detail] Set detailImages[${idx}]`);

            // [Sync] Detail images are stored separately in ch.detailImages
            // Do NOT sync to ch.images to avoid polluting the Main Image Grid in preview
        } else {
            console.error(`[Upload] Unknown type: ${type}`);
        }

        persistState();
        renderSilently();
        // [Fix] Auto-refresh live preview immediately after setting blob URL
        if (window.schedulePreviewRender) window.schedulePreviewRender();
        refreshThemeColorLivePreviewIfNeeded(ch);

        // Push Comfy Upload Promise (skip for keyItem detail uploads)
        if (!skipComfy) {
            const pComfy = uploadToComfy(file).then(name => {
                obj.name = name;
                obj.uploadStatus = name ? "ok" : "fail";
                ch.status = "图片已更新，待生成";
                persistState();
                renderSilently();
            });
            uploadPromises.push(pComfy);
        }

        // Push CMS Upload Promise
        const pCms = uploadToCms(file).then(res => {
            if (res) {
                const url = typeof res === "string" ? res : (res.url || "");
                if (url) {
                    obj.url = url;
                    obj.preview = url;
                    obj.cmsStatus = "ok";
                    // Sync URL back to inputs/arrays
                    if (type === 'main') {
                        setUrlValue(ch, uploadSlotIndex, url);
                        syncFormalImageUrls(ch);
                    } else if (type === 'detail') {
                        const dIdx = ch.detailImages.indexOf(obj);
                        if (dIdx !== -1 && ch.detailImageUrls) {
                            ch.detailImageUrls[dIdx] = url;
                            setDetailUrlValue(ch, dIdx, url);
                        }
                    }
                    persistState();
                    renderSilently();
                    // [Fix] Auto-refresh live preview after upload
                    if (window.schedulePreviewRender) window.schedulePreviewRender();
                    refreshThemeColorLivePreviewIfNeeded(ch);
                }
            } else {
                obj.cmsStatus = "fail";
                persistState();
                renderSilently();
                // [Fix] Auto-refresh live preview to show upload status
                if (window.schedulePreviewRender) window.schedulePreviewRender();
                refreshThemeColorLivePreviewIfNeeded(ch);
            }
        }).catch(err => {
            console.error("Upload to CMS failed:", err);
            obj.cmsStatus = "fail";
            persistState();
            renderSilently();
            // [Fix] Auto-refresh live preview to show upload status
            if (window.schedulePreviewRender) window.schedulePreviewRender();
            refreshThemeColorLivePreviewIfNeeded(ch);
        });
        uploadPromises.push(pCms);
    });

    // Wait for all uploads to complete, then refresh preview
    // [Modified] User requested Real-time preview. Do NOT force reload.
    // The persistState() calls inside the loop already trigger pushLivePreview() with blobURLs (immediate)
    // and then with CMS URLs (delayed).

    Promise.all(uploadPromises).then(() => {
        console.log("All uploads complete.");
    });
}



function handleImageReplacement(file, index, type = 'main') {
    if (!file) return;
    const ch = state.chapters[state.currentIndex];
    const skipComfy = shouldSkipComfyForUpload({ chapter: ch, type });
    const blobUrl = URL.createObjectURL(file);
    const obj = {
        preview: blobUrl,
        name: null,
        url: blobUrl,
        uploadStatus: skipComfy ? "" : "pending",
        cmsStatus: "pending",
        imgName: file.name || ""
    };

    if (type === 'main') {
        if (index < 0 || index >= 6) return;
        ch.mainImages[index] = obj;
        if (!Array.isArray(ch.mainImageUrls)) ch.mainImageUrls = Array(6).fill("");
        ch.mainImageUrls[index] = blobUrl;
        setUrlValue(ch, index, blobUrl);
        if (isThemeThemeDetailId(ch.id)) {
            fillPatternDetailBrandLabels(ch, null, ch.maxImages || 6, { forceSlots: [index + 1] });
        }
    } else {
        if (index < 0) {
            ch.detailImages.push(obj);
            ch.detailImageUrls.push(blobUrl);
            setDetailUrlValue(ch, ch.detailImages.length - 1, blobUrl);
        } else if (index < ch.detailImages.length) {
            ch.detailImages[index] = obj;
            ch.detailImageUrls[index] = blobUrl;
            setDetailUrlValue(ch, index, blobUrl);
        }
    }

    persistState();
    renderSilently();
    if (window.schedulePreviewRender) window.schedulePreviewRender();
    refreshThemeColorLivePreviewIfNeeded(ch);

    const promises = [];

    if (!skipComfy) {
        const pComfy = uploadToComfy(file).then(name => {
            obj.name = name;
            obj.uploadStatus = name ? "ok" : "fail";
            ch.status = "图片已更新，待生成";
            persistState();
            renderSilently();
            if (window.schedulePreviewRender) window.schedulePreviewRender();
            refreshThemeColorLivePreviewIfNeeded(ch);
        });
        promises.push(pComfy);
    }

    const pCms = uploadToCms(file).then(res => {
        if (res) {
            const url = typeof res === "string" ? res : (res.url || "");
            if (url) {
                obj.url = url;
                obj.preview = url;
                obj.cmsStatus = "ok";
                if (type === 'main') {
                    setUrlValue(ch, index, url);
                } else {
                    const detailIdx = index < 0 ? ch.detailImages.indexOf(obj) : index;
                    if (detailIdx >= 0) setDetailUrlValue(ch, detailIdx, url);
                }
                syncFormalImageUrls(ch);
                persistState();
                renderSilently();
                if (window.schedulePreviewRender) window.schedulePreviewRender();
                refreshThemeColorLivePreviewIfNeeded(ch);
            }
        } else {
            obj.cmsStatus = "fail";
            persistState();
            renderSilently();
            if (window.schedulePreviewRender) window.schedulePreviewRender();
            refreshThemeColorLivePreviewIfNeeded(ch);
        }
    }).catch(err => {
        console.error("Upload to CMS failed (Replace):", err);
        obj.cmsStatus = "fail";
        persistState();
        renderSilently();
        if (window.schedulePreviewRender) window.schedulePreviewRender();
        refreshThemeColorLivePreviewIfNeeded(ch);
    });
    promises.push(pCms);


    // [Modified] User requested Real-time preview. Do NOT force reload.

    Promise.all(promises).then(() => {
        console.log("Replacement upload complete.");
        if (window.schedulePreviewRender) window.schedulePreviewRender();
        refreshThemeColorLivePreviewIfNeeded(ch);
    });

}

function deleteDraft(idx, type = 'main') {
    const ch = state.chapters[state.currentIndex];
    if (type === 'main') {
        // [ ✨ Requirement: Set to null, no splice ✨ ]
        ch.mainImages[idx] = null;
        if (Array.isArray(ch.mainImageUrls)) ch.mainImageUrls[idx] = "";
        clearPatternDetailBrandLabel(ch, idx);
    } else {
        // [ ✨ Requirement: Splice for detail ✨ ]
        ch.detailImages.splice(idx, 1);
        if (Array.isArray(ch.detailImageUrls)) ch.detailImageUrls.splice(idx, 1);
    }
    ch.status = "图片已更新，待生成";
    syncFormalImageUrls(ch, { force: true });
    persistState();
    render();
}


window.deleteDraft = deleteDraft;

async function uploadToComfy(file) {
    const form = new FormData();
    form.append("image", file, file.name);
    form.append("overwrite", "true");

    try {
        // Use unified apiClient to handle URL normalization and errors
        const json = await apiClient.uploadImage(form);
        return json.name;
    } catch (e) {
        console.error("Comfy upload skipped/failed:", e);
        // Optional: Expose error to UI via a global var or notification if needed
        return null;
    }
}

async function uploadToCms(file) {
    try {
        const res = await cmsUploadService.uploadImages([file]);
        if (!res || !res.length) return null;
        const first = res[0];
        if (typeof first === "string") return first;
        return first;
    } catch (e) {
        throw e;
    }
}

function getCmsUrlFromUploadResult(res) {
    if (!res) return "";
    if (typeof res === "string") return res.trim();
    if (typeof res.url === "string" && res.url.trim()) return res.url.trim();
    if (typeof res.imgName === "string" && res.imgName.trim()) return res.imgName.trim();
    return "";
}

function getImageExtFromMimeType(mimeType) {
    const mt = String(mimeType || "").toLowerCase();
    if (mt.includes("png")) return "png";
    if (mt.includes("webp")) return "webp";
    if (mt.includes("gif")) return "gif";
    if (mt.includes("bmp")) return "bmp";
    if (mt.includes("svg")) return "svg";
    if (mt.includes("avif")) return "avif";
    if (mt.includes("tiff")) return "tiff";
    return "jpg";
}

async function uploadBlobUrlToCms(blobUrl, seq = 0) {
    const target = String(blobUrl || "").trim();
    if (!/^blob:/i.test(target)) return "";

    const resp = await fetch(target);
    if (!resp.ok) {
        throw new Error(`读取临时图片失败: ${resp.status}`);
    }
    const blob = await resp.blob();
    const ext = getImageExtFromMimeType(blob.type);
    const file = new File([blob], `export_sync_${Date.now()}_${seq}.${ext}`, {
        type: blob.type || `image/${ext}`
    });
    const uploadRes = await uploadToCms(file);
    return getCmsUrlFromUploadResult(uploadRes);
}

function collectBlobUrlsFromString(str, outSet) {
    if (typeof str !== "string") return;
    const direct = str.trim();
    if (/^blob:/i.test(direct)) outSet.add(direct);
    if (str.includes("\n") || str.includes("\r")) {
        str.split(/\r?\n/).forEach((line) => {
            const t = String(line || "").trim();
            if (/^blob:/i.test(t)) outSet.add(t);
        });
    }
}

function collectBlobUrlsDeep(value, outSet, visited = new WeakSet()) {
    if (value == null) return;
    if (typeof value === "string") {
        collectBlobUrlsFromString(value, outSet);
        return;
    }
    if (typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
        value.forEach((item) => collectBlobUrlsDeep(item, outSet, visited));
        return;
    }
    Object.keys(value).forEach((key) => {
        collectBlobUrlsDeep(value[key], outSet, visited);
    });
}

function replaceBlobUrlsInString(str, blobMap) {
    if (typeof str !== "string" || !blobMap || !blobMap.size) return str;
    const direct = str.trim();
    if (/^blob:/i.test(direct) && blobMap.has(direct)) {
        return blobMap.get(direct);
    }
    if (!(str.includes("\n") || str.includes("\r"))) return str;

    let changed = false;
    const replaced = str.split(/\r?\n/).map((line) => {
        const t = String(line || "").trim();
        if (/^blob:/i.test(t) && blobMap.has(t)) {
            changed = true;
            return line.replace(t, blobMap.get(t));
        }
        return line;
    });
    return changed ? replaced.join("\n") : str;
}

function replaceBlobUrlsDeep(value, blobMap, visited = new WeakSet()) {
    if (value == null || typeof value !== "object") return 0;
    if (visited.has(value)) return 0;
    visited.add(value);

    let changedCount = 0;
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const current = value[i];
            if (typeof current === "string") {
                const next = replaceBlobUrlsInString(current, blobMap);
                if (next !== current) {
                    value[i] = next;
                    changedCount++;
                }
            } else if (current && typeof current === "object") {
                changedCount += replaceBlobUrlsDeep(current, blobMap, visited);
            }
        }
        return changedCount;
    }

    Object.keys(value).forEach((key) => {
        const current = value[key];
        if (typeof current === "string") {
            const next = replaceBlobUrlsInString(current, blobMap);
            if (next !== current) {
                value[key] = next;
                changedCount++;
            }
            return;
        }
        if (current && typeof current === "object") {
            changedCount += replaceBlobUrlsDeep(current, blobMap, visited);
        }
    });
    return changedCount;
}

let blobSyncForExportPromise = null;
async function syncBlobUrlsToCmsBeforeHtmlExport({ includeReportFinal = false } = {}) {
    if (blobSyncForExportPromise) return blobSyncForExportPromise;

    blobSyncForExportPromise = (async () => {
        const roots = [];
        if (Array.isArray(state.chapters)) {
            const exportChapters = state.chapters.filter((ch) => ch && ch.isActive !== false);
            roots.push(exportChapters);
        }
        if (includeReportFinal && state.reportFinal && typeof state.reportFinal === "object") {
            roots.push(state.reportFinal);
        }

        const blobSet = new Set();
        roots.forEach((root) => collectBlobUrlsDeep(root, blobSet));
        const total = blobSet.size;
        if (!total) {
            return { total: 0, uploaded: 0, failed: 0, changed: 0 };
        }

        const blobMap = new Map();
        const failedUrls = [];
        let seq = 0;
        for (const blobUrl of blobSet) {
            try {
                const cmsUrl = await uploadBlobUrlToCms(blobUrl, seq++);
                if (cmsUrl) blobMap.set(blobUrl, cmsUrl);
                else failedUrls.push(blobUrl);
            } catch (err) {
                console.warn("[Export] blob url upload failed:", blobUrl, err);
                failedUrls.push(blobUrl);
            }
        }

        let changed = 0;
        if (blobMap.size > 0) {
            roots.forEach((root) => {
                changed += replaceBlobUrlsDeep(root, blobMap);
            });
            persistState();
        }

        return {
            total,
            uploaded: blobMap.size,
            failed: failedUrls.length,
            changed,
            failedUrls
        };
    })();

    try {
        return await blobSyncForExportPromise;
    } finally {
        blobSyncForExportPromise = null;
    }
}

async function ensureHtmlExportImagesReady({ includeReportFinal = false, refreshLivePreview = false } = {}) {
    const result = await syncBlobUrlsToCmsBeforeHtmlExport({ includeReportFinal });
    if (result.failed > 0) {
        alert(`仍有 ${result.failed} 张临时图片未同步到图床，已取消导出。请稍后重试或重新上传失败图片。`);
        return false;
    }
    if (refreshLivePreview && isLiveTemplate()) {
        renderPreviewCore(true);
        await new Promise((resolve) => setTimeout(resolve, 160));
    }
    return true;
}

function deleteImage(idx) {
    const ch = state.chapters[state.currentIndex];
    ch.images.splice(idx, 1);
    ch.status = "图片已更新，待生成";
    persistState();
    render();
}

// [Helper] Brand Name Extraction (Global Shared Logic)

const extractBrandName = (filename) => {
    if (!filename) return "";
    let raw = filename.replace(/\.[^/.]+$/, ""); // Remove extension

    // [Fix] 0. Special Case: AI.design (Safe explicit check)
    if (/ai\.design/i.test(filename) || /ai\.design/i.test(raw)) {
        return "AI.design";
    }

    // 1. Special Case: On Running
    if (raw.toLowerCase().startsWith("on_running")) return "On Running";

    // 2. Cleanup Prefixes/Suffixes
    raw = raw.replace(/_?\d+$/, ""); // Remove trailing ID
    raw = raw.replace(/^POP\d+/i, ""); // Remove POP prefix
    raw = raw.replace(/^pop_\d*/i, ""); // Remove pop_ prefix

    // 3. Extract English/Symbol segments
    const matches = raw.match(/[a-zA-Z0-9_\-\s]+/g);
    if (!matches) return "";

    // [Fix] Category Blocklist (Only "polo" as requested)
    const categoryBlocklist = ["polo"];

    // Filter out purely numeric segments AND items in blocklist
    const candidates = matches.filter(m => {
        if (/^\d+$/.test(m)) return false; // Pure numbers
        if (categoryBlocklist.includes(m.toLowerCase())) return false; // Blocklist
        return true;
    });
    if (candidates.length === 0) return "";

    // Use the last candidate (usually the brand in "Prefix...Brand...Suffix")
    const bestMatch = candidates[candidates.length - 1];

    // 4. Process the Best Match (Split by underscore and filter keywords)
    const ignoreList = ["SS", "AW", "FW", "WOMEN", "MEN", "KIDS", "MENS", "WOMENS", "CHILDREN", "SPRING", "SUMMER", "AUTUMN", "WINTER", "FALL", "PRE"];
    const parts = bestMatch.split("_");

    if (parts.length > 1) {
        const filteredParts = parts.filter(p => {
            const up = p.toUpperCase();
            if (/^20\d\d$/.test(p)) return false; // Year
            if (ignoreList.includes(up)) return false; // Keywords
            if (/^\d+$/.test(p)) return false; // Pure numbers
            return true;
        });
        if (filteredParts.length > 0) return filteredParts.join(" ");
    }

    return bestMatch.replace(/_+/g, " ").trim();
};

function extractBrandLabelFromImageAsset(asset) {
    if (!asset || typeof asset !== "object") return "";
    const candidates = [
        asset.imgName,
        asset.name,
        getFilenameFromAny(asset.url || ""),
        getFilenameFromAny(asset.preview || "")
    ];
    for (const candidate of candidates) {
        const normalized = normalizeBrandLabel(extractBrandName(String(candidate || "")));
        if (normalized) return normalized;
    }
    return "";
}

function extractBrandLabelsFromChapterImages(ch, slotCount = 6) {
    const brands = Array(slotCount).fill("");
    const images = Array.isArray(ch && ch.mainImages) ? ch.mainImages : [];
    for (let i = 0; i < slotCount; i++) {
        brands[i] = extractBrandLabelFromImageAsset(images[i]);
    }
    return brands;
}

function fillPatternDetailBrandLabels(ch, parsed, slotCount = 6, options = {}) {
    if (!ch || typeof ch.id !== "string" || !isThemeThemeDetailId(ch.id)) return;
    if (!ch.customData) ch.customData = {};

    const modelBrands = extractBrandsFromModelOutput(parsed, slotCount);
    const imageBrands = extractBrandLabelsFromChapterImages(ch, slotCount);
    const forceSlots = new Set(
        (Array.isArray(options.forceSlots) ? options.forceSlots : [])
            .map((value) => parseInt(value, 10))
            .filter((value) => Number.isFinite(value) && value >= 1 && value <= slotCount)
    );

    for (let i = 1; i <= slotCount; i++) {
        const key = `img${i}_brand`;
        const current = normalizeBrandLabel(ch.customData[key]);
        const fromModel = normalizeBrandLabel(modelBrands[i - 1]);
        const fromImage = normalizeBrandLabel(imageBrands[i - 1]);

        let nextValue = current || "";
        if (fromModel) {
            nextValue = fromModel;
        } else if (forceSlots.has(i)) {
            nextValue = fromImage || "";
        } else if (!current && fromImage) {
            nextValue = fromImage;
        }

        ch.customData[key] = nextValue;
    }
}

function swapSlottedImageBrandLabels(ch, fromIndex, toIndex) {
    if (!ch || !ch.customData || typeof ch.id !== "string") return;
    if (!/^(keyItem|patternDetail)\d+$/.test(ch.id) && !isThemeThemeItemDetailId(ch.id)) return;
    if (fromIndex === toIndex) return;

    const fromKey = `img${fromIndex + 1}_brand`;
    const toKey = `img${toIndex + 1}_brand`;
    const temp = ch.customData[fromKey] || "";
    ch.customData[fromKey] = ch.customData[toKey] || "";
    ch.customData[toKey] = temp;
}

function clearPatternDetailBrandLabel(ch, index) {
    if (!ch || !ch.customData || typeof ch.id !== "string") return;
    if (!isThemeThemeDetailId(ch.id)) return;
    if (!Number.isInteger(index) || index < 0) return;
    ch.customData[`img${index + 1}_brand`] = "";
}

/* Helper: Validate Prompt Structure */
function validatePrompt(workflow) {
    const keys = Object.keys(workflow);
    const badKeys = keys.filter(k => !/^\d+$/.test(k));
    const badValues = keys.filter(k => typeof workflow[k] !== 'object' || workflow[k] === null || !workflow[k].class_type);

    if (badKeys.length || badValues.length) {
        console.error("[PROMPT_BAD_KEYS]", badKeys);
        console.error("[PROMPT_BAD_VALUES]", badValues);
        // Alert user or throw
        throw new Error(`Invalid Prompt Structure. Keys: ${badKeys.length}, Values: ${badValues.length}`);
    }
}

/* Helper: Convert Graph JSON (Editor) to API JSON */
function convertGraphToApi(graphData) {
    if (!graphData.nodes || !Array.isArray(graphData.nodes)) return graphData;
    console.log("Detecting Graph JSON, converting to API format...");

    const api = {};
    const links = graphData.links || [];

    graphData.nodes.forEach(node => {
        const clean = { class_type: node.type, inputs: {} };
        const w = node.widgets_values || [];

        switch (node.type) {
            case "LoadImage": clean.inputs.image = w[0]; break;
            case "DF_Image_scale_to_side":
                clean.inputs.side_length = w[0]; clean.inputs.side = w[1];
                clean.inputs.upscale_method = w[2]; clean.inputs.crop = w[3]; break;
            case "Int": clean.inputs.Number = w[0]; break;
            case "ImageBatchMulti": clean.inputs.inputcount = w[0]; break;
            case "TextInput_": clean.inputs.text = w[0]; break;
            case "CR Text": clean.inputs.text = w[0]; break;
            case "CR Text Concatenate": clean.inputs.separator = w[0]; break;
            case "GeminiNode": clean.inputs.model = w[1]; clean.inputs.seed = w[2]; break;
            case "System Prompt": clean.inputs.text = w[0]; break;
        }

        if (node.inputs) {
            node.inputs.forEach(inp => {
                if (inp.link) {
                    const link = links.find(l => l[0] === inp.link);
                    if (link) clean.inputs[inp.name] = [String(link[1]), link[2]];
                }
            });
        }
        api[String(node.id)] = clean;
    });
    return api;
}

async function requestRackColorDisplayImage({ chapterId, sourceImages, chapterData, mode, promptText }) {
    void chapterData;
    const blobToDataUrl = async (blobUrl) => {
        try {
            const resp = await fetch(blobUrl);
            if (!resp.ok) return "";
            const blob = await resp.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
                reader.onerror = () => resolve("");
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.warn("[Rack] Failed to convert blob url", err);
            return "";
        }
    };
    const normalizeRackSourceImagesForProxy = async (list, limit = RACK_SOURCE_IMAGE_LIMIT) => {
        const raw = Array.isArray(list)
            ? list.map((url) => (typeof url === "string" ? url.trim() : "")).filter(Boolean)
            : [];
        const out = [];
        const seen = new Set();

        for (const url of raw) {
            let prepared = url;
            if (/^blob:/i.test(prepared)) {
                prepared = await blobToDataUrl(prepared);
            }
            if (!prepared) continue;
            if (!/^(https?:\/\/|data:image\/)/i.test(prepared)) continue;
            if (seen.has(prepared)) continue;
            seen.add(prepared);
            out.push(prepared);
            if (out.length >= limit) break;
        }
        return out;
    };
    const normalized = await normalizeRackSourceImagesForProxy(sourceImages, RACK_SOURCE_IMAGE_LIMIT);
    if (!normalized.length) throw new Error("未找到可用的参考图，请等待图片上传完成后重试");

    const baseUrl = String(CONFIG.RACK_PROXY_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
    const endpoint = String(CONFIG.RACK_PROXY_ENDPOINT || "/api/rack-image");
    const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const proxyCandidates = [];
    const addCandidateBase = (raw) => {
        const clean = String(raw || "").trim().replace(/\/+$/, "");
        if (!clean || proxyCandidates.includes(clean)) return;
        proxyCandidates.push(clean);
    };
    addCandidateBase(baseUrl);
    if (/127\.0\.0\.1/i.test(baseUrl)) addCandidateBase(baseUrl.replace(/127\.0\.0\.1/ig, "localhost"));
    if (/localhost/i.test(baseUrl)) addCandidateBase(baseUrl.replace(/localhost/ig, "127.0.0.1"));
    try {
        const host = (typeof window !== "undefined" && window.location && window.location.hostname)
            ? window.location.hostname.trim()
            : "";
        if (host) {
            const u = new URL(baseUrl);
            u.hostname = host;
            addCandidateBase(u.origin);
        }
    } catch (e) {
        // Ignore URL parse/host fallback failures.
    }

    const postToProxy = async (url) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                chapterId: String(chapterId || ""),
                sourceImages: normalized,
                mode: normalizeRackMode(mode),
                prompt: sanitizeRackPromptText(typeof promptText === "string" ? promptText.trim() : "", mode)
            })
        });
    };
    const probeProxyHealth = async (base) => {
        const healthUrl = `${base}/health`;
        try {
            const resp = await fetch(healthUrl, { method: "GET", headers: { "Accept": "application/json" } });
            const text = await resp.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
            return {
                base,
                healthUrl,
                reachable: true,
                ok: !!(resp.ok && data && data.ok),
                status: resp.status,
                data
            };
        } catch (err) {
            return {
                base,
                healthUrl,
                reachable: false,
                ok: false,
                status: 0,
                error: err && err.message ? err.message : String(err || "")
            };
        }
    };

    let response;
    let selectedProxyBase = "";
    let lastNetworkError = null;
    for (const base of proxyCandidates) {
        const requestUrl = `${base}${endpointPath}`;
        try {
            response = await postToProxy(requestUrl);
            selectedProxyBase = base;
            break;
        } catch (err) {
            lastNetworkError = err;
            console.warn("[Rack] Proxy endpoint failed", requestUrl, err);
        }
    }
    if (!response) {
        console.error("[Rack] All proxy candidates failed", proxyCandidates, lastNetworkError);
        const healthChecks = [];
        for (const base of proxyCandidates) {
            // Probe serially to reduce concurrent noise.
            const check = await probeProxyHealth(base);
            healthChecks.push(check);
        }
        console.warn("[Rack] Proxy health probe results", healthChecks);
        const online = healthChecks.find((item) => item && item.reachable && item.ok);
        if (online) {
            throw new Error("代理在线但连接被重置，请重启代理（启动挂杆代理.cmd）");
        }
        throw new Error("代理未启动或不可访问（127.0.0.1:8787）");
    }
    console.log("[Rack] Proxy endpoint selected", `${selectedProxyBase}${endpointPath}`);

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (e) {
        payload = { detail: text };
    }

    if (!response.ok) {
        let message = "";
        if (payload && typeof payload === "object") {
            const detail = typeof payload.detail === "string" ? payload.detail.trim() : "";
            const payloadMessage = typeof payload.message === "string" ? payload.message.trim() : "";
            const payloadError = typeof payload.error === "string" ? payload.error.trim() : "";
            message = detail || payloadMessage || payloadError;
        }
        if (!message) message = `代理请求失败 (${response.status})`;
        throw new Error(message);
    }

    const imageUrl = payload && typeof payload.imageUrl === "string" ? payload.imageUrl.trim() : "";
    if (!imageUrl) throw new Error("代理未返回 imageUrl");
    return { imageUrl };
}

async function requestThemePlanningChapterText({ chapterId, imageUrls = [], promptText, contextTexts = [] }) {
    const blobToDataUrl = async (blobUrl) => {
        try {
            const resp = await fetch(blobUrl);
            if (!resp.ok) return "";
            const blob = await resp.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
                reader.onerror = () => resolve("");
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.warn("[ThemePlanning] Failed to convert blob url", err);
            return "";
        }
    };

    const rawImageUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    const normalizedImageUrls = [];
    const seenImageUrls = new Set();
    for (const rawUrl of rawImageUrls) {
        let normalizedImageUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";
        if (!normalizedImageUrl) continue;
        if (/^blob:/i.test(normalizedImageUrl)) {
            normalizedImageUrl = await blobToDataUrl(normalizedImageUrl);
        }
        if (!/^(https?:\/\/|data:image\/)/i.test(normalizedImageUrl) || seenImageUrls.has(normalizedImageUrl)) {
            continue;
        }
        seenImageUrls.add(normalizedImageUrl);
        normalizedImageUrls.push(normalizedImageUrl);
    }

    const normalizedPrompt = typeof promptText === "string" ? promptText.trim() : "";
    if (!normalizedPrompt) {
        throw new Error("主题企划提示词为空");
    }
    const normalizedContextTexts = (Array.isArray(contextTexts) ? contextTexts : [contextTexts])
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);

    const baseUrl = String(CONFIG.RACK_PROXY_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
    const endpoint = String(THEME_THEME_TEXT_PROXY_ENDPOINT || "/api/theme-story-text");
    const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const proxyCandidates = [];
    const addCandidateBase = (raw) => {
        const clean = String(raw || "").trim().replace(/\/+$/, "");
        if (!clean || proxyCandidates.includes(clean)) return;
        proxyCandidates.push(clean);
    };
    addCandidateBase(baseUrl);
    if (/127\.0\.0\.1/i.test(baseUrl)) addCandidateBase(baseUrl.replace(/127\.0\.0\.1/ig, "localhost"));
    if (/localhost/i.test(baseUrl)) addCandidateBase(baseUrl.replace(/localhost/ig, "127.0.0.1"));
    try {
        const host = (typeof window !== "undefined" && window.location && window.location.hostname)
            ? window.location.hostname.trim()
            : "";
        if (host) {
            const u = new URL(baseUrl);
            u.hostname = host;
            addCandidateBase(u.origin);
        }
    } catch (e) {
        // Ignore URL parse/host fallback failures.
    }

    const postToProxy = async (url) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                chapterId: String(chapterId || ""),
                imageUrls: normalizedImageUrls,
                contextTexts: normalizedContextTexts,
                prompt: normalizedPrompt
            })
        });
    };
    const probeProxyHealth = async (base) => {
        const healthUrl = `${base}/health`;
        try {
            const resp = await fetch(healthUrl, { method: "GET", headers: { "Accept": "application/json" } });
            const text = await resp.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
            return {
                base,
                healthUrl,
                reachable: true,
                ok: !!(resp.ok && data && data.ok),
                status: resp.status,
                data
            };
        } catch (err) {
            return {
                base,
                healthUrl,
                reachable: false,
                ok: false,
                status: 0,
                error: err && err.message ? err.message : String(err || "")
            };
        }
    };

    let response;
    let selectedProxyBase = "";
    let lastNetworkError = null;
    for (const base of proxyCandidates) {
        const requestUrl = `${base}${endpointPath}`;
        try {
            response = await postToProxy(requestUrl);
            selectedProxyBase = base;
            break;
        } catch (err) {
            lastNetworkError = err;
            console.warn("[ThemePlanning] Proxy endpoint failed", requestUrl, err);
        }
    }
    if (!response) {
        console.error("[ThemePlanning] All proxy candidates failed", proxyCandidates, lastNetworkError);
        const healthChecks = [];
        for (const base of proxyCandidates) {
            const check = await probeProxyHealth(base);
            healthChecks.push(check);
        }
        console.warn("[ThemePlanning] Proxy health probe results", healthChecks);
        const online = healthChecks.find((item) => item && item.reachable && item.ok);
        if (online) {
            throw new Error("代理在线但连接被重置，请重启代理（启动挂杆代理.cmd）");
        }
        throw new Error("代理未启动或不可访问（127.0.0.1:8787）");
    }
    console.log("[ThemePlanning] Proxy endpoint selected", `${selectedProxyBase}${endpointPath}`);

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (e) {
        payload = { detail: text };
    }

    if (!response.ok) {
        let message = "";
        if (payload && typeof payload === "object") {
            const detail = typeof payload.detail === "string" ? payload.detail.trim() : "";
            const payloadMessage = typeof payload.message === "string" ? payload.message.trim() : "";
            const payloadError = typeof payload.error === "string" ? payload.error.trim() : "";
            message = detail || payloadMessage || payloadError;
        }
        if (!message) message = `代理请求失败 (${response.status})`;
        throw new Error(message);
    }

    const outputText = payload && typeof payload.text === "string" ? payload.text.trim() : "";
    if (!outputText) throw new Error("代理未返回 text");
    return { text: outputText };
}

function inferImageExtensionFromUrl(url) {
    const clean = String(url || "").trim();
    if (!clean) return "png";
    const noQuery = clean.split("?")[0].split("#")[0];
    const match = noQuery.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match && match[1] ? match[1].toLowerCase() : "";
    if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
    return "png";
}

function inferImageExtensionFromMime(mime) {
    const normalized = String(mime || "").toLowerCase();
    if (normalized.includes("jpeg")) return "jpg";
    if (normalized.includes("png")) return "png";
    if (normalized.includes("webp")) return "webp";
    if (normalized.includes("gif")) return "gif";
    if (normalized.includes("bmp")) return "bmp";
    return "png";
}

async function uploadRackGeneratedImageToCms(imageUrl) {
    const raw = typeof imageUrl === "string" ? imageUrl.trim() : "";
    if (!raw) throw new Error("接口未返回图片地址");
    const isDataImage = /^data:image\//i.test(raw);
    const isHttpImage = /^https?:\/\//i.test(raw);
    if (!isDataImage && !isHttpImage) throw new Error("生成结果不是可上传的图片地址");

    const uploadAsFile = async () => {
        const resp = await fetch(raw);
        if (!resp.ok) throw new Error(`下载生成图失败 (${resp.status})`);
        const blob = await resp.blob();
        const ext = isDataImage ? inferImageExtensionFromMime(blob.type) : inferImageExtensionFromUrl(raw);
        const fileType = blob.type || `image/${ext === "jpg" ? "jpeg" : ext}`;
        const fileName = `rack_generated_${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: fileType });
        const cmsResult = await uploadToCms(file);
        const cmsUrl = typeof cmsResult === "string"
            ? cmsResult.trim()
            : (cmsResult && typeof cmsResult.url === "string" ? cmsResult.url.trim() : "");
        if (!cmsUrl || !/^https?:\/\//i.test(cmsUrl)) {
            throw new Error("图床未返回有效图片链接");
        }
        return cmsUrl;
    };

    try {
        return await uploadAsFile();
    } catch (err) {
        if (isHttpImage) {
            console.warn("[Rack] Upload generated image to CMS failed, fallback to upstream URL:", err);
            return raw;
        }
        throw err;
    }
}

function extractRackSourceImages(chapter, limit = RACK_SOURCE_IMAGE_LIMIT) {
    const urls = [];
    const seen = new Set();
    const pushUrl = (val) => {
        const url = typeof val === "string" ? val.trim() : "";
        if (!url || seen.has(url)) return;
        seen.add(url);
        urls.push(url);
    };
    const pickBestImageUrl = (img) => {
        if (!img || typeof img !== "object") return "";
        const candidates = [img.url, img.preview];
        for (const item of candidates) {
            const value = typeof item === "string" ? item.trim() : "";
            if (!value) continue;
            // Prefer directly usable transport URLs.
            if (/^(https?:\/\/|blob:|data:image\/)/i.test(value)) return value;
        }
        for (const item of candidates) {
            const value = typeof item === "string" ? item.trim() : "";
            if (value) return value;
        }
        return "";
    };
    const collectFromImageObjects = (list) => {
        if (!Array.isArray(list)) return;
        for (const img of list) {
            pushUrl(pickBestImageUrl(img));
            if (urls.length >= limit) return;
        }
    };

    // Rack page uses fixed upload slots in mainImages; prefer this source only
    // so one visible image contributes one request image.
    collectFromImageObjects(chapter.mainImages || []);
    if (urls.length > 0) return urls.slice(0, limit);

    // Legacy fallback paths (only when mainImages is empty).
    collectFromImageObjects(chapter.images || []);
    (chapter.mainImageUrls || []).forEach((u) => {
        pushUrl(u);
    });
    String(chapter.urlListStr || "").split(/\r?\n/).forEach((u) => {
        pushUrl(u);
    });

    return urls.slice(0, limit);
}

async function generateRackColorDisplayImage(btn) {
    const ch = state.chapters[state.currentIndex];
    if (!ch || !isThemePlanningRackDisplayChapterId(ch.id)) return;

    const chapterId = ch.id || `chapter-${state.currentIndex + 1}`;
    if (isChapterGenerating(chapterId, RACK_IMAGE_SOURCE)) return;

    const sourceImages = extractRackSourceImages(ch, RACK_SOURCE_IMAGE_LIMIT);
    const rackMode = getRackModeFromChapter(ch);
    const customRackPrompt = getRackPromptFromChapter(ch, rackMode).trim();
    if (!sourceImages.length) {
        alert("请至少上传1张参考图");
        return;
    }

    if (!ch.customData || typeof ch.customData !== "object") ch.customData = {};
    setChapterGenerating(chapterId, RACK_IMAGE_SOURCE, true);
    setButtonLoading(btn, true, "生成中...");
    ch.status = "正在生成图片...";
    persistState();
    render();
    if (window.postToPreview) window.postToPreview(true);

    try {
        const result = await requestRackColorDisplayImage({
            chapterId,
            sourceImages,
            chapterData: ch,
            mode: rackMode,
            promptText: customRackPrompt || await getRackPromptTemplate(rackMode)
        });
        const imageUrl = (typeof result === "string") ? result : (result && result.imageUrl ? String(result.imageUrl) : "");
        if (!imageUrl || !imageUrl.trim()) {
            throw new Error("接口未返回图片地址");
        }
        ch.status = "图片生成成功，正在上传图床...";
        persistState();
        render();
        if (window.postToPreview) window.postToPreview(true);

        const finalImageUrl = await uploadRackGeneratedImageToCms(imageUrl.trim());
        ch.customData[RACK_RESULT_KEY] = finalImageUrl.trim();
        ch.status = "图片已生成";
        persistState();
        render();
        if (window.postToPreview) window.postToPreview(true);
    } catch (err) {
        const message = (err && err.message) ? err.message : "未知错误";
        ch.status = `图片生成失败: ${message}`;
        persistState();
        render();
        alert(`生成图片失败: ${message}`);
    } finally {
        setChapterGenerating(chapterId, RACK_IMAGE_SOURCE, false);
        setButtonLoading(btn, false);
        const liveBtn = document.getElementById("genRackImageBtn");
        if (liveBtn) syncGenerateButtonLoading(liveBtn, chapterId, RACK_IMAGE_SOURCE);
    }
}

// [Fix] Missing safeGenerate definition
function safeGenerate(btn, source) {
    if (btn && btn.classList.contains('is-loading')) return;
    runGenerateChapter(source);
}

async function runGenerateChapter(triggerSource) {
    const source = (typeof triggerSource === 'string') ? triggerSource : 'standard';
    const ch = state.chapters[state.currentIndex];
    const isThemePlanningReport = isThemeThemePlanningType(state.currentReportType);
    const isStylePlanningReport = isStylePlanningType(state.currentReportType);
    const themePlanningConfig = isThemePlanningReport ? resolveThemeThemePlanningConfig(ch?.id) : null;
    if (isThemePlanningReport && themePlanningConfig?.reserved) {
        markThemeThemePlanningReserved(ch, source === 'composition' ? "组合生成" : "文案生成", true);
        return;
    }
    const chapterId = ch && ch.id ? ch.id : `chapter-${state.currentIndex + 1}`;
    const legacyChapterNumber = getLegacyStylePlanningChapterNumber(ch?.id, state.currentIndex);
    const getTargetChapter = () => state.chapters.find(item => item && item.id === chapterId) || ch;
    const isViewingTargetChapter = () => (state.chapters[state.currentIndex] && state.chapters[state.currentIndex].id) === chapterId;
    const isQL = ['quiet_luxury', 'style_planning'].includes(state.currentReportType);
    const useThemePlanningApi = isThemePlanningReport && !themePlanningConfig?.reserved;

    let statusLine, genBtn;
    if (isQL) {
        if (source.startsWith("brand")) {
            statusLine = document.getElementById(`statusLine_${source}`);
            genBtn = document.getElementById(`genBtn_${source}`);
        } else if (source === 'composition') {
            // Correct ID for composition status/btn based on viewing code might be 'statusLine_comp'
            // But existing code used fallback. We try robust lookup.
            statusLine = document.getElementById("statusLine_comp") || document.getElementById("ql_statusLine");
            genBtn = document.getElementById("genBtn_comp");
        } else {
            statusLine = document.getElementById("statusLine") || document.getElementById("ql_statusLine"); // Fallback
            genBtn = document.getElementById("genBtn");
        }
    } else {
        statusLine = document.getElementById("statusLine");

    }

    // [Fix 1: Null-Safe Helper for Status Updates]
    // [Status Logic]
    const updateStatus = (type, msg) => {
        const targetChapter = getTargetChapter();
        if (targetChapter) targetChapter.status = msg;
        if (!isViewingTargetChapter()) return;

        const statusId = (source === 'composition') ? 'statusLine_comp' : 'statusLine';
        const statusEl = document.getElementById(statusId);
        const targetEl = statusEl || document.getElementById("statusLine");
        if (targetEl) {
            targetEl.className = `status-line ${type}`;
            targetEl.textContent = (statusEl ? "" : "[Comp] ") + msg;

            // Inline Styles for immediate feedback
            targetEl.style.display = "inline-flex";
            if (type === 'err') {
                targetEl.style.background = "rgba(255, 59, 48, 0.1)"; targetEl.style.color = "#c92a2a";
            } else if (type === 'active') {
                targetEl.style.background = "rgba(0, 113, 227, 0.1)"; targetEl.style.color = "#0071e3";
            } else if (type === 'success' || type === 'ok') {
                targetEl.style.background = "rgba(52, 199, 89, 0.1)"; targetEl.style.color = "#1a7f37";
            } else {
                targetEl.style.background = "rgba(0,0,0,0.05)"; targetEl.style.color = "#666";
            }
        } else {
            console.warn(`[GEN] Status update ignored: [${type}] ${msg}`);
        }
    };

    // [Fix: Null-Safe Button Loading]
    const setBtnLoading = (loading, txt) => {
        if (genBtn) {
            setButtonLoading(genBtn, loading, txt);
        }
    };

    const showError = (msg) => {
        updateStatus('err', msg);
        setBtnLoading(false);
    };

    if (isChapterGenerating(chapterId, source)) {
        updateStatus('active', '该章节正在生成中，请稍候...');
        setBtnLoading(true, "生成中...");
        return;
    }

    if (!ch.images || !ch.images.length || ch.images.some(img => img && img.uploadStatus !== "ok")) {
        // Validation check
        // For QL Composition mode, images might be 0 if pure text?
        // But assuming standard check:

        // [Fix] Check if current chapter uses a text-only workflow (no images required)
        let requiresImages = true;
        if (isStylePlanningReport) {
            const chId = legacyChapterNumber;
            if (!chId) {
                requiresImages = false;
            }
            const config = getStylePlanningConfig(chId);
            // Only consumerPortrait workflow is text-only (no images required)
            if (config.workflow === 'consumerPortrait') {
                requiresImages = false;
            }
        }

        if (!isQL || (isQL && source !== 'composition' && !source.startsWith('brand'))) {
            if (!ch.images.length && requiresImages) {
                showError("请至少上传1张图片，并等待上传完成"); return;
            }
        }
    }

    setChapterGenerating(chapterId, source, true);
    setBtnLoading(true, "生成中...");

    try {
        // [Modified] Support Quiet Luxury Unified Workflow with Format Conversion
        const isQuietLuxury = ['quiet_luxury', 'style_planning'].includes(state.currentReportType);
        const usesPlanningWorkflow = isQuietLuxury || isThemePlanningReport;
        const mapping = usesPlanningWorkflow ? WORKFLOW_MAPPING.WF_QL : WORKFLOW_MAPPING.WF1;

        let workflowRaw;
        let activeWorkflowConfig = null;
        if (isStylePlanningReport) {
            const chId = legacyChapterNumber;
            if (!chId) throw new Error("当前章节未配置文案生成工作流");
            activeWorkflowConfig = getStylePlanningConfig(chId);
            workflowRaw = JSON.parse(JSON.stringify(STYLE_PLANNING_WORKFLOWS[activeWorkflowConfig.workflow]));
        } else if (isThemePlanningReport) {
            activeWorkflowConfig = themePlanningConfig || resolveThemeThemePlanningConfig(ch?.id);
            if (!activeWorkflowConfig?.workflow) throw new Error("当前主题企划章节未配置文案生成工作流");
            workflowRaw = JSON.parse(JSON.stringify(STYLE_PLANNING_WORKFLOWS[activeWorkflowConfig.workflow]));
        } else if (isQuietLuxury) {
            workflowRaw = JSON.parse(JSON.stringify(QUIET_LUXURY_WORKFLOW));
        } else {
            workflowRaw = JSON.parse(JSON.stringify(BASE_WORKFLOW));
        }

        // Auto-Convert Graph -> API if needed
        let workflow = convertGraphToApi(workflowRaw);

        const currentConfig = REPORT_CONFIGS[state.currentReportType];

        // [Scoped Variables] Defined here to be accessible after prompt try-catch
        let activeInspiration = "";
        let activeUrls = [];
        let activeComfyImages = [];

        const getStandardUrls = () => {
            // ... existing logic ...
            const uUrls = extractUrlsFromText(ch.urlListStr);
            const count = ch.images.length;
            const res = [];
            for (let i = 0; i < count; i++) {
                if (i < uUrls.length && uUrls[i]) res.push(uUrls[i]);
                else {
                    const img = ch.images[i];
                    const fallback = img ? (img.url || (img.name ? toViewUrl(img.name) : "")) : "";
                    res.push(fallback);
                }
            }
            return res;
        };
        const getPromptImageFileNamesBlock = () => {
            const chapterId = String(ch?.id || "");
            let imageAssets = [];

            if (isThemePlanningReport) {
                if ((/^patternDetail\d+$/.test(chapterId) || isThemeThemeItemDetailId(chapterId))
                    || /^group-styling-page(?:-\d+)?$/.test(chapterId)
                    || /^theme-visual-editorial(?:-\d+)?$/.test(chapterId)) {
                    imageAssets = (Array.isArray(ch.mainImages) && ch.mainImages.some(Boolean))
                        ? ch.mainImages.slice(0, ch.maxImages || ch.mainImages.length)
                        : (Array.isArray(ch.images) ? ch.images.slice(0, ch.maxImages || ch.images.length) : []);
                }
            } else {
                if (chapterId === "style-outfit-page") {
                    imageAssets = Array.isArray(ch.images) ? ch.images.slice(1, 8) : [];
                } else if (/^keyItem\d+$/.test(chapterId)) {
                    imageAssets = (Array.isArray(ch.mainImages) && ch.mainImages.length)
                        ? ch.mainImages.slice(0, 6)
                        : (Array.isArray(ch.images) ? ch.images.slice(0, 6) : []);
                }
            }

            const fileNames = imageAssets
                .map(img => (img && (img.imgName || img.name || getFilenameFromAny(img.url || img.preview || ""))) || "")
                .filter(Boolean);
            if (!fileNames.length) return "";
            return "[IMAGE_FILE_NAMES]\n" + fileNames.join("\n");
        };

        // [Modified] Strict Manifest-based Prompt Routing & Image Selection for Key Items
        let promptText = "";
        let promptFile = "";
        let taskKey = "standard";

        // Resolve Task Key based on Source & Chapter
        if (isQuietLuxury) {
            if (source === 'composition') taskKey = "composition";
            else if (source.startsWith('brand')) taskKey = "brand";

            if (isLegacySpecialCompositionChapter(ch)) {
                if (source === 'composition') taskKey = "composition"; // Model
                else taskKey = "standard"; // Window
            }
        }

        if (isThemePlanningReport) {
            promptFile = activeWorkflowConfig?.prompt || "";
            if (!promptFile) throw new Error(`主题企划章节 ${ch?.id || state.currentIndex + 1} 未配置 prompt 文件`);
            promptText = await fetchTextNoCache(promptFile);
        } else {
            // 1. Load Manifest
            const manifestUrl = "prompts/chapters.manifest.json";
            const manifest = await fetchJsonNoCache(manifestUrl);

            // 2. Resolve Chapter ID (1-based)
            const chapterId = legacyChapterNumber || (state.currentIndex + 1);

            // 3. Lookup in Manifest
            const chConfig = manifest[String(chapterId)];
            if (!chConfig) throw new Error(`Manifest missing configuration for Chapter ID ${chapterId}`);

            const taskConfig = chConfig.tasks[taskKey] || chConfig.tasks["standard"];
            if (!taskConfig) throw new Error(`Manifest missing task '${taskKey}' for Chapter ID ${chapterId}`);

            promptFile = taskConfig.prompt_file;
            if (!promptFile) throw new Error(`Manifest entry for Chapter ${chapterId} Task ${taskKey} has no prompt_file`);

            // 4. Fetch Prompt File
            promptText = await fetchTextNoCache(promptFile);
        }

        console.log(`[PROMPT] Loaded ${promptFile} preview:`, promptText.slice(0, 50).replace(/\n/g, " "));

        // [Data Prep based on Source & Task]
        activeComfyImages = []; // We will populate strictly

        if (usesPlanningWorkflow) {
            if (isLegacySpecialCompositionChapter(ch)) {
                // === Key Item Special Logic ===
                if (taskKey === 'composition') {
                    // Mode: Model / Composition
                    // Source: Panel Composition Images (BG1, BG2, Overlay)
                    // Field: ch.customData.panelCompositionImages OR ch.images implicitly?
                    // Current Grid UI stores Panel Images in specific way or Custom Data?
                    // Based on `initCustomImageList`, images might be in customData or separate.
                    // Let's assume they are in `ch.customData` fields per previous instructions or standard image slots?
                    // Re-reading User Req: "Composition Text 区块... 关联图片区 Panel Composition (3 Images)"
                    // Actually, in `renderStep1`, Composition images seem to be standard file inputs mapped to customData keys?
                    // Let's check `renderStep1` logic for "Left Panel Composition" or similar.
                    // Actually, for Key Items, we usually have `ch.images` for the 16 grid items.
                    // The Panel Composition images (3) are likely stored in `ch.customData` keys: 'comp_img_bg1', 'comp_img_bg2', 'comp_img_overlay'.

                    const bg1 = ch.customData?.comp_img_bg1 || "";
                    const bg2 = ch.customData?.comp_img_bg2 || "";
                    const overlay = ch.customData?.comp_img_overlay || "";

                    // We need real blob/url objects for uploadToComfy, or if they are URLs already.
                    // `uploadImagesToComfy` expects objects with `name` or raw files? 
                    // Existing logic uses `ch.images` which are objects.
                    // If these are just URLs in customData, we might need to handle them.
                    // BUT, `activeComfyImages` usually expects objects with `name` (uploaded filename).

                    // CRITICAL: We need the actual Image Objects if we are to re-upload or use existing Names.
                    // If Panel Composition images are NOT in `ch.images`, we might struggle to get their Comfy names if they weren't tracked.
                    // However, if the user uploaded them via the UI we added in `renderStep1` (which used `uploadToCms`), we might only have URLs.
                    // If we don't have Comfy Names, we can't use them easily unless we re-upload URL? Comfy usually takes filenames.

                    // Fallback: If we can't find Comfy Names, we might skip image upload for now or assume they are already managed.
                    // BUT User said: "strictly use ... Panel Composition (3 Images)".
                    // Let's assume for now we use `activeUrls` for Prompt Injection, and `activeComfyImages` for Batch Node.

                    // Let's use the explicit fields:
                    const urls = [bg1, bg2, overlay].filter(Boolean);
                    activeUrls = urls;

                    // [Fix Step 2] Resolve Comfy Names for ImageBatch Node
                    const names = [
                        ch.customData?.comp_img_bg1_comfy_name,
                        ch.customData?.comp_img_bg2_comfy_name,
                        ch.customData?.comp_img_overlay_comfy_name
                    ].filter(Boolean);

                    if (names.length) {
                        activeComfyImages = names.map(n => ({ name: n }));
                    } else {
                        console.warn("[KeyItem] No Comfy Names found for Composition. Please re-upload images to fix Node 32 error.");
                        // Fallback: If user hits generate without re-uploading, it will fail.
                        activeComfyImages = [];
                    }
                    activeInspiration = ch.customData?.comp_inspiration || "";

                } else {
                    // Mode: Window / Standard
                    // Source: Item Grid (0-16)
                    activeComfyImages = ch.images.slice(0, 16).filter(img => img && img.name && img.uploadStatus === "ok" && !img.name.toLowerCase().includes("placeholder"));
                    activeUrls = activeComfyImages.map(img => img.url || (img.name ? toViewUrl(img.name) : "")).filter(Boolean);
                    activeInspiration = ch.inspiration || "";
                }

                console.log(`[GEN KEY ITEM] Mode: ${taskKey}, SystemPrompt: ${promptFile}, Images: ${activeComfyImages.length || activeUrls.length}`);

            } else if (source === 'composition') {
                // Generic Composition
                activeInspiration = ch.customData?.comp_inspiration || activeInspiration;
                activeUrls = Object.values(ch.customData || {}).filter(v => typeof v === 'string' && v.startsWith('http'));
                activeComfyImages = [];
            } else if (source.startsWith('brand')) {
                // ... existing brand logic ...
                const bIdx = source.replace("brand", "");
                activeInspiration = ch.customData?.[`${source}_inspiration`] || "";
                const imgKey = `b${bIdx}_imgs`;
                const rawImgs = ch.customData?.[imgKey];
                if (Array.isArray(rawImgs)) {
                    activeUrls = rawImgs;
                } else if (typeof rawImgs === 'string' && rawImgs.trim()) {
                    try { activeUrls = JSON.parse(rawImgs); }
                    catch (e) { activeUrls = rawImgs.split('\n').filter(x => x.trim()); }
                }
                if (!Array.isArray(activeUrls)) activeUrls = [];
                activeComfyImages = [];
            } else {
                // Standard Generic
                activeInspiration = ch.inspiration || "";
                activeUrls = getStandardUrls();
                activeComfyImages = ch.images.filter(img => img && img.name && img.uploadStatus === "ok" && !img.name.toLowerCase().includes("placeholder"));
            }
        } else {
            // Legacy
            activeInspiration = ch.inspiration || "";
            activeUrls = getStandardUrls();
            activeComfyImages = ch.images.filter(img => img && img.name && img.uploadStatus === "ok" && !img.name.toLowerCase().includes("placeholder"));
        }

        // Inspiration Injection
        if (activeInspiration) {
            promptText = promptText.replace("[DESIGNER_INTENT_WORDS_WILL_BE_INJECTED_HERE]", activeInspiration.trim());
        } else {
            promptText = promptText.replace("[DESIGNER_INTENT_WORDS_WILL_BE_INJECTED_HERE]", "[NONE]");
        }

        const promptImageFileNamesBlock = getPromptImageFileNamesBlock();
        if (promptImageFileNamesBlock) {
            promptText = `${String(promptText || "").trim()}\n\n${promptImageFileNamesBlock}`;
            console.log("[PROMPT] Injected image filename block:", promptImageFileNamesBlock);
        }

        let workflowUserInputText = "";
        if (usesPlanningWorkflow && mapping.USER_INPUT_NODE) {
            const chId = legacyChapterNumber;
            const planningConfig = isThemePlanningReport
                ? activeWorkflowConfig
                : getStylePlanningConfig(chId);
            const shouldInjectJson = planningConfig?.workflow === 'withJson'
                || planningConfig?.workflow === 'cover'
                || planningConfig?.workflow === 'consumerPortrait';

            if (shouldInjectJson) {
                const currentChapterId = state.chapters[state.currentIndex]?.id;
                const structure = Array.isArray(currentConfig?.structure) ? currentConfig.structure : [];
                const buildMergedCustomData = (item, index, forceDefaults = false) => {
                    const base = item && item.customData && typeof item.customData === 'object'
                        ? { ...item.customData }
                        : {};
                    if (!forceDefaults) return base;
                    const struct = structure.find(entry => entry && entry.id === item?.id) || structure[index] || null;
                    if (struct && Array.isArray(struct.fields)) {
                        struct.fields.forEach((field) => {
                            if (!field || !field.key) return;
                            if (base[field.key] === undefined && field.default !== undefined) {
                                base[field.key] = field.default;
                            }
                        });
                    }
                    return base;
                };
                const buildChapterSnapshot = (item, index, options = {}) => {
                    if (!item || typeof item !== 'object') return null;
                    const includeDefaults = !!options.includeDefaults;
                    const customData = buildMergedCustomData(item, index, includeDefaults);
                    return {
                        index,
                        legacyChapterNumber: getLegacyStylePlanningChapterNumber(item.id, index),
                        id: item.id ?? null,
                        key: item.key ?? null,
                        navTitle: item.title ?? null,
                        pageTitle: (customData.page_title || customData.title || item.title || null),
                        customData,
                        images: Array.isArray(item.images)
                            ? item.images.map(img => img ? ({ url: img.url || null, name: img.name || null }) : null).filter(Boolean)
                            : []
                    };
                };

                let payload;
                if (isThemePlanningReport) {
                    const reportType = state.currentReportType;
                    const currentChapter = state.chapters[state.currentIndex] || ch;
                    const currentNavGroup = getPlanningNavGroupForChapter(currentChapter, reportType);
                    const isThemeGroupStylingChapter = /^group-styling-page(?:-\d+)?$/.test(String(currentChapterId || ""));
                    if (isThemeGroupStylingChapter) {
                        const themeColorIndex = state.chapters.findIndex((item) => String(item?.id || "") === "page4");
                        const themeColorPage = themeColorIndex >= 0
                            ? buildChapterSnapshot(state.chapters[themeColorIndex], themeColorIndex, { includeDefaults: false })
                            : null;
                        payload = themeColorPage
                            ? {
                                currentPage: currentChapterId,
                                currentGroup: currentNavGroup,
                                sourcePage: "page4",
                                sourceLabel: "themeColor",
                                ts: Date.now(),
                                meta: {
                                    reportType: state.currentReportType,
                                    language: (typeof savedLocale !== 'undefined' ? savedLocale : (state.language || 'zh'))
                                },
                                chapter: themeColorPage
                            }
                            : {};
                    } else {
                        const themePlanningChapters = state.chapters
                            .map((item, i) => buildChapterSnapshot(item, i, { includeDefaults: true }))
                            .filter(Boolean)
                            .filter((snapshot) => {
                                const sourceChapter = state.chapters[snapshot.index];
                                if (!sourceChapter || sourceChapter.isActive === false) return false;
                                if (!snapshot.customData || !Object.keys(snapshot.customData).length) return false;
                                if (snapshot.id === currentChapterId) return false;

                                const snapshotGroup = getPlanningNavGroupForChapter({ id: snapshot.id }, reportType);
                                if (currentNavGroup === "global") return snapshotGroup === "content";
                                if (currentNavGroup === "summary") return snapshotGroup !== "summary";
                                return true;
                            });

                        payload = {
                            currentPage: currentChapterId,
                            currentGroup: currentNavGroup,
                            currentIndex: state.currentIndex,
                            totalChapters: themePlanningChapters.length,
                            chapters: themePlanningChapters,
                            ts: Date.now(),
                            meta: {
                                reportType: state.currentReportType,
                                language: (typeof savedLocale !== 'undefined' ? savedLocale : (state.language || 'zh'))
                            }
                        };
                    }
                } else {
                    const allChapters = state.chapters
                        .map((item, i) => buildChapterSnapshot(item, i))
                        .filter(Boolean)
                        .filter((x) => {
                            const chapterNumber = x.legacyChapterNumber;
                            if (!chapterNumber) return false;
                            if (chId === 1 || chId === 2) {
                                return chapterNumber >= 2 && x.customData && Object.keys(x.customData).length > 0;
                            }
                            if (chId === 3 || chId === 4 || chId === 5) {
                                return chapterNumber >= 6 && x.customData && Object.keys(x.customData).length > 0;
                            }
                            return chapterNumber >= 6 && chapterNumber <= 29 && x.customData && Object.keys(x.customData).length > 0;
                        });

                    payload = {
                        currentPage: currentChapterId,
                        currentIndex: state.currentIndex,
                        totalChapters: allChapters.length,
                        chapters: allChapters,
                        ts: Date.now(),
                        meta: {
                            reportType: state.currentReportType,
                            language: (typeof savedLocale !== 'undefined' ? savedLocale : (state.language || 'zh'))
                        }
                    };

                    if (chId === 9) {
                        const themeColorIndex = state.chapters.findIndex((item, index) => getLegacyStylePlanningChapterNumber(item?.id, index) === 8);
                        const themeColorPage = themeColorIndex >= 0
                            ? buildChapterSnapshot(state.chapters[themeColorIndex], themeColorIndex, { includeDefaults: true })
                            : null;
                        payload = themeColorPage || {};
                    }
                }

                workflowUserInputText = JSON.stringify(payload, null, 2);
                const injectionLabel = isThemePlanningReport
                    ? `theme planning ${payload?.currentGroup || "content"} JSON payload`
                    : (chId === 9 ? "theme color page JSON only" : "JSON payload");
                console.log(`[Node 92 Injection] Active for page "${currentChapterId}". Injecting ${injectionLabel}.`, payload);
            }
        }

        const apiContextTexts = [];
        if (workflowUserInputText) {
            apiContextTexts.push(workflowUserInputText);
        }
        if (useThemePlanningApi && activeInspiration && String(activeInspiration).trim()) {
            apiContextTexts.push(`内容产出参考此灵感：${String(activeInspiration).trim()}`);
        }

        let finalText = "";
        if (useThemePlanningApi) {
            updateStatus('active', "正在请求 API...");
            const apiResult = await requestThemePlanningChapterText({
                chapterId,
                imageUrls: activeUrls,
                promptText,
                contextTexts: apiContextTexts
            });
            finalText = typeof apiResult === "string"
                ? apiResult
                : String(apiResult && apiResult.text ? apiResult.text : "");
            if (!finalText.trim()) {
                throw new Error("API 未返回文案");
            }
        } else {
            updateStatus('active', "正在发送任务到 ComfyUI...");

        // Inject prompt into System Prompt Node (based on mapping)
        const mappedSysPromptNodeId = mapping.SYSTEM_PROMPT;
        const resolvedSysPromptNodeId = (mappedSysPromptNodeId && workflow[mappedSysPromptNodeId])
            ? mappedSysPromptNodeId
            : (workflow["109"] ? "109" : null);
        if (resolvedSysPromptNodeId && workflow[resolvedSysPromptNodeId]) {
            if (!workflow[resolvedSysPromptNodeId].inputs) workflow[resolvedSysPromptNodeId].inputs = {};
            workflow[resolvedSysPromptNodeId].inputs.text = promptText;
        }

        // Inject editor "core inspiration" into workflow node 110 when that input exists on current page.
        const node110 = workflow["110"];
        if (node110 && typeof node110 === "object") {
            const getTrimmed = (v) => String(v == null ? "" : v).trim();
            let hasCoreInspirationInput = false;
            let coreInspirationText = "";

            if (source === "composition") {
                hasCoreInspirationInput = !!document.getElementById("inspirationInput_comp");
                coreInspirationText = getTrimmed(ch.customData?.comp_inspiration || "");
            } else if (source && source.startsWith("brand")) {
                hasCoreInspirationInput = !!document.getElementById(`inspirationInput_${source}`);
                coreInspirationText = getTrimmed(ch.customData?.[`${source}_inspiration`] || "");
            } else {
                hasCoreInspirationInput = !!(document.getElementById("inspirationInput") || document.getElementById("ql_inspirationInput"));
                coreInspirationText = getTrimmed(ch.inspiration || "");
            }

            if (hasCoreInspirationInput) {
                if (!node110.inputs || typeof node110.inputs !== "object") node110.inputs = {};
                node110.inputs.text = coreInspirationText;
                console.log(`[WF110] Injected core inspiration. source=${source || "standard"}, length=${coreInspirationText.length}`);
            }
        }



        // 3. Workflow Parameter Injection (Common)
        let finalImages = [...activeComfyImages];
        if (finalImages.length > 16) finalImages = finalImages.slice(0, 16);
        const N = finalImages.length;

        if (usesPlanningWorkflow) {
            // [Quiet Luxury Logic]
            const batchNodeId = mapping.IMAGE_BATCH;
            const batchNode = workflow[batchNodeId];
            const loadNodes = mapping.LOAD_IMAGES;
            const scaleNodes = mapping.IMAGE_SCALE;

            // count Int node logic replaced by robust mapping below

            // [Parameter Injection]
            if (isLegacySpecialCompositionChapter(ch) && taskKey === 'composition') {
                if (batchNode) {
                    if (!batchNode.inputs) batchNode.inputs = {};
                    batchNode.inputs.inputcount = 3;
                    Object.keys(batchNode.inputs).forEach(k => { if (k.startsWith('image_')) delete batchNode.inputs[k]; });
                    for (let i = 0; i < 3; i++) {
                        const img = finalImages[i] || { name: null };
                        const loadId = loadNodes[i];
                        const scaleId = scaleNodes[i];
                        if (loadId && scaleId && workflow[loadId]) {
                            if (img.name) workflow[loadId].inputs.image = img.name;
                            batchNode.inputs[`image_${i + 1}`] = [scaleId, 0];
                        }
                    }
                    console.log("[KeyItem] Wired Node 32 with 3 composition inputs.");
                }
            } else if (batchNode) {
                // [Standard Generic Logic]
                if (!batchNode.inputs) batchNode.inputs = {};

                // [Stability Fix] Min 2 images for ImageBatchMulti
                if (finalImages.length === 1 && (batchNodeId === "32" || batchNodeId === 32)) {
                    console.log("[WF] Only 1 image found for batch node, repeating to meet min of 2.");
                    finalImages.push(finalImages[0]);
                }

                batchNode.inputs.inputcount = finalImages.length;
                Object.keys(batchNode.inputs).forEach(k => { if (k.startsWith('image_')) delete batchNode.inputs[k]; });
                for (let i = 0; i < finalImages.length; i++) {
                    const img = finalImages[i];
                    const loadId = loadNodes[i];
                    const scaleId = scaleNodes[i];
                    if (loadId && scaleId && workflow[loadId]) {
                        workflow[loadId].inputs.image = img.name;
                        batchNode.inputs[`image_${i + 1}`] = [scaleId, 0];
                    }
                }
            }

            const countNodeId = mapping.IMAGE_COUNT;
            if (countNodeId && workflow[countNodeId]) {
                const node = workflow[countNodeId];
                if (!node.inputs) node.inputs = {};
                if ('Number' in node.inputs) node.inputs.Number = finalImages.length;
                if ('inputcount' in node.inputs) node.inputs.inputcount = finalImages.length;
            }

            if (workflow[mapping.CHAPTER_ID]) workflow[mapping.CHAPTER_ID].inputs.text = ch.id;
            const legacyUrls = getStandardUrls();
            if (workflow["33"]) {
                let promptAuxText = legacyUrls.join("\n");
                if (promptImageFileNamesBlock) promptAuxText += (promptAuxText ? "\n\n" : "") + promptImageFileNamesBlock;
                workflow["33"].inputs.text = promptAuxText;
            }

            const userInputNodeId = mapping.USER_INPUT_NODE;
            if (userInputNodeId && workflow[userInputNodeId]) {
                if (!workflow[userInputNodeId].inputs) workflow[userInputNodeId].inputs = {};
                workflow[userInputNodeId].inputs.text = workflowUserInputText;
            }
        } else {
            // [Legacy Logic]
            // ... legacy reconstruction ...
            // (Assuming short version for brevity in diff, but must match existing logic)
            const loadNodes = mapping.LOAD_IMAGES;
            const scaleNodes = mapping.IMAGE_SCALE;
            const batchNodeId = mapping.IMAGE_BATCH;
            const batchNode = workflow[batchNodeId];
            if (batchNode && batchNode.inputs) {
                for (let k of Object.keys(batchNode.inputs)) if (k.startsWith("image_")) delete batchNode.inputs[k];
            }
            let legacyValid = ch.images.filter(img => img.name);
            if (legacyValid.length > 16) legacyValid = legacyValid.slice(0, 16);
            legacyValid.forEach((img, i) => {
                const loadNodeId = loadNodes[i];
                if (loadNodeId && workflow[loadNodeId]) workflow[loadNodeId].inputs.image = img.name;
                const scaleNodeId = scaleNodes[i];
                if (batchNode && scaleNodeId) batchNode.inputs[`image_${i + 1}`] = [scaleNodeId, 0];
            });
            const legacyUrls = getStandardUrls();
            if (workflow[mapping.IMAGE_COUNT]) workflow[mapping.IMAGE_COUNT].inputs.Number = legacyValid.length;
            if (workflow[mapping.CHAPTER_ID]) workflow[mapping.CHAPTER_ID].inputs.text = ch.id;
            if (workflow["33"]) {
                let promptAuxText = legacyUrls.join("\n");
                if (promptImageFileNamesBlock) promptAuxText += (promptAuxText ? "\n\n" : "") + promptImageFileNamesBlock;
                workflow["33"].inputs.text = promptAuxText;
            }
        }

        // [Sanitization]
        const cleanWorkflow = {};
        Object.keys(workflow).forEach(k => {
            if (/^\d+$/.test(k) && workflow[k] && typeof workflow[k] === 'object') {
                cleanWorkflow[k] = workflow[k];
            }
        });
        workflow = cleanWorkflow;

        validatePrompt(workflow);
        const payload = { prompt: workflow, extra_data: { api_key_comfy_org: CONFIG.API_KEY } };
        let promptId;
        try {
            const data = await apiClient.submitPrompt(payload);
            promptId = data.prompt_id;
        } catch (e) {
            showError("请求 ComfyUI 失败: " + e.message);
            console.error(e);
            return;
        }

        updateStatus('active', `任务已提交(ID: ${promptId ? promptId.slice(0, 6) : 'N/A'}...)，等待生成...`);

        let lastItem = null;
        // [Fix 2] Wait up to 240s, Poll History API
        for (let i = 0; i < 120; i++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                // [Fix 3] Explicit History Polling
                const hjson = await apiClient.fetchHistory(promptId);
                const item = hjson[promptId]; // { status: { completed: true }, outputs: { ... } }
                lastItem = item;

                if (item && item.status && item.status.completed) {
                    console.log("[GEN] Task Completed. Outputs:", item.outputs);

                    // [Fix 4] Dynamic Mapping for Output Node
                    const showTextNodeId = mapping.SHOW_TEXT; // Use 'mapping' not hardcoded WF1
                    const outputNode = (item.outputs || {})[showTextNodeId];

                    if (outputNode) {
                        const outputData = outputNode.text || outputNode.string || outputNode.value;
                        console.log("[GEN] Raw Output Data:", outputData);
                        if (Array.isArray(outputData) && outputData.length) {
                            finalText = outputData.join("\n");
                        } else if (typeof outputData === 'string') {
                            finalText = outputData;
                        }
                    } else {
                        // [Fallback] Node not found in history outputs?
                        // Check if ANY text node output exists?
                        console.warn(`[GEN] Node ${showTextNodeId} not found in history outputs.Available: `, Object.keys(item.outputs || {}));
                    }
                    break;
                }
            } catch (e) {
                // ignore 404/network glitches during polling
            }
        }

        if (!finalText) {
            const debugInfo = lastItem ? `Outputs: ${JSON.stringify(lastItem.outputs || {})}` : "No history item found";
            showError(`生成失败: 任务结束但未获取到文案 (Node ${mapping.SHOW_TEXT})。详情: ${debugInfo}`);
            return;
        }
        }

        let parsed = parseModelJson(finalText); // Ensure this function exists in scope or is imported

        // [Mapping Logic]
        if (usesPlanningWorkflow) {
            if (!ch.customData) ch.customData = {};

            // [New Branch: Key Item Composition vs Standard]
            // We use the same 'taskKey' logic or re-derive it.
            // Better to re-derive or check 'source'.
            let isCompMode = (source === 'composition');
            // Check for Key Items specific composition
            if (isLegacySpecialCompositionChapter(ch) && source === 'composition') isCompMode = true;

            if (isCompMode) {
                // === Composition/Model Mode Mapping ===
                // Target: Composition Text Group (comp_txt1_title, comp_txt1_desc, etc.)
                // The JSON from '关键单品模特.txt' likely returns keys like:
                // title, description, keywords, etc.
                // We map them to specific comp fields.

                // Example Mapping (Adjust based on actual prompt output keys):
                // 1. Title -> comp_txt2_title (Right side title usually)
                if (parsed.title || parsed.chapter_title) {
                    ch.customData.comp_txt2_title = parsed.title || parsed.chapter_title;
                }
                // 2. Desc -> comp_txt2_desc
                if (parsed.desc || parsed.summary || parsed.description) {
                    ch.customData.comp_txt2_desc = parsed.desc || parsed.summary || parsed.description;
                }
                // 3. Keywords -> comp_txt2_subtitle (or similar)
                if (parsed.keywords) {
                    const kw = Array.isArray(parsed.keywords) ? parsed.keywords.join(" ") : parsed.keywords;
                    ch.customData.comp_txt2_subtitle = kw;
                }

                // If prompt returns specific 'comp_' keys, accept them too
                Object.keys(parsed).forEach(k => {
                    if (k.startsWith('comp_')) ch.customData[k] = parsed[k];
                });

            } else {
                // === Standard/Window Mode Mapping (Existing Logic) ===

                // 1. Resolve Struct
                const struct = REPORT_CONFIGS[state.currentReportType].structure[state.currentIndex];

                // 2. Backward-compatible mapping for legacy brand prompt keys.
                // Some historical prompts used brand_name/intro/concept instead of
                // page_title/page_intro/concept_desc.
                if (struct && struct.id && struct.id.startsWith('brandDetail')) {
                    if (!parsed.page_title && parsed.brand_name) parsed.page_title = parsed.brand_name;
                    if (!parsed.page_intro && parsed.intro) parsed.page_intro = parsed.intro;
                    if (!parsed.concept_desc && parsed.concept) parsed.concept_desc = parsed.concept;
                }

                if (struct && struct.id === 'color-direction-page') {
                    parsed = sanitizeColorDirectionThemePalette(parsed);
                }

                // 3. Direct Assignment (Safe for custom keys)
                Object.assign(ch.customData, parsed);
                normalizeThemeEventCustomData(struct && struct.id, ch.customData);

                // 4. Specialized Mapping for Nested Prompts (e.g., Chapter 5)
                if (struct && struct.id === 'consumer-page' && parsed.consumer_profile) {
                    const cp = parsed.consumer_profile;
                    if (cp.blocks && Array.isArray(cp.blocks)) {
                        cp.blocks.forEach(b => {
                            if (b.index === 1) { ch.customData.p1_desc = b.description; }
                            else if (b.index === 2) { ch.customData.p2_desc = b.description; }
                            else if (b.index === 3) { ch.customData.p3_desc = b.description; }
                        });
                    }
                    if (parsed.charts) {
                        if (parsed.charts.radar_dimensions) ch.customData.radar_indicators = parsed.charts.radar_dimensions;
                        if (parsed.charts.radar_values) ch.customData.radar_values = parsed.charts.radar_values;
                        if (parsed.charts.bar_x_labels) ch.customData.bar_xaxis = parsed.charts.bar_x_labels;
                        if (parsed.charts.bar_values) ch.customData.bar_values = parsed.charts.bar_values;
                    }
                }

                // 5. Schema Mapping (Auto-sync Title/Keywords/Summary)
                if (struct && struct.fields) {
                    // ... (existing field mapping logic) ...
                    if (parsed.key_items_introduction) {
                        if (struct.fields.find(f => f.key === 'page_intro')) ch.customData.page_intro = parsed.key_items_introduction;
                    }
                    if (parsed.comp_inspiration) {
                        // Keep this for generic usage, but Key Item Model mode handles its own now above
                        if (struct.fields.find(f => f.key === 'comp_txt1_desc')) ch.customData.comp_txt1_desc = parsed.comp_inspiration;
                    }
                    // Title
                    if (parsed.chapter_title || parsed.title) {
                        const srcTitle = parsed.chapter_title || parsed.title;
                        const titleField = struct.fields.find(f => f.key === 'report_title' || f.key === 'page_title' || f.key === 'left_h3') || struct.fields.find(f => f.key.includes('title') && !f.key.includes('en'));
                        if (titleField && !ch.customData[titleField.key]) ch.customData[titleField.key] = srcTitle;
                        ch.title = srcTitle;
                    }
                    // Keywords
                    if (parsed.keywords) {
                        const kws = Array.isArray(parsed.keywords) ? parsed.keywords.join(", ") : parsed.keywords;
                        const kwField = struct.fields.find(f => f.key.includes('keyword'));
                        if (kwField && !ch.customData[kwField.key]) ch.customData[kwField.key] = kws;
                        ch.keywords = kws;
                    }
                    // Summary
                    if (parsed.summary_paragraph || parsed.summary || parsed.desc) {
                        const srcSum = parsed.summary_paragraph || parsed.summary || parsed.desc;
                        const sumField = struct.fields.find(f => ['report_intro', 'summary', 'page_intro', 'left_desc', 'profile1_desc'].includes(f.key)) || struct.fields.find(f => (f.key.includes('desc') || f.type === 'textarea') && !f.key.includes('en'));
                        if (sumField && !ch.customData[sumField.key]) ch.customData[sumField.key] = srcSum;
                        ch.summary = srcSum;
                    }
                }
            }
        } else {
            Object.assign(ch, parsed);
            if (parsed.chapter_title) ch.title = parsed.chapter_title;
            if (parsed.keywords) ch.keywords = Array.isArray(parsed.keywords) ? parsed.keywords.join("，") : parsed.keywords;
            if (parsed.summary_paragraph) ch.summary = parsed.summary_paragraph;
        }

        // For detail pages: sync brand labels from prompt output and uploaded filenames.
        fillKeyItemBrandLabels(ch, parsed, 6);
        fillPatternDetailBrandLabels(ch, parsed, 6);
        syncDirectoryForChapter(ch.id, state.currentReportType);

        persistState();

        // [Fix] Preserve Scroll on Generate Success
        const e = document.getElementById("step1-editor-panel");
        const s = e ? e.scrollTop : 0;
        render(); // This refills the inputs
        const eAfter = document.getElementById("step1-editor-panel");
        if (eAfter) eAfter.scrollTop = s;

        refreshPreviewAfterAiGenerate(true);

        updateStatus('success', "生成成功！");
        setBtnLoading(false);

        // Update ch.generatedData
        const imagesForJson = activeUrls.map((u, i) => {
            let alt = "";
            if (ch.images && ch.images[i] && ch.images[i].imgName) alt = ch.images[i].imgName;
            return { id: u, alt: alt };
        });

        ch.status = parsed.raw ? "已生成(需手动整理)" : "已生成";
        ch.generatedData = {
            chapter_id: parsed.chapter_id || ch.id,
            chapter_title: ch.title,
            keywords: ch.keywords ? ch.keywords.split(/,|，/) : [],
            summary_paragraph: ch.summary,
            images: imagesForJson
        };
        persistState();

        // [Fix] Preserve Scroll on Final Update
        const e2 = document.getElementById("step1-editor-panel");
        const s2 = e2 ? e2.scrollTop : 0;
        render();
        const eAfter2 = document.getElementById("step1-editor-panel");
        if (eAfter2) eAfter2.scrollTop = s2;
        refreshPreviewAfterAiGenerate(true);

        updateStatus('ok', "生成完成！请在右侧检查并修改内容");

    } catch (e) {
        showError("生成出错: " + e.message);
        console.error(e);
    } finally {
        setChapterGenerating(chapterId, source, false);
        setBtnLoading(false, "生成本章文案");
    }
}

// ===== Step2：全局汇编 =====
function renderStep2() {
    // [Fix] Ensure state.reportFinal is initialized
    if (!state.reportFinal) {
        state.reportFinal = {
            cover_images: ["", ""],
            recommendations: { brands: [{}, {}, {}], reports: [{}, {}] }
        };
    }

    // [ 🔄 1. 新增的辅助函数：用于保存步骤2的表单数据 🔄 ]
    function saveStep2Data() {
        if (!state.reportFinal) {
            console.warn("saveStep2Data called, but state.reportFinal is null.");
            return true;
        }
        try {
            const titleEl = document.getElementById("res_title");
            if (titleEl) {
                const getVal = (id, fallback = "") => {
                    const el = document.getElementById(id);
                    return el && typeof el.value === "string" ? el.value.trim() : fallback;
                };
                state.reportFinal.report_title = getVal("res_title", state.reportFinal.report_title || "");
                state.reportFinal.report_subtitle = getVal("res_subtitle", state.reportFinal.report_subtitle || "");
                state.reportFinal.introduction_paragraph = getVal("res_intro", state.reportFinal.introduction_paragraph || "");
                state.reportFinal.conclusion_paragraph = getVal("res_conc", state.reportFinal.conclusion_paragraph || "");
                state.reportFinal.report_author = getVal("meta_author", state.reportFinal.report_author || "");
                state.reportFinal.report_date = getVal("meta_date", state.reportFinal.report_date || new Date().toLocaleDateString('zh-CN'));

                // [Fix] 确保 reportFinal.generated_chapters_content 与 Step 1 的数据同步
                if (state.reportIntermediate && state.reportIntermediate.chapters) {
                    state.reportFinal.generated_chapters_content = state.reportIntermediate.chapters;
                    // 同时更新 chapter_order，如果它不存在或者长度不匹配
                    if (!state.reportFinal.chapter_order || state.reportFinal.chapter_order.length !== state.reportIntermediate.chapters.length) {
                        state.reportFinal.chapter_order = state.reportIntermediate.chapters.map(c => c.chapter_id || c.id);
                    }
                }

                // [Fix] 导出链路统一：用最新章节图片覆盖 reportFinal 快照里的 images 字段
                const cleanedStateChapters = Array.isArray(state.chapters) ? cleanDataForExport(state.chapters) : [];
                if (cleanedStateChapters.length && Array.isArray(state.reportFinal.generated_chapters_content)) {
                    state.reportFinal.generated_chapters_content = mergeExportChaptersWithStateImages(
                        state.reportFinal.generated_chapters_content,
                        cleanedStateChapters
                    );
                }
                if (cleanedStateChapters.length && Array.isArray(state.reportFinal.report_chapters)) {
                    state.reportFinal.report_chapters = mergeExportChaptersWithStateImages(
                        state.reportFinal.report_chapters,
                        cleanedStateChapters
                    );
                }

                persistState();

                const statusEl = document.getElementById("wf2Status");
                if (statusEl) {
                    statusEl.textContent = "✔ 已保存修改";
                    statusEl.className = "status-line ok";
                }
            }
            return true;
        } catch (e) {
            console.error("Error saving Step 2 data:", e);
            const statusEl = document.getElementById("wf2Status");
            if (statusEl) {
                statusEl.textContent = "✖ 保存修改时出错";
                statusEl.className = "status-line err";
            }
            return false;
        }
    }

    // [ 🔄 重构：Step 2 界面 (Visual Left, Text Right) 🔄 ]
    const container = contentPanelEl;
    container.innerHTML = "";

    // 1. 顶部通栏 (Top Bar)
    const topBar = document.createElement("div");
    topBar.className = "step2-top-bar";

    topBar.style.display = "flex";
    topBar.style.alignItems = "center";
    topBar.style.justifyContent = "space-between";
    topBar.style.padding = "16px 24px";
    topBar.style.background = "#fff";
    topBar.style.borderBottom = "1px solid var(--border-medium)";
    topBar.style.marginBottom = "24px";
    topBar.style.position = "sticky";
    topBar.style.top = "0";
    topBar.style.zIndex = "100";
    topBar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";

    if (!state.reportIntermediate) {
        topBar.innerHTML = `<div class="hint" style="font-size:13px">尚未从步骤1合并数据。请先在步骤1点击“合并全部章节 → 下载JSON”（该操作已自动保存到步骤2）。</div>`;
        container.appendChild(topBar);
    } else {
        const chs = (state.reportIntermediate.chapters || []);
        const len = minifyJson(state.reportIntermediate).length;
        const hasIntermediate = !!state.reportIntermediate;

        topBar.innerHTML = `
            <div style="display:flex;gap:32px;align-items:center;">
                <div>
                    <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">章节数</div>
                    <div style="font-size:18px;font-weight:600;color:#0f172a">${chs.length}</div>
                </div>
                <div>
                    <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">数据体量</div>
                    <div style="font-size:18px;font-weight:600;color:#0f172a">${len}</div>
                </div>
            </div>
            <div style="display:flex;gap:12px;">
                <button class="btn-ghost" id="btnDownloadJson" style="font-size:13px;">下载JSON</button>
                ${hasIntermediate ? `<button class="btn-primary" id="btnRunWF2" style="font-size:13px;">🔄 生成全局文案</button>` : ""}
                <button class="btn-primary" id="btnSaveStep2Next" style="font-size:13px;background:#0f172a;">保存并前往步骤3 →</button>
            </div>
        `;
        container.appendChild(topBar);

        // Bind Events
        if (hasIntermediate) {
            const btnRun = topBar.querySelector("#btnRunWF2");
            if (btnRun) btnRun.onclick = runWorkflow2;
        }
        const btnDownload = topBar.querySelector("#btnDownloadJson");
        if (btnDownload) {
            btnDownload.onclick = () => {
                if (saveStep2Data()) downloadFinalJson();
            };
        }
        const btnNext = topBar.querySelector("#btnSaveStep2Next");
        if (btnNext) {
            btnNext.onclick = () => {
                if (saveStep2Data()) {
                    state.currentIndex = 0;
                    setStep(3);
                }
            };
        }
    }

    // 2. 主体双栏布局 (Main Grid)
    const mainGrid = document.createElement("div");
    mainGrid.style.display = "grid";
    mainGrid.style.gridTemplateColumns = "1fr 1fr"; // 50:50
    mainGrid.style.gap = "40px";
    mainGrid.style.padding = "0 24px 40px 24px";
    mainGrid.style.maxWidth = "1400px";
    mainGrid.style.margin = "0 auto";

    // --- Left Column: Visual Assets ---
    const leftCol = document.createElement("div");
    leftCol.style.display = "flex";
    leftCol.style.flexDirection = "column";
    leftCol.style.gap = "32px";

    // A. Cover Image Upload (Moved to Left)
    const coverBox = document.createElement("div");
    coverBox.className = "section";
    coverBox.innerHTML = `<div class="panel-title">封面图设置 (Cover Images)</div>`;


    const coverGrid = document.createElement("div");
    coverGrid.className = "image-grid";
    coverGrid.style.gridTemplateColumns = "1fr 1fr"; // 2 columns for cover

    // Helper for Cover Upload
    // Helper for Cover Upload
    const createCoverSlot = (idx, label) => {
        const slot = document.createElement("div");

        // [Fix] Add Drag & Drop Support
        slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("hover"); };
        slot.ondragleave = () => slot.classList.remove("hover");
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.classList.remove("hover");
            const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                const file = files[0];
                // Use Blob URL for instant preview
                const blobUrl = URL.createObjectURL(file);
                if (!state.reportFinal.cover_images) state.reportFinal.cover_images = ["", ""];
                state.reportFinal.cover_images[idx] = {
                    preview: blobUrl,
                    url: blobUrl,
                    uploadStatus: "pending"
                };
                persistState();
                render();

                uploadToCms(file).then(res => {
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    if (url) {
                        state.reportFinal.cover_images[idx] = { url: url, uploadStatus: "ok" };
                        persistState();
                        render();
                    }
                }).catch(() => {
                    if (state.reportFinal.cover_images[idx]) {
                        state.reportFinal.cover_images[idx].uploadStatus = "fail";
                        persistState();
                        render();
                    }
                });
            }
        };

        // Support both string (legacy) and object (new) formats
        let currentVal = (state.reportFinal.cover_images && state.reportFinal.cover_images[idx]) || "";
        let currentUrl = "";
        let uploadStatus = "ok"; // Default for legacy strings

        if (typeof currentVal === "string") {
            currentUrl = currentVal;
        } else if (currentVal && typeof currentVal === "object") {
            currentUrl = currentVal.url || currentVal.preview || "";
            uploadStatus = currentVal.uploadStatus || "pending";
        }

        if (currentUrl) {
            slot.className = "img-slot has-img";

            let badge = "";
            if (uploadStatus === "pending") badge = `<div class="slot-badge" style="background:#fbbf24;color:#fff">...</div>`;
            else if (uploadStatus === "ok") badge = `<div class="slot-badge">OK</div>`;
            else if (uploadStatus === "fail") badge = `<div class="slot-badge" style="background:#ef4444;color:#fff">!</div>`;

            slot.innerHTML = `
                <img src="${currentUrl}">
                <div class="slot-del">×</div>
                ${badge}
            `;
            slot.querySelector(".slot-del").onclick = (e) => {
                e.stopPropagation();
                if (state.reportFinal.cover_images) state.reportFinal.cover_images[idx] = "";
                persistState();
                render();
            };
        } else {
            slot.className = "img-slot empty";
            slot.innerHTML = `<div class="slot-plus">+</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${label}</div>`;
            slot.onclick = () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    // Use Blob URL for instant preview (lightweight, no storage limit)
                    const blobUrl = URL.createObjectURL(file);
                    if (!state.reportFinal.cover_images) state.reportFinal.cover_images = ["", ""];

                    // Store as object with pending status
                    state.reportFinal.cover_images[idx] = {
                        preview: blobUrl,
                        url: blobUrl,
                        uploadStatus: "pending"
                    };
                    persistState();
                    render();
                    // Upload to CMS
                    try {
                        const res = await uploadToCms(file);
                        const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                        if (url) {
                            // Update to success status and real URL
                            state.reportFinal.cover_images[idx] = {
                                url: url,
                                uploadStatus: "ok"
                            };
                            persistState();
                            render();
                        }
                    } catch (err) {
                        console.error(err);
                        // Update to fail status
                        if (state.reportFinal.cover_images[idx]) {
                            state.reportFinal.cover_images[idx].uploadStatus = "fail";
                            persistState();
                            render();
                        }
                    }
                };
                input.click();
            };
        }
        return slot;
    };

    coverGrid.appendChild(createCoverSlot(0, "主封面图 (大)"));
    coverGrid.appendChild(createCoverSlot(1, "次封面图 (小)"));
    coverBox.appendChild(coverGrid);
    leftCol.appendChild(coverBox);

    // D. Recommendations (Moved to Left)
    // Initialize Data
    if (!state.reportFinal.recommendations) {
        state.reportFinal.recommendations = { brands: [{}, {}, {}], reports: [{}, {}] };
    }
    const recs = state.reportFinal.recommendations;
    if (!recs.brands) recs.brands = [{}, {}, {}];
    if (!recs.reports) recs.reports = [{}, {}];

    const recBox = document.createElement("div");
    recBox.className = "section";
    recBox.innerHTML = `<div class="panel-title">更多推荐 (Recommendations)</div>`;

    // Part A: Brand Wall (Compact)
    const brandTitle = document.createElement("div");
    brandTitle.style.fontSize = "12px";
    brandTitle.style.fontWeight = "600";
    brandTitle.style.color = "#64748b";
    brandTitle.style.marginBottom = "8px";
    brandTitle.textContent = "Part A: Brand Wall (3 Brands)";
    recBox.appendChild(brandTitle);

    const brandGrid = document.createElement("div");
    brandGrid.style.display = "grid";
    brandGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
    brandGrid.style.gap = "12px";

    recs.brands.forEach((item, idx) => {
        const card = document.createElement("div");
        card.style.background = "#f8fafc";
        card.style.borderRadius = "8px";
        card.style.padding = "8px";
        card.style.display = "flex";
        card.style.gap = "8px";
        card.style.alignItems = "center";

        // Tiny Image Slot
        const slot = document.createElement("div");
        slot.style.width = "40px";
        slot.style.height = "56px"; // 3:4 ratio roughly
        slot.style.background = "#e2e8f0";
        slot.style.borderRadius = "4px";
        slot.style.flexShrink = "0";
        slot.style.cursor = "pointer";
        slot.style.overflow = "hidden";
        slot.style.position = "relative";

        // [Fix] Add Drag & Drop Support
        slot.ondragover = (e) => { e.preventDefault(); slot.style.borderColor = "#0f172a"; };
        slot.ondragleave = () => { slot.style.borderColor = "transparent"; };
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.style.borderColor = "transparent";
            const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                const file = files[0];
                const blobUrl = URL.createObjectURL(file);
                item.image = blobUrl;
                persistState();
                render();
                uploadToCms(file).then(res => {
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    if (url) { item.image = url; persistState(); }
                }).catch(() => { });
            }
        };

        if (item.image) {
            slot.innerHTML = `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            slot.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:16px;">+</div>`;
        }
        slot.onclick = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                // Use Blob URL for instant preview
                const blobUrl = URL.createObjectURL(file);
                item.image = blobUrl;
                persistState();
                render();

                try {
                    const res = await uploadToCms(file);
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    if (url) { item.image = url; persistState(); }
                } catch (err) { }
            };
            input.click();
        };
        card.appendChild(slot);

        // Inputs
        const inputs = document.createElement("div");
        inputs.style.flex = "1";
        inputs.style.display = "flex";
        inputs.style.flexDirection = "column";
        inputs.style.gap = "4px";

        inputs.innerHTML = `
            <input class="input-ghost" style="padding:4px;font-size:12px;height:auto;" placeholder="Brand Name" value="${item.name || ""}">
            <input class="input-ghost" style="padding:4px;font-size:11px;height:auto;color:#94a3b8" placeholder="Link URL" value="${item.link || ""}">
        `;
        inputs.children[0].onchange = (e) => { item.name = e.target.value; persistState(); };
        inputs.children[1].onchange = (e) => { item.link = e.target.value; persistState(); };
        card.appendChild(inputs);

        brandGrid.appendChild(card);
    });
    recBox.appendChild(brandGrid);

    // Part B: Report Wall (Compact)
    const reportTitle = document.createElement("div");
    reportTitle.style.fontSize = "12px";
    reportTitle.style.fontWeight = "600";
    reportTitle.style.color = "#64748b";
    reportTitle.style.marginTop = "16px";
    reportTitle.style.marginBottom = "8px";
    reportTitle.textContent = "Part B: Report Wall (2 Reports)";
    recBox.appendChild(reportTitle);

    const reportGrid = document.createElement("div");
    reportGrid.style.display = "grid";
    reportGrid.style.gridTemplateColumns = "1fr 1fr";
    reportGrid.style.gap = "12px";

    recs.reports.forEach((item, idx) => {
        const card = document.createElement("div");
        card.style.background = "#f8fafc";
        card.style.borderRadius = "8px";
        card.style.padding = "8px";
        card.style.display = "flex";
        card.style.gap = "8px";
        card.style.alignItems = "center";

        // Tiny Image Slot
        const slot = document.createElement("div");
        slot.style.width = "60px";
        slot.style.height = "40px"; // 3:2 ratio
        slot.style.background = "#e2e8f0";
        slot.style.borderRadius = "4px";
        slot.style.flexShrink = "0";
        slot.style.cursor = "pointer";
        slot.style.overflow = "hidden";

        // [Fix] Add Drag & Drop Support
        slot.ondragover = (e) => { e.preventDefault(); slot.style.borderColor = "#0f172a"; };
        slot.ondragleave = () => { slot.style.borderColor = "transparent"; };
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.style.borderColor = "transparent";
            const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                const file = files[0];
                const blobUrl = URL.createObjectURL(file);
                item.image = blobUrl;
                persistState();
                render();
                uploadToCms(file).then(res => {
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    if (url) { item.image = url; persistState(); }
                }).catch(() => { });
            }
        };

        if (item.image) {
            slot.innerHTML = `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            slot.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:16px;">+</div>`;
        }
        slot.onclick = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                // Use Blob URL for instant preview
                const blobUrl = URL.createObjectURL(file);
                item.image = blobUrl;
                persistState();
                render();

                try {
                    const res = await uploadToCms(file);
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    if (url) { item.image = url; persistState(); }
                } catch (err) { }
            };
            input.click();
        };
        card.appendChild(slot);

        // Inputs
        const inputs = document.createElement("div");
        inputs.style.flex = "1";
        inputs.style.display = "flex";
        inputs.style.flexDirection = "column";
        inputs.style.gap = "4px";

        inputs.innerHTML = `
            <input class="input-ghost" style="padding:4px;font-size:12px;height:auto;font-weight:600" placeholder="Report Title" value="${item.title || ""}">
            <input class="input-ghost" style="padding:4px;font-size:11px;height:auto;" placeholder="Subtitle" value="${item.subtitle || ""}">
            <input class="input-ghost" style="padding:4px;font-size:11px;height:auto;color:#94a3b8" placeholder="Link URL" value="${item.link || ""}">
        `;
        inputs.children[0].onchange = (e) => { item.title = e.target.value; persistState(); };
        inputs.children[1].onchange = (e) => { item.subtitle = e.target.value; persistState(); };
        inputs.children[2].onchange = (e) => { item.link = e.target.value; persistState(); };
        card.appendChild(inputs);

        reportGrid.appendChild(card);
    });
    recBox.appendChild(reportGrid);
    leftCol.appendChild(recBox); // Appended to Left Column



    // --- Right Column: Editorial & Recommendations ---
    const rightCol = document.createElement("div");
    rightCol.style.display = "flex";
    rightCol.style.flexDirection = "column";
    rightCol.style.gap = "32px";

    // B. Dynamics Upload (Moved to Right, Conditional)
    const currentConfig = REPORT_CONFIGS[state.currentReportType] || {};
    const features = currentConfig.features || {};
    const hasDynamics = features.hasDynamicsSection;

    if (hasDynamics) {
        const dynamicsBox = document.createElement("div");
        dynamicsBox.className = "section";
        const MAX_DYNAMICS_IMAGES = 8;
        const dynImages = state.reportFinal.dynamics_images || [];
        if (!state.reportFinal.dynamics_images) state.reportFinal.dynamics_images = dynImages;

        dynamicsBox.innerHTML = `<div class="panel-title">前部动态 (Dynamics) <span class="hint" style="font-weight:normal;margin-left:8px">${dynImages.length}/${MAX_DYNAMICS_IMAGES}</span></div>`;

        const dynGrid = document.createElement("div");
        dynGrid.className = "image-grid";
        dynGrid.style.gridTemplateColumns = "repeat(4, 1fr)"; // 4 columns


        const handleFilesUploaded_dyn = (files) => {
            if (!files.length) return;
            let free = MAX_DYNAMICS_IMAGES - dynImages.length;
            if (free <= 0) return;
            const toAdd = files.slice(0, free);
            toAdd.forEach(file => {
                // Use Blob URL for instant preview
                const blobUrl = URL.createObjectURL(file);
                const obj = { preview: blobUrl, url: null, uploadStatus: "pending" };
                dynImages.push(obj);
                persistState();
                render();

                uploadToCms(file).then(res => {
                    const url = typeof res === "string" ? res : (res?.url || res?.imgName || "");
                    obj.url = url;
                    obj.uploadStatus = "ok";
                    persistState();
                    render();
                }).catch(() => {
                    obj.uploadStatus = "fail";
                    persistState();
                    render();
                });
            });
        };

        // Drag & Drop
        dynGrid.ondragover = e => { e.preventDefault(); dynGrid.style.borderColor = "#0f172a"; };
        dynGrid.ondragleave = () => { dynGrid.style.borderColor = "transparent"; };
        dynGrid.ondrop = e => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
            handleFilesUploaded_dyn(files);
        };

        for (let i = 0; i < MAX_DYNAMICS_IMAGES; i++) {
            const slot = document.createElement("div");
            const imgObj = dynImages[i];
            if (imgObj) {
                slot.className = "img-slot has-img";
                let badge = "";
                if (imgObj.uploadStatus === "pending") badge = `<div class="slot-badge" style="background:#fbbf24;color:#fff">...</div>`;
                else if (imgObj.uploadStatus === "ok") badge = `<div class="slot-badge">OK</div>`;
                else if (imgObj.uploadStatus === "fail") badge = `<div class="slot-badge" style="background:#ef4444;color:#fff">!</div>`;

                slot.innerHTML = `<img src="${imgObj.preview || imgObj.url}"><div class="slot-del">×</div>${badge}`;
                slot.querySelector(".slot-del").onclick = (e) => {
                    e.stopPropagation();
                    dynImages.splice(i, 1);
                    persistState();
                    render();
                };
            } else {
                slot.className = "img-slot empty";
                slot.innerHTML = `<div class="slot-plus">+</div>`;
                slot.onclick = () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.multiple = true;
                    input.onchange = (e) => {
                        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                        handleFilesUploaded_dyn(files);
                    };
                    input.click();
                };
            }
            dynGrid.appendChild(slot);
        }
        dynamicsBox.appendChild(dynGrid);
        rightCol.appendChild(dynamicsBox); // Appended to Right Column
    }

    // C. Global Text Form (Right)
    const textBox = document.createElement("div");
    textBox.className = "section";
    textBox.innerHTML = `<div class="panel-title">全局文案 (Editorial Text)</div>`;

    const introLabel = hasDynamics ? "introduction_paragraph (前部动态文案)" : "introduction_paragraph (封面引言)";

    textBox.innerHTML += `
        <div style="display:flex;gap:16px;margin-bottom:16px;">
            <div style="flex:1">
                <label class="field-label">report_title</label>
                <input id="res_title" class="input-ghost title-input" value="${state.reportFinal?.report_title || ""}" placeholder="输入报告标题...">
            </div>
            <div style="flex:1">
                <label class="field-label">report_subtitle</label>
                <input id="res_subtitle" class="input-ghost" value="${state.reportFinal?.report_subtitle || ""}" placeholder="输入副标题...">
            </div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:16px;">
            <div style="flex:1">
                <label class="field-label">author</label>
                <input id="meta_author" class="input-ghost" value="${state.reportFinal?.report_author || ""}" placeholder="作者...">
            </div>
            <div style="flex:1">
                <label class="field-label">date</label>
                <input id="meta_date" class="input-ghost" value="${state.reportFinal?.report_date || new Date().toLocaleDateString('zh-CN')}" placeholder="日期...">
            </div>
        </div>
        <div style="margin-bottom:16px;">
            <label class="field-label">${introLabel}</label>
            <textarea id="res_intro" class="textarea-ghost" style="min-height:80px">${state.reportFinal?.introduction_paragraph || ""}</textarea>
        </div>
        <div>
            <label class="field-label">conclusion_paragraph</label>
            <textarea id="res_conc" class="textarea-ghost" style="min-height:80px">${state.reportFinal?.conclusion_paragraph || ""}</textarea>
        </div>
        <div id="wf2Status" class="status-line" style="margin-top:12px">${state.reportFinal ? "✔ 已有最终JSON" : "等待生成..."}</div>
                `;
    rightCol.appendChild(textBox);



    mainGrid.appendChild(leftCol);
    mainGrid.appendChild(rightCol);
    container.appendChild(mainGrid);

    // [ 🔄 重构结束 🔄 ]

    async function runWorkflow2() {
        // [ 🔄 3. 修改：在执行生成之前，也先保存一次表单数据 🔄 ]
        if (!saveStep2Data()) {
            return;
        }

        const statusLine = document.getElementById("wf2Status"); // Assuming wf2Status is the correct ID for this context
        if (!statusLine) {
            console.warn(`[GEN] status element not found for query 'wf2Status'.Proceeding without status updates.`);
        }

        // [Fix] Wrap entire async logic in try/catch to ensure errors are handled and UI is reset
        try {
            const currentConfig = REPORT_CONFIGS[state.currentReportType];
            try {
                const promptText = await fetch(currentConfig.step2_prompt_file).then(res => res.text());
                wf2[WORKFLOW_MAPPING.WF2.SYSTEM_PROMPT].inputs.text = promptText;
            } catch (e) {
                status.className = "status-line err";
                status.textContent = "加载步骤2提示词失败 " + e.message;
                return;
            }
            const payloadText = minifyJson({
                schema_version: "2.0",
                product: "AI Report Demo",
                created_at: state.reportIntermediate.created_at || new Date().toISOString(),
                chapters: (state.reportIntermediate.chapters || [])
            });
            wf2[WORKWORKFLOW_MAPPING.WF2.INTERMEDIATE_TEXT].inputs.text = payloadText;

            const payload = { prompt: wf2, extra_data: { api_key_comfy_org: CONFIG.API_KEY } };

            status.className = "status-line"; status.textContent = "已提交至 AI 服务（步骤 2），等待返回...";
            let promptId;
            try {
                const data = await apiClient.submitPrompt(payload);
                promptId = data.prompt_id;
            } catch (e) { status.className = "status-line err"; status.textContent = "请求失败: " + e.message; return; }

            let finalText = ""; for (let i = 0; i < 90; i++) {
                await new Promise(r => setTimeout(r, 2000)); try {
                    const j = await apiClient.fetchHistory(promptId); const item = j[promptId];
                    if (item && item.status && item.status.completed) { const show = (item.outputs || {})[WORKFLOW_MAPPING.WF2.SHOW_TEXT]; if (show && show.text && show.text.length) { finalText = show.text.join("\n"); } break; }
                } catch (e) { }
            }
            if (!finalText) { status.className = "status-line err"; status.textContent = "超时未拿到输出，请检查 ShowText (#7)"; return; }

            const parsed = parseModelJson(finalText);
            if (parsed.raw) { status.className = "status-line err"; status.textContent = "模型未输出合法JSON，已显示原文；可调整后重试"; console.warn(parsed.raw); return; }

            const chaptersFromStep1 = state.reportIntermediate.chapters || [];
            let chaptersFinal = parsed.generated_chapters_content;
            if (!Array.isArray(chaptersFinal) || !chaptersFinal.length) {
                chaptersFinal = chaptersFromStep1;
            }
            chaptersFinal = chaptersFinal.map((c, i) => {
                const imgs = Array.isArray(c.images) ? c.images : [];
                const fixImgs = imgs.map(x => typeof x === "string" ? { id: x } : x);
                return { ...c, images: fixImgs };
            });

            state.reportFinal = {
                ...state.reportFinal, // <-- 🔄 1. 保留现有值 (如 cover_images, dynamics_images)

                // 2. 用 AI 的新数据覆盖文本字段
                schema_version: parsed.schema_version || "2.0",
                product: parsed.product || "AI Report Demo",
                report_title: parsed.report_title || "",
                report_subtitle: parsed.report_subtitle || "",
                introduction_paragraph: parsed.introduction_paragraph || "",
                conclusion_paragraph: parsed.conclusion_paragraph || "",
                report_author: state.reportFinal.report_author || parsed.report_author || "",
                report_date: state.reportFinal.report_date || parsed.report_date || "",
                chapter_order: Array.isArray(parsed.chapter_order) ? parsed.chapter_order : chaptersFinal.map(c => c.chapter_id || c.id || ""),
                generated_chapters_content: chaptersFinal
            };

            // (清理一下旧的 cover_image_url 字段，如果它存在的话)
            if (state.reportFinal.cover_image_url) {
                delete state.reportFinal.cover_image_url;
            }

            persistState();
            status.className = "status-line ok"; status.textContent = "✔ 全局文案已生成，可微调或前往步骤3";
            render();
        } finally {
            setButtonLoading(runBtn, false);
        }
    }
}


// [ 🔄 新增：清理导出数据的辅助函数 (全局) 🔄 ]
const cleanDataForExport = (data) => {
    if (!data) return data;
    // 深度克隆以避免修改原始 state
    const clean = JSON.parse(JSON.stringify(data));

    // 递归遍历清理 preview 字段
    const traverse = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        // 1. 删除 preview (Base64/Blob), 除非 url 字段缺失或无效 (保留本地预览能力)
        // 在 New Window Preview 中，如果是同一个 Session，Blob URL 通常有效。
        // 如果 url 也是 Blob，则无需 preview。如果 url 为空，则保留 preview 救急。
        // Only delete preview if url is a valid remote URL (not a local blob)
        // Blob URLs from the opener window are often inaccessible in the new window/iframe
        if ('preview' in obj) {
            if (obj.url && !obj.url.startsWith('blob:')) {
                delete obj.preview;
            }
            // else: keep preview if url is missing
        }

        // [Fix] 针对 recommendations 里的 image 字段也是 Base64 的情况
        if ('image' in obj && typeof obj.image === 'string' && obj.image.startsWith('data:image')) {
            // 如果同级有 url 字段，则优先使用 url，否则清空 image
            if (obj.url) {
                obj.image = obj.url;
            } else {
                delete obj.image;
            }
        }

        // 2. 确保 url 字段有效 (优先取 url, 其次取 tempUrl/id)
        // 注意：这里我们假设 uploadToCms 成功后 url 字段就是正式链接
        // 如果只有 name 没有 url，尝试构造临时链接
        if (obj.name && !obj.url) {
            obj.url = toViewUrl(obj.name);
        }

        // 继续递归
        Object.values(obj).forEach(traverse);
    };

    traverse(clean);
    return clean;
};

function downloadFinalJson() {
    if (!state.reportFinal) { alert("还没有最终JSON"); return; }
    const data = cleanDataForExport(state.reportFinal);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `pop-ai-final-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
}

// ===== Step3：查看/导出HTML =====
function renderStep3() {
    contentPanelEl.innerHTML = "";
    const wrap = document.createElement("div"); wrap.className = "section";
    // Removed duplicate title assignment
    if (!state.reportFinal) {
        wrap.innerHTML += `<div class="hint" data-i18n="step3.hintEmpty">提示：尚无步骤2的最终JSON。请先到步骤2生成。</div>`;
        wrap.innerHTML += `<button class="btn-ghost" id="btnBack2" data-i18n="step3.back">← 返回步骤2</button>`;
        contentPanelEl.appendChild(wrap);
        document.getElementById("btnBack2").onclick = () => setStep(2);
        return;
    }
    const count = (state.reportFinal.generated_chapters_content || []).length;

    // Header Row
    const headerRow = document.createElement("div");
    headerRow.className = "row";
    headerRow.style.marginBottom = "16px";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";

    // Left: Title & Hint
    const leftHeader = document.createElement("div");
    leftHeader.innerHTML = `
        <div class="hint" data-i18n="step3.hintLoaded" data-i18n-options='{"count":${count}}'>已加载最终JSON：章节数 ${count} · 可预览与导出 HTML</div>
            `;
    headerRow.appendChild(leftHeader);

    // Right: Buttons
    const rightHeader = document.createElement("div");
    rightHeader.style.display = "flex";
    rightHeader.style.gap = "12px";
    rightHeader.innerHTML = `
            <button class="btn-ghost" id="btnBack2b" data-i18n="step3.back">← 返回步骤2</button>
        <button class="btn-ghost" id="btnPreviewHtml" data-i18n="step3.preview">刷新预览</button>
        <button class="btn-secondary" id="btnOpenNew" data-i18n="step3.openNew">新窗口打开</button>
        <button class="btn-primary" id="btnExportHtml" data-i18n="step3.download">导出报告HTML</button>
    `;
    headerRow.appendChild(rightHeader);

    wrap.appendChild(headerRow);

    const frame = document.createElement("iframe"); frame.className = "preview-frame"; frame.id = "reportFrame";
    wrap.appendChild(frame);
    contentPanelEl.appendChild(wrap);

    document.getElementById("btnBack2b").onclick = () => setStep(2);

    // (Using global cleanDataForExport)

    const getReportData = () => {
        // 1. 获取原始数据
        const rawData = state.reportFinal || {};

        // 2. 执行清理 (移除 Base64)
        const data = cleanDataForExport(rawData);

        // [Fix] Include cleaned chapters from state to ensure user edits are preserved in export
        const cleanedStateChapters = Array.isArray(state.chapters) ? cleanDataForExport(state.chapters) : [];
        if (cleanedStateChapters.length) data.chapters = cleanedStateChapters;

        // [Fix] Normalize cover_images to strings for template compatibility
        if (data.cover_images && Array.isArray(data.cover_images)) {
            data.cover_images = data.cover_images.map(img => {
                if (typeof img === "string") return img;
                if (img && typeof img === "object") return img.url || "";
                return "";
            });
        }
        // 1. 映射 report_chapters，并用最新章节图片覆盖导出快照
        if (Array.isArray(data.generated_chapters_content)) {
            data.generated_chapters_content = mergeExportChaptersWithStateImages(
                data.generated_chapters_content,
                cleanedStateChapters
            );
        }
        if (!Array.isArray(data.report_chapters) && Array.isArray(data.generated_chapters_content)) {
            data.report_chapters = data.generated_chapters_content;
        }
        if (Array.isArray(data.report_chapters)) {
            data.report_chapters = mergeExportChaptersWithStateImages(
                data.report_chapters,
                cleanedStateChapters
            );
        }

        // [Fix] Ensure all images have 'alt' property AND try to recover it from state.chapters if missing
        if (Array.isArray(data.report_chapters)) {
            data.report_chapters.forEach((ch, chIdx) => {
                // Find corresponding original chapter in state.chapters
                // We assume order might match or we match by ID if possible. 
                // state.chapters is the source of truth for imgName.
                const originalCh = cleanedStateChapters.find(c => c.id === ch.chapter_id) || cleanedStateChapters[chIdx];

                if (Array.isArray(ch.images)) {
                    ch.images.forEach((img, imgIdx) => {
                        if (!img.alt || img.alt === "Brand") {
                            // Try to recover from original chapter
                            if (originalCh && originalCh.images && originalCh.images[imgIdx]) {
                                const originalImg = originalCh.images[imgIdx];
                                const nameToUse = originalImg.imgName || originalImg.name;
                                if (nameToUse) {
                                    img.alt = nameToUse;
                                }
                            }
                        }
                        if (!img.alt) img.alt = "";
                    });
                }
            });
        }

        // 2. 重建 table_of_contents_data：始终使用章节首图
        if (Array.isArray(data.report_chapters)) {
            const oldTOC = Array.isArray(data.table_of_contents_data) ? data.table_of_contents_data : [];
            data.table_of_contents_data = data.report_chapters.map((ch, idx) => {
                const oldItem = oldTOC[idx] || {};
                const imgObj = (Array.isArray(ch.images) && ch.images[0]) ? ch.images[0] : null;
                const firstImageUrl = imgObj ? (imgObj.id || imgObj.url || "") : "";
                const fallbackImageUrl = (oldItem.toc_image && oldItem.toc_image.id) ? oldItem.toc_image.id : "";
                const tocImageAlt = (imgObj && imgObj.alt)
                    ? imgObj.alt
                    : (ch.chapter_title || (oldItem.toc_image && oldItem.toc_image.alt) || "");
                return {
                    chapter_id: ch.chapter_id || oldItem.chapter_id || `chapter_${idx + 1}`,
                    toc_image: {
                        id: firstImageUrl || fallbackImageUrl,
                        alt: tocImageAlt || ""
                    }
                };
            });
        }
        return data;
    };

    const doPreview = async () => {
        const data = getReportData();
        data.showPdfButton = true; // [Feature] Show PDF button in preview
        const html = await templateService.generateHtml(data, state.currentReportType);
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        frame.src = URL.createObjectURL(blob);
    };
    document.getElementById("btnPreviewHtml").onclick = doPreview;
    document.getElementById("btnExportHtml").onclick = async () => {
        const ready = await ensureHtmlExportImagesReady({ includeReportFinal: true, refreshLivePreview: false });
        if (!ready) return;
        const data = getReportData();
        data.showPdfButton = true;
        const html = await templateService.generateHtml(data, state.currentReportType);
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `report-${Date.now()}.html`; a.click(); URL.revokeObjectURL(u);
    };
    document.getElementById("btnOpenNew").onclick = async () => {
        const ready = await ensureHtmlExportImagesReady({ includeReportFinal: true, refreshLivePreview: false });
        if (!ready) return;
        const data = getReportData();
        data.showPdfButton = true; // [Feature] Show PDF button in new window preview
        const html = await templateService.generateHtml(data, state.currentReportType);
        const w = window.open("", "_blank"); w.document.write(html); w.document.close();
    };
    doPreview();
}

// [ 🔄 Custom Image List Logic for Fields 🔄 ]
function initCustomImageList(container, ch, key, defaultVal, maxCount = 8) {
    const rawVal = (ch.customData && ch.customData[key] !== undefined) ? ch.customData[key] : (defaultVal || "");
    let urls = rawVal.split(/\r?\n/).filter(s => s.trim());

    // Create UI
    container.innerHTML = "";

    // 1. Grid
    const grid = document.createElement("div");
    grid.className = "image-grid";
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    grid.style.gap = "8px";

    // 2. Textarea (Hidden by default, for manual edit)
    const details = document.createElement("details");
    details.style.marginTop = "8px";
    details.innerHTML = `<summary style="font-size:11px;color:#94a3b8;cursor:pointer;user-select:none;">手动编辑 URLs (Edit Manual)</summary>`;
    const ta = document.createElement("textarea");
    ta.className = "textarea-ghost";
    ta.rows = 3;
    ta.style.fontSize = "11px";
    ta.style.width = "100%";
    ta.style.marginTop = "4px";
    ta.value = urls.join("\n");
    details.appendChild(ta);

    // Sync Textarea -> Grid
    ta.onchange = (e) => {
        urls = e.target.value.split(/\r?\n/).filter(s => s.trim());
        update(false);
    };

    container.appendChild(grid);
    container.appendChild(details);

    const renderItems = () => {
        grid.innerHTML = "";

        for (let i = 0; i < maxCount; i++) {
            const url = urls[i];
            const slot = document.createElement("div");
            slot.className = url ? "img-slot has-img" : "img-slot empty";
            slot.style.height = "100px";

            if (url) {
                // Has Image
                const isBlob = url.startsWith("blob:");
                slot.draggable = true;
                slot.innerHTML = `
                    <img src="${url}" style="width:100%;height:100%;object-fit:cover;">
                    <div class="slot-del">×</div>
                    ${isBlob ? '<div class="slot-badge" style="background:#fbbf24;color:#fff;font-size:9px">...</div>' : ''}
                `;

                // Delete
                slot.querySelector(".slot-del").onclick = (e) => {
                    e.stopPropagation();
                    urls.splice(i, 1);
                    update();
                };

                // Drag Events
                slot.ondragstart = (e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", i);
                    slot.classList.add("dragging");
                };
            } else {
                // Empty Slot
                slot.innerHTML = `<div class="slot-plus" style="font-size:20px">+</div>`;
                slot.onclick = () => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*"; input.multiple = true;
                    input.onchange = (e) => handleFiles(Array.from(e.target.files), i);
                    input.click();
                };
            }

            // Common DragOver/Drop
            slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("drag-over"); };
            slot.ondragleave = () => slot.classList.remove("drag-over");
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove("drag-over");

                // External Files
                const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
                if (files.length > 0) {
                    handleFiles(files, i);
                    return;
                }

                // Internal Reorder
                const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
                if (!isNaN(fromIdx) && fromIdx !== i) {
                    if (urls[fromIdx]) {
                        const moved = urls.splice(fromIdx, 1)[0];
                        let targetIdx = i;
                        if (targetIdx > fromIdx) targetIdx--;

                        urls.splice(targetIdx, 0, moved);
                        update();
                    }
                }
            };

            grid.appendChild(slot);
        }
    };

    const update = (syncTextarea = true) => {
        const newVal = urls.join("\n");
        if (!ch.customData) ch.customData = {};
        ch.customData[key] = newVal;

        if (syncTextarea) ta.value = newVal;

        persistState();
        renderItems();
        if (window.postToPreview) window.postToPreview();
    };

    const handleFiles = async (files, insertIndex) => {
        if (!files.length) return;

        const pending = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));

        if (insertIndex !== undefined && insertIndex < urls.length) {
            const newUrls = pending.map(p => p.url);
            urls.splice(insertIndex, 0, ...newUrls);
        } else {
            pending.forEach(p => urls.push(p.url));
        }

        renderItems();
        update(false); // [Fix] Immediately sync Blobs to state so re-renders don't lose them

        await Promise.all(pending.map(async (p) => {
            try {
                const res = await uploadToCms(p.file);
                const realUrl = (typeof res === "string" ? res : res.url) || res.imgName;
                if (realUrl) {
                    const idx = urls.indexOf(p.url);
                    if (idx !== -1) urls[idx] = realUrl;
                }
            } catch (e) {
                console.error("Upload failed", e);
            }
        }));

        update();
        postToPreview(); // 🔄 Force update preview for custom image lists

        // [Fix] If UI was re-rendered (detached) during async upload, force refresh to show new URLs
        if (!grid.isConnected) {
            render();
        }
    };

    renderItems();
}

function initCustomImageUpload(container, ch, key, defaultVal) {
    const renderComp = () => {
        const currentVal = (ch.customData && ch.customData[key] !== undefined) ? ch.customData[key] : (defaultVal || "");
        const comfyName = ch.customData?.[key + '_comfy_name'];
        const isBlob = currentVal.startsWith("blob:");
        const isTemp = looksLikeTemporaryUrls(currentVal);

        // Detailed Badge Status
        let badgeContent = "";
        if (currentVal) {
            if (isBlob) {
                badgeContent = `<div class="slot-badge" style="background:#fbbf24; color:#fff;">上传中...</div>`;
            } else if (comfyName) {
                badgeContent = `<div class="slot-badge" style="background:#4ade80; color:#fff;">Comfy ✔</div>`;
            } else {
                badgeContent = `<div class="slot-badge" style="background:#60a5fa; color:#fff;">CDN ✔</div>`;
            }
        }

        container.innerHTML = `
            <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:12px;">
                <div class="img-slot ${currentVal ? 'has-img' : 'empty'}" 
                     style="width:80px; height:80px; flex-shrink:0; position:relative; cursor:pointer; border:1px solid #ddd; border-radius:4px; display:flex; align-items:center; justify-content:center; background:#f9fafb; overflow:hidden;">
                    ${currentVal ? `
                        <img src="${currentVal}" style="width:100%; height:100%; object-fit:cover;">
                        <div class="slot-del">×</div>
                        ${badgeContent}
                    ` : `
                        <div class="slot-plus" style="font-size:20px; color:#999;">+</div>
                    `}
                </div>
                <div style="flex:1;">
                    <div class="url-box" style="margin:0; padding:4px 8px; background:#f8fafc;">
                        <input class="input-ghost custom-field-input-text" value="${currentVal}" style="width:100%; font-size:11px;" placeholder="图片 URL...">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                        <div class="hint" style="font-size:10px; color:#94a3b8;">支持拖拽或点击上传</div>
                    </div>
                </div>
            </div>
        `;

        const slot = container.querySelector(".img-slot");
        const input = container.querySelector(".custom-field-input-text");

        slot.onclick = (e) => {
            if (e.target.classList.contains("slot-del")) {
                e.stopPropagation();
                deleteCustomImage(key);
                return;
            }
            const fileInput = document.createElement("input");
            fileInput.type = "file"; fileInput.accept = "image/*";
            fileInput.onchange = async (evt) => {
                const file = evt.target.files[0];
                if (!file) return;

                // 1. Immediate Preview
                const blobUrl = URL.createObjectURL(file);
                if (!ch.customData) ch.customData = {};
                ch.customData[key] = blobUrl;
                renderComp(); // Show blob immediately
                if (window.postToPreview) window.postToPreview();

                // 2. Upload Logic
                // If it's a KeyItem detail or we want generic CDN upload
                // We skip Comfy for KeyDetail items as requested
                const isKeyItemDetail = ch.id.startsWith('keyItem') && key.startsWith('detail_');

                if (isKeyItemDetail) {
                    try {
                        const cdnUrl = await uploadFileToCMS(file);
                        if (cdnUrl) {
                            if (ch.customData[key] === blobUrl) { // Check if not replaced during upload
                                ch.customData[key] = cdnUrl;
                                URL.revokeObjectURL(blobUrl);
                                persistState();
                                renderComp();
                                if (window.postToPreview) window.postToPreview();
                            }
                        }
                    } catch (err) {
                        console.error("CDN Upload Failed:", err);
                        alert("图片上传失败");
                    }
                } else {
                    // Fallback to standard batch handler (which might just set blob or trigger other logic)
                    // Currently handleCustomImageUploadBatch just sets blob, assuming Sync button later?
                    // But for better UX, let's just leave it as is for others, or use the same logic?
                    // For now, only applying immediate CDN upload for KeyItems as strictly requested.
                    handleCustomImageUploadBatch(file, key);
                }
            };
            fileInput.click();
        };

        // Drag & Drop
        slot.ondrop = async (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
            if (files.length) {
                const file = files[0];
                const isKeyItemDetail = ch.id.startsWith('keyItem') && key.startsWith('detail_');

                if (isKeyItemDetail) {
                    const blobUrl = URL.createObjectURL(file);
                    if (!ch.customData) ch.customData = {};
                    ch.customData[key] = blobUrl;
                    renderComp();

                    try {
                        const cdnUrl = await uploadFileToCMS(file);
                        if (cdnUrl) {
                            ch.customData[key] = cdnUrl;
                            URL.revokeObjectURL(blobUrl);
                            persistState();
                            renderComp();
                            if (window.postToPreview) window.postToPreview();
                        }
                    } catch (err) { console.error(err); alert("上传失败"); }
                } else {
                    handleCustomImageUploadBatch(file, key);
                }
            }
        };
        slot.ondragover = e => { e.preventDefault(); slot.classList.add("drag-over"); };
        slot.ondragleave = () => slot.classList.remove("drag-over");

        input.onchange = (e) => {
            if (!ch.customData) ch.customData = {};
            ch.customData[key] = e.target.value.trim();
            persistState();
            renderComp();
            if (window.postToPreview) window.postToPreview();
        };
    };

    renderComp();
}

// ===== 渲染 Step 1 =====
function renderStep1() {
    // [Fix] Alias postToPreview to pushLivePreview to avoid ReferenceError
    const postToPreview = pushLivePreview;
    window.postToPreview = pushLivePreview; // 🔄 Global Alias for Helpers & Console

    const ch = state.chapters[state.currentIndex];


    const struct = REPORT_CONFIGS[state.currentReportType]?.structure?.[state.currentIndex];
    const maxImages = (struct?.maxImages !== undefined) ? struct.maxImages : ((ch.maxImages !== undefined) ? ch.maxImages : CONFIG.MAX_IMAGES_PER_CHAPTER);

    // [ 🔄 Safe Generation Wrapper (Moved to Function Scope) 🔄 ]
    const safeGenerate = async (btn, mode) => {
        if (!btn) return;
        const originText = btn.textContent || "生成";

        // 1. Force UI Start State
        btn.textContent = "启动中...";
        btn.disabled = true;

        try {
            if (typeof runGenerateChapter === 'function') {
                // Call original logic
                await runGenerateChapter(mode);

                // Poll for completion
                const check = () => {
                    const c = state.chapters[state.currentIndex];
                    const s = c.status || "";

                    // Conditions to Unlock
                    const isDone = s === "已生成";
                    const isFail = s.includes("失败") || s.includes("错") || s.includes("Error");

                    if (isDone || isFail) {
                        btn.textContent = originText;
                        btn.disabled = false;
                    } else {
                        // Force Keep Disabled
                        if (!btn.disabled) btn.disabled = true;
                        if (btn.textContent !== "生成中 (AI)...") btn.textContent = "生成中 (AI)...";
                        setTimeout(check, 800);
                    }
                };
                // Start Polling
                setTimeout(check, 500);

            } else {
                console.error("Function runGenerateChapter missing");
                btn.textContent = "系统错误: API缺失";
                setTimeout(() => { btn.textContent = originText; btn.disabled = false; }, 2000);
            }
        } catch (e) {
            console.error("Generation Error:", e);
            btn.textContent = "请求失败";
            setTimeout(() => { btn.textContent = originText; btn.disabled = false; }, 2000);
        }
    };

    // [ 🔄 Layout Strategy: Only 'Quiet Luxury' & 'Style Planning' uses Split Layout 🔄 ]
    const isQuietLuxury = (state.currentReportType === 'quiet_luxury' || isPlanningReportType(state.currentReportType));

    // [ 🔄 Restore Original Standard Mode for Non-QL 🔄 ]
    if (!isQuietLuxury) {
        contentPanelEl.innerHTML = "";
        const ch = state.chapters[state.currentIndex];

        // [Local Helper] Sync Data for Save
        const syncChapterDataToGenerated = (c) => {
            // 兜底初始化
            if (!c.generatedData) {
                if (c.title || c.summary || c.images.length > 0) {
                    c.generatedData = {
                        chapter_id: c.id || `chapter-${Date.now()}`,
                        chapter_title: "", summary_paragraph: "", keywords: [], images: []
                    };
                } else { return; }
            }
            c.generatedData.chapter_title = c.title;
            c.generatedData.summary_paragraph = c.summary;
            c.generatedData.keywords = Array.isArray(c.keywords) ? c.keywords : (c.keywords || "").split(/,|，/);

            // 图片链接同步
            const userUrls = extractUrlsFromText(c.urlListStr);
            const N = c.images.length;
            const usedUrls = [];
            for (let i = 0; i < N; i++) {
                if (i < userUrls.length && userUrls[i]) {
                    usedUrls.push(userUrls[i]);
                } else {
                    const img = c.images[i];
                    const fallback = img ? (img.url || (img.name ? toViewUrl(img.name) : "")) : "";
                    usedUrls.push(fallback);
                }
            }
            c.generatedData.images = usedUrls.map((u, i) => {
                let alt = "";
                if (c.images[i] && c.images[i].imgName) alt = c.images[i].imgName;
                return { id: u, alt: alt };
            });
        };

        // [Local Helper] Delete Image
        const deleteImage = (i) => {
            const c = state.chapters[state.currentIndex];
            if (c.images[i]) {
                c.images.splice(i, 1);
                // Sync URLs
                const currentUrlList = getUrlArray(c.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
                currentUrlList.splice(i, 1);
                c.urlListStr = serializeUrlArray(currentUrlList);
                persistState();
                render();
            }
        };

        const wrap = document.createElement("div");
        wrap.className = "grid12";

        const urlList = getUrlArray(ch.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);

        // --- Left Panel: Images & URLs ---
        const leftPanel = document.createElement("div");
        leftPanel.className = "section";
        leftPanel.style.display = "flex";
        leftPanel.style.flexDirection = "column";
        leftPanel.style.gap = "20px";

        leftPanel.innerHTML = `
            <div class="title" style="margin-bottom:10px">章节 ${state.currentIndex + 1}</div>
            
            <!--图片上传 -->
            <div>
                <div class="panel-title">图片 (最大 ${CONFIG.MAX_IMAGES_PER_CHAPTER}张)</div>
                <div class="image-grid" id="imgGrid" style="margin-top:10px;"></div>
                <div class="hint" style="margin-top:8px">支持拖拽排序；上传后自动存入图床</div>
            </div>

            <!--URL 列表-->
            <div class="url-box">
                <div class="row">
                    <label class="field-label">图片 URL (与上方图片顺序一致)</label>
                </div>
                <div class="url-grid" id="urlInputsGrid">
                    ${urlList.map((url, i) => `
                    <div class="url-field">
                        <span class="url-label">URL ${i + 1}</span>
                        <div class="url-status-chip">${url ? '✔' : '-'}</div>
                        <input class="input url-input-item" data-index="${i}" value="${url}" placeholder="https://...">
                    </div>
                    `).join('')
            }
                </div>
        <div class="url-actions" style="margin-top:8px">
            <button class="btn-mini" id="btnSyncOfficial">同步正式链接</button>
            <button class="btn-mini" id="btnSyncTemp">生成临时链接</button>
            <button class="btn-mini" id="btnClearUrls">清空 URL</button>
            <div style="flex:1; text-align:right; font-size:11px; color:#94a3b8;">图片数 ${ch.images.length} | 已填 URL ${urlList.filter(u => u).length}</div>
        </div>
            </div>
        `;
        wrap.appendChild(leftPanel);

        // --- Right Panel: Content Editing ---
        const rightPanel = document.createElement("div");
        rightPanel.className = "section";
        rightPanel.style.display = "flex";
        rightPanel.style.flexDirection = "column";
        rightPanel.style.gap = "24px";

        rightPanel.innerHTML = `
        <div class="row" style="margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                <div class="panel-title" style="margin:0; flex:1;">内容编辑</div>
                <div class="chips">
                    <button class="btn-ghost" id="btnResetCh">重置本章</button>
                    <button class="btn-ghost" id="btnSaveAll">合并全部章节 → 下载JSON</button>
                    <button class="btn-primary" id="btnSaveNext">保存并前往步骤2 →</button>
                </div>
            </div>
            
            <!--灵感输入 -->
            <div>
              <label class="field-label">核心灵感 (可选)</label>
              <input id="inspirationInput" class="input" placeholder="例如：极简主义、未来感、复古运动..." value="${ch.inspiration || ""}">
              <div class="hint">将注入到 Prompt 中，引导 AI 生成方向</div>
            </div>

            <!--生成按钮 -->
        <div class="row" style="justify-content:flex-start; gap:10px; align-items:center;">
            ${ch.id === 'recommendation-page' ? '' : `<button class="btn-primary" id="genBtn">生成本章文案</button>`}
            <div class="status-line" id="statusLine">${ch.status || "未生成"}</div>
            </div>

            <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">

                <!-- [ 🔄 新增：可编辑的生成结果 🔄 ] -->
                <div>
                    <label class="field-label">章节标题 (Title)</label>
                    <input id="inputTitle" class="input-ghost title-input" value="${ch.title || ""}" placeholder="输入章节标题...">
                </div>

                <div>
                    <label class="field-label">关键词 (Keywords)</label>
                    <input id="inputKeywords" class="input-ghost" value="${ch.keywords || ""}" placeholder="输入关键词...">
                </div>

                <div>
                    <label class="field-label">章节摘要 (Summary)</label>
                    <textarea id="inputSummary" class="textarea-ghost" rows="6" placeholder="输入章节摘要...">${ch.summary || ""}</textarea>
                </div>
                `;
        wrap.appendChild(rightPanel);
        contentPanelEl.appendChild(wrap);

        // [Bind Events]
        const inspInput = document.getElementById("inspirationInput");
        if (inspInput) {
            inspInput.addEventListener("input", (e) => {
                ch.inspiration = e.target.value;
                persistState();
            });
        }
        const inputTitle = document.getElementById("inputTitle");
        const inputKeywords = document.getElementById("inputKeywords");
        const inputSummary = document.getElementById("inputSummary");

        if (inputTitle) inputTitle.addEventListener("input", (e) => { ch.title = e.target.value; persistState(); });
        if (inputKeywords) inputKeywords.addEventListener("input", (e) => { ch.keywords = e.target.value; persistState(); });
        if (inputSummary) inputSummary.addEventListener("input", (e) => { ch.summary = e.target.value; persistState(); });

        const grid = document.getElementById("imgGrid");
        setupDragDrop(grid);

        for (let i = 0; i < CONFIG.MAX_IMAGES_PER_CHAPTER; i++) {
            const slot = document.createElement("div");
            const imgObj = ch.images[i];
            if (imgObj) {
                slot.className = "img-slot has-img";
                const img = document.createElement("img");
                img.src = imgObj.preview || imgObj.url || "";
                slot.appendChild(img);
                const del = document.createElement("div"); del.className = "slot-del"; del.textContent = "×";
                del.onclick = (e) => { e.stopPropagation(); deleteImage(i); };
                slot.appendChild(del);
                const badge = document.createElement("div"); badge.className = "slot-badge";
                badge.textContent = imageStatusBadgeText(imgObj);
                slot.appendChild(badge);
            } else {
                slot.className = "img-slot empty";
                const plus = document.createElement("div"); plus.className = "slot-plus";
                plus.textContent = ch.images.length === 0 && i === 0 ? "＋" : "+";
                slot.appendChild(plus);
                slot.onclick = () => openFileDialog(i, 'main');
            }
            grid.appendChild(slot);
        }

        enableImageReorder(grid, ch);

        document.querySelectorAll(".url-input-item").forEach(input => {
            input.addEventListener("change", (e) => {
                const idx = parseInt(e.target.dataset.index);
                const arr = getUrlArray(ch.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
                arr[idx] = e.target.value.trim();
                ch.urlListStr = serializeUrlArray(arr);
                persistState();
                const chip = e.target.previousElementSibling;
                if (chip) chip.textContent = arr[idx] ? '✔' : '-';
            });
        });

        document.getElementById("btnSyncOfficial").onclick = () => {
            const arr = [];
            for (let i = 0; i < CONFIG.MAX_IMAGES_PER_CHAPTER; i++) {
                const img = ch.images[i];
                arr.push(img ? (img.url || "") : "");
            }
            ch.urlListStr = serializeUrlArray(arr);
            persistState();
            render();
        };

        document.getElementById("btnSyncTemp").onclick = () => {
            const arr = [];
            for (let i = 0; i < CONFIG.MAX_IMAGES_PER_CHAPTER; i++) {
                const img = ch.images[i];
                arr.push((img && img.name) ? toViewUrl(img.name) : "");
            }
            ch.urlListStr = serializeUrlArray(arr);
            persistState();
            render();
        };

        document.getElementById("btnClearUrls").onclick = () => {
            if (confirm("确定清空所有 URL 吗？")) {
                ch.urlListStr = "";
                persistState();
                render();
            }
        };

        const legacyGenBtn = document.getElementById("genBtn");
        if (legacyGenBtn && typeof runGenerateChapter === 'function') {
            legacyGenBtn.onclick = runGenerateChapter;
            syncGenerateButtonLoading(legacyGenBtn, ch.id || `chapter-${state.currentIndex + 1}`, 'standard');
        }

        document.getElementById("btnResetCh").onclick = () => {
            if (confirm("确定清空本章数据？")) {
                const current = state.chapters[state.currentIndex];
                const mainSlots = (Array.isArray(current.mainImages) && current.mainImages.length) ? current.mainImages.length : 6;
                const mainUrlSlots = (Array.isArray(current.mainImageUrls) && current.mainImageUrls.length) ? current.mainImageUrls.length : mainSlots;

                state.chapters[state.currentIndex] = {
                    ...current,
                    title: "",
                    images: [],
                    urlListStr: "",
                    keywords: "",
                    summary: "",
                    status: "未生成",
                    inspiration: "",
                    generatedData: null,
                    customData: {},
                    mainImages: Array(mainSlots).fill(null),
                    detailImages: [],
                    mainImageUrls: Array(mainUrlSlots).fill(""),
                    detailImageUrls: []
                };
                persistState();
                render();
            }
        };

        document.getElementById("btnSaveAll").onclick = () => {
            state.chapters.forEach(syncChapterDataToGenerated);
            const valid = state.chapters.filter(c => c.generatedData);
            if (!valid.length) { alert("没有任何章节已生成数据"); return; }
            const finalData = { created_at: new Date().toISOString(), chapters: valid.map(c => c.generatedData) };
            const blob = new Blob([JSON.stringify(finalData, null, 2)], { type: "application/json" });
            const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `step1-chapters-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u);
        };

        document.getElementById("btnSaveNext").onclick = () => {
            state.chapters.forEach(syncChapterDataToGenerated);
            const valid = state.chapters.filter(c => c.generatedData);
            if (!valid.length) { alert("请至少生成一个章节的内容后再继续。"); return; }
            state.reportIntermediate = { created_at: new Date().toISOString(), chapters: valid.map(c => c.generatedData) };
            persistState();
            setStep(2);
        };

        return; // Early Exit
    }

    let wrap = document.getElementById("step1-layout-container");
    let editorPanel;
    const openStep1PreviewInNewWindow = () => {
        const iframe = document.getElementById("previewIframe");
        if (!iframe) return;

        if (!isPlanningReportType(state.currentReportType)) {
            window.open(iframe.src, '_blank');
            return;
        }

        let popupRef = null;
        try {
            popupRef = window.open('', '_blank');
        } catch (_) {
            popupRef = null;
        }

        const finalizeOpen = (htmlContent) => {
            if (!htmlContent) return false;
            const url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }));
            if (popupRef && !popupRef.closed) {
                popupRef.location.replace(url);
            } else {
                window.open(url, '_blank');
            }
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            return true;
        };

        const fallbackOpen = () => {
            try {
                const snapshotHtml = iframe.contentDocument && iframe.contentDocument.documentElement
                    ? `<!DOCTYPE html>\n${iframe.contentDocument.documentElement.outerHTML}`
                    : "";
                if (finalizeOpen(snapshotHtml)) return;
            } catch (err) {
                console.warn('[Step1] Failed to open preview snapshot:', err);
            }
            if (popupRef && !popupRef.closed) {
                popupRef.location.href = iframe.src;
            } else {
                window.open(iframe.src, '_blank');
            }
        };

        if (!iframe.contentWindow) {
            fallbackOpen();
            return;
        }

        const requestId = `step1_open_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        let timeoutId = 0;
        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
        };
        const handleMessage = (e) => {
            if (e.source !== iframe.contentWindow || !e.data || e.data.type !== 'RETURN_FULL_HTML') return;
            const incomingRequestId = String(e.data.requestId || '');
            if (incomingRequestId && incomingRequestId !== requestId) return;
            cleanup();
            if (!finalizeOpen(e.data.html)) {
                fallbackOpen();
            }
        };

        timeoutId = window.setTimeout(() => {
            cleanup();
            fallbackOpen();
        }, 8000);

        window.addEventListener('message', handleMessage);
        try {
            iframe.contentWindow.postMessage({ type: 'GET_FULL_HTML', mode: 'open', requestId }, '*');
        } catch (err) {
            cleanup();
            console.error('[Step1] Failed requesting preview HTML:', err);
            fallbackOpen();
        }
    };
    const bindStep1PreviewActions = () => {
        const btnRefreshPreview = document.getElementById("btnRefreshPreview");
        if (btnRefreshPreview) {
            btnRefreshPreview.onclick = () => {
                if (window.postToPreview) window.postToPreview(true);
            };
        }
        const btnOpenPreview = document.getElementById("btnOpenPreviewStep1");
        if (btnOpenPreview) {
            btnOpenPreview.onclick = () => openStep1PreviewInNewWindow();
        }
    };

    // --- 1. Manage Layout Containers ---
    if (isQuietLuxury) {
        // === SPLIT MODE WITH COLLAPSIBLE RIGHT PREVIEW ===
        if (!wrap) {
            contentPanelEl.innerHTML = "";
            wrap = document.createElement("div");
            wrap.id = "step1-layout-container";
            wrap.style.display = "flex";
            wrap.style.gap = "24px";
            wrap.style.height = "calc(100vh - 120px)";
            wrap.style.overflow = "hidden";
            contentPanelEl.appendChild(wrap);

            // 1. Editor Panel (Adaptive Width)
            editorPanel = document.createElement("div");
            editorPanel.id = "step1-editor-panel";
            editorPanel.style.display = "grid";
            // Default (Preview Open): 1 Column
            // Default (Preview Closed): 2 Columns
            editorPanel.style.gridTemplateColumns = "1fr 1fr";
            editorPanel.style.gap = "16px";
            editorPanel.style.height = "100%";
            editorPanel.style.overflowY = "auto";
            editorPanel.style.flex = "1"; // Full width initially
            editorPanel.style.transition = "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
            editorPanel.style.paddingRight = "4px";
            wrap.appendChild(editorPanel);

            // 2. Right Preview Panel
            const previewPanel = document.createElement("div");
            previewPanel.id = "step1-preview-panel";
            previewPanel.className = "section";
            previewPanel.style.padding = "0";
            previewPanel.style.overflow = "hidden";
            previewPanel.style.display = "flex";
            previewPanel.style.flexDirection = "column";
            // Default (Preview Closed)
            previewPanel.style.flex = "0 0 0";
            previewPanel.style.width = "0";
            previewPanel.style.opacity = "0";
            previewPanel.style.pointerEvents = "none";
            previewPanel.style.background = "#fff";
            previewPanel.style.boxShadow = "var(--shadow-md)";
            previewPanel.style.transition = "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
            previewPanel.style.minWidth = "0"; // Allow shrinking
            configureStep1LivePreviewPanelLayout(previewPanel, state.currentReportType);

            // Header with Collapse Button
            const preHeader = document.createElement("div");
            preHeader.style.padding = "10px 20px";
            preHeader.style.borderBottom = "1px solid #eee";
            preHeader.style.display = "flex";
            preHeader.style.justifyContent = "space-between";
            preHeader.style.alignItems = "center";
            preHeader.style.minWidth = "400px"; // Prevent content squash
            preHeader.innerHTML = `
                <span style="font-size:12px; font-weight:bold; color:#666;">实时预览</span>
                <div style="display:flex;gap:8px">
                    <button class="btn-mini" id="btnRefreshPreview">刷新</button>
                    <button class="btn-mini" id="btnOpenPreviewStep1" title="New Window">在新窗口打开</button>
                </div>
                `;
            previewPanel.appendChild(preHeader);

            const iframeContainer = document.createElement("div");
            iframeContainer.style.flex = "1";
            iframeContainer.style.position = "relative";
            iframeContainer.style.overflow = "hidden";
            iframeContainer.style.width = "100%";
            iframeContainer.style.background = isThemeThemePlanningType(state.currentReportType) ? "#fff" : "#e0e0e0";
            iframeContainer.style.minWidth = "400px"; // Prevent content squash

            const iframe = document.createElement("iframe");
            iframe.id = "previewIframe";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.onload = () => {
                forceHydrateLivePreview(true);
                syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll: true });
                setTimeout(() => syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll: true }), 120);
                setTimeout(() => syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll: true }), 320);
            };
            if (REPORT_CONFIGS[state.currentReportType]) {
                const tpl = REPORT_CONFIGS[state.currentReportType].templateFile;
                iframe.dataset.reportType = state.currentReportType;
                iframe.dataset.templateFile = tpl;
                iframe.src = `${tpl}?chIdx=${state.currentIndex}&v=${Date.now()}`;
            }
            iframeContainer.appendChild(iframe);
            previewPanel.appendChild(iframeContainer);
            wrap.appendChild(previewPanel);
            bindStep1PreviewActions();

            const syncOpenedPreviewToCurrentChapter = () => {
                const livePreviewIframe = document.getElementById("previewIframe");
                const livePreviewContainer = livePreviewIframe ? livePreviewIframe.parentElement : null;
                const livePreviewPanel = document.getElementById("step1-preview-panel");
                configureStep1LivePreviewPanelLayout(livePreviewPanel, state.currentReportType);
                configureStep1LivePreviewContainerLayout(livePreviewContainer, state.currentReportType);
                attachLivePreviewViewport(
                    livePreviewIframe,
                    livePreviewContainer,
                    state.currentReportType,
                    "__cleanupStep1LivePreviewViewport"
                );
                syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll: true });
            };

            // [ 🔄 Expand Button (Hidden by default) 🔄 ]
            // [ 🔄 Layout Toggle Button (Persistent) 🔄 ]
            const toggleBtn = document.createElement("button");
            toggleBtn.id = "btnTogglePreview";
            toggleBtn.innerHTML = "预览 ➔"; // Initial Closed State
            toggleBtn.className = "btn-secondary";
            toggleBtn.style.position = "absolute";
            toggleBtn.style.right = "0";
            toggleBtn.style.top = "50%";
            toggleBtn.style.transform = "translateY(-50%)";
            toggleBtn.style.borderTopRightRadius = "0";
            toggleBtn.style.borderBottomRightRadius = "0";
            toggleBtn.style.zIndex = "100";
            // toggleBtn.style.display = "block"; // Always visible
            toggleBtn.style.boxShadow = "-2px 0 8px rgba(0,0,0,0.1)";
            toggleBtn.onclick = () => document.dispatchEvent(new CustomEvent('togglePreview'));
            wrap.appendChild(toggleBtn);

            // [ 🔄 Toggle Logic 🔄 ]
            let isPreviewOpen = false;
            const togglePreview = () => {
                isPreviewOpen = !isPreviewOpen;
                if (isPreviewOpen) {
                    if (isThemeThemePlanningType(state.currentReportType)) {
                        themeThemeStep1PreviewAutoFollowEnabled = true;
                    }
                    // OPEN State
                    previewPanel.style.flex = "1";
                    previewPanel.style.width = "auto";
                    previewPanel.style.opacity = "1";
                    previewPanel.style.pointerEvents = "auto";
                    configureStep1LivePreviewPanelLayout(previewPanel, state.currentReportType);

                    editorPanel.style.flex = "0 0 480px";
                    editorPanel.style.gridTemplateColumns = "1fr";

                    toggleBtn.innerHTML = "收起 ➔";
                    requestAnimationFrame(syncOpenedPreviewToCurrentChapter);
                    setTimeout(syncOpenedPreviewToCurrentChapter, 80);
                    setTimeout(syncOpenedPreviewToCurrentChapter, 220);
                } else {
                    // CLOSED State (Collapsed to right)
                    previewPanel.style.flex = "0 0 0";
                    previewPanel.style.width = "0";
                    previewPanel.style.opacity = "0";
                    previewPanel.style.pointerEvents = "none";
                    configureStep1LivePreviewPanelLayout(previewPanel, state.currentReportType);

                    // Editor Expands
                    editorPanel.style.flex = "1";
                    editorPanel.style.gridTemplateColumns = "1fr 1fr";

                    toggleBtn.innerHTML = "预览 ➔";
                }
            };

            // Expose globally for event
            document.addEventListener('togglePreview', togglePreview);
            // document.getElementById("btnCollapsePreview").onclick = togglePreview; // Disabled header button event

        } else {
            // Just Re-get elements
            editorPanel = document.getElementById("step1-editor-panel");
            editorPanel.innerHTML = "";
            // Sync Iframe Scroll
            const iframe = document.getElementById("previewIframe");
            const nextTemplateFile = getCurrentTemplatePath();
            const shouldReloadPreviewTemplate = !!(
                iframe &&
                nextTemplateFile &&
                (iframe.dataset.reportType !== state.currentReportType || iframe.dataset.templateFile !== nextTemplateFile)
            );
            if (iframe && shouldReloadPreviewTemplate) {
                iframe.dataset.reportType = state.currentReportType;
                iframe.dataset.templateFile = nextTemplateFile;
                iframe.src = `${nextTemplateFile}?chIdx=${state.currentIndex}&v=${Date.now()}`;
            } else if (iframe && iframe.contentWindow) {
                syncLivePreviewChapterNavigation(state.currentIndex);
            }
        }

        const livePreviewIframe = document.getElementById("previewIframe");
        const livePreviewContainer = livePreviewIframe ? livePreviewIframe.parentElement : null;
        const livePreviewPanel = document.getElementById("step1-preview-panel");
        configureStep1LivePreviewPanelLayout(livePreviewPanel, state.currentReportType);
        configureStep1LivePreviewContainerLayout(livePreviewContainer, state.currentReportType);
        attachLivePreviewViewport(
            livePreviewIframe,
            livePreviewContainer,
            state.currentReportType,
            "__cleanupStep1LivePreviewViewport"
        );
        attachLivePreviewManualScrollGuard(
            livePreviewIframe,
            "__cleanupStep1LivePreviewManualScrollGuard",
            [1]
        );


        // [ ✨ Unified Step 2 Logic & Event Handling ✨ ]
        if (!window._qlGlobalMsgHandler) {
            window._qlGlobalMsgHandler = (e) => {
                // On first preview handshake, push all chapters once so directory pages
                // don't stay in static fallback state before users click into them.
                if (e.data && e.data.type === 'TEMPLATE_READY') {
                    syncLivePreviewChapterNavigation(state.currentIndex, { forceUpdateAll: true });
                }
                if (e.data && e.data.type === 'SAVE_IMAGE_TRANSFORM') {
                    const { chIdx, imgIdx, transform } = e.data;
                    if (state.chapters[chIdx]?.images?.[imgIdx]) {
                        if (!state.chapters[chIdx].images[imgIdx].transform) state.chapters[chIdx].images[imgIdx].transform = {};
                        state.chapters[chIdx].images[imgIdx].transform = transform;
                        persistState();
                    }
                }
                if (e.data && e.data.type === 'RETURN_FULL_HTML') {
                    document.dispatchEvent(new CustomEvent('htmlExportReady', { detail: e.data.html }));
                }

                // [Dynamic Page Management]
                const handleAddPage = (prefix) => {
                    const nextIdx = findNextInactiveDynamicPageIndex(prefix, state.currentReportType);
                    if (nextIdx !== -1) {
                        const nextChapter = state.chapters[nextIdx];
                        nextChapter.isActive = true;
                        applyChapterCustomDataDefaults(nextChapter, state.currentReportType);
                        if (shouldSyncDynamicDirectory(prefix, state.currentReportType)) {
                            normalizeAutoDetailPageEnTitle(nextChapter);
                            syncDirectoryForChapter(nextChapter.id);
                        }
                        state.currentIndex = nextIdx;
                        persistState();
                        render();
                        postToPreview(true);
                    }
                };

                const addMessageMap = {
                    ADD_KEY_ITEM: 'keyItem',
                    ADD_PATTERN_DETAIL: 'patternDetail',
                    ADD_BRAND_DETAIL: 'brandDetail',
                    ADD_THEME_EVENT_PAGE: 'themeEvent',
                    ADD_GROUP_STYLING_PAGE: 'groupStyling',
                    ADD_RACK_DISPLAY_PAGE: 'rackDisplay',
                    ADD_THEME_VISUAL_EDITORIAL_PAGE: 'themeVisualEditorial',
                    ADD_VISUAL_DISPLAY_PAGE: 'visualDisplay'
                };
                const removeMessageTypes = new Set([
                    'REMOVE_KEY_ITEM',
                    'REMOVE_PATTERN_DETAIL',
                    'REMOVE_BRAND_DETAIL',
                    'REMOVE_THEME_EVENT_PAGE',
                    'REMOVE_GROUP_STYLING_PAGE',
                    'REMOVE_RACK_DISPLAY_PAGE',
                    'REMOVE_THEME_VISUAL_EDITORIAL_PAGE',
                    'REMOVE_VISUAL_DISPLAY_PAGE'
                ]);

                if (e.data && addMessageMap[e.data.type]) handleAddPage(addMessageMap[e.data.type]);
                if (e.data && removeMessageTypes.has(e.data.type)) {
                    const chId = e.data.id;
                    const ch = state.chapters.find(c => c.id === chId);
                    const dynamicType = getDynamicPageGroupType(chId, state.currentReportType);
                    const dynamicGroup = dynamicType
                        ? getDynamicPageGroupConfigByType(dynamicType, state.currentReportType)
                        : null;
                    if (ch && dynamicGroup && chId !== dynamicGroup.firstId) {
                        if (confirm(`确定要删除 ${ch.title} 吗？`)) {
                            ch.isActive = false;
                            ch.images = [];
                            ch.customData = {};
                            ch.status = "未生成";

                            // Switch to previous chapter if current
                            const idx = state.chapters.indexOf(ch);
                            if (state.currentIndex === idx) {
                                const visible = state.chapters.map((c, i) => ({ c, i })).filter(item => item.c.isActive);
                                const prev = visible.reverse().find(item => item.i < idx);
                                state.currentIndex = prev ? prev.i : 0;
                            }
                            if (shouldSyncDynamicDirectory(dynamicType, state.currentReportType)) {
                                syncDirectoryForChapter(ch.id);
                            }
                            persistState();
                            render();
                            postToPreview(true);
                        }
                    }
                }
            };
            window.addEventListener('message', window._qlGlobalMsgHandler);
        }

        const isStep2 = (state.step === 2);
        const editor = document.getElementById("step1-editor-panel");
        const preview = document.getElementById("step1-preview-panel");
        const toggleBtn = document.getElementById("btnTogglePreview");
        const preHeader = preview ? preview.querySelector("div[style*='justify-content']") : null;
        let actionParams = null;
        if (preHeader) actionParams = preHeader.lastElementChild;

        if (isStep2 && editor && preview) {
            editor.style.display = "none";
            preview.style.flex = "1";
            preview.style.width = "100%";
            preview.style.opacity = "1";
            preview.style.pointerEvents = "auto";
            if (toggleBtn) toggleBtn.style.display = "none";

            actionParams.innerHTML = `
                    <button class="btn-secondary" id="btnToggleEditMode" style="margin-right:12px;">调整图片位置</button>
                    <button class="btn-ghost" id="btnOpenNewQL">新窗口打开</button>
                    <button class="btn-primary" id="btnExportQL" style="background:#000; border-color:#000;">导出报告HTML</button>
                 `;
            let isEditMode = false;
            document.getElementById('btnToggleEditMode').onclick = () => {
                isEditMode = !isEditMode;
                const b = document.getElementById('btnToggleEditMode');
                b.innerHTML = isEditMode ? "完成调整" : "调整图片位置";
                b.className = isEditMode ? "btn-primary" : "btn-secondary";
                const fr = document.getElementById("previewIframe");
                if (fr) fr.contentWindow.postMessage({ type: 'SET_EDIT_MODE', enabled: isEditMode }, '*');
            };
            const reqExport = async (mode) => {
                const ready = await ensureHtmlExportImagesReady({ includeReportFinal: false, refreshLivePreview: true });
                if (!ready) return;
                const onHtml = (e) => {
                    document.removeEventListener('htmlExportReady', onHtml);
                    const url = URL.createObjectURL(new Blob([e.detail], { type: 'text/html' }));
                    if (mode === 'open') window.open(url, '_blank');
                    else { const a = document.createElement('a'); a.href = url; a.download = 'Quiet_Luxury_Report.html'; a.click(); }
                };
                document.addEventListener('htmlExportReady', onHtml);
                const fr = document.getElementById("previewIframe");
                if (fr) fr.contentWindow.postMessage({ type: 'GET_FULL_HTML' }, '*');
            };
            document.getElementById('btnOpenNewQL').onclick = () => reqExport('open');
            document.getElementById('btnExportQL').onclick = () => reqExport('download');
        } else if (editor && preview) {
            // Step 1 Restore
            if (window.getComputedStyle(editor).display === "none") {
                editor.style.display = "grid";
                if (toggleBtn) toggleBtn.style.display = "block";
                if (actionParams) {
                    actionParams.innerHTML = `
                        <button class="btn-mini" id="btnRefreshPreview">刷新</button>
                        <button class="btn-mini" id="btnOpenPreviewStep1" title="New Window">在新窗口打开</button>
                     `;
                    bindStep1PreviewActions();
                }
            }
        }
        // Ensure all pages (including cover) are synced after iframe init/render.
        setTimeout(() => { forceHydrateLivePreview(true); }, 200);
    } else {
        // === STANDARD MODE (Restored) ===
        if (wrap) {
            // Destroy Split Layout if coming from QL
            contentPanelEl.innerHTML = "";
            wrap = null;
        }

        editorPanel = document.getElementById("step1-editor-panel");
        if (!editorPanel) {
            editorPanel = document.createElement("div");
            editorPanel.id = "step1-editor-panel";
            // Standard Styles for Full Page Editor
            editorPanel.style.maxWidth = "1200px";
            editorPanel.style.margin = "0 auto";
            contentPanelEl.appendChild(editorPanel);
        } else {
            editorPanel.innerHTML = "";
            // Reset style just in case
            editorPanel.style = "";
            editorPanel.style.maxWidth = "1200px";
            editorPanel.style.margin = "0 auto";
        }
    }

    // --- 2. Render Editor Content ---

    // [Init Image Arrays for QL/StylePlanning]
    if (isQuietLuxury) {
        if (!ch.mainImages) {
            // Map first 6 of ch.images to mainImages (fixed slots)
            ch.mainImages = new Array(6).fill(null).map((_, i) => ch.images[i] || null);
        }
        if (!ch.detailImages) {
            ch.detailImages = ch.images.slice(6) || [];
        }
    }

    // [ ✨ Auto-Sync Pattern Images (Ch10 -> Ch11-14) ✨ ]
    // Ensures data is present for Preview/Export, matching the visual "locked slot"
    if (isQuietLuxury) {
        const patternMap = { "ch11": 0, "ch12": 1, "ch13": 2, "ch14": 3 };
        const srcIdx = patternMap[ch.id];
        if (srcIdx !== undefined) {
            const ch10 = state.chapters.find(c => c.id === "ch10");
            if (ch10 && ch10.images && ch10.images[srcIdx]) {
                const srcImg = ch10.images[srcIdx];
                // Check if need to sync (if empty or different)
                const currentImg = ch.images[0];
                const isDifferent = !currentImg || (currentImg.url !== srcImg.url) || (currentImg.preview !== srcImg.preview);

                if (isDifferent) {
                    // Clone to avoid ref issues
                    ch.images[0] = { ...srcImg };
                    console.log(`[AutoSync] Synced image from Ch10[${srcIdx}] to ${ch.id}[0]`);
                    persistState();
                    // No need to re-render, we are in render
                }
            }
        }
    }

    const urlList = getUrlArray(ch.urlListStr, maxImages);
    const hideStylePlanningUploadHints = isPlanningReportType(state.currentReportType);
    const descHtml = (!hideStylePlanningUploadHints && ch.desc)
        ? `<div class="info-box" style="margin-bottom:12px; font-size:12px; color:#333; padding:8px 0; font-weight:500;">📖 ${ch.desc}</div>`
        : "";
    const displayTitle = ch.title ? ch.title : `章节 ${state.currentIndex + 1}`;
    const isCustomGridChapter = (isQuietLuxury && struct?.id === "ch4");

    if (isCustomGridChapter) {
        // [Complex Custom Grid - Logic Retained]
        const globalFields = (struct.fields || []).filter(f => !f.key.match(/^img\d+_/));
        const globalFieldsHtml = globalFields.map(f => `
                <div style="margin-bottom:8px;">
                    <label class="field-label">${f.label}</label>
                    ${f.type === 'textarea'
                ? `<textarea class="textarea-ghost custom-field-input" data-key="${f.key}" rows="3">${(ch.customData?.[f.key]) || f.default || ""}</textarea>`
                : `<input class="input-ghost custom-field-input" data-key="${f.key}" value="${(ch.customData?.[f.key]) || f.default || ""}">`
            }
                </div>
                `).join('');

        // 2. Base Grid (1-10)
        let baseGridHtml = `<div style="border:1px solid #e5e7eb; border-radius:8px; padding:16px; background:#fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div class="panel-title" style="margin-bottom:12px;">底层网格 (Base Grid 1-10)</div>`;
        for (let i = 0; i < 10; i++) {
            const imgIdx = i + 1;
            const url = urlList[i] || "";
            const fieldCn = struct.fields.find(f => f.key === `img${imgIdx}_cn`);
            const fieldEn = struct.fields.find(f => f.key === `img${imgIdx}_en`);
            const imgObj = ch.images[i];
            const imgSrc = imgObj ? (imgObj.preview || imgObj.url) : "";

            baseGridHtml += `
                    <div style="display:flex; gap:12px; margin-bottom:16px; align-items:flex-start; border-bottom:1px dashed #eee; padding-bottom:12px;">
                        <div class="split-img-slot img-slot ${imgSrc ? 'has-img' : 'empty'}" data-index="${i}" style="width:80px; height:80px; background:#f9fafb; border-radius:4px; flex-shrink:0; cursor:pointer; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;">
                            ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="color:#999; font-size:10px;">IMG ${imgIdx}</div>`}
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                            <input class="input url-input-item" data-index="${i}" value="${url}" placeholder="Image URL..." style="font-size:12px; width:100%;">
                                <div style="display:flex; gap:8px;">
                                    <input class="input-ghost custom-field-input" data-key="${fieldCn?.key || ''}" value="${(ch.customData?.[fieldCn?.key]) || fieldCn?.default || ''}" placeholder="标签 (CN)" style="flex:1;">
                                        <input class="input-ghost custom-field-input" data-key="${fieldEn?.key || ''}" value="${(ch.customData?.[fieldEn?.key]) || fieldEn?.default || ''}" placeholder="Label (EN)" style="flex:1;">
                                        </div>
                                </div>
                        </div>`;
        }
        baseGridHtml += `</div>`;

        let decoGridHtml = `<div style="border:1px solid #e5e7eb; border-radius:8px; padding:16px; background:#fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div class="panel-title" style="margin-bottom:12px;">点缀装饰 (Decorations 11-16)</div>
                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">`;
        for (let i = 10; i < 16; i++) {
            const url = urlList[i] || "";
            const imgObj = ch.images[i];
            const imgSrc = imgObj ? (imgObj.preview || imgObj.url) : "";
            decoGridHtml += `
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div class="split-img-slot img-slot ${imgSrc ? 'has-img' : 'empty'}" data-index="${i}" style="aspect-ratio:1; background:#f9fafb; border-radius:4px; cursor:pointer; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;">
                                    ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="color:#999; font-size:10px;">IMG ${i + 1}</div>`}
                                </div>
                                <input class="input url-input-item" data-index="${i}" value="${url}" placeholder="URL" style="font-size:10px;">
                            </div>`;
        }
        decoGridHtml += `</div>`;

        editorPanel.innerHTML = `
                        <div style="background:#fff; padding:12px 16px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05); border:1px solid #e5e7eb;">
                            <div class="row" style="justify-content:space-between; align-items:center; margin:0;">
                                <div class="title" style="margin:0;">${displayTitle}</div>
                                <div class="chips">
                                    <button class="btn-ghost" id="btnResetCh">重置</button>
                                    <button class="btn-primary" id="btnSaveNext">下一步 ➔</button>
                                </div>
                            </div>
                            ${descHtml ? `<div style="margin-top:12px;">${descHtml}</div>` : ''}
                        </div>

                        <div style="background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05); border:1px solid #e5e7eb;">
                            <div class="panel-title" style="margin-bottom:12px;">页面文本 (Page Texts)</div>
                            ${globalFieldsHtml}
                        </div>
                        ${baseGridHtml}
                        ${decoGridHtml}
                        `;

        // Bind Events specific to CUSTOM GRID
        setTimeout(() => {
            // [Fix] Initialize Standard Image Grid if present (Restored for QL/StylePlanning)
            // This is required because QL mode splits layout and we reintroduced imgGrid for standard chapters
            const grid = document.getElementById("imgGrid");
            if (grid) {
                grid.innerHTML = ""; // Clear to prevent duplication
                setupDragDrop(grid);

                // Redefine deleteImage locally for this closure as the original one is in 'else' block
                const deleteImage = (i) => {
                    const c = state.chapters[state.currentIndex];
                    if (c.images[i]) {
                        c.images.splice(i, 1);
                        const currentUrlList = getUrlArray(c.urlListStr, CONFIG.MAX_IMAGES_PER_CHAPTER);
                        currentUrlList.splice(i, 1);
                        c.urlListStr = serializeUrlArray(currentUrlList);
                        persistState();
                        render();
                    }
                };

                for (let i = 0; i < CONFIG.MAX_IMAGES_PER_CHAPTER; i++) {
                    const slot = document.createElement("div");
                    const imgObj = ch.images[i];
                    if (imgObj) {
                        slot.className = "img-slot has-img";
                        const img = document.createElement("img");
                        img.src = imgObj.preview || imgObj.url || "";
                        slot.appendChild(img);
                        const del = document.createElement("div"); del.className = "slot-del"; del.textContent = "×";
                        del.onclick = (e) => { e.stopPropagation(); deleteImage(i); };
                        slot.appendChild(del);
                        const badge = document.createElement("div"); badge.className = "slot-badge";
                        badge.textContent = imageStatusBadgeText(imgObj);
                        slot.appendChild(badge);
                    } else {
                        slot.className = "img-slot empty";
                        const plus = document.createElement("div"); plus.className = "slot-plus";
                        plus.textContent = ch.images.length === 0 && i === 0 ? "＋" : "+";
                        slot.appendChild(plus);
                        slot.onclick = () => openFileDialog(i, 'main');
                    }
                    grid.appendChild(slot);
                }
                enableImageReorder(grid, ch);
            }

            // File Inputs
            editorPanel.querySelectorAll('.split-img-slot').forEach(slot => {
                slot.onclick = () => {
                    const idx = parseInt(slot.dataset.index);
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*";
                    input.multiple = true; // [Fix] Enable batch upload
                    input.onchange = (e) => {
                        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                        if (files.length) {
                            // Use global handler for robust batch upload + scroll preservation
                            handleFilesUploaded(files, idx);
                        }
                    };
                    input.click();
                };
            });
            // Custom Inputs
            editorPanel.querySelectorAll('.custom-field-input').forEach(inp => {
                inp.oninput = (e) => {
                    const key = e.target.dataset.key;
                    if (!ch.customData) ch.customData = {};
                    ch.customData[key] = e.target.value;
                    persistState();
                    postToPreview();
                };
            });
            // URL Inputs
            editorPanel.querySelectorAll('.url-input-item').forEach(inp => {
                inp.oninput = (e) => { // ✨ Real-time update
                    const idx = parseInt(e.target.dataset.index);
                    const currentUrlList = getUrlArray(ch.urlListStr, maxImages);
                    currentUrlList[idx] = e.target.value;
                    ch.urlListStr = serializeUrlArray(currentUrlList);
                    persistState();
                    // render(); // Avoid full re-render on every keystroke to prevent losing focus
                    postToPreview();
                }
            });
        }, 0);

    } else {
        // --- STANDARD EDITOR CONTENT (Used by both QL non-grid chapters and ALL other reports) ---
        const currentRackMode = getRackModeFromChapter(ch);
        const currentRackPrompt = getRackPromptFromChapter(ch, currentRackMode);
        editorPanel.innerHTML = `
        <!-- [LEFT COLUMN] Header + Images + Suggestions -->
        <div style="display:flex; flex-direction:column; gap:16px;">
            <!-- Header -->
            <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:0;">
                 <div class="title">${displayTitle}</div>
                 <div class="chips">
                    <button class="btn-ghost" id="btnResetCh">重置</button>
                    <button class="btn-primary" id="btnSaveNext">下一步 ➔</button>
                </div>
            </div>

            <!-- 1. 图片上传 -->
            ${maxImages > 0 ? `
            <div>
                ${hideStylePlanningUploadHints ? '' : `<div class="panel-title" style="font-size:14px; margin-bottom:8px;">图片上传</div>`}
                ${descHtml ? `<div style="margin-bottom:8px;">${descHtml}</div>` : ''}

                <!-- [ ✨ Main vs Detail Split Logic ✨ ] -->
                <!-- [ ✨ Unified Image Grid (Restored) ✨ ] -->
                <div class="panel-title" style="font-size:14px; margin:16px 0 8px;">图片 (最大 ${maxImages} 张)</div>
                <div class="image-grid" id="imgGrid"></div>
                <div class="hint" style="margin-top:8px; margin-bottom:12px;">支持拖拽排序；上传后自动存入图床</div>
                
                ${(ch.id.startsWith('keyItem') && ch.id !== 'keyItemsDirectory') ? `
                    <!-- [Detail Upload UI Removed] -->
                    
                    <!-- [Detail URL UI Removed] -->
                ` : ''}



                <!-- URL 列表 (Always Visible) -->
                <div style="margin-top:12px;">
                    <div style="font-size:12px; color:#666; margin-bottom:8px;">图片 URL 列表</div>
                    <div class="url-box">
                        <div class="url-grid" id="urlInputsGrid">
                            ${urlList.map((url, i) => `
                                    <div class="url-field">
                                        <span class="url-label">${i + 1}</span>
                                        <input class="input url-input-item" data-index="${i}" value="${url}" placeholder="URL...">
                                    </div>
                                    `).join('')}
                        </div>
                        <div class="url-actions" style="margin-top:8px">
                            <button class="btn-mini" id="btnSyncOfficial">同步</button>
                            <button class="btn-mini" id="btnSyncTemp">临时</button>
                            <button class="btn-mini" id="btnClearUrls">清空</button>
                        </div>
                    </div>
                </div>

                ${ch.id === 'recommendation-page' ? `
                <div style="margin-top:12px;">
                    <div style="font-size:12px; color:#666; margin-bottom:8px;">图片跳转链接列表</div>
                    <div class="url-box">
                        <div class="url-grid">
                            ${Array.from({ length: maxImages }, (_, i) => `
                                <div class="url-field">
                                    <span class="url-label">${i + 1}</span>
                                    <input class="input recommendation-link-input-item" data-index="${i}" value="${(ch.customData?.[`rec_link_${i + 1}`]) || ""}" placeholder="https://...">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- [ ✨ New: Composition Panel(Left/Right Panel) ✨ ] -->
            ${(() => {
                if (struct?.id === "ch15") {
                    return `
                    <div style="margin-top:24px; border-top:1px dashed #e5e7eb; padding-top:16px;">
                        <div class="panel-title" style="font-size:14px; margin-bottom:12px;">Brand Images</div>
                        ${['Brand 1', 'Brand 2', 'Brand 3'].map((b, i) => {
                        const key = `b${i + 1}_imgs`;
                        const field = struct.fields.find(f => f.key === key);
                        const defaultVal = field?.default || "";
                        return `
                                <div style="margin-bottom:24px;">
                                    <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:#4b5563;">${b}</div>
                                    <div class="custom-image-list-wrapper" data-key="${key}" data-default="${encodeURIComponent(defaultVal)}"></div>
                                </div>
                            `;
                    }).join('')}
                    </div>
                    `;
                }

                const compGroups = ["Right Panel Composition", "Left Panel Composition"];
                const activeCompGroup = (struct?.fields || []).find(f => compGroups.includes(f.group))?.group;
                if (!activeCompGroup || ['ch8', 'ch9'].includes(ch.id)) return "";

                const compKeys = ['comp_img_bg1', 'comp_img_bg2', 'comp_img_overlay'];

                return `
                <div style="margin-top:24px; border-top:1px dashed #e5e7eb; padding-top:16px;">
                    <div class="panel-title" style="font-size:14px; margin-bottom:8px;">Panel Composition (3 Images: BG1, BG2, Overlay)</div>
                    <div class="image-grid" id="compGrid">
                        ${compKeys.map((key, i) => {
                    const val = ch.customData?.[key] || "";
                    const comfyName = ch.customData?.[key + '_comfy_name'];

                    // Badge Status Logic
                    let badgeContent = "";
                    if (val) {
                        if (val.startsWith("blob:")) {
                            badgeContent = `<div class="slot-badge" style="background:#fbbf24; color:#fff;">Uploading...</div>`;
                        } else if (comfyName) {
                            badgeContent = `<div class="slot-badge" style="background:#4ade80; color:#fff;">Comfy ✔</div>`;
                        } else {
                            badgeContent = `<div class="slot-badge" style="background:#60a5fa; color:#fff;">CDN ✔</div>`;
                        }
                    }

                    return `
                            <div class="img-slot comp-img-slot ${val ? 'has-img' : 'empty'}" data-key="${key}" data-idx="${i}" 
                                 onclick="openCompFileDialog('${key}')" 
                                 style="position:relative;">
                                ${val ? `
                                    <img src="${val}">
                                    <div class="slot-del" onclick="event.stopPropagation(); deleteCompImage('${key}')">×</div>
                                    ${badgeContent}
                                ` : `
                                    <div class="slot-plus">+</div>
                                `}
                            </div>
                         `;
                }).join('')}
                    </div>
                </div>
                `;
            })()}

            <!-- [ ✨ Dynamic Type: Image Fields shifted to Left ✨ ] -->
            ${(() => {
                if (!struct || !struct.fields) return "";
                // [Modified] STRICTLY restrict this Custom Image Field UI to Detail Chapters only
                // This ensures other chapters don't "look like" Single Item Details
                if (!(ch.id.startsWith('patternDetail') || ch.id.startsWith('themeItemDetail') || ch.id.startsWith('brandDetail') || ch.id.startsWith('keyItem'))) return "";
                if (ch.id === 'keyItemsDirectory') return ""; // Exclude Directory itself

                // [Feature] Special Handling for KeyItem Detail Images (Horizontal Grid + Batch)
                // [Feature] Special Handling for KeyItem Detail Images (Horizontal Grid + Batch)
                if (ch.id.startsWith('keyItem')) {
                    let allRowsHtml = "";
                    const allDetailKeys = [];

                    // Generate rows for items 1 through 6
                    for (let g = 1; g <= 6; g++) {
                        const prefix = `detail_${g}`;
                        const keys = [`${prefix}_1`, `${prefix}_2`, `${prefix}_3`];
                        const groupFields = struct.fields.filter(f => keys.includes(f.key));

                        if (!groupFields.length) continue;

                        groupFields.forEach(f => allDetailKeys.push(f.key));

                        const slots = groupFields.map((f, i) => {
                            const val = ch.customData?.[f.key] || "";
                            const hasImg = !!val;
                            const detailIdx = (g - 1) * 3 + i;
                            const detailObj = Array.isArray(ch.detailImages) ? ch.detailImages[detailIdx] : null;
                            const cmsStatus = detailObj && typeof detailObj === "object" ? String(detailObj.cmsStatus || "").trim().toLowerCase() : "";
                            let badgeContent = "";
                            if (hasImg) {
                                const badgeText = imageStatusBadgeText({
                                    uploadStatus: detailObj?.uploadStatus || "",
                                    cmsStatus: cmsStatus || (/^https?:\/\//i.test(val) ? "ok" : "")
                                });
                                if (badgeText) {
                                    badgeContent = `<div class="slot-badge">${badgeText}</div>`;
                                }
                            }
                            // Just show "1", "2", "3" as label instead of full label if needed, or keep full label
                            // User asked for number at start of row, so maybe keep label simple
                            const simpleLabel = f.label.split(' ').pop() || (i + 1);

                            return `
                                <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                                    <div style="width:100%; aspect-ratio:1; background:${hasImg ? '#fff' : '#f9fafb'}; border:1px ${hasImg ? 'solid #e5e7eb' : 'dashed #d1d5db'}; border-radius:6px; position:relative; overflow:hidden; cursor:pointer; display:flex; align-items:center; justify-content:center;"
                                         onclick="document.getElementById('batch_input_${ch.id}_${g}').click()"
                                         title="${f.label} - Click to Batch Upload">
                                         ${hasImg ?
                                    `<img src="${val}" style="width:100%; height:100%; object-fit:cover;">
                                            <div class="slot-del" style="opacity:1; background:rgba(0,0,0,0.5); color:#fff; width:20px; height:20px; line-height:18px; text-align:center; border-radius:50%; top:4px; right:4px;" onclick="event.stopPropagation(); window.deleteCustomDetailImage('${f.key}')">×</div>
                                            ${badgeContent}`
                                    : `<div style="color:#999; font-size:20px;">+</div>`
                                }
                                    </div>
                                    <div style="font-size:12px; color:#666; text-align:center;">${f.label}</div>
                                </div>
                             `;
                        }).join('');

                        allRowsHtml += `
                        <div style="display:flex; gap:16px; align-items:flex-start; margin-bottom:24px;">
                            <div style="font-weight:800; font-size:18px; color:#9CA3AF; padding-top:20px; width:24px; text-align:center;">${g}</div>
                            <div style="flex:1; display:flex; gap:12px;">
                                ${slots}
                            </div>
                            <!-- Unique Input for this Row -->
                            <input type="file" id="batch_input_${ch.id}_${g}" multiple accept="image/*" style="display:none" 
                                    onchange="window.handleBatchDetailChange(event, '${prefix}')">
                        </div>`;
                    }

                    if (!allRowsHtml) return "";

                    return `
                    <div style="margin-top:20px; padding-top:16px; border-top:1px dashed #e5e7eb;">
                         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <div class="panel-title" style="margin:0;">细节图</div>
                            <div class="url-actions" style="margin:0; display:flex; gap:8px;">
                                <button class="btn-mini btn-group-sync" data-keys="${allDetailKeys.join(',')}" title="批量同步该组图片到图床">同步图床</button>
                                <button class="btn-mini btn-group-clear" data-keys="${allDetailKeys.join(',')}" title="清空该组图片">清空</button>
                            </div>
                         </div>
                         ${allRowsHtml}
                    </div>
                    `;
                }

                const compKeys = ['comp_img_bg1', 'comp_img_bg2', 'comp_img_overlay'];
                const brandImgKeys = ['b1_imgs', 'b2_imgs', 'b3_imgs'];

                let leftImageFields = struct.fields.filter(f =>
                    (f.type === 'image' || (f.type === 'image_list' && struct.id !== 'ch15')) &&
                    !compKeys.includes(f.key) &&
                    !brandImgKeys.includes(f.key)
                );



                if (!leftImageFields.length) return "";

                let lastGroup = "";
                return leftImageFields.map((f, i) => {
                    let html = "";
                    if (f.group && f.group !== lastGroup) {
                        const groupFields = struct.fields.filter(field => field.group === f.group);
                        const imageKeys = groupFields.filter(field => field.type === 'image').map(field => field.key);

                        html += `
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #e5e7eb; margin:24px 0 12px 0; padding-bottom:6px;">
                            <div style="font-weight:800; color:#1f2937; font-size:15px;">${f.group}</div>
                            <div class="url-actions" style="margin:0; display:flex; gap:8px;">
                                <button class="btn-mini btn-group-sync" data-keys="${imageKeys.join(',')}" title="批量同步该组图片到图床">同步图床</button>
                                <button class="btn-mini btn-group-clear" data-keys="${imageKeys.join(',')}" title="清空该组图片">清空</button>
                            </div>
                        </div>`;
                        lastGroup = f.group;
                    }

                    html += `
                        <div style="margin-bottom:8px;">
                            <label class="field-label">${f.label}</label>
                            ${f.type === 'image_list'
                            ? `<div class="custom-image-list-wrapper" data-key="${f.key}" data-default="${encodeURIComponent(f.default || '')}"></div>`
                            : `<div class="custom-image-upload-wrapper" data-key="${f.key}" data-default="${encodeURIComponent(f.default || '')}"></div>`
                        }
                        </div>`;
                    return html;
                }).join('');
            })()}
        </div>

        <!-- [RIGHT COLUMN] Content Editor -->
        <div style="background:#fff; padding:16px; border-radius:8px; border:1px solid #eee; align-self:start;">
            <!-- AI Gen & Standard Fields -->
            <div style="${(struct?.id === 'ch15') ? 'display:none;' : ''}">
                <div class="row" style="margin-bottom:10px; flex-wrap:wrap; gap:10px; ${(['themeItemsDirectory', 'keyItemsDirectory', 'patternsDirectory', 'brandsDirectory'].includes(ch.id)) ? 'display:none;' : ''}">
                    <div class="field-label" style="flex:1;">AI 内容生成</div>
                    <div class="status-line" id="statusLine">${ch.status || "未生成"}</div>
                </div>

                ${(['themeItemsDirectory', 'keyItemsDirectory', 'patternsDirectory', 'brandsDirectory', 'recommendation-page'].includes(ch.id)) ? '' : (isThemePlanningRackDisplayChapterId(ch.id) ? `
                    <div style="margin-bottom:12px;">
                        <div style="display:flex; gap:8px; margin-bottom:8px;">
                            <button class="btn-mini" id="rackModeBtnRack" style="padding:6px 14px; border:1px solid; ${currentRackMode === RACK_MODE_RACK ? 'background:#111827;color:#fff;border-color:#111827;' : 'background:#fff;color:#374151;border-color:#d1d5db;'}">自然有机风</button>
                            <button class="btn-mini" id="rackModeBtnFloor" style="padding:6px 14px; border:1px solid; ${currentRackMode === RACK_MODE_FLOOR ? 'background:#111827;color:#fff;border-color:#111827;' : 'background:#fff;color:#374151;border-color:#d1d5db;'}">简约绿植风</button>
                            <button class="btn-mini" id="rackModeBtnWall" style="padding:6px 14px; border:1px solid; ${currentRackMode === RACK_MODE_WALL ? 'background:#111827;color:#fff;border-color:#111827;' : 'background:#fff;color:#374151;border-color:#d1d5db;'}">极简墙面风</button>
                            <button class="btn-mini" id="rackModeBtnMetal" style="padding:6px 14px; border:1px solid; ${currentRackMode === RACK_MODE_METAL ? 'background:#111827;color:#fff;border-color:#111827;' : 'background:#fff;color:#374151;border-color:#d1d5db;'}">金属风</button>
                            <button class="btn-mini" id="rackModeBtnCorner" style="padding:6px 14px; border:1px solid; ${currentRackMode === RACK_MODE_CORNER ? 'background:#111827;color:#fff;border-color:#111827;' : 'background:#fff;color:#374151;border-color:#d1d5db;'}">L型转角空间</button>
                        </div>
                        <div style="margin-bottom:10px;">
                            <label class="field-label" for="rackPromptInput">提示词</label>
                            <textarea id="rackPromptInput" class="textarea-ghost" rows="8" placeholder="当前模式会自动加载预制提示词，可按需修改。"></textarea>
                            <div class="hint" style="margin-top:6px;">点击风格按钮会载入对应预设提示词，你可以在此基础上继续修改。</div>
                        </div>
                        <div style="display:flex; justify-content:flex-start;">
                            <button class="btn-primary" id="genRackImageBtn" style="padding: 10px 24px; font-size:13px;">生成图片</button>
                        </div>
                    </div>
                ` : `
                    <div style="margin-bottom:12px;">
                        <input id="inspirationInput" class="input" style="width:100%; margin-bottom:8px;" placeholder="输入核心灵感 (可选)..." value="${ch.inspiration || ""}">
                        <div style="display:flex; justify-content:flex-start;">
                            <button class="btn-primary" id="genBtn" style="padding: 10px 24px; font-size:13px;">生成文案</button>
                        </div>
                    </div>
                `)}

                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:12px; ${(state.currentReportType === 'quiet_luxury' || isPlanningReportType(state.currentReportType)) ? 'display:none;' : ''}">
                    <div>
                        <label class="field-label">标题</label>
                        <input id="inputTitle" class="input-ghost" style="font-weight:bold;" value="${ch.title || ""}">
                    </div>
                    <div>
                        <label class="field-label">关键词</label>
                        <input id="inputKeywords" class="input-ghost" value="${ch.keywords || ""}">
                    </div>
                    <div>
                        <label class="field-label">摘要</label>
                        <textarea id="inputSummary" class="textarea-ghost" rows="5">${ch.summary || ""}</textarea>
                    </div>
                </div>
            </div>

            <!-- Standard Fields Logic -->
            ${(() => {
                if (!struct || !struct.fields) return "";
                let lastGroup = "";
                const compGroups = ["Right Panel Composition", "Left Panel Composition"];

                let fieldsToRender = struct.fields;
                if (struct.dynamicFields) {
                    const { detailIdPrefix } = struct.dynamicFields;
                    const detailCount = state.chapters.filter(ch =>
                        ch.id && ch.id.startsWith(detailIdPrefix) &&
                        ch.id !== struct.id &&
                        ch.isActive === true
                    ).length;

                    fieldsToRender = struct.fields.filter(f => {
                        if (!f.key.match(/(item|pattern|brand)\d+_/)) return true;
                        const match = f.key.match(/(item|pattern|brand)(\d+)_/);
                        if (!match) return true;
                        const fieldNum = parseInt(match[2]);
                        return fieldNum <= detailCount;
                    });
                }

                return fieldsToRender.map((f, i) => {
                    if (compGroups.includes(f.group)) return "";
                    if (f.type === 'image') return "";
                    if (f.type === 'image_list' && struct.id !== 'ch15') return "";
                    if (struct.id === "ch15" && f.type === 'image_list') return "";

                    let html = "";
                    if (f.group && f.group !== lastGroup) {
                        let displayGroup = f.group;
                        if (struct.id === "ch15" && f.group.startsWith("Brand")) {
                            displayGroup = f.group.split('(')[0].trim();
                        }

                        const groupFields = struct.fields.filter(field => field.group === f.group);
                        const hasImages = groupFields.some(field => field.type === 'image' || field.type === 'image_list');
                        const imageKeys = groupFields.filter(field => field.type === 'image').map(field => field.key);

                        html += `
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #e5e7eb; margin:24px 0 12px 0; padding-bottom:6px;">
                            <div style="font-weight:800; color:#1f2937; font-size:15px;">${displayGroup}</div>
                            ${hasImages ? `
                                <div class="url-actions" style="margin:0; display:flex; gap:8px;">
                                    <button class="btn-mini btn-group-sync" data-keys="${imageKeys.join(',')}" title="批量同步该组图片到图床">同步图床</button>
                                    <button class="btn-mini btn-group-clear" data-keys="${imageKeys.join(',')}" title="清空该组图片">清空</button>
                                </div>
                            ` : ''}
                        </div>`;
                        lastGroup = f.group;
                    }

                    const inspirationPlaceholders = {
                        trend_title: "请在此输入亮点标题（中文）...",
                        trend_subtitle: "请在此输入亮点标题（英文）...",
                        case_title: "请在此输入案例品牌/标题...",
                        c1_title: "请在此输入卡片1标题...",
                        c1_sub: "请在此输入卡片1副标题...",
                        c2_title: "请在此输入卡片2标题...",
                        c2_sub: "请在此输入卡片2副标题...",
                        c3_title: "请在此输入卡片3标题...",
                        c3_sub: "请在此输入卡片3副标题...",
                        c4_title: "请在此输入卡片4标题...",
                        c4_sub: "请在此输入卡片4副标题..."
                    };
                    let fallbackPlaceholder = "";
                    if (struct?.id === "new-inspiration") {
                        fallbackPlaceholder = inspirationPlaceholders[f.key] || "";
                    } else if (struct?.id?.startsWith("keyItem") && struct.id !== "keyItemsDirectory") {
                        if (f.key === "feature1") fallbackPlaceholder = "请在此输入关键特性1...";
                        else if (f.key === "feature2") fallbackPlaceholder = "请在此输入关键特性2...";
                        else if (f.key === "feature3") fallbackPlaceholder = "请在此输入关键特性3...";
                        else {
                            const brandMatch = /^img(\d+)_brand$/.exec(f.key || "");
                            if (brandMatch) fallbackPlaceholder = `请在此输入品牌标注${brandMatch[1]}...`;
                        }
                    } else if (struct?.id?.startsWith("patternDetail") || struct?.id?.startsWith("themeItemDetail")) {
                        if (f.key === "page_title") fallbackPlaceholder = "请在此输入页面标题...";
                        else if (f.key === "page_en_title") fallbackPlaceholder = "请在此输入英文标题...";
                        else if (f.key === "page_intro") fallbackPlaceholder = "请在此输入简介...";
                        else if (f.key === "kw1") fallbackPlaceholder = "请在此输入关键词1...";
                        else if (f.key === "kw2") fallbackPlaceholder = "请在此输入关键词2...";
                        else if (f.key === "kw3") fallbackPlaceholder = "请在此输入关键词3...";
                        else if (f.key === "app1") fallbackPlaceholder = "请在此输入应用方向1...";
                        else if (f.key === "app2") fallbackPlaceholder = "请在此输入应用方向2...";
                        else if (f.key === "app3") fallbackPlaceholder = "请在此输入应用方向3...";
                        else {
                            const brandMatch = /^img(\d+)_brand$/.exec(f.key || "");
                            if (brandMatch) fallbackPlaceholder = `请在此输入品牌标注${brandMatch[1]}...`;
                        }
                    } else if (struct?.id?.startsWith("brandDetail")) {
                        if (f.key === "season") fallbackPlaceholder = "请在此输入季节/系列...";
                        else if (f.key === "page_title") fallbackPlaceholder = "请在此输入品牌名称...";
                        else if (f.key === "page_intro") fallbackPlaceholder = "请在此输入品牌简介...";
                        else if (f.key === "concept_desc") fallbackPlaceholder = "请在此输入产品概念...";
                    } else if (struct?.id === "style-page") {
                        if (f.key === "page_title") fallbackPlaceholder = "请在此输入页面标题...";
                        else if (f.key === "page_en_title") fallbackPlaceholder = "请在此输入英文标题...";
                        else if (f.key === "summary") fallbackPlaceholder = "请在此输入摘要...";
                        else {
                            const inspirationMatch = /^insp(\d+)_title$/.exec(f.key || "");
                            const itemMatch = /^item(\d+)_title$/.exec(f.key || "");
                            const patternMatch = /^pattern(\d+)_title$/.exec(f.key || "");
                            if (inspirationMatch) fallbackPlaceholder = `请在此输入灵感标题${inspirationMatch[1]}...`;
                            else if (itemMatch) fallbackPlaceholder = `请在此输入单品标题${itemMatch[1]}...`;
                            else if (patternMatch) fallbackPlaceholder = `请在此输入图案标题${patternMatch[1]}...`;
                        }
                    } else if (struct?.id === "conclusion-page") {
                        if (f.key === "page_title") fallbackPlaceholder = "请在此输入页面标题...";
                        else {
                            const summaryTitleMatch = /^summary_title_(\d+)$/.exec(f.key || "");
                            const summaryDescMatch = /^summary_desc_(\d+)$/.exec(f.key || "");
                            if (summaryTitleMatch) fallbackPlaceholder = `请在此输入要点${summaryTitleMatch[1]}标题...`;
                            else if (summaryDescMatch) fallbackPlaceholder = `请在此输入要点${summaryDescMatch[1]}描述...`;
                        }
                    }
                    const fieldPlaceholder = f.placeholder || fallbackPlaceholder;
                    const isReadOnlyField = !!f.readOnly;
                    const readOnlyVal = isReadOnlyField ? getReadOnlyFieldValue(f) : "";
                    const hasStoredVal = !isReadOnlyField && ch.customData && ch.customData[f.key] !== undefined;
                    const usePlaceholder = !!fieldPlaceholder;
                    const val = isReadOnlyField
                        ? readOnlyVal
                        : (hasStoredVal ? ch.customData[f.key] : (usePlaceholder ? "" : (f.default || "")));
                    const placeholderAttr = fieldPlaceholder ? ` placeholder="${String(fieldPlaceholder).replace(/"/g, '&quot;')}"` : "";
                    const readOnlyAttr = isReadOnlyField ? ' readonly aria-readonly="true"' : "";
                    const inputClassName = isReadOnlyField ? "input-ghost" : "input-ghost custom-field-input";
                    const textareaClassName = isReadOnlyField ? "textarea-ghost" : "textarea-ghost custom-field-input";
                    const inputStyle = isReadOnlyField
                        ? 'width:100%; background:#f8fafc; color:#475569; border-style:dashed;'
                        : 'width:100%;';
                    html += `
                        <div style="margin-bottom:8px;">
                            <label class="field-label">${f.label}</label>
                            ${f.type === 'textarea'
                            ? `<textarea class="${textareaClassName}" data-key="${f.key}" rows="3"${placeholderAttr}${readOnlyAttr} style="${inputStyle}">${val}</textarea>`
                            : `<input class="${inputClassName}" data-key="${f.key}" value="${val}"${placeholderAttr}${readOnlyAttr} style="${inputStyle}">`
                        }
                        </div>`;
                    return html;
                }).join('');
            })()}
        </div>
        `;

        // [ ✨ New: Global Helper Funcs for Composition Panel ✨ ]
        // These are defined globally so they can be referenced directly in HTML onclick/ondrop attributes
        // [ ✨ Cleaned Up: Removed duplicate local function definitions ✨ ]
        // The previous definitions of window.handleCompImageUpload and window.openCompFileDialog
        // inside the setTimeout block have been removed because:
        // 1. They were causing scope conflicts/shadowing with the global functions
        // 2. We now have a single source of truth in the global function definitions above (Lines 968-1016)
        // 3. The HTML attributes (onclick="openCompFileDialog(i)") will now correctly resolve to the global function.


        // [Init Helpers for Standard Editor]
        setTimeout(() => {
            // [Fix] Bind events for custom fields in Standard Editor
            editorPanel.querySelectorAll('.custom-field-input').forEach(inp => {
                inp.oninput = (e) => {
                    const key = e.target.dataset.key;
                    if (!ch.customData) ch.customData = {};
                    ch.customData[key] = e.target.value;
                    persistState();
                    if (window.postToPreview) window.postToPreview();
                };
            });

            // Removed duplicate local defs for openCompFileDialog etc. to avoid confusion
            // They are now Global functions triggered by onclick HTML attributes.

            // [New: Detail Image Slots Handlers]
            if (ch.id.startsWith('keyItem') && ch.id !== 'keyItemsDirectory') {
                const detailSlots = editorPanel.querySelectorAll('.detail-img-slot');
                detailSlots.forEach(slot => {
                    const key = slot.dataset.key;

                    // Click to upload
                    if (!slot.classList.contains('has-img')) {
                        slot.onclick = () => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Show preview
                                if (!ch.customData) ch.customData = {};
                                const blobUrl = URL.createObjectURL(file);
                                ch.customData[key] = blobUrl;
                                render();

                                // Upload to CMS
                                try {
                                    const cdnUrl = await uploadFileToCMS(file);
                                    if (cdnUrl) {
                                        ch.customData[key] = cdnUrl;
                                        URL.revokeObjectURL(blobUrl);
                                        persistState();
                                        postToPreview();
                                        // Re-render to update badge
                                        render();
                                    }
                                } catch (err) {
                                    console.error('Upload failed:', err);
                                    URL.revokeObjectURL(blobUrl);
                                    delete ch.customData[key];
                                    render();
                                    alert('上传失败');
                                }
                            };
                            input.click();
                        };
                    } else {
                        // Delete button
                        const delBtn = slot.querySelector('.slot-del');
                        if (delBtn) {
                            delBtn.onclick = (e) => {
                                e.stopPropagation();
                                if (confirm('确认删除此细节图？')) {
                                    if (ch.customData?.[key]) {
                                        const oldVal = ch.customData[key];
                                        if (oldVal.startsWith('blob:')) URL.revokeObjectURL(oldVal);
                                        delete ch.customData[key];
                                        persistState();
                                        postToPreview();
                                        render();
                                    }
                                }
                            };
                        }
                    }
                });
            }

            const listWrappers = editorPanel.querySelectorAll(".custom-image-list-wrapper");
            listWrappers.forEach(wrap => {
                const key = wrap.dataset.key;
                const defEncoded = wrap.dataset.default;
                const def = decodeURIComponent(defEncoded);
                const limit = parseInt(wrap.dataset.limit) || 8;
                initCustomImageList(wrap, ch, key, def, limit);
            });

            const imageWrappers = editorPanel.querySelectorAll(".custom-image-upload-wrapper");
            imageWrappers.forEach(wrap => {
                const key = wrap.dataset.key;
                const defEncoded = wrap.dataset.default;
                const def = decodeURIComponent(defEncoded);
                initCustomImageUpload(wrap, ch, key, def);
            });

            // Re-bind Group Action Events
            editorPanel.querySelectorAll(".btn-group-sync").forEach(btn => {
                btn.onclick = async () => {
                    const keys = btn.dataset.keys.split(',').filter(k => k);
                    if (!keys.length) return;

                    const toSync = keys.filter(k => {
                        const val = ch.customData?.[k];
                        return val && (val.startsWith('blob:') || looksLikeTemporaryUrls(val));
                    });

                    if (!toSync.length) {
                        alert("该组暂无需要同步的临时图片");
                        return;
                    }

                    btn.disabled = true;
                    const originalText = btn.innerText;
                    btn.innerText = "同步中...";

                    try {
                        for (const key of toSync) {
                            const val = ch.customData[key];
                            const response = await fetch(val);
                            const blob = await response.blob();
                            const file = new File([blob], `${key}.jpg`, { type: blob.type });
                            await handleCustomImageUploadBatch(file, key);
                        }
                    } catch (err) {
                        alert("批量同步失败: " + err.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerText = originalText;
                    }
                };
            });

            editorPanel.querySelectorAll(".btn-group-clear").forEach(btn => {
                btn.onclick = () => {
                    if (!confirm("确定清空该组所有图片吗？")) return;
                    const keys = btn.dataset.keys.split(',').filter(k => k);
                    keys.forEach(k => {
                        if (ch.customData) {
                            delete ch.customData[k];
                            delete ch.customData[k + '_comfy_name'];
                        }
                    });
                    persistState();
                    render();
                    if (window.postToPreview) window.postToPreview();
                };
            });

            // Re-bind Standard Events (PostToPreview is safe to call even if iframe absent)
            const inspInput = document.getElementById("inspirationInput");
            if (inspInput) inspInput.oninput = (e) => { ch.inspiration = e.target.value; persistState(); postToPreview(); };
            const currentChapterId = ch.id || `chapter-${state.currentIndex + 1}`;

            // [Quiet Luxury Bindings]
            const qlGenBtn = document.getElementById("ql_genBtn");
            if (qlGenBtn) {
                qlGenBtn.onclick = () => safeGenerate(qlGenBtn, 'standard');
                syncGenerateButtonLoading(qlGenBtn, currentChapterId, 'standard');
            }

            // Standard Generation Button (Right Panel)
            const genBtn = document.getElementById("genBtn");
            if (genBtn) {
                genBtn.onclick = () => safeGenerate(genBtn, 'standard');
                syncGenerateButtonLoading(genBtn, currentChapterId, 'standard');
            }

            const setRackMode = async (mode) => {
                if (!isThemePlanningRackDisplayChapterId(ch.id)) return;
                const normalizedMode = normalizeRackMode(mode);
                const currentMode = getRackModeFromChapter(ch);
                if (normalizedMode !== currentMode) {
                    setRackModeForChapter(ch, normalizedMode);
                }
                await applyRackPromptTemplateToChapter(ch, normalizedMode, { force: true });
                render();
            };
            const rackModeBtnRack = document.getElementById("rackModeBtnRack");
            if (rackModeBtnRack) {
                rackModeBtnRack.onclick = () => { void setRackMode(RACK_MODE_RACK); };
            }
            const rackModeBtnFloor = document.getElementById("rackModeBtnFloor");
            if (rackModeBtnFloor) {
                rackModeBtnFloor.onclick = () => { void setRackMode(RACK_MODE_FLOOR); };
            }
            const rackModeBtnWall = document.getElementById("rackModeBtnWall");
            if (rackModeBtnWall) {
                rackModeBtnWall.onclick = () => { void setRackMode(RACK_MODE_WALL); };
            }
                const rackModeBtnMetal = document.getElementById("rackModeBtnMetal");
                if (rackModeBtnMetal) {
                    rackModeBtnMetal.onclick = () => { void setRackMode(RACK_MODE_METAL); };
                }
                const rackModeBtnCorner = document.getElementById("rackModeBtnCorner");
                if (rackModeBtnCorner) {
                    rackModeBtnCorner.onclick = () => { void setRackMode(RACK_MODE_CORNER); };
                }
            const rackPromptInput = document.getElementById("rackPromptInput");
            if (rackPromptInput) {
                rackPromptInput.value = currentRackPrompt;
                rackPromptInput.oninput = (event) => {
                    setRackPromptForChapter(ch, getRackModeFromChapter(ch), event.target.value);
                };
                if (!String(rackPromptInput.value || "").trim()) {
                    rackPromptInput.placeholder = "正在加载预制提示词...";
                    void getRackPromptTemplate(currentRackMode).then((defaultPrompt) => {
                        const latestChapter = state.chapters[state.currentIndex];
                        if (latestChapter !== ch || !isThemePlanningRackDisplayChapterId(ch.id)) return;
                        if (String(rackPromptInput.value || "").trim()) return;
                        if (!defaultPrompt) {
                            rackPromptInput.placeholder = "可输入当前模式生成提示词...";
                            return;
                        }
                        rackPromptInput.value = defaultPrompt;
                        setRackPromptForChapter(ch, getRackModeFromChapter(ch), defaultPrompt);
                        rackPromptInput.placeholder = "当前模式会自动加载预制提示词，可按需修改。";
                    });
                }
            }
            const genRackImageBtn = document.getElementById("genRackImageBtn");
            if (genRackImageBtn) {
                genRackImageBtn.onclick = () => generateRackColorDisplayImage(genRackImageBtn);
                syncGenerateButtonLoading(genRackImageBtn, currentChapterId, RACK_IMAGE_SOURCE);
            }

            // Composition Generation Button (Right Panel)
            const compGenBtn = document.getElementById("genBtn_comp");
            if (compGenBtn) {
                compGenBtn.onclick = () => safeGenerate(compGenBtn, 'composition');
                syncGenerateButtonLoading(compGenBtn, currentChapterId, 'composition');
            }

            const qlInsp = document.getElementById("ql_inspirationInput");
            if (qlInsp) qlInsp.oninput = (e) => { ch.inspiration = e.target.value; persistState(); postToPreview(); };

            // [Composition Inspiration Binding]
            const compInsp = document.getElementById("inspirationInput_comp");
            if (compInsp) compInsp.oninput = (e) => {
                if (!ch.customData) ch.customData = {};
                ch.customData.comp_inspiration = e.target.value;
                persistState();
            };

            // [Brand 1-3 Bindings (Chapter 15)]
            [1, 2, 3].forEach(i => {
                const bInsp = document.getElementById(`inspirationInput_brand${i}`);
                if (bInsp) bInsp.oninput = (e) => {
                    if (!ch.customData) ch.customData = {};
                    ch.customData[`brand${i}_inspiration`] = e.target.value;
                    persistState();
                };
                const bBtn = document.getElementById(`genBtn_brand${i}`);
                if (bBtn) {
                    bBtn.onclick = () => safeGenerate(bBtn, `brand${i}`);
                    syncGenerateButtonLoading(bBtn, currentChapterId, `brand${i}`);
                }
            });

            const inputTitle = document.getElementById("inputTitle");
            if (inputTitle) inputTitle.oninput = (e) => { ch.title = e.target.value; persistState(); postToPreview(); };

            const inputKeywords = document.getElementById("inputKeywords");
            if (inputKeywords) inputKeywords.oninput = (e) => { ch.keywords = e.target.value; persistState(); postToPreview(); };

            const inputSummary = document.getElementById("inputSummary");
            if (inputSummary) inputSummary.oninput = (e) => { ch.summary = e.target.value; persistState(); postToPreview(); };

            document.querySelectorAll(".custom-field-input").forEach(inp => {
                inp.oninput = (e) => {
                    const key = e.target.dataset.key;
                    if (!ch.customData) ch.customData = {};
                    ch.customData[key] = e.target.value;
                    if (key && key.endsWith('_hex')) {
                        const previewBox = document.querySelector(`.color-preview-box[data-related-key="${key}"]`);
                        if (previewBox) previewBox.style.backgroundColor = e.target.value;
                    }
                    persistState();
                    postToPreview();
                }
            });

            // URL inputs in standard mode
            document.querySelectorAll(".url-input-item").forEach(inp => {
                inp.onchange = (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    const arr = getUrlArray(ch.urlListStr, maxImages);
                    arr[idx] = e.target.value.trim();
                    ch.urlListStr = serializeUrlArray(arr);
                    persistState();
                    const chip = e.target.previousElementSibling;
                    if (chip) chip.textContent = arr[idx] ? '✅' : '⚪';
                    postToPreview();
                }
            });

            document.querySelectorAll(".recommendation-link-input-item").forEach(inp => {
                inp.oninput = (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    if (!Number.isFinite(idx)) return;
                    if (!ch.customData) ch.customData = {};
                    const key = `rec_link_${idx + 1}`;
                    const val = (e.target.value || "").trim();
                    if (val) ch.customData[key] = val;
                    else delete ch.customData[key];
                    persistState();
                    postToPreview();
                };
            });

            // [ ✨ New: Render Both Grids ✨ ]
            // [ ✨ New: Render Unified Grid ✨ ]
            const unifiedGrid = document.getElementById("imgGrid");
            if (unifiedGrid) {
                renderUnifiedImageGrid(unifiedGrid, ch, maxImages);
            }

            // [ ✨ Render Detail Grid Removed ✨ ]
            // const detailGrid = document.getElementById("detailImgGrid");
            // if (detailGrid) {
            //     renderDetailImageGrid(detailGrid, ch, 18);
            // }

            // [ ✨ New: Detail Events ✨ ]
            if (ch.id.startsWith('keyItem') && ch.id !== 'keyItemsDirectory') {
                // URL Inputs
                document.querySelectorAll(".detail-url-input-item").forEach(inp => {
                    inp.onchange = (e) => {
                        const idx = parseInt(e.target.dataset.index);
                        const val = e.target.value.trim();

                        // Update URL Array
                        if (!ch.detailImageUrls) ch.detailImageUrls = [];
                        while (ch.detailImageUrls.length <= idx) ch.detailImageUrls.push("");
                        ch.detailImageUrls[idx] = val;
                        setDetailUrlValue(ch, idx, val);

                        // Update Image Object
                        if (!ch.detailImages) ch.detailImages = [];
                        while (ch.detailImages.length <= idx) ch.detailImages.push(null);

                        if (val) {
                            ch.detailImages[idx] = { preview: val, url: val, cmsStatus: "ok" };
                        } else {
                            ch.detailImages[idx] = null;
                        }

                        persistState();
                        render(); // Re-render to update grid
                        postToPreview();
                    };
                });

                // Sync Button
                const btnSyncD = document.getElementById("btnSyncDetail");
                if (btnSyncD) {
                    btnSyncD.onclick = async () => {
                        // Find blobs
                        if (!ch.detailImages) return;
                        btnSyncD.textContent = "Syncing...";
                        try {
                            for (let i = 0; i < ch.detailImages.length; i++) {
                                const img = ch.detailImages[i];
                                if (img && img.url && img.url.startsWith("blob:")) {
                                    const res = await fetch(img.url);
                                    const blob = await res.blob();
                                    const file = new File([blob], "detail.jpg", { type: blob.type });
                                    const cdnUrl = await uploadFileToCMS(file);
                                    if (cdnUrl) {
                                        img.url = cdnUrl;
                                        img.cmsStatus = "ok";
                                        ch.detailImageUrls[i] = cdnUrl;
                                        setDetailUrlValue(ch, i, cdnUrl);
                                    }
                                }
                            }
                            persistState();
                            render();
                        } catch (e) { console.error(e); alert("Sync failed"); }
                        btnSyncD.textContent = "同步";
                    };
                }

                // Clear Button
                const btnClearD = document.getElementById("btnClearDetail");
                if (btnClearD) {
                    btnClearD.onclick = () => {
                        if (confirm("Clear all detail images?")) {
                            ch.detailImages = [];
                            ch.detailImageUrls = [];
                            persistState();
                            render();
                            postToPreview();
                        }
                    };
                }
            }

            // Legacy placeholders removed.            // [ ✨ New: Composition Panel Events ✨ ]
            const compGrid = document.getElementById("compGrid");
            if (compGrid) {
                // Slot Click & Drop
                compGrid.querySelectorAll(".comp-img-slot").forEach(slot => {
                    const key = slot.dataset.key;



                    slot.onclick = (e) => {
                        // Delete logic
                        if (e.target.classList.contains("slot-del")) {
                            e.stopPropagation();
                            if (!ch.customData) ch.customData = {};
                            delete ch.customData[key];
                            // Also clear Comfy name if exists
                            delete ch.customData[key + '_comfy_name'];

                            persistState();
                            render();
                            postToPreview();
                            return;
                        }

                        // Open File Dialog
                        openCompFileDialog(key);
                    };

                    // Drag & Drop
                    slot.ondrop = (e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
                        if (files.length) handleCompImageUpload(files[0], key);
                    };
                    slot.ondragover = e => { e.preventDefault(); slot.classList.add("drag-over"); };
                    slot.ondragleave = () => slot.classList.remove("drag-over");
                });
            }

            // [ ✨ URL Sync Actions ✨ ]
            const btnSyncOf = document.getElementById("btnSyncOfficial");
            if (btnSyncOf) btnSyncOf.onclick = () => {
                syncFormalImageUrls(ch, { force: true });
                persistState();
                render();
            };

            const btnSyncTemp = document.getElementById("btnSyncTemp");
            if (btnSyncTemp) btnSyncTemp.onclick = () => {
                // Special case for temp: sync all current preview/urls including blobs
                const all = [
                    ...(ch.mainImages || []).map(img => img ? (img.preview || img.url || "") : "").filter(Boolean),
                    ...(ch.detailImages || []).map(img => img ? (img.preview || img.url || "") : "").filter(Boolean)
                ];
                ch.urlListStr = all.join("\n");
                persistState();
                render();
            };

            const btnClearUrls = document.getElementById("btnClearUrls");
            if (btnClearUrls) btnClearUrls.onclick = () => {
                ch.urlListStr = "";
                persistState();
                render();
            };

            // Comp URL Inputs
            document.querySelectorAll(".comp-url-input").forEach(inp => {
                inp.onchange = (e) => {
                    const key = inp.dataset.key;
                    if (!ch.customData) ch.customData = {};
                    ch.customData[key] = e.target.value;
                    persistState();
                    render(); // Update image grid
                    postToPreview();
                }
            });

        }, 0);
    }




    // [ ✨ Unified Grid Renderer with Drag Sort & Detail Sync ✨ ]
function getStylePlanningUploadSlotLabel(ch, idx, limit) {
    if (!ch || !ch.id) return "";
    if (ch.id === "style-outfit-page" && idx === 0) return "背景";
    if (ch.id === "color-direction-page" && idx >= Math.max(0, limit - 2)) return "上层PNG图";
    if (isThemePlanningGroupStylingChapterId(ch.id)) {
        if (idx >= 0 && idx <= 2) return `左侧背景图 ${idx + 1}`;
        if (idx === 3) return "左侧上层PNG";
    }
    return "";
}

function appendPlanningUploadSlotLabel(slot, label) {
    if (!slot || !label) return;
    const chip = document.createElement("div");
    chip.textContent = label;
    chip.style.position = "absolute";
    chip.style.left = "8px";
    chip.style.right = "8px";
    chip.style.bottom = "8px";
    chip.style.padding = "4px 6px";
    chip.style.borderRadius = "999px";
    chip.style.background = "rgba(255,255,255,0.88)";
    chip.style.color = "#4b5563";
    chip.style.fontSize = "10px";
    chip.style.fontWeight = "700";
    chip.style.lineHeight = "1.2";
    chip.style.letterSpacing = "0.03em";
    chip.style.textAlign = "center";
    chip.style.pointerEvents = "none";
    chip.style.zIndex = "2";
    slot.appendChild(chip);
}

function renderUnifiedImageGrid(grid, ch, limit) {
        if (!grid) return;
        grid.innerHTML = "";
        const INTERNAL_DRAG_MIME = "application/x-codex-slot-index";

        const isKeyItemDetail = !!(ch && typeof ch.id === 'string' && ch.id.startsWith('keyItem') && ch.id !== 'keyItemsDirectory');
        const isStylePlanning = !!(state && isPlanningReportType(state.currentReportType));
        const useFixedMainSlots = isKeyItemDetail || isStylePlanning;

        // Fixed-slot mode: delete clears only current slot (no forward shift).
        if (useFixedMainSlots) {
            if (!Array.isArray(ch.mainImages)) ch.mainImages = Array(limit).fill(null);
            while (ch.mainImages.length < limit) ch.mainImages.push(null);
            if (!Array.isArray(ch.mainImageUrls)) ch.mainImageUrls = Array(limit).fill("");
            while (ch.mainImageUrls.length < limit) ch.mainImageUrls.push("");
        } else {
            if (!Array.isArray(ch.images)) ch.images = [];
        }

        const primaryImages = useFixedMainSlots ? ch.mainImages : ch.images;

        for (let i = 0; i < limit; i++) {
            const imgObj = primaryImages[i];
            const slot = document.createElement("div");
            slot.className = "img-slot" + (imgObj ? " has-img" : " empty");
            slot.dataset.index = i;

            // [Drag Sort]
            slot.draggable = !!imgObj;
            slot.ondragstart = (e) => {
                if (!imgObj) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.effectAllowed = 'move';
                try { e.dataTransfer.setData(INTERNAL_DRAG_MIME, String(i)); } catch (_) { }
                // Firefox compatibility fallback
                e.dataTransfer.setData('text/plain', `codex-slot:${i}`);
                slot.classList.add('dragging');
            };
            slot.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                slot.classList.add('drag-over');
            };
            slot.ondragleave = () => slot.classList.remove('drag-over');
            slot.ondragend = () => {
                slot.classList.remove('dragging');
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            };

            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                // Prefer drag/move detection first.
                let srcIdx = NaN;
                try {
                    const rawInternal = e.dataTransfer.getData(INTERNAL_DRAG_MIME);
                    if (rawInternal !== '') srcIdx = parseInt(rawInternal, 10);
                } catch (_) { }
                if (Number.isNaN(srcIdx)) {
                    const rawTxt = e.dataTransfer.getData('text/plain') || '';
                    const m = rawTxt.match(/(?:^codex-slot:)?(\d+)$/);
                    if (m) srcIdx = parseInt(m[1], 10);
                }

                // Internal Sort Drop
                const destIdx = i;

                if (!isNaN(srcIdx) && srcIdx !== destIdx) {
                    if (useFixedMainSlots) {
                        // Fixed main slots: move by swapping slots, never compact.
                        const tM = ch.mainImages[srcIdx];
                        ch.mainImages[srcIdx] = ch.mainImages[destIdx];
                        ch.mainImages[destIdx] = tM;

                        if (Array.isArray(ch.mainImageUrls)) {
                            const tU = ch.mainImageUrls[srcIdx];
                            ch.mainImageUrls[srcIdx] = ch.mainImageUrls[destIdx];
                            ch.mainImageUrls[destIdx] = tU;
                        }
                    } else {
                        const temp = ch.images[srcIdx];
                        ch.images[srcIdx] = ch.images[destIdx];
                        ch.images[destIdx] = temp;

                        if (Array.isArray(ch.mainImages)) {
                            const tM = ch.mainImages[srcIdx];
                            ch.mainImages[srcIdx] = ch.mainImages[destIdx];
                            ch.mainImages[destIdx] = tM;
                        }
                        if (Array.isArray(ch.mainImageUrls)) {
                            const tU = ch.mainImageUrls[srcIdx];
                            ch.mainImageUrls[srcIdx] = ch.mainImageUrls[destIdx];
                            ch.mainImageUrls[destIdx] = tU;
                        }
                    }

                    swapSlottedImageBrandLabels(ch, srcIdx, destIdx);

                    // Swap Detail Groups (3 items each)
                    // Only if detailImages exist (Key Items)
                    if (ch.detailImages) {
                        for (let k = 0; k < 3; k++) {
                            const sD = srcIdx * 3 + k;
                            const dD = destIdx * 3 + k;

                            // Swap Image Objs
                            const tempD = ch.detailImages[sD];
                            ch.detailImages[sD] = ch.detailImages[dD];
                            ch.detailImages[dD] = tempD;

                            // Swap URLs
                            if (ch.detailImageUrls) {
                                const tempU = ch.detailImageUrls[sD];
                                ch.detailImageUrls[sD] = ch.detailImageUrls[dD];
                                ch.detailImageUrls[dD] = tempU;
                            }
                        }
                    }

                    persistState();
                    render();
                    if (window.postToPreview) window.postToPreview();
                    return;
                }

                // External file drop
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                    if (files.length) handleFilesUploaded(files, i);
                }
            };

            if (imgObj) {
                const img = document.createElement("img");
                img.src = imgObj.preview || imgObj.url || "";
                img.draggable = false;
                slot.appendChild(img);

                const del = document.createElement("div");
                del.className = "slot-del"; del.textContent = "×";
                del.onclick = (e) => {
                    e.stopPropagation();
                    if (useFixedMainSlots) {
                        // Fixed slots: clear only current slot, no forward shift.
                        ch.mainImages[i] = null;
                        if (Array.isArray(ch.mainImageUrls)) ch.mainImageUrls[i] = "";
                        if (Array.isArray(ch.images)) ch.images[i] = null;
                        clearPatternDetailBrandLabel(ch, i);
                    } else {
                        ch.images.splice(i, 1);
                        if (ch.mainImages) ch.mainImages = ch.images.slice(0, limit); // approx

                        if (ch.detailImages) {
                            ch.detailImages.splice(i * 3, 3);
                            if (ch.detailImageUrls) ch.detailImageUrls.splice(i * 3, 3);
                            while (ch.detailImages.length < 18) ch.detailImages.push(null);
                            while (ch.detailImageUrls && ch.detailImageUrls.length < 18) ch.detailImageUrls.push("");
                        }
                    }

                    persistState();
                    render();
                    postToPreview();
                };
                slot.appendChild(del);

                const badge = document.createElement("div");
                badge.className = "slot-badge";
                badge.textContent = imageStatusBadgeText(imgObj);
                slot.appendChild(badge);
                appendPlanningUploadSlotLabel(slot, getStylePlanningUploadSlotLabel(ch, i, limit));

                // Click to Replace
                slot.title = "点击替换 / 拖拽排序";
                slot.onclick = () => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = "image/*";
                    inp.onchange = (e) => {
                        if (e.target.files[0]) handleFilesUploaded([e.target.files[0]], i);
                    };
                    inp.click();
                };
            } else {
                slot.innerHTML = '<div class="slot-plus">+</div>';
                const specialLabel = getStylePlanningUploadSlotLabel(ch, i, limit);
                if (specialLabel) {
                    const plusEl = slot.querySelector('.slot-plus');
                    if (plusEl) {
                        plusEl.textContent = specialLabel;
                        plusEl.style.fontSize = '14px';
                        plusEl.style.fontWeight = '800';
                        plusEl.style.color = 'var(--border-medium)';
                        plusEl.style.letterSpacing = '0.04em';
                        plusEl.style.textAlign = 'center';
                        plusEl.style.padding = '0 8px';
                        plusEl.style.textShadow = 'none';
                    }
                }
                // Click to Add
                slot.onclick = () => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = "image/*";
                    inp.multiple = true;
                    inp.onchange = (e) => {
                        const files = Array.from(e.target.files);
                        if (files.length) handleFilesUploaded(files, i); // Insert at i
                    };
                    inp.click();
                };
            }
            grid.appendChild(slot);
        }
    }

    // [New: Detail Grid Renderer]
    function renderDetailImageGrid(grid, ch, limit) {
        if (!grid) return;
        grid.innerHTML = "";

        // Ensure array alignment (fill with nulls if sparse)
        if (!ch.detailImages) ch.detailImages = [];

        for (let i = 0; i < limit; i++) {
            const imgObj = ch.detailImages[i];
            const slot = document.createElement("div");
            slot.className = "img-slot" + (imgObj ? " has-img" : " empty");
            slot.dataset.index = i;

            // Visual Grouping: Add gap every 3 items
            if (i > 0 && i % 3 === 0) slot.style.marginLeft = "8px"; // Extra separation for groups

            // [ ✨ New: Add Index Label (e.g. 1-1, 1-2) ✨ ]
            const mainIdx = Math.floor(i / 3) + 1;
            const subIdx = (i % 3) + 1;

            // Create Label
            const label = document.createElement("div");
            label.innerText = `${mainIdx}-${subIdx}`;
            label.style.position = "absolute";
            label.style.top = "2px";
            label.style.left = "2px";
            label.style.fontSize = "10px";
            label.style.fontFamily = "monospace";
            label.style.background = "rgba(255,255,255,0.6)";
            label.style.color = "#333";
            label.style.padding = "1px 3px";
            label.style.borderRadius = "2px";
            label.style.pointerEvents = "none";
            label.style.zIndex = "10";
            slot.appendChild(label);

            if (imgObj) {
                const img = document.createElement("img");
                img.src = imgObj.preview || imgObj.url || "";
                slot.appendChild(img);

                const del = document.createElement("div");
                del.className = "slot-del"; del.textContent = "×";
                del.onclick = (e) => {
                    e.stopPropagation();
                    // Use null to preserve slot alignment (Fixed Slots)
                    ch.detailImages[i] = null;
                    if (ch.detailImageUrls && ch.detailImageUrls[i]) ch.detailImageUrls[i] = "";
                    persistState();
                    render();
                    if (window.postToPreview) window.postToPreview();
                };
                slot.appendChild(del);

                const badge = document.createElement("div");
                badge.className = "slot-badge";
                badge.textContent = imageStatusBadgeText(imgObj);
                slot.appendChild(badge);

                slot.title = "点击替换 (Details 1-3 for Main 1, etc.)";
                slot.onclick = () => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = "image/*";
                    inp.onchange = (e) => {
                        let files = Array.from(e.target.files);
                        // [Boundary Check] Limit to current group end
                        const groupEnd = Math.floor(i / 3) * 3 + 2;
                        const maxCount = groupEnd - i + 1;
                        if (files.length > maxCount) files = files.slice(0, maxCount);

                        if (files.length) handleFilesUploaded(files, i, 'detail');
                    };
                    inp.click();
                };
            } else {
                slot.innerHTML = '<div class="slot-plus" style="font-size:16px;">+</div>';
                // Show hint for what this slot is
                const mainIdx = Math.floor(i / 3) + 1;
                const subIdx = (i % 3) + 1;
                slot.title = `Upload Detail ${subIdx} for Main Item ${mainIdx}`;

                slot.onclick = () => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = "image/*";
                    inp.multiple = true;
                    inp.onchange = (e) => {
                        let files = Array.from(e.target.files);
                        // [Boundary Check] Limit to current group end
                        const groupEnd = Math.floor(i / 3) * 3 + 2;
                        const maxCount = groupEnd - i + 1;
                        if (files.length > maxCount) files = files.slice(0, maxCount);

                        if (files.length) handleFilesUploaded(files, i, 'detail');
                    };
                    inp.click();
                };
            }
            grid.appendChild(slot);
        }
    }

    // [Helper] Delete Image (Global for QL)
    function deleteImage(idx, type = 'main') {
        // ... kept for compatibility with existing call sites if any ...
        const ch = state.chapters[state.currentIndex];
        if (!ch) return;
        if (type === 'main') {
            // For unified view, we might not use this, but keep logic safely
            if (ch.mainImages) ch.mainImages[idx] = null;
            clearPatternDetailBrandLabel(ch, idx);
        } else {
            if (ch.detailImages) ch.detailImages.splice(idx, 1);
        }
        persistState();
        render();
        if (window.postToPreview) window.postToPreview();
    }
    // Common Helper for Image Grid Rendering
    function renderStandardImageGrid(grid, max, ch, startIdx = 0) {
        if (!grid) return;
        grid.innerHTML = ""; // Clear first

        const count = max; // Render fixed number of slots based on max (or subset max)

        // [ ✨ Pattern Detail Logic: Link Slot 0 to ch10 ✨ ]
        const patternMap = { "ch11": 0, "ch12": 1, "ch13": 2, "ch14": 3 };
        const isPatternDetail = Object.keys(patternMap).includes(ch.id);
        let linkedImgUrl = "";

        if (isPatternDetail) {
            const ch10 = state.chapters.find(c => c.id === "ch10");
            if (ch10 && ch10.images) {
                const idx = patternMap[ch.id];
                const sourceImg = ch10.images[idx];
                if (sourceImg) linkedImgUrl = sourceImg.preview || sourceImg.url;
            }
        }

        if (isPatternDetail) {
            const ch10 = state.chapters.find(c => c.id === "ch10");
            if (ch10 && ch10.images) {
                const idx = patternMap[ch.id];
                const sourceImg = ch10.images[idx];
                if (sourceImg) linkedImgUrl = sourceImg.preview || sourceImg.url;
            }
        }

        for (let j = 0; j < count; j++) {
            const i = startIdx + j; // Actual index in ch.images
            const slot = document.createElement("div");
            slot.dataset.index = i; // [Key Fix] Store index for Drop targeting

            // [ ✨ Render Locked Slot 0 for Pattern Details ✨ ]
            if (isPatternDetail && i === 0) {
                slot.className = "img-slot has-img locked";
                slot.style.border = "2px solid #C5A065"; // Gold border to show importance
                slot.style.opacity = "0.9";
                slot.title = "Linked from Key Patterns (Chapter 10)";

                if (linkedImgUrl) {
                    const img = document.createElement("img");
                    img.src = linkedImgUrl;
                    slot.appendChild(img);
                } else {
                    slot.innerHTML = `<div style="text-align:center; font-size:10px; color:#999; padding:0 4px;">Linked Pattern<br>(Set in Ch10)</div>`;
                }

                // Add lock icon overlay
                const lock = document.createElement("div");
                lock.innerHTML = "🔒";
                lock.style.position = "absolute"; lock.style.top = "2px"; lock.style.right = "4px"; lock.style.fontSize = "12px";
                slot.appendChild(lock);

                grid.appendChild(slot);
                continue; // Skip standard logic for this slot
            }

            const imgObj = ch.images[i];
            if (imgObj) {
                slot.className = "img-slot has-img";
                const img = document.createElement("img");
                img.src = imgObj.preview || imgObj.url || "";
                slot.appendChild(img);
                const del = document.createElement("div"); del.className = "slot-del"; del.textContent = "×";
                del.onclick = (e) => { e.stopPropagation(); deleteImage(i); };
                slot.appendChild(del);
                const badge = document.createElement("div"); badge.className = "slot-badge";
                badge.textContent = imageStatusBadgeText(imgObj);
                slot.appendChild(badge);

                // [ ✨ Click to Replace ✨ ]
                slot.title = "点击替换图片 (Click to replace)";
                slot.style.cursor = "pointer";
                slot.onclick = (e) => {
                    if (e.target.className === "slot-del") return; // Handled by del
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*";
                    input.multiple = true; // [Fix] Enable batch selection
                    input.onchange = (evt) => {
                        const files = Array.from(evt.target.files || []);
                        if (files.length) {
                            files.forEach((f, k) => {
                                handleImageReplacement(f, i + k);
                            });
                        }
                    };
                    input.click();
                };
            } else {
                slot.className = "img-slot empty";
                const plus = document.createElement("div"); plus.className = "slot-plus";
                plus.textContent = ch.images.length === 0 && i === 0 ? "+" : "+";
                slot.appendChild(plus);
                slot.onclick = () => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*";
                    input.multiple = true; // [Fix] Batch select
                    input.onchange = (evt) => {
                        const files = Array.from(evt.target.files || []);
                        if (files.length) {
                            files.forEach((f, k) => {
                                handleImageReplacement(f, i + k);
                            });
                        }
                    };
                    input.click();
                };
            }
            grid.appendChild(slot);
        }
        enableImageReorder(grid, ch);
    }

    // [Bind Footer Buttons - Shared]
    // These use IDs so they bind fine if they exist in DOM
    setTimeout(() => {
        // [New: Key Item Detail Rows Init]
        // Grid is 6 rows * 3 cols = 18 slots. Global Index starts at 8.
        for (let row = 0; row < 6; row++) {
            const rowEl = document.getElementById(`detailRow_${row}`);
            if (rowEl) {
                // Determine start index for this row: 8 + (row * 3)
                const startIdx = 8 + (row * 3);
                // Render 3 slots for this row
                renderStandardImageGrid(rowEl, 3, ch, startIdx);
            }
        }

        const btnSyncOf = document.getElementById("btnSyncOfficial");
        if (btnSyncOf) btnSyncOf.onclick = () => {
            const arr = [];
            for (let i = 0; i < maxImages; i++) {
                const img = ch.images[i];
                arr.push(img ? (img.url || "") : "");
            }
            ch.urlListStr = serializeUrlArray(arr);
            persistState();
            render();
        };

        const btnSyncTp = document.getElementById("btnSyncTemp");
        if (btnSyncTp) btnSyncTp.onclick = () => {
            const arr = [];
            for (let i = 0; i < maxImages; i++) {
                const img = ch.images[i];
                let temp = "";
                if (img && img.name) temp = toViewUrl(img.name);
                arr.push(temp);
            }
            ch.urlListStr = serializeUrlArray(arr);
            persistState();
            render();
        };

        const btnClear = document.getElementById("btnClearUrls");
        if (btnClear) btnClear.onclick = () => {
            if (confirm("确定清空所有 URL 吗？")) {
                ch.urlListStr = "";
                persistState();
                render();
            }
        };

        const btnGen = document.getElementById("genBtn");
        if (btnGen) {
            btnGen.onclick = () => {
                // [Cover/General] Unified Generation Entry Point
                console.log(`[Generate Click] Starting Generation for Index: ${state.currentIndex} (ID: ${ch.id})`);
                safeGenerate(btnGen, 'standard');
            };
            syncGenerateButtonLoading(btnGen, ch.id || `chapter-${state.currentIndex + 1}`, 'standard');
        }

        // [New Binding for Composition Button]
        const btnComp = document.getElementById("genBtn_comp");
        if (btnComp) {
            btnComp.onclick = () => {
                console.log(`[Generate Composition Click] Starting Generation for Index: ${state.currentIndex} `);
                safeGenerate(btnComp, 'composition');
            };
            syncGenerateButtonLoading(btnComp, ch.id || `chapter-${state.currentIndex + 1}`, 'composition');
        }



        if (btnSaveNext) btnSaveNext.onclick = () => {
            if (isPlanningReportType(state.currentReportType)) {
                const nextTarget = getNextStylePlanningChapterTarget();
                if (nextTarget) {
                    state.currentIndex = nextTarget.index;
                    state.navFilter = nextTarget.filter;
                    render();
                } else {
                    alert("已经是最后一章了 (Already the last chapter)");
                }
                return;
            }

            // [ ✨ Specific Logic for Quiet Luxury: Just Next Chapter ✨ ]
            if (state.currentReportType === 'quiet_luxury') {
                if (state.currentIndex < state.chapters.length - 1) {
                    state.currentIndex++;
                    render();
                } else {
                    alert("已经是最后一章了 (Already the last chapter)");
                }
                return;
            }

            state.chapters.forEach(syncChapterDataToGenerated);
            // Save logic...

            // Re-implement the download logic from original
            const finalData = state.chapters.map(c => {
                if (!c.generatedData) return null; // Simplified checks
                return {
                    id: state.currentReportType + "_" + (state.chapters.indexOf(c) + 1),
                    ...c.generatedData,
                    timestamp: new Date().toISOString()
                };
            }).filter(d => d);

            // Just move to step 2 as original did
            const valid = state.chapters.filter(c => c.generatedData);
            if (!valid.length) {
                if (!confirm("⚠️ 似乎没有生成任何有效数据(generatedData为空)。\n仍然强制进入【步骤 2】吗？")) return;
            }
            setStep(2);
        };

        const btnReset = document.getElementById("btnResetCh");
        if (btnReset) btnReset.onclick = () => {
            if (confirm("确定清空本章数据？")) {
                const current = state.chapters[state.currentIndex];
                const mainSlots = (Array.isArray(current.mainImages) && current.mainImages.length) ? current.mainImages.length : 6;
                const mainUrlSlots = (Array.isArray(current.mainImageUrls) && current.mainImageUrls.length) ? current.mainImageUrls.length : mainSlots;
                const fresh = {
                    ...current,
                    title: current.title,
                    images: [],
                    urlListStr: "",
                    keywords: "",
                    summary: "",
                    status: "未生成",
                    inspiration: "",
                    generatedData: null,
                    customData: {},
                    mainImages: Array(mainSlots).fill(null),
                    detailImages: [],
                    mainImageUrls: Array(mainUrlSlots).fill(""),
                    detailImageUrls: []
                };
                state.chapters[state.currentIndex] = fresh;
                persistState();
                render();
            }
        };

        const btnRefPrev = document.getElementById("btnRefreshPreview");
        if (btnRefPrev) {
            btnRefPrev.onclick = () => {
                if (window.postToPreview) {
                    window.postToPreview(true);
                } else {
                    const ifr = document.getElementById("previewIframe");
                    const cfg = REPORT_CONFIGS[state.currentReportType];
                    if (ifr && cfg && cfg.templateFile) {
                        ifr.src = `${cfg.templateFile}?chIdx=${state.currentIndex}&v=${Date.now()}`;
                    } else if (ifr) {
                        ifr.src = ifr.src;
                    }
                }
            };
        }

    }, 0);
}

// ===== 初始化报告类型选择器 =====
function initReportTypeSelector() {
    const selector = document.getElementById("reportTypeSelect");
    if (!selector) return;

    selector.innerHTML = "";
    const supportedTypes = [REPORT_TYPE_STYLE_PLANNING, REPORT_TYPE_THEME_THEME_PLANNING];
    supportedTypes.forEach((reportType) => {
        const config = REPORT_CONFIGS[reportType];
        if (!config) return;
        const option = document.createElement("option");
        option.value = reportType;
        option.textContent = config.name || reportType;
        option.selected = state.currentReportType === reportType;
        selector.appendChild(option);
    });

    if (!REPORT_CONFIGS[state.currentReportType]) {
        state.currentReportType = DEFAULT_REPORT_TYPE;
    }
    selector.value = state.currentReportType;

    selector.onchange = () => {
        const nextType = selector.value;
        if (!REPORT_CONFIGS[nextType] || nextType === state.currentReportType) {
            selector.value = state.currentReportType;
            return;
        }

        saveCurrentReportTypeSnapshot();
        state.currentReportType = nextType;
        restoreReportTypeSnapshot(nextType);
        state.currentIndex = getDefaultChapterIndexForReport(nextType, state.chapters);
        persistState();
        render();
    };
}

// [ ✨ Task Queue Display Logic ✨ ]
function updateQueueUI(pending, running) {
    let queueEl = document.getElementById("queueStatus");
    if (!queueEl) {
        const topbarRow = document.querySelector(".topbar .row");
        if (topbarRow) {
            queueEl = document.createElement("div");
            queueEl.id = "queueStatus";
            queueEl.className = "queue-status";
            // Insert before envHint
            const envHint = document.getElementById("envHint");
            if (envHint) {
                topbarRow.insertBefore(queueEl, envHint);
            } else {
                topbarRow.appendChild(queueEl);
            }
        }
    }

    if (!queueEl) return;

    const total = pending + running;
    if (total > 0) {
        queueEl.style.display = "flex";
        queueEl.innerHTML = `${ICONS.queue} <span>${total} Tasks</span>`;
        queueEl.title = `${running} Running, ${pending} Pending`;
        queueEl.classList.add("busy");
    } else {
        queueEl.style.display = "none";
        queueEl.classList.remove("busy");
    }
}

let isPolling = false;
async function pollQueueStatus() {
    if (isPolling) return;
    isPolling = true;
    try {
        const res = await apiClient.getQueue();
        const pending = res.queue_pending ? res.queue_pending.length : 0;
        const running = res.queue_running ? res.queue_running.length : 0;
        updateQueueUI(pending, running);
    } catch (e) {
        // Silent fail
    } finally {
        isPolling = false;
        setTimeout(pollQueueStatus, 3000);
    }
}

// [ ✨ Version Check Logic ✨ ]
function checkVersion() {
    fetch(`version.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.version && data.version !== CURRENT_VERSION) {
                showVersionNotice(data.version);
            }
        })
        .catch(err => console.error("Check version failed:", err));
}

function showVersionNotice(newVer) {
    if (document.getElementById("versionNotice")) return;

    const div = document.createElement("div");
    div.id = "versionNotice";
    div.className = "version-notice";

    // New UI Structure
    div.innerHTML = `
        <div class="version-notice-title">发现新版本</div>
        <div class="version-notice-desc">检测到新版本 ${newVer}，请刷新以获取最新功能</div>
        <button id="refreshBtn" class="version-refresh-btn">立即刷新</button>
    `;

    document.body.appendChild(div);

    // Bind click event to the button
    const btn = div.querySelector("#refreshBtn");
    btn.onclick = (e) => {
        e.stopPropagation(); // Prevent bubbling if any
        // Cache busting reload
        const url = new URL(window.location.href);
        url.searchParams.set('t', Date.now());
        window.location.href = url.toString();
    };
}

// 启动版本轮询 (每60秒)
// setInterval(checkVersion, 60000);
// 立即检查一次版本
// checkVersion();

// Start polling queue status
pollQueueStatus();

// ===== 主渲染 =====
function render() {
    if (!(isPlanningReportType(state.currentReportType) && state.step === 2)) {
        window._beforeLeaveStylePlanningStep2 = null;
    }
    if (!(isLiveTemplate() && state.step === 1)) {
        cleanupLivePreviewViewport("__cleanupStep1LivePreviewViewport");
        cleanupLivePreviewViewport("__cleanupStep1LivePreviewManualScrollGuard");
    }
    if (!(isPlanningReportType(state.currentReportType) && state.step === 2)) {
        cleanupLivePreviewViewport("__cleanupStep2PlanningPreviewViewport");
        cleanupLivePreviewViewport("__cleanupStep2PlanningPreviewManualScrollGuard");
    }

    if (isPlanningReportType(state.currentReportType)) {
        syncRecommendationFromChapters();
    }

    // [Auto-Fix] Retroactively hide unused detail pages for clean view
    if (isStylePlanningType(state.currentReportType) && !state._visibilityFixed_v2) {
        let changed = false;
        state.chapters.forEach(ch => {
            const match = ch.id.match(/^(keyItem|patternDetail|brandDetail)(\d+)$/);
            if (match && parseInt(match[2]) > 1) {
                // Check if chapter is effectively empty
                const hasContent = (ch.images && ch.images.some(img => img)) ||
                    (ch.mainImages && ch.mainImages.some(img => img)) ||
                    (ch.detailImages && ch.detailImages.length > 0) ||
                    (ch.generatedData); // If generated, keep it

                if (!hasContent) {
                    if (ch.isActive !== false) {
                        ch.isActive = false;
                        changed = true;
                    }
                }
            }
        });
        state._visibilityFixed_v2 = true;
        if (changed) persistState();
    }

    if (isThemeThemePlanningType(state.currentReportType) && !state._themeElementVisibilityFixed_v1) {
        let changed = false;
        state.chapters.forEach((chapter) => {
            const match = /^(themeItemDetail|patternDetail)(\d+)$/.exec(String(chapter?.id || ""));
            if (!match || parseInt(match[2], 10) <= 1) return;
            const hasContent = (chapter.images && chapter.images.some(Boolean)) ||
                (chapter.mainImages && chapter.mainImages.some(Boolean)) ||
                (chapter.detailImages && chapter.detailImages.some(Boolean)) ||
                (chapter.customData && Object.values(chapter.customData).some((value) => String(value || "").trim() !== "")) ||
                chapter.generatedData;
            if (!hasContent && chapter.isActive !== false) {
                chapter.isActive = false;
                changed = true;
            }
        });
        state._themeElementVisibilityFixed_v1 = true;
        if (changed) {
            syncDirectoryFromDetails('themeItems');
            syncDirectoryFromDetails('keyItems');
            persistState();
        }
    }

    if (isThemeThemePlanningType(state.currentReportType) && !state._themeDynamicVisibilityFixed_v2) {
        let changed = false;
        state.chapters.forEach((chapter) => {
            const dynamicType = getDynamicPageGroupType(chapter?.id, REPORT_TYPE_THEME_THEME_PLANNING);
            const dynamicGroup = dynamicType
                ? getDynamicPageGroupConfigByType(dynamicType, REPORT_TYPE_THEME_THEME_PLANNING)
                : null;
            if (!dynamicGroup || chapter.id === dynamicGroup.firstId) return;
            if (!chapterHasMeaningfulDynamicContent(chapter) && chapter.isActive !== false) {
                chapter.isActive = false;
                changed = true;
            }
        });
        state._themeDynamicVisibilityFixed_v2 = true;
        if (changed) {
            syncDirectoryFromDetails('themeItems');
            syncDirectoryFromDetails('keyItems');
            persistState();
        }
    }

    initReportTypeSelector(); // 初始化选择器
    initDraftBox(); // [ 🔄 Initialize Draft Box 🔄 ]
    renderSteps();
    renderChaptersNav();
    if (state.currentReportType === 'quiet_luxury') {
        if (state.step === 1) renderStep1();
        else renderStep2_QL(); // Unified Step 2 (Reuse Real-time Preview)
    } else if (isPlanningReportType(state.currentReportType)) {
        if (state.step === 1) renderStep1();
        else renderStep2_StylePlanning(); // [New] Step 2 for Style Planning: Add Custom Images
    } else {
        if (state.step === 1) renderStep1();
        else if (state.step === 2) renderStep2();
        else renderStep3();
    }
}

// ===== [Simplified Quiet Luxury Step 2: Preview & Export] =====
function renderStep2_QL() {
    contentPanelEl.innerHTML = '';

    // 1. Data Check
    const count = state.chapters.length;
    if (count === 0) {
        contentPanelEl.innerHTML = `<div class="hint" style="padding:20px;">提示：暂无章节数据，请先返回步骤1生成。</div>`;
        return;
    }

    const wrap = document.createElement('div');
    wrap.className = "section";
    wrap.style.maxWidth = "100%"; // Full width for QL
    wrap.style.height = "calc(100vh - 100px)";
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";

    // 2. Header Row (Standard UI Style)
    const headerRow = document.createElement("div");
    headerRow.className = "row";
    headerRow.style.marginBottom = "16px";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";
    headerRow.style.flexShrink = "0";

    // Left: Title & Hint
    const leftHeader = document.createElement("div");
    leftHeader.innerHTML = `
                    <div style="font-weight:600; font-size:16px;">内容预览</div>
                `;
    headerRow.appendChild(leftHeader);

    // Right: Buttons
    const rightHeader = document.createElement("div");
    rightHeader.style.display = "flex";
    rightHeader.style.gap = "12px";
    rightHeader.innerHTML = `
                    <button type="button" class="btn-secondary" id="btnToggleEditMode">调整图片位置</button>
        <button type="button" class="btn-ghost" id="btnOpenNewQL">新窗口打开</button>
        <button type="button" class="btn-primary" id="btnExportQL" style="background:#000; border-color:#000;">导出报告HTML</button>
                `;
    headerRow.appendChild(rightHeader);
    wrap.appendChild(headerRow);

    // 3. Iframe Container
    const frameBox = document.createElement('div');
    frameBox.style.cssText = "flex:1; border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;";
    const iframe = document.createElement('iframe');
    iframe.className = "preview-frame";
    iframe.style.cssText = "width:100%; height:100%; border:none;";
    // Helper: Send All Data
    const sendAllData = (targetWindow) => {
        if (!targetWindow) return;
        const timestamp = Date.now();
        state.chapters.forEach((ch, idx) => {
            targetWindow.postMessage({ type: 'UPDATE_CHAPTER_DATA', index: idx, data: ch, timestamp }, '*');
        });
    };

    // 4. Data Injection Logic (Pre-bind)
    iframe.onload = () => sendAllData(iframe.contentWindow);

    iframe.src = getCurrentTemplatePath() + "?v=" + Date.now();
    frameBox.appendChild(iframe);
    wrap.appendChild(frameBox);
    contentPanelEl.appendChild(wrap);

    // 5. Action Bindings
    // [Sync] Message Handler
    if (window._qlMsgHandler) window.removeEventListener('message', window._qlMsgHandler);
    window._qlMsgHandler = (e) => {
        // Handshake: Template is ready
        if (e.data && e.data.type === 'TEMPLATE_READY') {
            sendAllData(e.source);
        }
        // Save Transform
        if (e.data && e.data.type === 'SAVE_IMAGE_TRANSFORM') {
            const { chIdx, imgIdx, transform } = e.data;
            if (state.chapters[chIdx] && state.chapters[chIdx].images && state.chapters[chIdx].images[imgIdx]) {
                if (!state.chapters[chIdx].images[imgIdx].transform) {
                    state.chapters[chIdx].images[imgIdx].transform = {};
                }
                state.chapters[chIdx].images[imgIdx].transform = transform;
                persistState();
                console.log('Saved Transform:', chIdx, imgIdx, transform);
            }
        }
    };
    window.addEventListener('message', window._qlMsgHandler);

    // Toggle Edit Mode Logic
    let isEditMode = false;
    document.getElementById('btnToggleEditMode').onclick = (e) => {
        if (e) e.preventDefault();
        isEditMode = !isEditMode;
        const btn = document.getElementById('btnToggleEditMode');
        btn.innerHTML = isEditMode ? "完成调整" : "调整图片位置";
        btn.className = isEditMode ? "btn-primary" : "btn-secondary";
        iframe.contentWindow.postMessage({ type: 'SET_EDIT_MODE', enabled: isEditMode }, '*');
    };

    // Export Handler
    const handleHtmlExport = async (mode) => {
        const ready = await ensureHtmlExportImagesReady({ includeReportFinal: false, refreshLivePreview: true });
        if (!ready) return;
        const onMsg = async (e) => {
            if (e.data && e.data.type === 'RETURN_FULL_HTML') {
                window.removeEventListener('message', onMsg);
                const htmlContent = e.data.html;

                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);

                if (mode === 'download') {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Quiet_Luxury_Report_v${Date.now()}.html`;
                    a.click();
                } else if (mode === 'open') {
                    window.open(url, '_blank');
                }

                // Cleanup? defer revoking
                setTimeout(() => URL.revokeObjectURL(url), 10000);
            }
        };
        window.addEventListener('message', onMsg);
        iframe.contentWindow.postMessage({ type: 'GET_FULL_HTML' }, '*');
    };

    document.getElementById('btnExportQL').onclick = (e) => { e.preventDefault(); handleHtmlExport('download'); };
    document.getElementById('btnOpenNewQL').onclick = (e) => { e.preventDefault(); handleHtmlExport('open'); };
}

// 启动
render();

// ===== [New: Style Planning Step 2: Add Custom Images] =====
function normalizeSpEditableText(value, options = {}) {
    const { preserveNewlines = false } = options;
    const raw = String(value == null ? '' : value)
        .replace(/\u00a0/g, ' ')
        .replace(/\r\n?/g, '\n');
    if (preserveNewlines) {
        return raw
            .split('\n')
            .map(line => line.replace(/[ \t]+/g, ' ').trim())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
    return raw.replace(/\s+/g, ' ').trim();
}

function isSpPreviewElementVisible(el) {
    if (!el || !el.ownerDocument || !el.ownerDocument.defaultView) return false;
    const win = el.ownerDocument.defaultView;
    const style = win.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (Number(style.opacity || '1') === 0) return false;
    return true;
}

function readSpPreviewText(root, selector, options = {}) {
    if (!root || !selector) return undefined;
    const el = root.querySelector(selector);
    if (!el) return undefined;
    return normalizeSpEditableText(el.innerText || el.textContent || '', options);
}

function readSpPreviewTexts(root, selector, options = {}) {
    if (!root || !selector) return [];
    return Array.from(root.querySelectorAll(selector))
        .map((el) => normalizeSpEditableText(el.innerText || el.textContent || '', options));
}

function splitSpEditableSeries(value, maxCount) {
    const normalized = normalizeSpEditableText(value || '', { preserveNewlines: true });
    if (!normalized) return [];
    return normalized
        .split(/[\n、,，]+/)
        .map(part => normalizeSpEditableText(part))
        .filter(Boolean)
        .slice(0, maxCount);
}

function syncStylePlanningPreviewTextState(previewDoc) {
    if (state.currentReportType !== 'style_planning' || !previewDoc) return false;
    const structure = Array.isArray(REPORT_CONFIGS.style_planning?.structure)
        ? REPORT_CONFIGS.style_planning.structure
        : [];
    const structureMap = new Map(structure.map(item => [item.id, item]));
    let changed = false;

    const writeField = (customData, key, value) => {
        if (value === undefined || !key) return;
        const nextValue = String(value);
        const prevValue = Object.prototype.hasOwnProperty.call(customData, key)
            ? String(customData[key] == null ? '' : customData[key])
            : undefined;
        if (prevValue === nextValue) return;
        customData[key] = nextValue;
        changed = true;
    };

    const readDirectoryItems = (page, prefix, count) => {
        const items = Array.from(page.querySelectorAll('.pattern-item'));
        const values = [];
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const isVisible = item ? isSpPreviewElementVisible(item) : false;
            values.push({
                title: isVisible && item ? readSpPreviewText(item, '.item-title') || '' : '',
                intro: isVisible && item ? readSpPreviewText(item, '.item-intro', { preserveNewlines: true }) || '' : ''
            });
        }
        return values;
    };

    const applySeriesFields = (customData, prefix, values, count) => {
        for (let i = 1; i <= count; i++) {
            const entry = Array.isArray(values) ? values[i - 1] : null;
            writeField(customData, `${prefix}${i}_title`, entry && entry.title ? entry.title : '');
            writeField(customData, `${prefix}${i}_intro`, entry && entry.intro ? entry.intro : '');
        }
    };

    state.chapters.forEach((chapter) => {
        if (!chapter || chapter.isActive === false || typeof chapter.id !== 'string') return;
        const page = previewDoc.getElementById(chapter.id);
        if (!page) return;
        const chapterConfig = structureMap.get(chapter.id);
        if (!chapter.customData || typeof chapter.customData !== 'object') chapter.customData = {};
        const customData = chapter.customData;

        switch (chapter.id) {
            case 'cover-page': {
                writeField(customData, 'style_trend', readSpPreviewText(page, 'h3'));
                writeField(customData, 'report_title', readSpPreviewText(page, 'h1', { preserveNewlines: true }));
                writeField(customData, 'report_subtitle', readSpPreviewText(page, 'h2'));
                const tags = readSpPreviewTexts(page, '.sub-tags .tag').filter(Boolean);
                writeField(customData, 'keywords', tags.join('，'));
                writeField(customData, 'report_intro', readSpPreviewText(page, 'div[style*="border-left"] p', { preserveNewlines: true }));
                break;
            }
            case 'toc-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.toc-title'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.toc-subtitle'));
                const cards = Array.from(page.querySelectorAll('.toc-card'));
                for (let i = 1; i <= 8; i++) {
                    const card = cards[i - 1];
                    writeField(customData, `ch${i}_en_title`, card ? readSpPreviewText(card, '.toc-mini-title') || '' : '');
                    writeField(customData, `ch${i}_title`, card ? readSpPreviewText(card, '.toc-card-title') || '' : '');
                    writeField(customData, `ch${i}_desc`, card ? readSpPreviewText(card, '.toc-card-desc', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'style-page': {
                writeField(customData, 'page_en_title', readSpPreviewText(page, '.header-section h2'));
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                writeField(customData, 'summary', readSpPreviewText(page, '.trend-concept', { preserveNewlines: true }));

                const inspTitles = splitSpEditableSeries(readSpPreviewText(page, '#style-insp-p', { preserveNewlines: true }), 4);
                for (let i = 1; i <= 4; i++) {
                    writeField(customData, `insp${i}_title`, inspTitles[i - 1] || '');
                }

                const itemTitles = splitSpEditableSeries(readSpPreviewText(page, '#style-item-p', { preserveNewlines: true }), 8);
                for (let i = 1; i <= 8; i++) {
                    writeField(customData, `item${i}_title`, itemTitles[i - 1] || '');
                }

                const patternTitles = splitSpEditableSeries(readSpPreviewText(page, '#style-pattern-p', { preserveNewlines: true }), 8);
                for (let i = 1; i <= 8; i++) {
                    writeField(customData, `pattern${i}_title`, patternTitles[i - 1] || '');
                }
                break;
            }
            case 'consumer-page': {
                const items = Array.from(page.querySelectorAll('.profile-item'));
                for (let i = 1; i <= 3; i++) {
                    const item = items[i - 1];
                    writeField(customData, `p${i}_title`, item ? readSpPreviewText(item, 'h4') || '' : '');
                    writeField(customData, `p${i}_desc`, item ? readSpPreviewText(item, 'p', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'atmosphere-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                writeField(customData, 'page_intro', readSpPreviewText(page, '.section-text', { preserveNewlines: true }));
                break;
            }
            case 'new-inspiration': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.content-overlay .main-title'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.content-overlay .header-section h2'));
                writeField(customData, 'trend_title', readSpPreviewText(page, '.content-overlay h3'));
                writeField(customData, 'trend_subtitle', readSpPreviewText(page, '.content-overlay h4'));
                writeField(customData, 'case_title', readSpPreviewText(page, '.content-overlay h5'));
                writeField(customData, 'left_desc', readSpPreviewText(page, '.content-overlay p', { preserveNewlines: true }));
                const cards = Array.from(page.querySelectorAll('.insp-card'));
                for (let i = 1; i <= 4; i++) {
                    const card = cards[i - 1];
                    writeField(customData, `c${i}_title`, card ? readSpPreviewText(card, '.insp-card-text h4') || '' : '');
                    writeField(customData, `c${i}_sub`, card ? readSpPreviewText(card, '.insp-card-text h5') || '' : '');
                    writeField(customData, `c${i}_desc`, card ? readSpPreviewText(card, '.insp-card-text p', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'page4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                writeField(customData, 'summary', readSpPreviewText(page, '.trend-concept', { preserveNewlines: true }));
                const strips = Array.from(page.querySelectorAll('.palette-sidebar .p-strip'));
                for (let i = 1; i <= 7; i++) {
                    const strip = strips[i - 1];
                    const rawLines = strip ? normalizeSpEditableText(strip.querySelector('span')?.innerText || '', { preserveNewlines: true }) : '';
                    const lines = rawLines
                        ? rawLines.split('\n').map(part => normalizeSpEditableText(part)).filter(Boolean)
                        : [];
                    writeField(customData, `color${i}_cn`, lines[0] || '');
                    writeField(customData, `color${i}_en`, lines[1] || '');
                    writeField(customData, `color${i}_code`, lines[2] || '');
                }
                break;
            }
            case 'color-direction-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                const cols = Array.from(page.querySelectorAll('.direction-col'));
                const prefixes = [
                    { title: 'left_title', enTitle: 'left_en_title', intro: 'left_intro', desc: 'left_desc', enDesc: 'left_en_desc', swatchPrefix: 'l' },
                    { title: 'right_title', enTitle: 'right_en_title', intro: 'right_intro', desc: 'right_desc', enDesc: 'right_en_desc', swatchPrefix: 'r' }
                ];
                cols.forEach((col, idx) => {
                    const def = prefixes[idx];
                    if (!def) return;
                    writeField(customData, def.title, readSpPreviewText(col, '.theme-header h3'));
                    writeField(customData, def.enTitle, readSpPreviewText(col, '.theme-header h4'));
                    writeField(customData, def.intro, readSpPreviewText(col, '.atmosphere-intro', { preserveNewlines: true }));
                    const swatches = Array.from(col.querySelectorAll('.swatch'));
                    const cnNames = [];
                    const enNames = [];
                    swatches.forEach((swatch, swatchIdx) => {
                        const spans = Array.from(swatch.querySelectorAll('span'));
                        const cn = spans[0] ? normalizeSpEditableText(spans[0].innerText || spans[0].textContent || '') : '';
                        const en = spans[1] ? normalizeSpEditableText(spans[1].innerText || spans[1].textContent || '') : '';
                        const code = spans[2] ? normalizeSpEditableText(spans[2].innerText || spans[2].textContent || '') : '';
                        cnNames.push(cn);
                        enNames.push(en);
                        writeField(customData, `${def.swatchPrefix}_c${swatchIdx + 1}_Code`, code);
                    });
                    writeField(customData, def.desc, cnNames.filter(Boolean).join(' + '));
                    writeField(customData, def.enDesc, enNames.filter(Boolean).join(' & '));
                });
                break;
            }
            case 'rack-color-display-page':
            case 'rack-color-display-page-2':
            case 'rack-color-display-page-3':
            case 'rack-color-display-page-4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                break;
            }
            case 'style-outfit-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.header-section h1'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.header-section h2'));
                const outfits = Array.from(page.querySelectorAll('.outfit-item'));
                for (let i = 1; i <= 7; i++) {
                    const outfit = outfits[i - 1];
                    writeField(customData, `img${i}_brand`, outfit ? readSpPreviewText(outfit, '.brand-label') || '' : '');
                }
                break;
            }
            case 'keyItemsDirectory': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                applySeriesFields(customData, 'item', readDirectoryItems(page, 'item', 8), 8);
                break;
            }
            case 'patternsDirectory': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                applySeriesFields(customData, 'pattern', readDirectoryItems(page, 'pattern', 8), 8);
                break;
            }
            case 'brandsDirectory': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                applySeriesFields(customData, 'brand', readDirectoryItems(page, 'brand', 8), 8);
                break;
            }
            case 'conclusion-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                const items = Array.from(page.querySelectorAll('.summary-item'));
                for (let i = 1; i <= 3; i++) {
                    const item = items[i - 1];
                    writeField(customData, `summary_title_${i}`, item ? readSpPreviewText(item, 'h3') || '' : '');
                    writeField(customData, `summary_desc_${i}`, item ? readSpPreviewText(item, 'p', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'recommendation-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                break;
            }
            default: {
                if (/^keyItem\d+$/.test(chapter.id) && chapter.id !== 'keyItemsDirectory') {
                    writeField(customData, 'page_en_title', readSpPreviewText(page, '.header-section h2'));
                    writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                    writeField(customData, 'page_intro', readSpPreviewText(page, '.description', { preserveNewlines: true }));
                    const featureItems = Array.from(page.querySelectorAll('.application-list ul li'));
                    for (let i = 1; i <= 3; i++) {
                        writeField(customData, `feature${i}`, featureItems[i - 1] ? normalizeSpEditableText(featureItems[i - 1].innerText || featureItems[i - 1].textContent || '') : '');
                    }
                    const gridSlots = Array.from(page.querySelectorAll('.pattern-grid-scroll .grid-img-item')).slice(0, 6);
                    for (let i = 1; i <= 6; i++) {
                        const slot = gridSlots[i - 1];
                        const label = slot ? slot.querySelector('.brand-overlay-label') : null;
                        const value = label && isSpPreviewElementVisible(label)
                            ? normalizeSpEditableText(label.innerText || label.textContent || '')
                            : '';
                        writeField(customData, `img${i}_brand`, value);
                    }
                } else if (/^patternDetail\d+$/.test(chapter.id)) {
                    writeField(customData, 'page_en_title', readSpPreviewText(page, '.header-section h2'));
                    writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                    writeField(customData, 'page_intro', readSpPreviewText(page, '.description', { preserveNewlines: true }));
                    const blocks = Array.from(page.querySelectorAll('.pattern-keywords > div'));
                    for (let i = 1; i <= 3; i++) {
                        const block = blocks[i - 1];
                        const spans = block ? Array.from(block.querySelectorAll('span')) : [];
                        const cn = spans[0] ? normalizeSpEditableText(spans[0].innerText || spans[0].textContent || '') : '';
                        const en = spans[1] ? normalizeSpEditableText(spans[1].innerText || spans[1].textContent || '') : '';
                        writeField(customData, `kw${i}`, cn && en ? `${cn} | ${en}` : (cn || en || ''));
                    }
                    const apps = Array.from(page.querySelectorAll('.application-list ul li'));
                    for (let i = 1; i <= 3; i++) {
                        writeField(customData, `app${i}`, apps[i - 1] ? normalizeSpEditableText(apps[i - 1].innerText || apps[i - 1].textContent || '') : '');
                    }
                } else if (/^brandDetail\d+$/.test(chapter.id)) {
                    writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                    writeField(customData, 'page_intro', readSpPreviewText(page, '.description', { preserveNewlines: true }));
                    writeField(customData, 'concept_desc', readSpPreviewText(page, '.concept-desc', { preserveNewlines: true }));
                } else if (chapterConfig && chapterConfig.id === chapter.id && chapter.id === 'style-outfit-page') {
                    writeField(customData, 'page_title', readSpPreviewText(page, '.header-section h1'));
                }
                break;
            }
        }
    });

    return changed;
}

function syncThemeThemePlanningPreviewTextState(previewDoc) {
    if (!isThemeThemePlanningType(state.currentReportType) || !previewDoc) return false;
    const structure = Array.isArray(REPORT_CONFIGS.theme_theme_planning?.structure)
        ? REPORT_CONFIGS.theme_theme_planning.structure
        : [];
    const structureMap = new Map(structure.map(item => [item.id, item]));
    let changed = false;

    const writeField = (customData, key, value) => {
        if (value === undefined || !key) return;
        const nextValue = String(value);
        const prevValue = Object.prototype.hasOwnProperty.call(customData, key)
            ? String(customData[key] == null ? '' : customData[key])
            : undefined;
        if (prevValue === nextValue) return;
        customData[key] = nextValue;
        changed = true;
    };

    const applySeriesFields = (customData, prefix, values, count) => {
        for (let i = 1; i <= count; i++) {
            const entry = Array.isArray(values) ? values[i - 1] : null;
            writeField(customData, `${prefix}${i}_title`, entry && entry.title ? entry.title : '');
            writeField(customData, `${prefix}${i}_intro`, entry && entry.intro ? entry.intro : '');
        }
    };

    const readThemeDirectoryItems = (page, count) => {
        const items = Array.from(page.querySelectorAll('.pattern-item'));
        return Array.from({ length: count }, (_, index) => {
            const item = items[index];
            const isVisible = item ? isSpPreviewElementVisible(item) : false;
            return {
                title: isVisible && item ? readSpPreviewText(item, '.item-title') || '' : '',
                intro: isVisible && item ? readSpPreviewText(item, '.item-intro', { preserveNewlines: true }) || '' : ''
            };
        });
    };

    const readPaletteStripValue = (strip, selector, lineIndex) => {
        if (!strip) return '';
        const direct = readSpPreviewText(strip, selector);
        if (direct !== undefined) {
            return direct || '';
        }
        const rawLines = normalizeSpEditableText(
            strip.querySelector('.p-strip-meta')?.innerText || strip.querySelector('span')?.innerText || '',
            { preserveNewlines: true }
        );
        const lines = rawLines
            ? rawLines.split('\n').map(part => normalizeSpEditableText(part)).filter(Boolean)
            : [];
        return lines[lineIndex] || '';
    };

    const readGroupStylingPaletteValue = (slot, selector, datasetKey = '') => {
        if (!slot) return '';
        const direct = readSpPreviewText(slot, selector);
        if (direct !== undefined) {
            return direct || '';
        }
        if (datasetKey) {
            const datasetValue = slot.dataset ? slot.dataset[datasetKey] : '';
            return typeof datasetValue === 'string' ? datasetValue.trim() : '';
        }
        return '';
    };

    state.chapters.forEach((chapter) => {
        if (!chapter || chapter.isActive === false || typeof chapter.id !== 'string') return;
        const page = previewDoc.getElementById(chapter.id);
        if (!page) return;
        if (!chapter.customData || typeof chapter.customData !== 'object') chapter.customData = {};
        const customData = chapter.customData;

        switch (chapter.id) {
            case 'cover-page': {
                writeField(customData, 'style_trend', readSpPreviewText(page, '.cover-hero__eyebrow'));
                writeField(customData, 'report_title', readSpPreviewText(page, '#cover-page-title', { preserveNewlines: true }));
                writeField(customData, 'report_subtitle', readSpPreviewText(page, '.cover-hero__subtitle'));
                writeField(customData, 'report_intro', readSpPreviewText(page, '.cover-hero__summary-text', { preserveNewlines: true }));
                const tags = readSpPreviewTexts(page, '.cover-hero__tags .tag').filter(Boolean);
                writeField(customData, 'keywords', tags.join('，'));
                break;
            }
            case 'toc-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.toc-title'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.toc-subtitle'));
                const cards = Array.from(page.querySelectorAll('.toc-card'));
                for (let i = 1; i <= 7; i++) {
                    const card = cards[i - 1];
                    writeField(customData, `ch${i}_en_title`, card ? readSpPreviewText(card, '.toc-mini-title') || '' : '');
                    writeField(customData, `ch${i}_title`, card ? readSpPreviewText(card, '.toc-card-title') || '' : '');
                    writeField(customData, `ch${i}_desc`, card ? readSpPreviewText(card, '.toc-card-desc', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'theme-origin': {
                writeField(customData, 'page_title', readSpPreviewText(page, '#theme-origin-title'));
                writeField(customData, 'page_en_title', readSpPreviewText(page, '.report-cover__english'));
                writeField(customData, 'summary', readSpPreviewText(page, '.report-cover__summary', { preserveNewlines: true }));
                const rows = Array.from(page.querySelectorAll('.report-cover__keyword'));
                for (let i = 1; i <= 3; i++) {
                    const row = rows[i - 1];
                    writeField(customData, `kw${i}_cn`, row ? readSpPreviewText(row, '.report-cover__keyword-cn') || '' : '');
                    writeField(customData, `kw${i}_en`, row ? readSpPreviewText(row, '.report-cover__keyword-en') || '' : '');
                }
                break;
            }
            case 'theme-event':
            case 'theme-event-continued':
            case 'theme-event-3':
            case 'theme-event-4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.theme-event__title'));
                const fixedNumbers = getThemeEventFixedKickerNumbers(chapter.id);
                const columns = Array.from(page.querySelectorAll('.theme-event__column'));
                for (let i = 1; i <= 2; i++) {
                    const column = columns[i - 1];
                    const rawKicker = column ? readSpPreviewText(column, '.theme-event__kicker') || '' : '';
                    writeField(
                        customData,
                        `block${i}_kicker`,
                        fixedNumbers && fixedNumbers[i - 1]
                            ? formatThemeEventKickerValue(rawKicker, fixedNumbers[i - 1])
                            : rawKicker
                    );
                    writeField(customData, `block${i}_desc`, column ? readSpPreviewText(column, '.theme-event__desc', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'theme-story-panel': {
                writeField(customData, 'eyebrow', readSpPreviewText(page, '.theme-story-panel__eyebrow'));
                writeField(customData, 'page_title', readSpPreviewText(page, '#theme-story-panel-title'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.theme-story-panel__subtitle'));
                writeField(customData, 'lead', readSpPreviewText(page, '.theme-story-panel__lead', { preserveNewlines: true }));
                const metaItems = Array.from(page.querySelectorAll('.theme-story-panel__meta-item'));
                for (let i = 1; i <= 3; i++) {
                    const item = metaItems[i - 1];
                    writeField(customData, `meta${i}_label`, item ? readSpPreviewText(item, '.theme-story-panel__meta-label') || '' : '');
                    writeField(customData, `meta${i}_value`, item ? readSpPreviewText(item, '.theme-story-panel__meta-value') || '' : '');
                }
                break;
            }
            case 'atmosphere-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                writeField(customData, 'page_intro', readSpPreviewText(page, '.section-text', { preserveNewlines: true }));
                break;
            }
            case 'themeItemsDirectory':
            case 'keyItemsDirectory': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.directory-header__title'));
                writeField(customData, 'page_subtitle', readSpPreviewText(page, '.directory-header__background'));
                applySeriesFields(customData, 'item', readThemeDirectoryItems(page, 6), 6);
                break;
            }
            case 'page4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                writeField(customData, 'summary', readSpPreviewText(page, '.trend-concept', { preserveNewlines: true }));
                const strips = Array.from(page.querySelectorAll('.palette-sidebar .p-strip'));
                for (let i = 1; i <= 7; i++) {
                    const strip = strips[i - 1];
                    writeField(customData, `color${i}_cn`, readPaletteStripValue(strip, '.p-strip-name-cn', 0));
                    writeField(customData, `color${i}_en`, readPaletteStripValue(strip, '.p-strip-name-en', 1));
                    writeField(customData, `color${i}_code`, readPaletteStripValue(strip, '.p-strip-hex', 2));
                }
                break;
            }
            case 'group-styling-page':
            case 'group-styling-page-2':
            case 'group-styling-page-3':
            case 'group-styling-page-4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                const brandKeys = [
                    'hero_brand',
                    ...Array.from({ length: 15 }, (_, index) => `item${String(index + 1).padStart(2, '0')}_brand`)
                ];
                const items = Array.from(page.querySelectorAll('.group-styling-item'));
                brandKeys.forEach((key, index) => {
                    const item = items[index];
                    writeField(customData, key, item ? readSpPreviewText(item, '.group-styling-item__brand') || '' : '');
                    writeField(
                        customData,
                        `${key}_left`,
                        item ? ((item.style.getPropertyValue('--brand-left') || '').trim()) : ''
                    );
                    writeField(
                        customData,
                        `${key}_bottom`,
                        item ? ((item.style.getPropertyValue('--brand-bottom') || '').trim()) : ''
                    );
                });
                const paletteSlots = Array.from(page.querySelectorAll('.group-styling-palette-zone--header .group-styling-palette-zone__slot'));
                for (let i = 1; i <= 5; i++) {
                    const slot = paletteSlots[i - 1];
                    writeField(customData, `palette${i}_cn`, readGroupStylingPaletteValue(slot, '.group-styling-palette-zone__name-cn', 'nameCn'));
                    writeField(customData, `palette${i}_en`, readGroupStylingPaletteValue(slot, '.group-styling-palette-zone__name-en', 'nameEn'));
                    writeField(customData, `palette${i}_code`, readGroupStylingPaletteValue(slot, '.group-styling-palette-zone__hex', 'hex'));
                }
                break;
            }
            case 'rack-color-display-page':
            case 'rack-color-display-page-2':
            case 'rack-color-display-page-3':
            case 'rack-color-display-page-4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                break;
            }
            case 'theme-visual-editorial':
            case 'theme-visual-editorial-2':
            case 'theme-visual-editorial-3':
            case 'theme-visual-editorial-4': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                const tags = Array.from(page.querySelectorAll('.visual-editorial-card__tag'));
                for (let i = 1; i <= 6; i++) {
                    writeField(customData, `tag${i}`, tags[i - 1] ? normalizeSpEditableText(tags[i - 1].innerText || tags[i - 1].textContent || '') : '');
                }
                const notes = Array.from(page.querySelectorAll('.visual-editorial-note p'));
                writeField(customData, 'note', notes[0] ? normalizeSpEditableText(notes[0].innerText || notes[0].textContent || '', { preserveNewlines: true }) : '');
                break;
            }
            case 'visual-display-page':
            case 'visual-display-page-2':
            case 'visual-display-page-3': {
                writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                const notes = Array.from(page.querySelectorAll('.visual-editorial-note'));
                writeField(customData, 'note', notes[0] ? readSpPreviewText(notes[0], 'p', { preserveNewlines: true }) || '' : '');
                break;
            }
            case 'conclusion-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '#conclusion-page-title'));
                const items = Array.from(page.querySelectorAll('.summary-item'));
                for (let i = 1; i <= 3; i++) {
                    const item = items[i - 1];
                    writeField(customData, `summary_title_${i}`, item ? readSpPreviewText(item, 'h3') || '' : '');
                    writeField(customData, `summary_desc_${i}`, item ? readSpPreviewText(item, 'p', { preserveNewlines: true }) || '' : '');
                }
                break;
            }
            case 'recommendation-page': {
                writeField(customData, 'page_title', readSpPreviewText(page, '#recommendation-page-title'));
                break;
            }
            default: {
                if (isThemeThemeDetailId(chapter.id)) {
                    if (!isSpPreviewElementVisible(page)) {
                        break;
                    }
                    writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                    writeField(customData, 'page_en_title', readSpPreviewText(page, '.section-eyebrow'));
                    writeField(customData, 'page_intro', readSpPreviewText(page, '.description', { preserveNewlines: true }));
                    writeField(customData, 'list_title', readSpPreviewText(page, '.application-list__title, .application-list h3'));
                    const keywordBlocks = Array.from(page.querySelectorAll('.pattern-keywords > div'));
                    for (let i = 1; i <= 3; i++) {
                        const block = keywordBlocks[i - 1];
                        const spans = block ? Array.from(block.querySelectorAll('span')) : [];
                        writeField(customData, `kw${i}_cn`, spans[0] ? normalizeSpEditableText(spans[0].innerText || spans[0].textContent || '') : '');
                        writeField(customData, `kw${i}_en`, spans[1] ? normalizeSpEditableText(spans[1].innerText || spans[1].textContent || '') : '');
                    }
                    const listItems = Array.from(page.querySelectorAll('.application-list li'));
                    for (let i = 1; i <= 3; i++) {
                        const item = listItems[i - 1];
                        writeField(customData, `app${i}`, item ? normalizeSpEditableText(item.innerText || item.textContent || '', { preserveNewlines: true }) : '');
                    }
                    const gridSlots = Array.from(page.querySelectorAll('.pattern-grid-scroll .grid-img-item')).slice(0, 6);
                    for (let i = 1; i <= 6; i++) {
                        const slot = gridSlots[i - 1];
                        const label = slot ? slot.querySelector('.brand-overlay-label') : null;
                        const value = label && isSpPreviewElementVisible(label)
                            ? normalizeSpEditableText(label.innerText || label.textContent || '')
                            : '';
                        writeField(customData, `img${i}_brand`, value);
                    }
                } else if (structureMap.get(chapter.id)?.id === chapter.id) {
                    writeField(customData, 'page_title', readSpPreviewText(page, '.main-title'));
                }
                break;
            }
        }
    });

    return changed;
}

function syncPlanningPreviewTextState(previewDoc) {
    if (isThemeThemePlanningType(state.currentReportType)) {
        return syncThemeThemePlanningPreviewTextState(previewDoc);
    }
    if (isStylePlanningType(state.currentReportType)) {
        return syncStylePlanningPreviewTextState(previewDoc);
    }
    return false;
}

function renderStep2_StylePlanning() {
    contentPanelEl.innerHTML = '';

    // 1. Data Check
    const count = state.chapters.length;
    if (count === 0) {
        contentPanelEl.innerHTML = `<div class="hint" style="padding:20px;">提示：暂无章节数据，请先返回步骤1生成。</div>`;
        return;
    }

    const wrap = document.createElement('div');
    wrap.className = "section";
    wrap.style.maxWidth = "100%";
    wrap.style.height = "calc(100vh - 100px)";
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";

    // 2. Header Row
    const headerRow = document.createElement("div");
    headerRow.className = "row";
    headerRow.style.marginBottom = "16px";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";
    headerRow.style.flexShrink = "0";

    // Left: Title
    const leftHeader = document.createElement("div");
    leftHeader.innerHTML = `
        <div style="font-weight:600; font-size:16px;">内容预览</div>
    `;
    headerRow.appendChild(leftHeader);

    // Right: Actions
    const rightHeader = document.createElement("div");
    rightHeader.style.display = "flex";
    rightHeader.style.gap = "12px";
    rightHeader.innerHTML = `
        <button type="button" class="btn-ghost" id="btnOpenNewSP">新窗口打开</button>
        <button type="button" class="btn-secondary" id="btnToggleEditMode">编辑模式</button>
        <button type="button" class="btn-primary" id="btnExportSP" style="background:#000; border-color:#000;">导出报告HTML</button>
    `;
    headerRow.appendChild(rightHeader);
    wrap.appendChild(headerRow);

    // 3. Iframe Container
    const frameBox = document.createElement('div');
    frameBox.style.cssText = "flex:1; border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff; position:relative;";

    const iframe = document.createElement('iframe');
    iframe.id = "sp-preview-frame";
    iframe.className = "preview-frame";
    iframe.style.cssText = "width:100%; height:100%; border:none;";
    let isEditMode = false;

    const syncEditModeToIframe = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'SET_EDIT_MODE', enabled: isEditMode }, '*');
        }
    };
    const syncPreviewTextToState = () => {
        try {
            const previewDoc = iframe && iframe.contentDocument;
            const didChange = syncPlanningPreviewTextState(previewDoc);
            if (didChange) persistState();
            return didChange;
        } catch (err) {
            console.error('[SP] Failed to sync edited preview text:', err);
            return false;
        }
    };
    const flushStep2PreviewState = () => {
        syncPreviewTextToState();
        try {
            const frameWin = iframe && iframe.contentWindow;
            if (!frameWin) return;
            if (typeof frameWin.__codexPersistImageTransforms === 'function') {
                frameWin.__codexPersistImageTransforms();
            } else {
                frameWin.postMessage({ type: 'PERSIST_EDIT_STATE' }, '*');
            }
            if (typeof frameWin.__codexExitEditMode === 'function') {
                frameWin.__codexExitEditMode();
            } else {
                frameWin.postMessage({ type: 'SET_EDIT_MODE', enabled: false }, '*');
            }
        } catch (err) {
            console.warn('[SP] Failed to flush preview transform state:', err);
        }
    };
    window._beforeLeaveStylePlanningStep2 = flushStep2PreviewState;

    // Helper: Send All Data
    const sendAllData = (targetWindow) => {
        if (!targetWindow) return;
        state.chapters.forEach((ch, idx) => {
            let dataToSend = { ...ch };
            const config = REPORT_CONFIGS[state.currentReportType];
            const struct = config && config.structure ? config.structure[idx] : null;
            if (struct && struct.fields) {
                const mergedCustomData = { ...(ch.customData || {}) };
                struct.fields.forEach(f => {
                    if (mergedCustomData[f.key] === undefined && f.default !== undefined) {
                        mergedCustomData[f.key] = f.default;
                    }
                });
                dataToSend.customData = mergedCustomData;
            }
            targetWindow.postMessage({ type: 'UPDATE_CHAPTER_DATA', index: idx, data: dataToSend }, '*');
        });

    };

    iframe.onload = () => {
        sendAllData(iframe.contentWindow);
        syncEditModeToIframe();
    };
    iframe.src = getCurrentTemplatePath() + "?v=" + Date.now();
    attachLivePreviewViewport(
        iframe,
        frameBox,
        state.currentReportType,
        "__cleanupStep2PlanningPreviewViewport"
    );
    attachLivePreviewManualScrollGuard(
        iframe,
        "__cleanupStep2PlanningPreviewManualScrollGuard",
        [2]
    );
    frameBox.appendChild(iframe);
    wrap.appendChild(frameBox);
    contentPanelEl.appendChild(wrap);

    // 4. Logic Implementation
    const btnEdit = document.getElementById('btnToggleEditMode');
    if (btnEdit) {
        btnEdit.onclick = (e) => {
            if (e) e.preventDefault();
            if (isEditMode) syncPreviewTextToState();
            isEditMode = !isEditMode;
            btnEdit.innerHTML = isEditMode ? "完成编辑" : "编辑模式";
            btnEdit.className = isEditMode ? "btn-primary" : "btn-secondary";
            if (isEditMode) {
                btnEdit.style.background = "#000";
                btnEdit.style.borderColor = "#000";
            } else {
                btnEdit.style.background = "";
                btnEdit.style.borderColor = "";
            }
            syncEditModeToIframe();
        };
    }
    let pendingSpExport = null;
    const clearPendingSpExport = () => {
        if (!pendingSpExport) return null;
        const current = pendingSpExport;
        if (current.timer) clearTimeout(current.timer);
        pendingSpExport = null;
        return current;
    };
    const getSpLiveExportData = () => {
        try {
            const frameWin = iframe && iframe.contentWindow;
            const frameSource = (frameWin && frameWin.jsonData && typeof frameWin.jsonData === 'object')
                ? JSON.parse(JSON.stringify(frameWin.jsonData))
                : {};
            const config = REPORT_CONFIGS[state.currentReportType] || {};
            const structure = Array.isArray(config.structure) ? config.structure : [];
            const chapters = (Array.isArray(state.chapters) ? cleanDataForExport(state.chapters) : []).map((chapter, idx) => {
                const clonedChapter = (chapter && typeof chapter === 'object') ? chapter : {};
                const struct = structure[idx];
                if (struct && Array.isArray(struct.fields)) {
                    const mergedCustomData = { ...(clonedChapter.customData || {}) };
                    struct.fields.forEach((field) => {
                        if (mergedCustomData[field.key] === undefined && field.default !== undefined) {
                            mergedCustomData[field.key] = field.default;
                        }
                    });
                    clonedChapter.customData = mergedCustomData;
                }
                return clonedChapter;
            });
            return {
                ...frameSource,
                chapters
            };
        } catch (_) {
            return { chapters: [] };
        }
    };
    const buildSpExportDocument = (rawHtml) => {
        const txt = String(rawHtml || '').trim();
        const normalized = /<html[\s>]/i.test(txt)
            ? txt
            : `<!DOCTYPE html><html><head></head><body>${txt}</body></html>`;
        return new DOMParser().parseFromString(normalized, 'text/html');
    };
    const scrubSpExportRuntimeNodes = (doc) => {
        if (!doc) return;
        doc.querySelectorAll('script').forEach((node) => {
            const src = String(node.getAttribute('src') || '').trim();
            const lowerSrc = src.toLowerCase();
            const isExtensionScript = lowerSrc.startsWith('chrome-extension://');
            const isEditorRuntimeScript = /(^|\/)(app|index)\.js(\?|$)/i.test(src);
            if (isExtensionScript || isEditorRuntimeScript) {
                node.remove();
            }
        });
        doc.querySelectorAll('link[href]').forEach((node) => {
            const href = String(node.getAttribute('href') || '').trim().toLowerCase();
            if (href.startsWith('chrome-extension://')) {
                node.remove();
            }
        });
        doc.querySelectorAll('[data-inspect-config], [id^="_o_"]').forEach((node) => node.remove());
    };
    const injectSpExportBootstrap = (doc) => {
        if (!doc.head) {
            const head = doc.createElement('head');
            doc.documentElement.insertBefore(head, doc.body || null);
        }
        const exportData = getSpLiveExportData() || { chapters: [] };
        exportData.showPdfButton = true;
        const payload = JSON.stringify(exportData).replace(/<\/script/gi, '<\\/script');
        doc.querySelectorAll('#sp-fast-export-style, #sp-fast-export-data').forEach((node) => node.remove());

        const exportStyle = doc.createElement('style');
        exportStyle.id = 'sp-fast-export-style';
        exportStyle.textContent =
            '.cls-btn,.resizer,#editor-ui,#ctx-menu,.edit-controls,.edit-controls-2,.nav-control-outer,.nav-control-inner{display:none!important;visibility:hidden!important;}' +
            '#custom-image-layer{pointer-events:none!important;}' +
            'body.is-editing,body.edit-mode,body.replace-mode{cursor:default!important;}' +
            '#downloadPdfButton{display:none!important;visibility:hidden!important;pointer-events:none!important;}';

        const exportScript = doc.createElement('script');
        exportScript.id = 'sp-fast-export-data';
        exportScript.textContent =
            `window.__SP_STATIC_EXPORT__=true;window.jsonData=${payload};` +
            "(function(){" +
            "function normalizeImages(list){return Array.isArray(list)?list.map(function(item){return item&&typeof item==='object'?item:{};}):list;}" +
            "function applyStaticSpecialPages(){" +
            "try{" +
            "var data=window.jsonData||{};" +
            "var chapters=Array.isArray(data.chapters)?data.chapters:[];" +
            "chapters.forEach(function(ch){" +
            "if(!ch||typeof ch!=='object'||ch.isActive===false||typeof ch.id!=='string')return;" +
            "if(ch.id.indexOf('keyItem')===0&&ch.id!=='keyItemsDirectory'&&typeof window.updateKeyItemContent==='function'){window.updateKeyItemContent(ch);return;}" +
            "if((ch.id.indexOf('themeItemDetail')===0||ch.id.indexOf('patternDetail')===0)&&typeof window.updateThemeDetailContent==='function'){window.updateThemeDetailContent(ch);}" +
            "});" +
            "}catch(err){console.warn('[SP export] special page hydrate failed',err);}" +
            "}" +
            "function applyStaticThemePages(){" +
            "try{" +
            "var data=window.jsonData||{};" +
            "var chapters=Array.isArray(data.chapters)?data.chapters:[];" +
            "chapters.forEach(function(ch){" +
            "if(!ch||typeof ch!=='object'||ch.isActive===false||typeof ch.id!=='string')return;" +
            "if(ch.id==='page4'&&typeof window.updateThemeColorContent==='function'){window.updateThemeColorContent(ch);return;}" +
            "if(ch.id==='color-direction-page'&&typeof window.updateColorDirectionContent==='function'){window.updateColorDirectionContent(ch);}" +
            "if(ch.id==='consumer-page'&&typeof window.updateConsumerPortraitContent==='function'){window.updateConsumerPortraitContent(ch);}" +
            "});" +
            "}catch(err){console.warn('[SP export] theme page hydrate failed',err);}" +
            "}" +
            "function primeStaticData(){" +
            "try{" +
            "var data=window.jsonData||{};" +
            "var chapters=Array.isArray(data.chapters)?data.chapters:[];" +
            "chapters.forEach(function(ch){" +
            "if(!ch||typeof ch!=='object')return;" +
            "ch.images=normalizeImages(ch.images);" +
            "ch.mainImages=normalizeImages(ch.mainImages);" +
            "ch.detailImages=normalizeImages(ch.detailImages);" +
            "});" +
            "}catch(err){console.warn('[SP export] static prime failed',err);}" +
            "}" +
            "function finalizeStaticLayout(){" +
            "try{" +
            "var b=document.body;" +
            "if(b){b.classList.remove('is-editing','edit-mode','replace-mode');b.classList.add('preview-mode');}" +
            "var btn=document.getElementById('downloadPdfButton');" +
            "if(btn){btn.style.display=(window.jsonData&&window.jsonData.showPdfButton)?'inline-block':'none';}" +
            "if(typeof window.updateKeyItemLadderNavLabels==='function')window.updateKeyItemLadderNavLabels();" +
            "if(typeof window.__adjustReportLayout==='function'){requestAnimationFrame(function(){window.__adjustReportLayout();});setTimeout(function(){window.__adjustReportLayout();},80);}" +
            "if(typeof window.__scheduleColorDirectionSync==='function'){window.__scheduleColorDirectionSync(0);window.__scheduleColorDirectionSync(90);}" +
            "}catch(err){console.warn('[SP export] layout finalize failed',err);}" +
            "}" +
            "window.addEventListener('DOMContentLoaded',function(){primeStaticData();applyStaticSpecialPages();applyStaticThemePages();setTimeout(finalizeStaticLayout,0);setTimeout(applyStaticSpecialPages,80);setTimeout(applyStaticThemePages,80);});" +
            "window.addEventListener('load',function(){setTimeout(applyStaticThemePages,80);setTimeout(applyStaticThemePages,1200);});" +
            "if(document.readyState!=='loading'){primeStaticData();applyStaticSpecialPages();applyStaticThemePages();setTimeout(finalizeStaticLayout,0);setTimeout(applyStaticSpecialPages,80);setTimeout(applyStaticThemePages,80);}" +
            "})();";

        doc.head.prepend(exportScript);
        doc.head.prepend(exportStyle);

        if (doc.body) {
            doc.body.classList.remove('is-editing', 'edit-mode', 'replace-mode');
            doc.body.classList.add('preview-mode');
        }
    };
    const setSpExportBaseHref = (doc, href) => {
        if (!doc || !doc.head) return;
        doc.querySelectorAll('base').forEach((node) => node.remove());
        if (!href) return;
        const base = doc.createElement('base');
        base.href = href;
        doc.head.prepend(base);
    };
    const normalizeSpExportHtml = (rawHtml, mode) => {
        const doc = buildSpExportDocument(rawHtml);
        const normalizedMode = String(mode || 'download').toLowerCase();
        scrubSpExportRuntimeNodes(doc);
        injectSpExportBootstrap(doc);
        if (normalizedMode === 'open') {
            setSpExportBaseHref(doc, window.location.href);
        } else {
            setSpExportBaseHref(doc, '');
        }
        return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
    };
    const sanitizeSpSnapshotHtml = (rawHtml, mode) => normalizeSpExportHtml(rawHtml, mode);
    const finalizeSpHtmlExport = (rawHtml, mode, popupRef) => {
        const normalizedMode = String(mode || 'download').toLowerCase();
        const htmlContent = normalizeSpExportHtml(rawHtml, normalizedMode);
        if (normalizedMode === 'open') {
            if (popupRef && !popupRef.closed) {
                popupRef.document.open();
                popupRef.document.write(htmlContent);
                popupRef.document.close();
                return true;
            }
            const url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }));
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            return true;
        }
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getPlanningExportFilePrefix(state.currentReportType)}_v${Date.now()}.html`;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return true;
    };
    const trySpHtmlSnapshotExport = (mode, popupRef) => {
        try {
            const doc = iframe && iframe.contentDocument;
            if (!doc || !doc.documentElement) return false;
            const snapshotHtml = sanitizeSpSnapshotHtml(doc.documentElement.outerHTML, mode);
            return finalizeSpHtmlExport(snapshotHtml, mode, popupRef);
        } catch (err) {
            console.error('[SP] Snapshot HTML export failed:', err);
            return false;
        }
    };
    if (window._spMsgHandler) window.removeEventListener('message', window._spMsgHandler);
    window._spMsgHandler = async (e) => {
        if (!e.data) return;
        const data = e.data;
        const fromPreview = (e.source === iframe.contentWindow);
        if (data.type === 'TEMPLATE_READY') {
            if (!fromPreview) return;
            sendAllData(e.source);
            return;
        }
        if (data.type === 'RETURN_FULL_HTML') {
            const currentRequest = pendingSpExport;
            if (!currentRequest) return;
            const incomingRequestId = String(data.requestId || '');
            const requestMatches = incomingRequestId && incomingRequestId === currentRequest.requestId;
            if (!fromPreview && !requestMatches) return;
            clearPendingSpExport();
            const htmlContent = data.html;
            const mode = String(data.mode || currentRequest.mode || '').toLowerCase();
            const popup = currentRequest.popupRef;
            if (!htmlContent && !trySpHtmlSnapshotExport(mode, popup)) {
                alert('导出失败：未获取到HTML内容。');
                return;
            }
            if (htmlContent) finalizeSpHtmlExport(htmlContent, mode, popup);
        }
    };
    window.addEventListener('message', window._spMsgHandler);
    const reqExport = async (mode) => {
        syncPreviewTextToState();
        const ready = await ensureHtmlExportImagesReady({ includeReportFinal: false, refreshLivePreview: true });
        if (!ready) return;
        if (!iframe || !iframe.contentWindow) {
            alert('预览尚未就绪，请稍后重试。');
            return;
        }
        if (pendingSpExport) return;
        const normalizedMode = String(mode || 'download').toLowerCase();
        let popupRef = null;
        if (normalizedMode === 'open') {
            try {
                popupRef = window.open('', '_blank');
            } catch (_) {
                popupRef = null;
            }
        }
        const requestId = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        pendingSpExport = {
            requestId,
            mode: normalizedMode,
            popupRef,
            timer: setTimeout(() => {
                const current = clearPendingSpExport();
                if (!current || current.requestId !== requestId) return;
                if (trySpHtmlSnapshotExport(normalizedMode, current.popupRef)) {
                    return;
                }
                try {
                    if (current.popupRef && !current.popupRef.closed) current.popupRef.close();
                } catch (_) { }
                alert('导出超时，请重试。');
            }, 20000)
        };
        try {
            iframe.contentWindow.postMessage({ type: 'GET_FULL_HTML', mode: normalizedMode, requestId }, '*');
        } catch (err) {
            const current = clearPendingSpExport();
            if (trySpHtmlSnapshotExport(normalizedMode, current ? current.popupRef : null)) {
                return;
            }
            try {
                if (current && current.popupRef && !current.popupRef.closed) current.popupRef.close();
            } catch (_) { }
            console.error('[SP] Failed to request export:', err);
            alert('导出请求失败，请刷新后重试。');
        }
    };
    document.getElementById('btnExportSP').onclick = () => reqExport('download');
    document.getElementById('btnOpenNewSP').onclick = () => reqExport('open');
}

// [ ✨ Helper: Batch Upload for Detail Images ✨ ]
window.handleBatchDetailChange = function (e, groupPrefix) {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;

    const ch = state.chapters[state.currentIndex];
    if (!ch) return;
    if (!ch.customData) ch.customData = {};
    if (!Array.isArray(ch.detailImages)) ch.detailImages = [];
    if (!Array.isArray(ch.detailImageUrls)) ch.detailImageUrls = [];

    // Keys: detail_1_1, detail_1_2, detail_1_3
    const keys = [`${groupPrefix}_1`, `${groupPrefix}_2`, `${groupPrefix}_3`];
    const groupMatch = /^detail_(\d+)$/.exec(groupPrefix || "");
    const groupNum = groupMatch ? parseInt(groupMatch[1], 10) : NaN;
    const baseDetailIdx = Number.isFinite(groupNum) && groupNum > 0 ? (groupNum - 1) * 3 : null;

    // 1) Immediate local preview (blob)
    const uploadJobs = [];
    files.slice(0, 3).forEach((file, i) => {
        const key = keys[i];
        if (!key) return;
        const url = URL.createObjectURL(file);
        ch.customData[key] = url;
        delete ch.customData[key + '_comfy_name'];

        // Keep chapter.detailImages in sync so Step2 can always read the latest detail uploads.
        if (baseDetailIdx !== null) {
            const detailIdx = baseDetailIdx + i;
            while (ch.detailImages.length <= detailIdx) ch.detailImages.push(null);
            while (ch.detailImageUrls.length <= detailIdx) ch.detailImageUrls.push("");

            const prev = ch.detailImages[detailIdx] || {};
            ch.detailImages[detailIdx] = {
                ...prev,
                preview: url,
                url: url,
                imgName: file.name || prev.imgName || "",
                uploadStatus: "",
                cmsStatus: prev.cmsStatus || "pending"
            };
            ch.detailImageUrls[detailIdx] = url;
            setDetailUrlValue(ch, detailIdx, url);

            // 2) Auto upload to CMS and replace blob with CDN URL
            const job = uploadToCms(file).then((res) => {
                const cdnUrl = typeof res === "string" ? res : (res?.url || "");
                if (!cdnUrl) return;
                const live = state.chapters.find(item => item && item.id === ch.id) || ch;
                if (!live.customData) live.customData = {};
                live.customData[key] = cdnUrl;
                delete live.customData[key + '_comfy_name'];

                if (!Array.isArray(live.detailImages)) live.detailImages = [];
                if (!Array.isArray(live.detailImageUrls)) live.detailImageUrls = [];
                while (live.detailImages.length <= detailIdx) live.detailImages.push(null);
                while (live.detailImageUrls.length <= detailIdx) live.detailImageUrls.push("");

                const next = live.detailImages[detailIdx] || {};
                live.detailImages[detailIdx] = {
                    ...next,
                    preview: cdnUrl,
                    url: cdnUrl,
                    imgName: next.imgName || file.name || "",
                    uploadStatus: "",
                    cmsStatus: "ok"
                };
                live.detailImageUrls[detailIdx] = cdnUrl;
                setDetailUrlValue(live, detailIdx, cdnUrl);

                persistState();
                renderSilently();
                if (window.schedulePreviewRender) window.schedulePreviewRender();
            }).catch((err) => {
                console.warn("[Detail] CMS auto upload failed:", err);
                const live = state.chapters.find(item => item && item.id === ch.id) || ch;
                if (Array.isArray(live.detailImages) && live.detailImages[detailIdx]) {
                    live.detailImages[detailIdx].cmsStatus = "fail";
                }
                persistState();
                renderSilently();
            });
            uploadJobs.push(job);
        }
    });

    persistState();
    render();
    if (window.postToPreview) window.postToPreview();
    Promise.all(uploadJobs).catch(() => { /* errors handled per job */ });
    e.target.value = ''; // Reset input
};

window.deleteCustomDetailImage = function (key) {
    const ch = state.chapters[state.currentIndex];
    if (!ch) return;
    if (ch.customData) {
        delete ch.customData[key];
        delete ch.customData[key + '_comfy_name'];
    }

    const match = /^detail_(\d+)_(\d+)$/.exec(key || "");
    if (match && Array.isArray(ch.detailImages) && Array.isArray(ch.detailImageUrls)) {
        const groupNum = parseInt(match[1], 10);
        const slotNum = parseInt(match[2], 10);
        if (Number.isFinite(groupNum) && Number.isFinite(slotNum) && groupNum > 0 && slotNum > 0) {
            const idx = (groupNum - 1) * 3 + (slotNum - 1);
            if (idx < ch.detailImages.length) ch.detailImages[idx] = null;
            if (idx < ch.detailImageUrls.length) ch.detailImageUrls[idx] = "";
            setDetailUrlValue(ch, idx, "");
        }
    }

    persistState();
    renderSilently();
    if (window.postToPreview) window.postToPreview();
};




