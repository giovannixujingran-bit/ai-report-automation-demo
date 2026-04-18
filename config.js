// config.js

const buildThemePlanningPatternDetailBrandFields = () =>
  Array.from({ length: 6 }, (_, index) => ({
    group: "品牌标注",
    key: `img${index + 1}_brand`,
    label: `图片${index + 1} 品牌`,
    default: ""
  }));

const buildThemePlanningGroupStylingFields = () => {
  const itemDefaults = [
    "Brunello Cucinelli",
    "Calvin Klein",
    "By Malene Birger",
    "Khaite",
    "Calvin Klein",
    "Jil Sander",
    "Jil Sander",
    "CLAUDIE PIERLOT",
    "Jil Sander",
    "The Row",
    "补充单品",
    "Source Unknown",
    "单品13",
    "单品14",
    "单品15"
  ];
  /* const groupStylingPaletteFields = Array.from({ length: 7 }, (_, index) => ({
    group: "主题色卡（同步自主题色彩页）",
    key: `palette${index + 1}_code`,
    label: `色卡${index + 1} 色号`,
    default: "",
    placeholder: "请先在主题色彩页生成色号",
    readOnly: true,
    syncFromThemeColorCodeSlot: index + 1
  })); */

  const editableGroupStylingPaletteFields = Array.from({ length: 5 }, (_, index) => ([
    {
      group: `组货色卡 ${index + 1}`,
      key: `palette${index + 1}_cn`,
      label: `色卡${index + 1} 中文`,
      default: ""
    },
    {
      group: `组货色卡 ${index + 1}`,
      key: `palette${index + 1}_en`,
      label: `色卡${index + 1} 英文`,
      default: ""
    },
    {
      group: `组货色卡 ${index + 1}`,
      key: `palette${index + 1}_code`,
      label: `色卡${index + 1} 色号`,
      default: "",
      placeholder: "请由组货搭配生成填入"
    }
  ])).flat();

  return [
    { key: "page_title", label: "页面标题", default: "组货搭配-留白漫游" },
    { key: "hero_brand", label: "主模特标签", default: "KEY LOOK" },
    ...editableGroupStylingPaletteFields,
    ...itemDefaults.map((value, index) => ({
      key: `item${String(index + 1).padStart(2, "0")}_brand`,
      label: `单品${index + 1} 标签`,
      default: value
    }))
  ];
};

