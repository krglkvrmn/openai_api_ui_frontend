export function parseChatId(chatId: number | string | null | undefined): number | null {
    switch (typeof chatId) {
        case "string":
            return chatId === "new" ? null : parseInt(chatId, 10);
        case "number":
            return chatId;
        default:
            return null;
    }
}

export function castStringsToDates(obj: any): any {
    if ("created_at" in obj && typeof obj.created_at === "string") {
        obj.created_at = new Date(obj.created_at);
    }
    if ("last_updated" in obj && typeof obj.last_updated === "string") {
        obj.last_updated = new Date(obj.last_updated);
    }
    return obj;
}