/**
 * Style Planning Chapter Mapping
 * Links chapter numbers to their workflow key and prompt file.
 */

export const STYLE_PLANNING_MAPPING = {
    1: { name: "封面", workflow: "consumerPortrait", prompt: "1封面.txt" },
    2: { name: "总目录", workflow: "consumerPortrait", prompt: "2总目录.txt" },
    3: { name: "风格驱动", workflow: "withJson", prompt: "3风格驱动.txt" },
    4: { name: "风格趋势", workflow: "withJson", prompt: "4风格趋势.txt" },
    5: { name: "消费者画像", workflow: "consumerPortrait", prompt: "5消费者画像.txt" },
    38: { name: "总结展望", workflow: "withJson", prompt: "17总结展望.txt" },

    // Standard pages
    6: { name: "趋势氛围", workflow: "noJson", prompt: "6趋势氛围.txt" },
    7: { name: "灵感驱动", workflow: "noJson", prompt: "7灵感驱动.txt" },
    8: { name: "主题色彩", workflow: "noJson", prompt: "8主题色彩.txt" },
    9: { name: "色彩方向", workflow: "withJson", prompt: "9色彩方向.txt" },
    10: { name: "风格穿搭", workflow: "noJson", prompt: "10风格穿搭.txt" },
    11: { name: "关键单品目录", workflow: "noJson", prompt: "11关键单品目录.txt" },
    12: { name: "关键单品细节 01", workflow: "noJson", prompt: "12关键单品.txt" },
    13: { name: "关键单品细节 02", workflow: "noJson", prompt: "12关键单品.txt" },
    14: { name: "关键单品细节 03", workflow: "noJson", prompt: "12关键单品.txt" },
    15: { name: "关键单品细节 04", workflow: "noJson", prompt: "12关键单品.txt" },
    16: { name: "关键单品细节 05", workflow: "noJson", prompt: "12关键单品.txt" },
    17: { name: "关键单品细节 06", workflow: "noJson", prompt: "12关键单品.txt" },
    18: { name: "关键单品细节 07", workflow: "noJson", prompt: "12关键单品.txt" },
    19: { name: "关键单品细节 08", workflow: "noJson", prompt: "12关键单品.txt" },
    20: { name: "关键图案目录", workflow: "noJson", prompt: "13关键图案.txt" },
    21: { name: "图案细节 01", workflow: "noJson", prompt: "14图案细节.txt" },
    22: { name: "图案细节 02", workflow: "noJson", prompt: "14图案细节.txt" },
    23: { name: "图案细节 03", workflow: "noJson", prompt: "14图案细节.txt" },
    24: { name: "图案细节 04", workflow: "noJson", prompt: "14图案细节.txt" },
    25: { name: "图案细节 05", workflow: "noJson", prompt: "14图案细节.txt" },
    26: { name: "图案细节 06", workflow: "noJson", prompt: "14图案细节.txt" },
    27: { name: "图案细节 07", workflow: "noJson", prompt: "14图案细节.txt" },
    28: { name: "图案细节 08", workflow: "noJson", prompt: "14图案细节.txt" },
    29: { name: "品牌推荐目录", workflow: "noJson", prompt: "15品牌推荐目录.txt" },
    30: { name: "品牌详细推荐 01", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    31: { name: "品牌详细推荐 02", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    32: { name: "品牌详细推荐 03", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    33: { name: "品牌详细推荐 04", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    34: { name: "品牌详细推荐 05", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    35: { name: "品牌详细推荐 06", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    36: { name: "品牌详细推荐 07", workflow: "noJson", prompt: "16品牌详细推荐.txt" },
    37: { name: "品牌详细推荐 08", workflow: "noJson", prompt: "16品牌详细推荐.txt" }
};

export function getStylePlanningConfig(chId) {
    return STYLE_PLANNING_MAPPING[chId] || { workflow: "noJson" };
}
