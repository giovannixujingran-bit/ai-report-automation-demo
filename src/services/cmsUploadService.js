const SUCCESS_CODES = new Set([200, 0, 1, "200", "0", "1"]);

export class CmsUploadService {
  constructor({ endpoint, token, fetchFn } = {}) {
    this.endpoint = endpoint;
    this.token = token;
    this.fetchFn = fetchFn || ((...args) => globalThis.fetch(...args));
  }

  async uploadImages(files = []) {
    if (!files.length) return [];
    const url = this.buildUrl();
    const form = new FormData();
    files.forEach((file, idx) => {
      form.append("image", file, file.name || `image_${idx}`);
    });
    if (!url) throw new Error("[CMS UPLOAD] Missing upload URL");
    console.log("[CMS UPLOAD] request", {
      url,
      method: "POST",
      origin: typeof location !== "undefined" ? location.origin : "unknown",
      online: typeof navigator !== "undefined" ? navigator.onLine : "unknown"
    });

    try {
      const response = await this.fetchFn(url, {
        method: "POST",
        body: form,
        headers: {
          Accept: "application/json"
        }
      });
      const payload = await safeJson(response);
      const isOk = response.ok && isSuccessPayload(payload);
      if (!isOk) {
        throw new Error((payload && (payload.msg || payload.message)) || `CMS upload failed(${response.status})`);
      }
      const urls = extractUrls(payload);
      if (!urls.length) {
        throw new Error("CMS returned no usable URL");
      }
      return urls;
    } catch (err) {
      console.error("[CMS UPLOAD] failed", {
        url,
        message: err?.message,
        name: err?.name,
        online: typeof navigator !== "undefined" ? navigator.onLine : "unknown"
      });
      throw err;
    }
  }

  buildUrl() {
    if (!this.endpoint) {
      throw new Error("CMS upload endpoint is not configured");
    }
    const url = new URL(this.endpoint);
    if (this.token) {
      url.searchParams.set("api_token", this.token);
    }
    return url.toString();
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (err) {
    console.warn("CMS response is not valid JSON", err);
    return null;
  }
}

function isSuccessPayload(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (typeof payload.msg === "string" && payload.msg.includes("成功")) return true;
  if (payload.ret !== undefined) return SUCCESS_CODES.has(payload.ret);
  if (payload.code !== undefined) return SUCCESS_CODES.has(payload.code);
  return true;
}

function extractUrls(payload) {
  if (!payload || typeof payload !== "object") return [];
  const pools = [];
  if (Array.isArray(payload.data)) pools.push(payload.data);
  if (Array.isArray(payload.result)) pools.push(payload.result);
  if (Array.isArray(payload.urls)) pools.push(payload.urls);
  if (payload.data && typeof payload.data === "object" && payload.data.imgList && typeof payload.data.imgList === "object") {
    pools.push(Object.values(payload.data.imgList));
  }
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    pools.push(Object.values(payload.data));
  }
  if (!pools.length) {
    return [];
  }

  const urls = [];
  pools.flat().forEach((item) => {
    if (!item) return;
    if (typeof item === "string") {
      urls.push({ url: item });
      return;
    }
    if (typeof item === "object") {
      const url = item.url || item.full_path || item.fullUrl || item.path || "";
      const imgName = item.imgName || item.name || item.filename || item.fileName || "";
      if (url) urls.push({ url, imgName });
    }
  });
  return urls.filter((item) => item && item.url).map((item) => ({ url: item.url, imgName: item.imgName || "" }));
}
