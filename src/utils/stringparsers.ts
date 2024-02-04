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