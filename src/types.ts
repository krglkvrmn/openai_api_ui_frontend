// Main data types

// Chat
export type ChatBaseType = {
    title: string,
    model: string,
    created_at?: Date,
    last_updated?: Date

}

export type DefaultChatType = {
    id: null,
    messages: MessageType[]
} & ChatBaseType;

export type ChatOverviewType = {
    id: number,
} & ChatBaseType;


export type ChatType = {
    id: number | null,
    messages: MessageType[],
} & ChatBaseType;

export type ChatExistingType = ChatType & {id: number};

export type ChatCreateType = {
    messages: MessageCreateType[],
} & ChatBaseType;

// export type ChatAnyType = ChatOverviewType | ChatType;
export type ChatsStateType = ChatType[] | undefined;
export type ChatPropType = ChatType | undefined;
export type ChatStateType = ChatType | undefined;

// export type ChatWithMessagesOverviewType = ChatPropType & {messages: MessageOverviewType[]}
// export type ChatWithMessagesOverviewStateType = ChatWithMessagesOverviewType | undefined;

// Message
export type MessageAuthor = "user" | "system" | "function" | "assistant";

export type MessageOverviewType = {
    id?: number,
    author: MessageAuthor,
    created_at?: Date | null,
}
export type MessageOverviewExistingType = MessageOverviewType & {id: number};

export type MessageCreateType = {
    author: MessageAuthor,
    content: string,
    chat_id?: number,
    created_at?: Date | null,
}

export type MessageType = MessageOverviewType & {content?: string}
export type MessageWithContentType = MessageOverviewType & {content: string}
export type MessageExistingType = MessageType & {id: number}

// Prompt

export type PromptType = {
    id?: number;
    popularity: number;
    content: string
}

export interface ChatTypeFields {
    id?: number,
    model?: string,
    title?: string,
    created_at?: Date | null,
    last_updated?: Date | null,
    messages?: MessageType[]
}

export type ChatsActionType = {type: string, payload: any}

export type ChatIdCallbackType = (chat_id: number) => void;
export type ChatIdNameCallbackType = ({chat_id, name}: {chat_id: number, name: string}) => void;

export type UserErrors = string[];
