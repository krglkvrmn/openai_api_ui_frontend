export type MessageAuthor = "user" | "system" | "function" | "assistant";

export type MessageType = {
    id?: number,
    author: MessageAuthor,
    content: string,
    status?: "awaiting" | "generating" | "complete",
    created_at?: Date | null,
}

export type PromptType = {
    id?: number;
    popularity: number;
    content: string
}

export type DefaultChatType = {
    id: null,
    title: string,
    model: string
}

export type ChatOverviewType = {
    id: number,
    title: string,
    model: string,
    created_at: Date,
    last_updated: Date
}

export interface ChatTypeFields {
    id?: number,
    model?: string,
    title?: string,
    created_at?: Date | null,
    last_updated?: Date | null,
    messages?: MessageType[]
}

export interface ChatType extends ChatTypeFields {
    model: string,
    title: string,
    messages: MessageType[]
}

export type ChatsActionType = {type: string, payload: any}

export type ChatIdCallbackType = (chat_id: number) => void;
export type ChatIdNameCallbackType = ({chat_id, name}: {chat_id: number, name: string}) => void;

export type UserErrors = string[];
