const DEFAULT_STYLE_PATCH = [
  "html,body{overflow-x:clip}",
  "@supports not (overflow-x:clip){html,body{overflow-x:hidden}}",
  ".toc-grid,.report-chapter,.masonry-gallery{max-width:100%}",
  ".toc-card{overflow-wrap:anywhere;word-break:break-word}",
  '.brand-name[contenteditable=\"true\"]{outline:2px dashed rgba(17,17,17,.3)}'
].join("");

export class TemplateService {
  constructor(options = {}) {
    const fallbackFetch = (...args) => globalThis.fetch(...args);
    this.fetchFn = options.fetchFn || fallbackFetch;
    this.cache = new Map();
    this.stylePatch = options.stylePatch || DEFAULT_STYLE_PATCH;
    this.reportConfigs = options.reportConfigs || {};
  }

  async loadTemplate(url) {
    if (!url) {
      throw new Error("Template url is missing");
    }
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const response = await this.fetchFn(url, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Unable to load template (${url}): ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    this.cache.set(url, text);
    return text;
  }

  async generateHtml(reportData, reportType) {
    const config = this.reportConfigs[reportType];
    if (!config) {
      throw new Error(`Unknown report type: ${reportType}`);
    }
    return this.buildReportHtml({
      templateUrl: config.templateFile,
      viewerJson: reportData
    });
  }

  async buildReportHtml({ templateUrl, viewerJson }) {
    let template = await this.loadTemplate(templateUrl);
    template = injectStyles(template, this.stylePatch);
    return injectViewerJson(template, viewerJson);
  }
}

function injectStyles(html, inlineStyles) {
  if (!inlineStyles) return html;
  const styleTag = `<style>${inlineStyles}</style></head>`;
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, styleTag);
  }
  return `<head>${styleTag}</head>${html}`;
}

function injectViewerJson(html, json) {
  const jsonStr = JSON.stringify(json, null, 2);
  const assignmentRegex = /const\s+jsonData\s*=\s*\{[\s\S]*?\}\s*;/;
  if (assignmentRegex.test(html)) {
    return html.replace(assignmentRegex, `const jsonData = ${jsonStr};`);
  }
  const escaped = jsonStr.replace(/<\//g, "<\\/");
  const script = `
<script id="report-data" type="application/json">${escaped}</script>
<script id="report-data-bootstrap">
  (() => {
    try {
      const source = document.getElementById("report-data");
      if (!source) return;
      window.jsonData = JSON.parse(source.textContent || "{}");
    } catch (error) {
      console.warn("[report-data] bootstrap failed", error);
    }
  })();
</script>
`;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `\n${script}\n</body>`);
  }
  return `${html}\n${script}`;
}
