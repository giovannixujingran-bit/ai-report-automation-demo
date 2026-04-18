const THEME_THEME_PROMPT_DIR = "prompts/\u4e3b\u9898\u4f01\u5212\u63d0\u793a\u8bcd";

const RESERVED_THEME_THEME_PLANNING_CONFIG = {
    workflow: null,
    prompt: null,
    reserved: true,
    statusText: "\u5f85\u63a5\u5165"
};

function createNoJsonThemeConfig(name, promptFile) {
    return {
        name,
        workflow: "noJson",
        prompt: `${THEME_THEME_PROMPT_DIR}/${promptFile}`,
        reserved: false
    };
}

function createWithJsonThemeConfig(name, promptFile) {
    return {
        name,
        workflow: "withJson",
        prompt: `${THEME_THEME_PROMPT_DIR}/${promptFile}`,
        reserved: false
    };
}

function createThemeSeriesConfig(prefix, count, namePrefix, promptFile) {
    return Object.fromEntries(
        Array.from({ length: count }, (_, index) => {
            const number = String(index + 1).padStart(2, "0");
            return [
                `${prefix}${index + 1}`,
                createNoJsonThemeConfig(`${namePrefix} ${number}`, promptFile)
            ];
        })
    );
}

export const THEME_THEME_PLANNING_MAPPING = {
    "cover-page": createWithJsonThemeConfig("\u5c01\u9762", "01\u5c01\u9762.txt"),
    "toc-page": createWithJsonThemeConfig("\u76ee\u5f55", "02\u603b\u76ee\u5f55.txt"),
    "theme-origin": createWithJsonThemeConfig("\u7075\u611f\u6765\u6e90", "03\u7075\u611f\u6765\u6e90.txt"),
    "theme-event": createNoJsonThemeConfig("\u4e3b\u9898\u4e8b\u4ef6", "05\u4e3b\u9898\u4e8b\u4ef6.txt"),
    "theme-event-continued": createNoJsonThemeConfig("\u4e3b\u9898\u4e8b\u4ef6\uff08\u7eed\u9875\uff09", "05\u4e3b\u9898\u4e8b\u4ef6.txt"),
    "theme-event-3": createNoJsonThemeConfig("\u4e3b\u9898\u4e8b\u4ef6 03", "05\u4e3b\u9898\u4e8b\u4ef6.txt"),
    "theme-event-4": createNoJsonThemeConfig("\u4e3b\u9898\u4e8b\u4ef6 04", "05\u4e3b\u9898\u4e8b\u4ef6.txt"),
    "theme-story-panel": createNoJsonThemeConfig("\u4e3b\u9898\u6545\u4e8b", "09\u4e3b\u9898\u6545\u4e8b.txt"),
    "atmosphere-page": createNoJsonThemeConfig("\u8d8b\u52bf\u6c1b\u56f4", "10\u8d8b\u52bf\u6c1b\u56f4.txt"),
    "themeItemsDirectory": createNoJsonThemeConfig("\u4e3b\u9898\u5355\u54c1\u76ee\u5f55", "11\u4e3b\u9898\u5355\u54c1\u76ee\u5f55.txt"),
    ...createThemeSeriesConfig("themeItemDetail", 6, "\u5355\u54c1\u7ec6\u8282", "12\u5355\u54c1\u7ec6\u8282.txt"),
    "keyItemsDirectory": createNoJsonThemeConfig("\u4e3b\u9898\u5143\u7d20\u76ee\u5f55", "11\u4e3b\u9898\u5143\u7d20\u76ee\u5f55.txt"),
    ...createThemeSeriesConfig("patternDetail", 6, "\u5143\u7d20\u7ec6\u8282", "12\u5143\u7d20\u7ec6\u8282.txt"),
    "page4": createNoJsonThemeConfig("\u4e3b\u9898\u8272\u5f69", "15\u4e3b\u9898\u8272\u5f69.txt"),
    "group-styling-page": createWithJsonThemeConfig("\u7ec4\u8d27\u642d\u914d", "16\u7ec4\u8d27\u642d\u914d.txt"),
    "group-styling-page-2": createWithJsonThemeConfig("\u7ec4\u8d27\u642d\u914d 02", "16\u7ec4\u8d27\u642d\u914d.txt"),
    "group-styling-page-3": createWithJsonThemeConfig("\u7ec4\u8d27\u642d\u914d 03", "16\u7ec4\u8d27\u642d\u914d.txt"),
    "group-styling-page-4": createWithJsonThemeConfig("\u7ec4\u8d27\u642d\u914d 04", "16\u7ec4\u8d27\u642d\u914d.txt"),
    "rack-color-display-page": { ...RESERVED_THEME_THEME_PLANNING_CONFIG, name: "\u6302\u6746\u9648\u5217" },
    "rack-color-display-page-2": { ...RESERVED_THEME_THEME_PLANNING_CONFIG, name: "\u6302\u6746\u9648\u5217 02" },
    "rack-color-display-page-3": { ...RESERVED_THEME_THEME_PLANNING_CONFIG, name: "\u6302\u6746\u9648\u5217 03" },
    "rack-color-display-page-4": { ...RESERVED_THEME_THEME_PLANNING_CONFIG, name: "\u6302\u6746\u9648\u5217 04" },
    "theme-visual-editorial": createNoJsonThemeConfig("\u5f62\u8c61\u5927\u7247", "21\u5f62\u8c61\u5927\u7247.txt"),
    "theme-visual-editorial-2": createNoJsonThemeConfig("\u5f62\u8c61\u5927\u7247 02", "21\u5f62\u8c61\u5927\u7247.txt"),
    "theme-visual-editorial-3": createNoJsonThemeConfig("\u5f62\u8c61\u5927\u7247 03", "21\u5f62\u8c61\u5927\u7247.txt"),
    "theme-visual-editorial-4": createNoJsonThemeConfig("\u5f62\u8c61\u5927\u7247 04", "21\u5f62\u8c61\u5927\u7247.txt"),
    "visual-display-page": createNoJsonThemeConfig("\u89c6\u89c9\u9648\u5217", "25\u89c6\u89c9\u9648\u5217.txt"),
    "visual-display-page-2": createNoJsonThemeConfig("\u89c6\u89c9\u9648\u5217 02", "25\u89c6\u89c9\u9648\u5217.txt"),
    "visual-display-page-3": createNoJsonThemeConfig("\u89c6\u89c9\u9648\u5217 03", "25\u89c6\u89c9\u9648\u5217.txt"),
    "conclusion-page": createWithJsonThemeConfig("\u603b\u7ed3\u5c55\u671b", "26\u603b\u7ed3\u5c55\u671b.txt"),
    "recommendation-page": createNoJsonThemeConfig("\u63a8\u8350\u94fe\u63a5", "27\u63a8\u8350\u94fe\u63a5.txt")
};

export function getThemeThemePlanningConfig(chapterId) {
    return THEME_THEME_PLANNING_MAPPING[String(chapterId || "")] || RESERVED_THEME_THEME_PLANNING_CONFIG;
}
