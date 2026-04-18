const jsonContentType = /application\/json/i;

export function createApiClient(config) {
  const base = normalizeBase(config.COMFY_HOST || "");

  async function request(path, options = {}) {
    const response = await fetch(base + path, options);
    if (!response.ok) {
      let message = response.statusText;
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
        // ignore
      }
      throw new Error(`ComfyUI request failed: ${response.status} ${message}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (jsonContentType.test(contentType)) {
      return response.json();
    }
    return response.text();
  }

  return {
    ping: () => request("system_stats"),
    uploadImage: (formData) =>
      request("upload/image", {
        method: "POST",
        body: formData
      }),
    submitPrompt: (payload) =>
      request("prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
    fetchHistory: (promptId) => request(`history/${promptId}`),
    getQueue: () => request("queue"), // [✨ New] Get queue status
    buildViewUrl: (filename) =>
      filename ? `${base}view?filename=${encodeURIComponent(filename)}&type=input&subfolder=` : "",
    baseUrl: base,
    apiKey: config.API_KEY || ""
  };
}

function normalizeBase(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

