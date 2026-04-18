export class DraftService {
    constructor(dbName = "PopAiDraftsDB", storeName = "drafts") {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    async init() {
        if (this.db) return;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async saveDraft(title, data) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const draft = {
                id: Date.now().toString(),
                title: title || "未命名草稿",
                updatedAt: Date.now(),
                data: data
            };
            const request = store.put(draft);
            request.onsuccess = () => resolve(draft.id);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async updateDraft(id, data, newTitle = null) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const getReq = store.get(id);

            getReq.onsuccess = () => {
                const draft = getReq.result;
                if (!draft) {
                    reject(new Error("Draft not found"));
                    return;
                }
                draft.data = data;
                draft.updatedAt = Date.now();
                if (newTitle) draft.title = newTitle;

                const putReq = store.put(draft);
                putReq.onsuccess = () => resolve(id);
                putReq.onerror = (e) => reject(e.target.error);
            };
            getReq.onerror = (e) => reject(e.target.error);
        });
    }

    async getAllDrafts() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                // Sort by updatedAt desc
                const list = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
                resolve(list);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async deleteDraft(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async importDraft(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = JSON.parse(e.target.result);
                    // Validate basic structure
                    if (!content.data || !content.title) {
                        throw new Error("Invalid draft file format");
                    }
                    // Force a new ID to avoid collision
                    const newId = await this.saveDraft(content.title + " (导入)", content.data);
                    resolve(newId);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
}