// 定义所有可用的报告类型
export const REPORT_CONFIGS = {

  // 这是你的第一个报告
  "silhouette": {
    "name": "服装-廓形趋势报告",
    "templateFile": "templates/silhouette_v1.24.html", // (路径更新为 v14)
    "step1_prompt_file": "prompts/silhouette_step1.txt",
    "step2_prompt_file": "prompts/silhouette_step2.txt",
    "features": { "hasDynamicsSection": false } // <-- ✨ 新增
  },

  "detail": {
    "name": "服装-细节工艺趋势报告",
    "templateFile": "templates/detail_v1.24.html",
    "step1_prompt_file": "prompts/detail_step1.txt",
    "step2_prompt_file": "prompts/detail_step2.txt",
    "features": { "hasDynamicsSection": false } // <-- ✨ 新增
  },

  // 【✨ 新增：辅料报告 ✨】
  "accessories": {
    "name": "服装-辅料趋势报告",
    "templateFile": "templates/accessories_v1.24.html",      // (这是您后续要创建的)
    "step1_prompt_file": "prompts/accessories_step1.txt", // (这是您已准备好的)
    "step2_prompt_file": "prompts/accessories_step2.txt", // (这是您已准备好的)
    "features": { "hasDynamicsSection": true } // <-- ✨ 新增：开启动态板块功能
  },

  // 【✨ 新增：图案报告 ✨】
  "pattern": {
    "name": "服装-图案趋势报告",
    "templateFile": "templates/pattern_v1.0.html",
    "step1_prompt_file": "prompts/pattern_step1.txt",
    "step2_prompt_file": "prompts/pattern_step2.txt",
    "features": { "hasDynamicsSection": true }
  },

  // 【✨ 新增：风格企划模板 ✨】
  "style_planning": {
    "name": "主题-风格企划模板",
    "templateFile": "templates/主题-风格企划模板.html",
    "step1_prompt_file": "prompts/quiet_luxury_step1.txt",
    "step2_prompt_file": "prompts/silhouette_step2.txt",
    "color_direction_prompt_file": "prompts/风格趋势提示词/色彩方向.txt",
    "features": { "hasDynamicsSection": true },
    "structure": [
      {
        id: "cover-page", title: "封面", enTitle: "Cover", maxImages: 1, desc: "建议上传: 1张封面主图",
        fields: [
          { key: "style_trend", label: "风格趋势 (英文)", default: "STYLE TREND REPORT" },
          { key: "report_title", label: "报告标题 (中文)", default: "风格名称（中文）" },
          { key: "report_subtitle", label: "报告副标题 (英文)", default: "风格名称（英文）" },
          { key: "keywords", label: "关键词 (逗号分隔)", default: "关键词1，关键词2，关键词3，关键词4" },
          { key: "report_intro", label: "简介文本", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "toc-page", title: "目录", enTitle: "Table of Contents", maxImages: 8, desc: "建议上传: 8张目录预览图",
        fields: [
          { key: "page_title", label: "页面标题", default: "目录索引" },
          { key: "page_subtitle", label: "页面副标题", default: "Table of Contents" },

          { group: "Chapter 1", key: "ch1_en_title", label: "章节1 英文标题", default: "Style Driver" },
          { group: "Chapter 1", key: "ch1_title", label: "章节1 中文标题", default: "风格驱动" },
          { group: "Chapter 1", key: "ch1_desc", label: "章节1 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 2", key: "ch2_en_title", label: "章节2 英文标题", default: "Consumer Trend" },
          { group: "Chapter 2", key: "ch2_title", label: "章节2 中文标题", default: "画像与趋势" },
          { group: "Chapter 2", key: "ch2_desc", label: "章节2 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 3", key: "ch3_en_title", label: "章节3 英文标题", default: "Inspiration" },
          { group: "Chapter 3", key: "ch3_title", label: "章节3 中文标题", default: "灵感图鉴" },
          { group: "Chapter 3", key: "ch3_desc", label: "章节3 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 4", key: "ch4_en_title", label: "章节4 英文标题", default: "Color Direction" },
          { group: "Chapter 4", key: "ch4_title", label: "章节4 中文标题", default: "色彩方向" },
          { group: "Chapter 4", key: "ch4_desc", label: "章节4 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 5", key: "ch5_en_title", label: "章节5 英文标题", default: "Key Items" },
          { group: "Chapter 5", key: "ch5_title", label: "章节5 中文标题", default: "趋势单品" },
          { group: "Chapter 5", key: "ch5_desc", label: "章节5 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 6", key: "ch6_en_title", label: "章节6 英文标题", default: "Key Patterns" },
          { group: "Chapter 6", key: "ch6_title", label: "章节6 中文标题", default: "趋势图案" },
          { group: "Chapter 6", key: "ch6_desc", label: "章节6 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 7", key: "ch7_en_title", label: "章节7 英文标题", default: "Brand Picks" },
          { group: "Chapter 7", key: "ch7_title", label: "章节7 中文标题", default: "品牌推荐" },
          { group: "Chapter 7", key: "ch7_desc", label: "章节7 简介", type: "textarea", default: "请在此输入简介..." },

          { group: "Chapter 8", key: "ch8_en_title", label: "章节8 英文标题", default: "Outlook" },
          { group: "Chapter 8", key: "ch8_title", label: "章节8 中文标题", default: "总结展望" },
          { group: "Chapter 8", key: "ch8_desc", label: "章节8 简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "style-page", title: "风格驱动", enTitle: "Style Driven", maxImages: 3, desc: "建议上传: 1张主视觉图 + 2张侧边细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "无界静奢" },
          { key: "page_en_title", label: "英文标题", default: "Style Driver" },
          { key: "summary", label: "摘要", type: "textarea", default: "请在此输入简介..." },

          { group: "Trend Inspiration", key: "insp1_title", label: "灵感标题 1", default: "智享运动" },
          { group: "Trend Inspiration", key: "insp2_title", label: "灵感标题 2", default: "科技控温" },
          { group: "Trend Inspiration", key: "insp3_title", label: "灵感标题 3", default: "雪服日常化" },
          { group: "Trend Inspiration", key: "insp4_title", label: "灵感标题 4", default: "概念空间" },

          { group: "Trend Items", key: "item1_title", label: "单品标题 1", default: "关键单品1" },
          { group: "Trend Items", key: "item2_title", label: "单品标题 2", default: "关键单品2" },
          { group: "Trend Items", key: "item3_title", label: "单品标题 3", default: "关键单品3" },
          { group: "Trend Items", key: "item4_title", label: "单品标题 4", default: "关键单品4" },
          { group: "Trend Items", key: "item5_title", label: "单品标题 5", default: "关键单品5" },
          { group: "Trend Items", key: "item6_title", label: "单品标题 6", default: "关键单品6" },
          { group: "Trend Items", key: "item7_title", label: "单品标题 7", default: "关键单品7" },
          { group: "Trend Items", key: "item8_title", label: "单品标题 8", default: "关键单品8" },

          { group: "Trend Patterns", key: "pattern1_title", label: "图案标题 1", default: "关键图案1" },
          { group: "Trend Patterns", key: "pattern2_title", label: "图案标题 2", default: "关键图案2" },
          { group: "Trend Patterns", key: "pattern3_title", label: "图案标题 3", default: "关键图案3" },
          { group: "Trend Patterns", key: "pattern4_title", label: "图案标题 4", default: "关键图案4" },
          { group: "Trend Patterns", key: "pattern5_title", label: "图案标题 5", default: "关键图案5" },
          { group: "Trend Patterns", key: "pattern6_title", label: "图案标题 6", default: "关键图案6" },
          { group: "Trend Patterns", key: "pattern7_title", label: "图案标题 7", default: "关键图案7" },
          { group: "Trend Patterns", key: "pattern8_title", label: "图案标题 8", default: "关键图案8" }
        ]
      },
      {
        id: "consumer-page", title: "消费者画像", enTitle: "Consumer Insight", maxImages: 0, desc: "图表数据配置",
        fields: [
          { group: "Profile 1", key: "p1_title", label: "人群定位-标题", default: "人群定位" },
          { group: "Profile 1", key: "p1_desc", label: "人群定位-描述", type: "textarea", default: "请在此输入简介..." },
          { group: "Profile 1", key: "radar_indicators", label: "雷达图-维度", default: "社交货币,审美红利,自我悦纳,圈层归属,长期主义,科技体感" },
          { group: "Profile 1", key: "radar_values", label: "雷达图-数值", default: "85, 90, 88, 70, 95, 80" },

          { group: "Profile 2", key: "p2_title", label: "场景定位-标题", default: "场景定位" },
          { group: "Profile 2", key: "p2_desc", label: "场景定位-描述", type: "textarea", default: "请在此输入简介..." },
          { group: "Profile 2", key: "bar_xaxis", label: "柱状图-分类", default: "商务社交,都市通勤,旷野度假,松弛感,身份认同" },
          { group: "Profile 2", key: "bar_values", label: "柱状图-数值", default: "40, 30, 45, 55, 35" },

          { group: "Profile 3", key: "p3_title", label: "消费心理-标题", default: "消费心理" },
          { group: "Profile 3", key: "p3_desc", label: "消费心理-描述", type: "textarea", default: "请在此输入简介..." },
          { group: "Profile 3", key: "pie_labels", label: "饼图-分类", default: "质感/面料,品牌价值观,社交认同,流行趋势" },
          { group: "Profile 3", key: "pie_values", label: "饼图-数值", default: "40, 25, 20, 15" }
        ]
      },
      {
        id: "atmosphere-page", title: "趋势氛围", enTitle: "Trend Atmosphere", maxImages: 8, desc: "建议上传: 1张左侧图 + 7张右侧拼图",
        fields: [
          { key: "page_title", label: "页面标题", default: "趋势氛围" },
          { key: "page_intro", label: "页面简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "new-inspiration", title: "灵感驱动", enTitle: "Inspiration", maxImages: 5, desc: "建议上传: 5张灵感图",
        fields: [
          { key: "page_title", label: "页面标题", default: "灵感驱动" },
          { key: "page_subtitle", label: "页面副标题 (英文)", default: "Inspiration-driven" },
          { group: "Left Highlight", key: "trend_title", label: "亮点标题 (中文)", default: "雪潮行者" },
          { group: "Left Highlight", key: "trend_subtitle", label: "亮点标题 (英文)", default: "Treny Skier" },
          { group: "Left Highlight", key: "case_title", label: "案例品牌/标题", default: "The North Face Urban Exploration" },
          { group: "Left Highlight", key: "left_desc", label: "亮点描述", type: "textarea", default: "请在此输入简介..." },

          { group: "Card 1", key: "c1_title", label: "卡片 1 标题", default: "智享运动" },
          { group: "Card 1", key: "c1_sub", label: "卡片 1 副标题", default: "Oakley Meta Vanguard" },
          { group: "Card 1", key: "c1_desc", label: "卡片 1 描述", type: "textarea", default: "请在此输入简介..." },

          { group: "Card 2", key: "c2_title", label: "卡片 2 标题", default: "科技控温" },
          { group: "Card 2", key: "c2_sub", label: "卡片 2 副标题", default: "安踏 Snow Suit V3" },
          { group: "Card 2", key: "c2_desc", label: "卡片 2 描述", type: "textarea", default: "请在此输入简介..." },

          { group: "Card 3", key: "c3_title", label: "卡片 3 标题", default: "雪服日常化" },
          { group: "Card 3", key: "c3_sub", label: "卡片 3 副标题", default: "BALENCIAGA 2025" },
          { group: "Card 3", key: "c3_desc", label: "卡片 3 描述", type: "textarea", default: "请在此输入简介..." },

          { group: "Card 4", key: "c4_title", label: "卡片 4 标题", default: "概念空间" },
          { group: "Card 4", key: "c4_sub", label: "卡片 4 副标题", default: "DESCENTE x Daniel Arsham" },
          { group: "Card 4", key: "c4_desc", label: "卡片 4 描述", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "page4", title: "主题色彩", enTitle: "Theme Color", maxImages: 5, desc: "建议上传: 5张色彩灵感图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题色彩" },
          { key: "summary", label: "描述", type: "textarea" },
          { group: "色卡 1", key: "color1_cn", label: "中文", default: "沙砾米" },
          { group: "色卡 1", key: "color1_en", label: "英文", default: "Sand Beige" },
          { group: "色卡 1", key: "color1_code", label: "潘通", default: "14-1118" },
          { group: "色卡 1", key: "color1", label: "颜色 1 (Hex，仅用于显示颜色)", default: "#E5D3B3" },

          { group: "色卡 2", key: "color2_cn", label: "中文", default: "岩砂灰" },
          { group: "色卡 2", key: "color2_en", label: "英文", default: "Stone Taupe" },
          { group: "色卡 2", key: "color2_code", label: "潘通", default: "17-1210" },
          { group: "色卡 2", key: "color2", label: "颜色 2 (Hex，仅用于显示颜色)", default: "#968F83" },

          { group: "色卡 3", key: "color3_cn", label: "中文", default: "苔原绿" },
          { group: "色卡 3", key: "color3_en", label: "英文", default: "Tundra Green" },
          { group: "色卡 3", key: "color3_code", label: "潘通", default: "18-0513" },
          { group: "色卡 3", key: "color3", label: "颜色 3 (Hex，仅用于显示颜色)", default: "#5B6259" },

          { group: "色卡 4", key: "color4_cn", label: "中文", default: "深海蓝" },
          { group: "色卡 4", key: "color4_en", label: "英文", default: "Deep Sea Navy" },
          { group: "色卡 4", key: "color4_code", label: "潘通", default: "19-4025" },
          { group: "色卡 4", key: "color4", label: "颜色 4 (Hex，仅用于显示颜色)", default: "#2C3642" },

          { group: "色卡 5", key: "color5_cn", label: "中文", default: "红陶棕" },
          { group: "色卡 5", key: "color5_en", label: "英文", default: "Terracotta Brown" },
          { group: "色卡 5", key: "color5_code", label: "潘通", default: "18-1438" },
          { group: "色卡 5", key: "color5", label: "颜色 5 (Hex，仅用于显示颜色)", default: "#7D5A5A" },

          { group: "色卡 6", key: "color6_cn", label: "中文", default: "雾霭蓝" },
          { group: "色卡 6", key: "color6_en", label: "英文", default: "Misty Blue" },
          { group: "色卡 6", key: "color6_code", label: "潘通", default: "14-4103" },
          { group: "色卡 6", key: "color6", label: "颜色 6 (Hex，仅用于显示颜色)", default: "#A8B5CD" },

          { group: "色卡 7", key: "color7_cn", label: "中文", default: "石墨黑" },
          { group: "色卡 7", key: "color7_en", label: "英文", default: "Graphite Black" },
          { group: "色卡 7", key: "color7_code", label: "潘通", default: "19-4007" },
          { group: "色卡 7", key: "color7", label: "颜色 7 (Hex，仅用于显示颜色)", default: "#333333" }
        ]
      },
      {
        id: "color-direction-page", title: "色彩方向", enTitle: "Color Direction", maxImages: 8, desc: "建议上传: 左4张 + 右4张",
        fields: [
          { key: "page_title", label: "页面标题", default: "色彩方向" },
          { group: "Left Theme", key: "left_title", label: "标题 (中文)", default: "海岸听风" },
          { group: "Left Theme", key: "left_en_title", label: "标题 (英文)", default: "Coastal Wind" },
          { group: "Left Theme", key: "left_desc", label: "中文色名 (用+连接)", default: "午夜蓝 + 月光白 + 玛宝蓝 + 海水蓝 + 云杉绿" },
          { group: "Left Theme", key: "left_en_desc", label: "英文色名 (用&连接)", default: "Evening Blue & Moonbeam & Malibu Blue & Floaty Blue & Sea Spray" },
          { group: "Left Theme", key: "left_intro", label: "左侧描述", type: "textarea", default: "请在此输入简介..." },
          // Left Swatches (5)
          { group: "L-Swatch 1", key: "l_c1_hex", label: "色值 (Hex)", default: "#1A2B4C" },
          { group: "L-Swatch 1", key: "l_c1_Code", label: "色号代码", default: "PANTONE<br>19-4052" },
          { group: "L-Swatch 2", key: "l_c2_hex", label: "色值 (Hex)", default: "#F0F4F8" },
          { group: "L-Swatch 2", key: "l_c2_Code", label: "色号代码", default: "PANTONE<br>11-4001" },
          { group: "L-Swatch 3", key: "l_c3_hex", label: "色值 (Hex)", default: "#4A6FA5" },
          { group: "L-Swatch 3", key: "l_c3_Code", label: "色号代码", default: "PANTONE<br>17-4041" },
          { group: "L-Swatch 4", key: "l_c4_hex", label: "色值 (Hex)", default: "#2E86AB" },
          { group: "L-Swatch 4", key: "l_c4_Code", label: "色号代码", default: "PANTONE<br>18-4247" },
          { group: "L-Swatch 5", key: "l_c5_hex", label: "色值 (Hex)", default: "#3A5F40" },
          { group: "L-Swatch 5", key: "l_c5_Code", label: "色号代码", default: "PANTONE<br>19-5917" },

          { group: "Right Theme", key: "right_title", label: "标题 (中文)", default: "暮色余晖" },
          { group: "Right Theme", key: "right_en_title", label: "标题 (英文)", default: "Twilight Afterglow" },
          { group: "Right Theme", key: "right_desc", label: "中文色名 (用+连接)", default: "暮果紫 + 伞菌棕 + 矿层绿 + 绒草灰" },
          { group: "Right Theme", key: "right_en_desc", label: "英文色名 (用&连接)", default: "Twilight Purple & Chanterelle & Tourmaline & Velvet Gray" },
          { group: "Right Theme", key: "right_intro", label: "右侧描述", type: "textarea", default: "请在此输入简介..." },
          // Right Swatches
          { group: "R-Swatch 1", key: "r_c1_hex", label: "色值 (Hex)", default: "#4D3B56" },
          { group: "R-Swatch 1", key: "r_c1_Code", label: "色号代码", default: "PANTONE<br>19-3720" },
          { group: "R-Swatch 2", key: "r_c2_hex", label: "色值 (Hex)", default: "#8D7B68" },
          { group: "R-Swatch 2", key: "r_c2_Code", label: "色号代码", default: "PANTONE<br>16-1319" },
          { group: "R-Swatch 3", key: "r_c3_hex", label: "色值 (Hex)", default: "#556B2F" },
          { group: "R-Swatch 3", key: "r_c3_Code", label: "色号代码", default: "PANTONE<br>18-4030" },
          { group: "R-Swatch 4", key: "r_c4_hex", label: "色值 (Hex)", default: "#A9A9A9" },
          { group: "R-Swatch 4", key: "r_c4_Code", label: "色号代码", default: "PANTONE<br>16-3915" },
          { group: "R-Swatch 5", key: "r_c5_hex", label: "色值 (Hex)", default: "#808080" },
          { group: "R-Swatch 5", key: "r_c5_Code", label: "色号代码", default: "PANTONE<br>00-0000" }
        ]
      },
      {
        id: "rack-color-display-page", title: "挂杆色彩陈列", enTitle: "Rack Color Display", maxImages: 10, desc: "建议上传: 最多10张参考图，生成1张挂杆陈列图，可编辑提示词",
        fields: [
          { key: "page_title", label: "页面标题", default: "挂杆色彩陈列" }
        ]
      },
      {
        id: "style-outfit-page", title: "风格穿搭", enTitle: "Style & Outfit", maxImages: 8, desc: "建议上传: 第1张为背景图, 后7张为穿搭图",
        fields: [
          { key: "page_title", label: "页面标题", default: "风格穿搭" },
          { key: "page_subtitle", label: "页面副标题", default: "Style & Outfit" },
          { key: "img1_brand", label: "品牌 1" },
          { key: "img2_brand", label: "品牌 2" },
          { key: "img3_brand", label: "品牌 3" },
          { key: "img4_brand", label: "品牌 4" },
          { key: "img5_brand", label: "品牌 5" },
          { key: "img6_brand", label: "品牌 6" },
          { key: "img7_brand", label: "品牌 7" }
        ]
      },
      {
        id: "keyItemsDirectory", title: "关键单品目录", enTitle: "Key Items", maxImages: 8, desc: "建议上传: 3-8张单品预览图",
        dynamicFields: { detailIdPrefix: "keyItem", maxCount: 8 }, // 动态同步字段数量
        fields: [
          { key: "page_title", label: "页面标题", default: "关键单品" },
          { key: "item1_title", label: "单品1 标题", default: "" }, { key: "item1_intro", label: "单品1 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item2_title", label: "单品2 标题", default: "" }, { key: "item2_intro", label: "单品2 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item3_title", label: "单品3 标题", default: "" }, { key: "item3_intro", label: "单品3 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item4_title", label: "单品4 标题", default: "" }, { key: "item4_intro", label: "单品4 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item5_title", label: "单品5 标题", default: "" }, { key: "item5_intro", label: "单品5 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item6_title", label: "单品6 标题", default: "" }, { key: "item6_intro", label: "单品6 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item7_title", label: "单品7 标题", default: "" }, { key: "item7_intro", label: "单品7 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "item8_title", label: "单品8 标题", default: "" }, { key: "item8_intro", label: "单品8 简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "keyItem1", title: "单品细节 01", enTitle: "Key Item 01", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 01" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 01" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 顶级双面羊绒" },
          { key: "feature2", label: "关键特性 2", default: "• 流畅落肩剪裁" },
          { key: "feature3", label: "关键特性 3", default: "• 极简无扣设计" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "PRADA" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "PRADA" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "PRADA" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "PRADA" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "PRADA" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "PRADA" },
          // 细节图配置
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem2", title: "单品细节 02", enTitle: "Key Item 02", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 02" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 02" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem3", title: "单品细节 03", enTitle: "Key Item 03", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 03" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 03" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem4", title: "单品细节 04", enTitle: "Key Item 04", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 04" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 04" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem5", title: "单品细节 05", enTitle: "Key Item 05", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 05" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 05" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem6", title: "单品细节 06", enTitle: "Key Item 06", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 06" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 06" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem7", title: "单品细节 07", enTitle: "Key Item 07", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 07" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 07" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "keyItem8", title: "单品细节 08", enTitle: "Key Item 08", maxImages: 6, desc: "建议上传: 6张主图",
        detailImages: { maxImages: 18, desc: "每张主图可上传3张细节图 (共6组×3=18张)" },
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键单品 08" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Key Item Detail 08" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "feature1", label: "关键特性 1", default: "• 特性1" },
          { key: "feature2", label: "关键特性 2", default: "• 特性2" },
          { key: "feature3", label: "关键特性 3", default: "• 特性3" },
          { group: "品牌标注", key: "img1_brand", label: "图 1 品牌", default: "" },
          { group: "品牌标注", key: "img2_brand", label: "图 2 品牌", default: "" },
          { group: "品牌标注", key: "img3_brand", label: "图 3 品牌", default: "" },
          { group: "品牌标注", key: "img4_brand", label: "图 4 品牌", default: "" },
          { group: "品牌标注", key: "img5_brand", label: "图 5 品牌", default: "" },
          { group: "品牌标注", key: "img6_brand", label: "图 6 品牌", default: "" },
          { group: "1 细节图", key: "detail_1_1", label: "细节图 1", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_2", label: "细节图 2", type: "image", default: "" },
          { group: "1 细节图", key: "detail_1_3", label: "细节图 3", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_1", label: "细节图 1", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_2", label: "细节图 2", type: "image", default: "" },
          { group: "2 细节图", key: "detail_2_3", label: "细节图 3", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_1", label: "细节图 1", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_2", label: "细节图 2", type: "image", default: "" },
          { group: "3 细节图", key: "detail_3_3", label: "细节图 3", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_1", label: "细节图 1", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_2", label: "细节图 2", type: "image", default: "" },
          { group: "4 细节图", key: "detail_4_3", label: "细节图 3", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_1", label: "细节图 1", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_2", label: "细节图 2", type: "image", default: "" },
          { group: "5 细节图", key: "detail_5_3", label: "细节图 3", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_1", label: "细节图 1", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_2", label: "细节图 2", type: "image", default: "" },
          { group: "6 细节图", key: "detail_6_3", label: "细节图 3", type: "image", default: "" }
        ]
      },
      {
        id: "patternsDirectory", title: "关键图案目录", enTitle: "Key Patterns", maxImages: 8, desc: "建议上传: 3-8张图案预览图",
        dynamicFields: { detailIdPrefix: "patternDetail", maxCount: 8 }, // 动态同步字段数量
        fields: [
          { key: "page_title", label: "页面标题", default: "关键图案" },
          { key: "pattern1_title", label: "图案1 标题", default: "" }, { key: "pattern1_intro", label: "图案1 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern2_title", label: "图案2 标题", default: "" }, { key: "pattern2_intro", label: "图案2 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern3_title", label: "图案3 标题", default: "" }, { key: "pattern3_intro", label: "图案3 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern4_title", label: "图案4 标题", default: "" }, { key: "pattern4_intro", label: "图案4 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern5_title", label: "图案5 标题", default: "" }, { key: "pattern5_intro", label: "图案5 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern6_title", label: "图案6 标题", default: "" }, { key: "pattern6_intro", label: "图案6 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern7_title", label: "图案7 标题", default: "" }, { key: "pattern7_intro", label: "图案7 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "pattern8_title", label: "图案8 标题", default: "" }, { key: "pattern8_intro", label: "图案8 简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "patternDetail1", title: "图案细节 01", enTitle: "Pattern Detail 01", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 01" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 01" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 飘带真丝衬衫" },
          { key: "app2", label: "应用方向 2", default: "• 复古茶歇裙" },
          { key: "app3", label: "应用方向 3", default: "• 艺术感丝巾配饰" }
        ]
      },
      {
        id: "patternDetail2", title: "图案细节 02", enTitle: "Pattern Detail 02", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 02" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 02" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 提花针织开衫" },
          { key: "app2", label: "应用方向 2", default: "• 丝绒半身裙" },
          { key: "app3", label: "应用方向 3", default: "• 复古手提包" }
        ]
      },
      {
        id: "patternDetail3", title: "图案细节 03", enTitle: "Pattern Detail 03", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 03" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 03" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 扎染牛仔外套" },
          { key: "app2", label: "应用方向 2", default: "• 渐变色连衣裙" },
          { key: "app3", label: "应用方向 3", default: "• 休闲卫衣" }
        ]
      },
      {
        id: "patternDetail4", title: "图案细节 04", enTitle: "Pattern Detail 04", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 04" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 04" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 刺绣夹克" },
          { key: "app2", label: "应用方向 2", default: "• 印花阔腿裤" },
          { key: "app3", label: "应用方向 3", default: "• 民族风配饰" }
        ]
      },
      {
        id: "patternDetail5", title: "图案细节 05", enTitle: "Pattern Detail 05", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 05" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 05" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 应用1" },
          { key: "app2", label: "应用方向 2", default: "• 应用2" },
          { key: "app3", label: "应用方向 3", default: "• 应用3" }
        ]
      },
      {
        id: "patternDetail6", title: "图案细节 06", enTitle: "Pattern Detail 06", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 06" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 06" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 应用1" },
          { key: "app2", label: "应用方向 2", default: "• 应用2" },
          { key: "app3", label: "应用方向 3", default: "• 应用3" }
        ]
      },
      {
        id: "patternDetail7", title: "图案细节 07", enTitle: "Pattern Detail 07", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 07" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 07" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 应用1" },
          { key: "app2", label: "应用方向 2", default: "• 应用2" },
          { key: "app3", label: "应用方向 3", default: "• 应用3" }
        ]
      },
      {
        id: "patternDetail8", title: "图案细节 08", enTitle: "Pattern Detail 08", maxImages: 6,
        fields: [
          { key: "page_title", label: "页面标题 (中文)", default: "关键图案- 08" },
          { key: "page_en_title", label: "页面标题 (英文)", default: "Pattern Trend 08" },
          { key: "page_intro", label: "简介", type: "textarea", default: "请在此输入简介..." },
          { key: "kw1", label: "关键词 1 (中|英)", default: "关键词1 | KEYWORD 1" },
          { key: "kw2", label: "关键词 2 (中|英)", default: "关键词2 | KEYWORD 2" },
          { key: "kw3", label: "关键词 3 (中|英)", default: "关键词3 | KEYWORD 3" },
          { key: "app1", label: "应用方向 1", default: "• 应用1" },
          { key: "app2", label: "应用方向 2", default: "• 应用2" },
          { key: "app3", label: "应用方向 3", default: "• 应用3" }
        ]
      },
      {
        id: "brandsDirectory", title: "品牌推荐目录", enTitle: "Brand Directory", maxImages: 8, desc: "建议上传: 3-8张品牌预览图",
        dynamicFields: { detailIdPrefix: "brandDetail", maxCount: 8 }, // 动态同步字段数量
        fields: [
          { key: "page_title", label: "页面标题", default: "品牌推荐" },
          { key: "brand1_title", label: "品牌1 标题", default: "品牌一" }, { key: "brand1_intro", label: "品牌1 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand2_title", label: "品牌2 标题", default: "品牌二" }, { key: "brand2_intro", label: "品牌2 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand3_title", label: "品牌3 标题", default: "品牌三" }, { key: "brand3_intro", label: "品牌3 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand4_title", label: "品牌4 标题", default: "" }, { key: "brand4_intro", label: "品牌4 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand5_title", label: "品牌5 标题", default: "" }, { key: "brand5_intro", label: "品牌5 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand6_title", label: "品牌6 标题", default: "" }, { key: "brand6_intro", label: "品牌6 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand7_title", label: "品牌7 标题", default: "" }, { key: "brand7_intro", label: "品牌7 简介", type: "textarea", default: "请在此输入简介..." },
          { key: "brand8_title", label: "品牌8 标题", default: "" }, { key: "brand8_intro", label: "品牌8 简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "brandDetail1", title: "品牌推荐 01", enTitle: "Brand Recommendation 01", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌一" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail2", title: "品牌推荐 02", enTitle: "Brand Recommendation 02", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌二" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail3", title: "品牌推荐 03", enTitle: "Brand Recommendation 03", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌三" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail4", title: "品牌推荐 04", enTitle: "Brand Recommendation 04", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌四" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail5", title: "品牌推荐 05", enTitle: "Brand Recommendation 05", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌五" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail6", title: "品牌推荐 06", enTitle: "Brand Recommendation 06", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌六" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail7", title: "品牌推荐 07", enTitle: "Brand Recommendation 07", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌七" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      {
        id: "brandDetail8", title: "品牌推荐 08", enTitle: "Brand Recommendation 08", maxImages: 8, desc: "建议上传: 8张品牌图",
        fields: [          { key: "page_title", label: "品牌名称", default: "品牌八" },
          { key: "page_intro", label: "品牌简介", type: "textarea", default: "请在此输入简介..." },
          { key: "concept_desc", label: "产品概念", type: "textarea", default: "在此处输入概念说明" }
        ]
      },
      // Note: Brand Details are handled via JS injection in template, may require specific handling
      {
        id: "conclusion-page", title: "总结展望", enTitle: "Summary", maxImages: 1, desc: "建议上传: 1张图",
        fields: [
          { key: "page_title", label: "页面标题", default: "总结展望" },
          { key: "summary_title_1", label: "要点 1 标题", default: "美学原点与趋势共鸣" },
          { key: "summary_desc_1", label: "要点 1 描述", type: "textarea", default: "请在此输入简介..." },
          { key: "summary_title_2", label: "要点 2 标题", default: "单品转化方案" },
          { key: "summary_desc_2", label: "要点 2 描述", type: "textarea", default: "请在此输入简介..." },
          { key: "summary_title_3", label: "要点 3 标题", default: "标杆引领与未来开发" },
          { key: "summary_desc_3", label: "要点 3 描述", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "recommendation-page", title: "相关推荐", enTitle: "Recommendations", maxImages: 6, desc: "建议上传: 2, 4 或 6张封面图",
        fields: [{ key: "page_title", label: "页面标题", default: "相关报告推荐" }]
      }
    ]
  },

  "theme_theme_planning": {
    "name": "主题-主题企划模板",
    "templateFile": "templates/主题-主题企划模板.html",
    "step1_prompt_file": "",
    "step2_prompt_file": "",
    "features": { "hasDynamicsSection": true },
    "structure": [
      {
        id: "cover-page", title: "封面", enTitle: "Cover", maxImages: 1, desc: "建议上传: 1张封面主图",
        fields: [
          { key: "style_trend", label: "封面抬头", default: "主题企划" },
          { key: "report_title", label: "页面标题", default: "主题名称（中文）" },
          { key: "report_subtitle", label: "页面副标题", default: "Theme Planning" },
          { key: "keywords", label: "关键词（逗号分隔）", default: "关键词1，关键词2，关键词3，关键词4" },
          { key: "report_intro", label: "简介", type: "textarea", default: "请在此输入简介..." }
        ]
      },
      {
        id: "toc-page", title: "目录", enTitle: "Table of Contents", maxImages: 7, desc: "建议上传: 7张目录预览图",
        fields: [
          { key: "page_title", label: "页面标题", default: "目录" },
          { key: "page_subtitle", label: "页面副标题", default: "Table of Contents" },

          { group: "Chapter 1", key: "ch1_en_title", label: "章节1 英文标题", default: "THEME ORIGIN" },
          { group: "Chapter 1", key: "ch1_title", label: "章节1 中文标题", default: "灵感来源" },
          { group: "Chapter 1", key: "ch1_desc", label: "章节1 简介", type: "textarea", default: "回看主题起点，梳理品牌参照、核心灵感与整体方向判断。" },

          { group: "Chapter 2", key: "ch2_en_title", label: "章节2 英文标题", default: "THEME EVENT" },
          { group: "Chapter 2", key: "ch2_title", label: "章节2 中文标题", default: "\u4E3B\u9898\u4E8B\u4EF6" },
          { group: "Chapter 2", key: "ch2_desc", label: "章节2 简介", type: "textarea", default: "\u68B3\u7406\u4E3B\u9898\u4E8B\u4EF6\u8282\u70B9\u4E0E\u4F20\u64AD\u573A\u666F\uFF0C\u8BA9\u4E3B\u9898\u5185\u5BB9\u5177\u5907\u66F4\u6E05\u6670\u7684\u843D\u5730\u8282\u594F\u3002" },

          { group: "Chapter 3", key: "ch3_en_title", label: "章节3 英文标题", default: "MOOD & INSPIRATION" },
          { group: "Chapter 3", key: "ch3_title", label: "章节3 中文标题", default: "氛围灵感" },
          { group: "Chapter 3", key: "ch3_desc", label: "章节3 简介", type: "textarea", default: "提炼视觉氛围基调，并为后续色彩、元素与造型表达建立统一的场景参考。" },

          { group: "Chapter 4", key: "ch4_en_title", label: "章节4 英文标题", default: "THEME ITEMS" },
          { group: "Chapter 4", key: "ch4_title", label: "章节4 中文标题", default: "主题单品" },
          { group: "Chapter 4", key: "ch4_desc", label: "章节4 简介", type: "textarea", default: "梳理核心单品与品类方向，把主题概念进一步转成明确的产品骨架。" },

          { group: "Chapter 5", key: "ch5_en_title", label: "章节5 英文标题", default: "KEY ELEMENTS" },
          { group: "Chapter 5", key: "ch5_title", label: "章节5 中文标题", default: "主题元素" },
          { group: "Chapter 5", key: "ch5_desc", label: "章节5 简介", type: "textarea", default: "梳理关键元素与细节方向，把主题语言转成更具体的产品表达。" },

          { group: "Chapter 6", key: "ch6_en_title", label: "章节6 英文标题", default: "COLOR & STYLING" },
          { group: "Chapter 6", key: "ch6_title", label: "章节6 中文标题", default: "色彩组货" },
          { group: "Chapter 6", key: "ch6_desc", label: "章节6 简介", type: "textarea", default: "整合主题色彩、组货搭配与挂杆陈列，形成落地可执行的搭配系统。" },

          { group: "Chapter 7", key: "ch7_en_title", label: "章节7 英文标题", default: "VISUAL EXPRESSION" },
          { group: "Chapter 7", key: "ch7_title", label: "章节7 中文标题", default: "视觉演绎" },
          { group: "Chapter 7", key: "ch7_desc", label: "章节7 简介", type: "textarea", default: "进入形象大片与视觉陈列章节，完成主题的最终视觉收束与输出。" }
        ]
      },
      {
        id: "theme-origin", title: "灵感来源", enTitle: "Theme Origin", maxImages: 1, desc: "建议上传: 1张主视觉图",
        fields: [
          { key: "page_title", label: "页面标题", default: "灵感来源" },
          { key: "page_en_title", label: "英文标题", default: "THEME ORIGIN" },
          { key: "kw1_cn", label: "关键词1 中文", default: "占位文本" },
          { key: "kw1_en", label: "关键词1 英文", default: "PLACEHOLDER" },
          { key: "kw2_cn", label: "关键词2 中文", default: "占位文本" },
          { key: "kw2_en", label: "关键词2 英文", default: "PLACEHOLDER" },
          { key: "kw3_cn", label: "关键词3 中文", default: "占位文本" },
          { key: "kw3_en", label: "关键词3 英文", default: "PLACEHOLDER" },
          { key: "summary", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "theme-event", title: "主题事件", enTitle: "Theme Event", maxImages: 4, desc: "建议上传: 4张事件参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题事件" },
          { group: "Column 1", key: "block1_kicker", label: "左侧小标题", default: "01 城市静场主题首发" },
          { group: "Column 1", key: "block1_desc", label: "左侧说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Column 2", key: "block2_kicker", label: "右侧小标题", default: "02 联名限定快闪发布" },
          { group: "Column 2", key: "block2_desc", label: "右侧说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "theme-event-continued", title: "主题事件（续页）", enTitle: "Theme Event Continued", maxImages: 4, desc: "建议上传: 4张事件参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题事件" },
          { group: "Column 1", key: "block1_kicker", label: "左侧小标题", default: "03 材质工坊沉浸体验" },
          { group: "Column 1", key: "block1_desc", label: "左侧说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Column 2", key: "block2_kicker", label: "右侧小标题", default: "04 会员专场收官企划" },
          { group: "Column 2", key: "block2_desc", label: "右侧说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "theme-event-3", title: "主题事件", enTitle: "Theme Event", maxImages: 4, desc: "建议上传: 4张事件参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题事件" },
          { group: "Column 1", key: "block1_kicker", label: "左侧小标题", default: "05 延展故事内容" },
          { group: "Column 1", key: "block1_desc", label: "左侧说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Column 2", key: "block2_kicker", label: "右侧小标题", default: "06 延展故事内容" },
          { group: "Column 2", key: "block2_desc", label: "右侧说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "theme-event-4", title: "主题事件", enTitle: "Theme Event", maxImages: 4, desc: "建议上传: 4张事件参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题事件" },
          { group: "Column 1", key: "block1_kicker", label: "左侧小标题", default: "07 延展故事内容" },
          { group: "Column 1", key: "block1_desc", label: "左侧说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Column 2", key: "block2_kicker", label: "右侧小标题", default: "08 延展故事内容" },
          { group: "Column 2", key: "block2_desc", label: "右侧说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "theme-story-panel", title: "主题故事", enTitle: "Theme Story Panel", maxImages: 1, desc: "建议上传: 1张主题故事主图",
        fields: [
          { key: "eyebrow", label: "眉题", default: "BLANK ROAM" },
          { key: "page_title", label: "页面标题", default: "留白漫游" },
          { key: "page_subtitle", label: "副标题", default: "从趋势灵感到生活场景的叙事展开" },
          { key: "lead", label: "说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Meta 1", key: "meta1_label", label: "标签1", default: "情绪线索" },
          { group: "Meta 1", key: "meta1_value", label: "内容1", default: "松弛 / 秩序 / 留白" },
          { group: "Meta 2", key: "meta2_label", label: "标签2", default: "场景关键词" },
          { group: "Meta 2", key: "meta2_value", label: "内容2", default: "城市漫游 / 静态社交 / 日常仪式" },
          { group: "Meta 3", key: "meta3_label", label: "标签3", default: "转化方向" },
          { group: "Meta 3", key: "meta3_value", label: "内容3", default: "视觉大片 / 色彩系统 / 单品表达" }
        ]
      },
      {
        id: "atmosphere-page", title: "趋势氛围", enTitle: "Trend Atmosphere", maxImages: 8, desc: "建议上传: 8张氛围参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "趋势氛围" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "themeItemsDirectory", title: "主题单品目录", enTitle: "Theme Items", maxImages: 6, desc: "建议上传: 3-6张目录缩略图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题单品" },
          { key: "page_subtitle", label: "背景标题", default: "THEME ITEMS" },
          { group: "Item 1", key: "item1_title", label: "单品1 标题", default: "核心外套" },
          { group: "Item 1", key: "item1_intro", label: "单品1 简介", type: "textarea", default: "适合放本季主推外套、外层廓形与关键主款视角。" },
          { group: "Item 2", key: "item2_title", label: "单品2 标题", default: "结构上衣" },
          { group: "Item 2", key: "item2_intro", label: "单品2 简介", type: "textarea", default: "适合放衬衫、上衣或能体现肩颈结构的重点单品。" },
          { group: "Item 3", key: "item3_title", label: "单品3 标题", default: "下装系统" },
          { group: "Item 3", key: "item3_intro", label: "单品3 简介", type: "textarea", default: "适合放裤装、裙装与比例结构清晰的下装款式。" },
          { group: "Item 4", key: "item4_title", label: "单品4 标题", default: "连衣套装" },
          { group: "Item 4", key: "item4_intro", label: "单品4 简介", type: "textarea", default: "适合放连衣裙、套装或成组出现的完整造型单品。" },
          { group: "Item 5", key: "item5_title", label: "单品5 标题", default: "功能单品" },
          { group: "Item 5", key: "item5_intro", label: "单品5 简介", type: "textarea", default: "适合放具口袋、抽绳、可拆卸等功能模块的重点款。" },
          { group: "Item 6", key: "item6_title", label: "单品6 标题", default: "配件点睛" },
          { group: "Item 6", key: "item6_intro", label: "单品6 简介", type: "textarea", default: "适合放包袋、鞋履、帽饰等强化主题识别的辅助单品。" }
        ]
      },
      {
        id: "themeItemDetail1", title: "单品细节 01", enTitle: "Item Detail 01", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "外层轮廓" },
          { key: "kw1_en", label: "关键词1 英文", default: "OUTERWEAR" },
          { key: "kw2_cn", label: "关键词2 中文", default: "面料厚感" },
          { key: "kw2_en", label: "关键词2 英文", default: "TEXTURE" },
          { key: "kw3_cn", label: "关键词3 中文", default: "造型层次" },
          { key: "kw3_en", label: "关键词3 英文", default: "LAYERING" },
          { key: "app1", label: "要点1", default: "主推外套款" },
          { key: "app2", label: "要点2", default: "层搭外观方向" },
          { key: "app3", label: "要点3", default: "系列主视觉" }
        ]
      },
      {
        id: "themeItemDetail2", title: "单品细节 02", enTitle: "Item Detail 02", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "肩颈结构" },
          { key: "kw1_en", label: "关键词1 英文", default: "TOP" },
          { key: "kw2_cn", label: "关键词2 中文", default: "门襟细节" },
          { key: "kw2_en", label: "关键词2 英文", default: "DETAIL" },
          { key: "kw3_cn", label: "关键词3 中文", default: "内搭关系" },
          { key: "kw3_en", label: "关键词3 英文", default: "LAYER" },
          { key: "app1", label: "要点1", default: "衬衫上衣款" },
          { key: "app2", label: "要点2", default: "通勤叠搭接口" },
          { key: "app3", label: "要点3", default: "领口细节强化" }
        ]
      },
      {
        id: "themeItemDetail3", title: "单品细节 03", enTitle: "Item Detail 03", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "下摆比例" },
          { key: "kw1_en", label: "关键词1 英文", default: "BOTTOM" },
          { key: "kw2_cn", label: "关键词2 中文", default: "裤裙线条" },
          { key: "kw2_en", label: "关键词2 英文", default: "PROPORTION" },
          { key: "kw3_cn", label: "关键词3 中文", default: "行走量感" },
          { key: "kw3_en", label: "关键词3 英文", default: "FLOW" },
          { key: "app1", label: "要点1", default: "裤装版型方向" },
          { key: "app2", label: "要点2", default: "裙装长度控制" },
          { key: "app3", label: "要点3", default: "系列比例支点" }
        ]
      },
      {
        id: "themeItemDetail4", title: "单品细节 04", enTitle: "Item Detail 04", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "整体造型" },
          { key: "kw1_en", label: "关键词1 英文", default: "LOOK" },
          { key: "kw2_cn", label: "关键词2 中文", default: "成组关系" },
          { key: "kw2_en", label: "关键词2 英文", default: "SET" },
          { key: "kw3_cn", label: "关键词3 中文", default: "风格完整" },
          { key: "kw3_en", label: "关键词3 英文", default: "BALANCE" },
          { key: "app1", label: "要点1", default: "连衣款方向" },
          { key: "app2", label: "要点2", default: "套装组合表达" },
          { key: "app3", label: "要点3", default: "成套陈列建议" }
        ]
      },
      {
        id: "themeItemDetail5", title: "单品细节 05", enTitle: "Item Detail 05", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "模块装置" },
          { key: "kw1_en", label: "关键词1 英文", default: "UTILITY" },
          { key: "kw2_cn", label: "关键词2 中文", default: "场景转换" },
          { key: "kw2_en", label: "关键词2 英文", default: "FUNCTION" },
          { key: "kw3_cn", label: "关键词3 中文", default: "实用细节" },
          { key: "kw3_en", label: "关键词3 英文", default: "DETAIL" },
          { key: "app1", label: "要点1", default: "功能款开发" },
          { key: "app2", label: "要点2", default: "场景切换设计" },
          { key: "app3", label: "要点3", default: "模块结构强化" }
        ]
      },
      {
        id: "themeItemDetail6", title: "单品细节 06", enTitle: "Item Detail 06", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "单品细节" },
          { key: "page_en_title", label: "英文标题", default: "ITEM DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "配饰重心" },
          { key: "kw1_en", label: "关键词1 英文", default: "ACCESSORY" },
          { key: "kw2_cn", label: "关键词2 中文", default: "视觉点题" },
          { key: "kw2_en", label: "关键词2 英文", default: "ACCENT" },
          { key: "kw3_cn", label: "关键词3 中文", default: "识别补充" },
          { key: "kw3_en", label: "关键词3 英文", default: "SIGNATURE" },
          { key: "app1", label: "要点1", default: "鞋包配饰点题" },
          { key: "app2", label: "要点2", default: "局部识别强化" },
          { key: "app3", label: "要点3", default: "陈列搭配补位" }
        ]
      },
      {
        id: "keyItemsDirectory", title: "主题元素目录", enTitle: "Theme Elements", maxImages: 6, desc: "建议上传: 3-6张目录缩略图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题元素" },
          { key: "page_subtitle", label: "背景标题", default: "THEME ELEMENTS" },
          { group: "Item 1", key: "item1_title", label: "元素1 标题", default: "核心材质" },
          { group: "Item 1", key: "item1_intro", label: "元素1 简介", type: "textarea", default: "适合放主面料近景与触感截图。" },
          { group: "Item 2", key: "item2_title", label: "元素2 标题", default: "纹理语言" },
          { group: "Item 2", key: "item2_intro", label: "元素2 简介", type: "textarea", default: "适合放印花、纹理重复节奏和图形组织方式。" },
          { group: "Item 3", key: "item3_title", label: "元素3 标题", default: "装饰配件" },
          { group: "Item 3", key: "item3_intro", label: "元素3 简介", type: "textarea", default: "适合放五金、辅料、包边和能提升识别度的局部结构细节。" },
          { group: "Item 4", key: "item4_title", label: "元素4 标题", default: "廓形结构" },
          { group: "Item 4", key: "item4_intro", label: "元素4 简介", type: "textarea", default: "适合放轮廓拆解、比例关系与层次结构示意。" },
          { group: "Item 5", key: "item5_title", label: "元素5 标题", default: "功能装置" },
          { group: "Item 5", key: "item5_intro", label: "元素5 简介", type: "textarea", default: "适合放口袋系统、调节组件和功能细节特写。" },
          { group: "Item 6", key: "item6_title", label: "元素6 标题", default: "图形符号" },
          { group: "Item 6", key: "item6_intro", label: "元素6 简介", type: "textarea", default: "适合放标识系统、图形符号和视觉记忆点。" }
        ]
      },
      {
        id: "patternDetail1", title: "元素细节 01", enTitle: "Element Detail 01", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "材质方向" },
          { key: "kw1_en", label: "关键词1 英文", default: "MATERIAL" },
          { key: "kw2_cn", label: "关键词2 中文", default: "表面肌理" },
          { key: "kw2_en", label: "关键词2 英文", default: "TEXTURE" },
          { key: "kw3_cn", label: "关键词3 中文", default: "触感关键词" },
          { key: "kw3_en", label: "关键词3 英文", default: "TACTILITY" },
          { key: "app1", label: "要点1", default: "主材质特写" },
          { key: "app2", label: "要点2", default: "工艺细节延展" },
          { key: "app3", label: "要点3", default: "应用场景示意" }
        ]
      },
      {
        id: "patternDetail2", title: "元素细节 02", enTitle: "Element Detail 02", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "纹样组织" },
          { key: "kw1_en", label: "关键词1 英文", default: "PATTERN" },
          { key: "kw2_cn", label: "关键词2 中文", default: "图形节奏" },
          { key: "kw2_en", label: "关键词2 英文", default: "RHYTHM" },
          { key: "kw3_cn", label: "关键词3 中文", default: "表面处理" },
          { key: "kw3_en", label: "关键词3 英文", default: "SURFACE" },
          { key: "app1", label: "要点1", default: "纹样拆解图" },
          { key: "app2", label: "要点2", default: "肌理对比组" },
          { key: "app3", label: "要点3", default: "工艺落地方向" }
        ]
      },
      {
        id: "patternDetail3", title: "元素细节 03", enTitle: "Element Detail 03", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "配件点缀" },
          { key: "kw1_en", label: "关键词1 英文", default: "TRIM" },
          { key: "kw2_cn", label: "关键词2 中文", default: "结构细节" },
          { key: "kw2_en", label: "关键词2 英文", default: "STRUCTURE" },
          { key: "kw3_cn", label: "关键词3 中文", default: "局部亮点" },
          { key: "kw3_en", label: "关键词3 英文", default: "ACCENT" },
          { key: "app1", label: "要点1", default: "辅料与五金" },
          { key: "app2", label: "要点2", default: "结构拆解细节" },
          { key: "app3", label: "要点3", default: "装饰亮点归纳" }
        ]
      },
      {
        id: "patternDetail4", title: "元素细节 04", enTitle: "Element Detail 04", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "轮廓变化" },
          { key: "kw1_en", label: "关键词1 英文", default: "SILHOUETTE" },
          { key: "kw2_cn", label: "关键词2 中文", default: "比例平衡" },
          { key: "kw2_en", label: "关键词2 英文", default: "PROPORTION" },
          { key: "kw3_cn", label: "关键词3 中文", default: "层次结构" },
          { key: "kw3_en", label: "关键词3 英文", default: "STRUCTURE" },
          { key: "app1", label: "要点1", default: "轮廓拆解示意" },
          { key: "app2", label: "要点2", default: "比例对比参考" },
          { key: "app3", label: "要点3", default: "层次结构延展" }
        ]
      },
      {
        id: "patternDetail5", title: "元素细节 05", enTitle: "Element Detail 05", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "功能模块" },
          { key: "kw1_en", label: "关键词1 英文", default: "UTILITY" },
          { key: "kw2_cn", label: "关键词2 中文", default: "装置语言" },
          { key: "kw2_en", label: "关键词2 英文", default: "MODULE" },
          { key: "kw3_cn", label: "关键词3 中文", default: "实用细节" },
          { key: "kw3_en", label: "关键词3 英文", default: "DETAIL" },
          { key: "app1", label: "要点1", default: "功能组件特写" },
          { key: "app2", label: "要点2", default: "使用路径说明" },
          { key: "app3", label: "要点3", default: "细节落地建议" }
        ]
      },
      {
        id: "patternDetail6", title: "元素细节 06", enTitle: "Element Detail 06", maxImages: 6, desc: "建议上传: 6张细节图",
        fields: [
          { key: "page_title", label: "页面标题", default: "元素细节" },
          { key: "page_en_title", label: "英文标题", default: "ELEMENT DETAIL" },
          { key: "page_intro", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "list_title", label: "列表标题", default: "应用场景" },
          { key: "kw1_cn", label: "关键词1 中文", default: "图形表达" },
          { key: "kw1_en", label: "关键词1 英文", default: "GRAPHIC" },
          { key: "kw2_cn", label: "关键词2 中文", default: "标识系统" },
          { key: "kw2_en", label: "关键词2 英文", default: "SIGNATURE" },
          { key: "kw3_cn", label: "关键词3 中文", default: "视觉记忆" },
          { key: "kw3_en", label: "关键词3 英文", default: "IDENTITY" },
          { key: "app1", label: "要点1", default: "图形符号提炼" },
          { key: "app2", label: "要点2", default: "版面节奏组合" },
          { key: "app3", label: "要点3", default: "识别应用方向" }
        ]
      },
      {
        id: "page4", title: "主题色彩", enTitle: "Theme Color", maxImages: 5, desc: "建议上传: 5张色彩参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "主题色彩" },
          { key: "summary", label: "页面说明", type: "textarea", default: "请在此输入占位说明文字..." },
          { group: "Color 1", key: "color1_cn", label: "色卡1 中文", default: "" },
          { group: "Color 1", key: "color1_en", label: "色卡1 英文", default: "" },
          { group: "Color 1", key: "color1_code", label: "色卡1 色值", default: "" },
          { group: "Color 2", key: "color2_cn", label: "色卡2 中文", default: "" },
          { group: "Color 2", key: "color2_en", label: "色卡2 英文", default: "" },
          { group: "Color 2", key: "color2_code", label: "色卡2 色值", default: "" },
          { group: "Color 3", key: "color3_cn", label: "色卡3 中文", default: "" },
          { group: "Color 3", key: "color3_en", label: "色卡3 英文", default: "" },
          { group: "Color 3", key: "color3_code", label: "色卡3 色值", default: "" },
          { group: "Color 4", key: "color4_cn", label: "色卡4 中文", default: "" },
          { group: "Color 4", key: "color4_en", label: "色卡4 英文", default: "" },
          { group: "Color 4", key: "color4_code", label: "色卡4 色值", default: "" },
          { group: "Color 5", key: "color5_cn", label: "色卡5 中文", default: "" },
          { group: "Color 5", key: "color5_en", label: "色卡5 英文", default: "" },
          { group: "Color 5", key: "color5_code", label: "色卡5 色值", default: "" },
          { group: "Color 6", key: "color6_cn", label: "色卡6 中文", default: "" },
          { group: "Color 6", key: "color6_en", label: "色卡6 英文", default: "" },
          { group: "Color 6", key: "color6_code", label: "色卡6 色值", default: "" },
          { group: "Color 7", key: "color7_cn", label: "色卡7 中文", default: "" },
          { group: "Color 7", key: "color7_en", label: "色卡7 英文", default: "" },
          { group: "Color 7", key: "color7_code", label: "色卡7 色值", default: "" }
        ]
      },
      {
        id: "group-styling-page", title: "组货搭配", enTitle: "Group Styling", maxImages: 20, desc: "建议上传: 前4张为左侧拼贴图（前3张背景图，第4张上层PNG），后16张为组货搭配图",
        fields: buildThemePlanningGroupStylingFields()
      },
      {
        id: "group-styling-page-2", title: "组货搭配", enTitle: "Group Styling", maxImages: 20, desc: "建议上传: 前4张为左侧拼贴图（前3张背景图，第4张上层PNG），后16张为组货搭配图",
        fields: buildThemePlanningGroupStylingFields()
      },
      {
        id: "group-styling-page-3", title: "组货搭配", enTitle: "Group Styling", maxImages: 20, desc: "建议上传: 前4张为左侧拼贴图（前3张背景图，第4张上层PNG），后16张为组货搭配图",
        fields: buildThemePlanningGroupStylingFields()
      },
      {
        id: "group-styling-page-4", title: "组货搭配", enTitle: "Group Styling", maxImages: 20, desc: "建议上传: 前4张为左侧拼贴图（前3张背景图，第4张上层PNG），后16张为组货搭配图",
        fields: buildThemePlanningGroupStylingFields()
      },
      {
        id: "rack-color-display-page", title: "挂杆陈列", enTitle: "Rack Display", maxImages: 14, desc: "建议上传: 最多14张参考图，生成1张挂杆陈列图，可编辑提示词",
        fields: [
          { key: "page_title", label: "页面标题", default: "挂杆陈列" }
        ]
      },
      {
        id: "rack-color-display-page-2", title: "挂杆陈列", enTitle: "Rack Display", maxImages: 14, desc: "建议上传: 最多14张参考图，生成1张挂杆陈列图，可编辑提示词",
        fields: [
          { key: "page_title", label: "页面标题", default: "挂杆陈列" }
        ]
      },
      {
        id: "rack-color-display-page-3", title: "挂杆陈列", enTitle: "Rack Display", maxImages: 14, desc: "建议上传: 最多14张参考图，生成1张挂杆陈列图，可编辑提示词",
        fields: [
          { key: "page_title", label: "页面标题", default: "挂杆陈列" }
        ]
      },
      {
        id: "rack-color-display-page-4", title: "挂杆陈列", enTitle: "Rack Display", maxImages: 14, desc: "建议上传: 最多14张参考图，生成1张挂杆陈列图，可编辑提示词",
        fields: [
          { key: "page_title", label: "页面标题", default: "挂杆陈列" }
        ]
      },
      {
        id: "theme-visual-editorial", title: "形象大片", enTitle: "Promotional Film", maxImages: 6, desc: "建议上传: 6张形象大片参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "形象大片" },
          { key: "tag1", label: "标签1", default: "VISUAL 01" },
          { key: "tag2", label: "标签2", default: "CAMPAIGN 02" },
          { key: "tag3", label: "标签3", default: "FRAME 03" },
          { key: "tag4", label: "标签4", default: "LOOK 04" },
          { key: "tag5", label: "标签5", default: "STILL 05" },
          { key: "tag6", label: "标签6", default: "VISUAL 06" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "theme-visual-editorial-2", title: "形象大片", enTitle: "Promotional Film", maxImages: 6, desc: "建议上传: 6张形象大片参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "形象大片" },
          { key: "tag1", label: "标签1", default: "VISUAL 01" },
          { key: "tag2", label: "标签2", default: "CAMPAIGN 02" },
          { key: "tag3", label: "标签3", default: "FRAME 03" },
          { key: "tag4", label: "标签4", default: "LOOK 04" },
          { key: "tag5", label: "标签5", default: "STILL 05" },
          { key: "tag6", label: "标签6", default: "VISUAL 06" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "theme-visual-editorial-3", title: "形象大片", enTitle: "Promotional Film", maxImages: 6, desc: "建议上传: 6张形象大片参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "形象大片" },
          { key: "tag1", label: "标签1", default: "VISUAL 01" },
          { key: "tag2", label: "标签2", default: "CAMPAIGN 02" },
          { key: "tag3", label: "标签3", default: "FRAME 03" },
          { key: "tag4", label: "标签4", default: "LOOK 04" },
          { key: "tag5", label: "标签5", default: "STILL 05" },
          { key: "tag6", label: "标签6", default: "VISUAL 06" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "theme-visual-editorial-4", title: "形象大片", enTitle: "Promotional Film", maxImages: 6, desc: "建议上传: 6张形象大片参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "形象大片" },
          { key: "tag1", label: "标签1", default: "VISUAL 01" },
          { key: "tag2", label: "标签2", default: "CAMPAIGN 02" },
          { key: "tag3", label: "标签3", default: "FRAME 03" },
          { key: "tag4", label: "标签4", default: "LOOK 04" },
          { key: "tag5", label: "标签5", default: "STILL 05" },
          { key: "tag6", label: "标签6", default: "VISUAL 06" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "visual-display-page", title: "视觉陈列", enTitle: "Visual Display", maxImages: 6, desc: "建议上传: 6张视觉陈列参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "视觉陈列" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "visual-display-page-2", title: "视觉陈列", enTitle: "Visual Display", maxImages: 6, desc: "建议上传: 6张视觉陈列参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "视觉陈列" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "visual-display-page-3", title: "视觉陈列", enTitle: "Visual Display", maxImages: 6, desc: "建议上传: 6张视觉陈列参考图",
        fields: [
          { key: "page_title", label: "页面标题", default: "视觉陈列" },
          { key: "note", label: "整体说明", type: "textarea", default: "请在此输入整体说明..." }
        ]
      },
      {
        id: "conclusion-page", title: "总结展望", enTitle: "Summary", maxImages: 1, desc: "建议上传: 1张总结页主图",
        fields: [
          { key: "page_title", label: "页面标题", default: "总结展望" },
          { key: "summary_title_1", label: "要点1 标题", default: "占位小标题一" },
          { key: "summary_desc_1", label: "要点1 内容", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "summary_title_2", label: "要点2 标题", default: "占位小标题二" },
          { key: "summary_desc_2", label: "要点2 内容", type: "textarea", default: "请在此输入占位说明文字..." },
          { key: "summary_title_3", label: "要点3 标题", default: "占位小标题三" },
          { key: "summary_desc_3", label: "要点3 内容", type: "textarea", default: "请在此输入占位说明文字..." }
        ]
      },
      {
        id: "recommendation-page", title: "推荐链接", enTitle: "Recommendations", maxImages: 6, desc: "建议上传: 2、4 或 6张推荐封面图",
        fields: [
          { key: "page_title", label: "页面标题", default: "相关报告推荐" }
        ]
      }
    ]
  }
};

const themeThemePlanningPatternSections = REPORT_CONFIGS["theme_theme_planning"]?.structure || [];
themeThemePlanningPatternSections
  .filter((section) => /^patternDetail[1-6]$/.test(String(section?.id || "")))
  .forEach((section) => {
    if (!Array.isArray(section.fields)) section.fields = [];
    const existingKeys = new Set(section.fields.map((field) => String(field?.key || "")));
    buildThemePlanningPatternDetailBrandFields().forEach((field) => {
      if (!existingKeys.has(field.key)) {
        section.fields.push({ ...field });
      }
    });
  });

// 设置一个默认启动时加载的报告
export const DEFAULT_REPORT_TYPE = "style_planning";
