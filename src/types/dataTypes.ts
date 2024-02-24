// Message types

export type MessageAuthor = "user" | "system" | "function" | "assistant";

export type MessageBase = {
    author: MessageAuthor,
    created_at?: Date
}

export type MessageRead = MessageBase & {
    id: number,
    chat_id: number
}

export type MessageFullRead = MessageRead & {
    content: string
}

export type MessageInfoRead = MessageRead;
export type MessageCreate = MessageBase & {
    content: string
}
export type MessageAddToChatCreate = MessageCreate & {
    chat_id: number
}
export type MessageAny = MessageCreate | MessageFullRead | MessageInfoRead;

// Chat types

export type ChatIdType = number | null;

export type ChatBase = {
    title: string,
    model: string,
    created_at?: Date,
    last_updated?: Date
}


export type ChatRead = ChatBase & {
    id: number
}

export type ChatInfoRead = ChatRead;

export type ChatFullRead = ChatRead & {
    messages: MessageInfoRead[]
}

export type ChatFullCreate = ChatBase & {
    messages: MessageCreate[]
}
export type ChatFullStream = ChatFullCreate;

export type ChatDefault = ChatBase & {
    id: null,
    messages: MessageCreate[]
}

export type ChatAny = ChatBase & {
    id: ChatIdType,
    messages: MessageAny[];
}

// SystemPrompt types

export type SystemPromptBase = {
    content: string
}

export type SystemPromptCreate = SystemPromptBase;

export type SystemPromptRead = SystemPromptBase & {
    id: number,
    user_id: number,
    popularity: number
}

// API keys types

export type APIKeyBase = {
    key: string
}

export type APIKeyRead = APIKeyBase & {
    id: string
}

export type APIKeyCreate = APIKeyBase;