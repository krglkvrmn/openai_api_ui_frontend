import { useState, useReducer, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { ChatsActionType, MessageType, ChatTypeFields, ChatIdCallbackType, MessageAuthor, ChatIdNameCallbackType, ChatType } from "../../types";


export const CHATS_ACTIONS = {
    SET_CHATS: "set-chats",
    CREATE_CHAT: "create-chat",
    UPDATE_CHAT: "update-chat",
    RENAME_CHAT: "rename-chat",
    DELETE_CHAT: "delete-chat"
};

export function createDefaultChat(): ChatType {
    return {
        model: "gpt-3.5-turbo",
        title: "New chat",
        messages: [],
        created_at: null,
        last_updated: null
    };
}


export type TuseChatsDispatchers = {
    addMessage: (author: MessageAuthor, text: string) => void;
    activateChat: ChatIdCallbackType;
    deleteChat: ChatIdCallbackType;
    renameChat: ChatIdNameCallbackType;
    switchModel: (newModel: string) => void;
};

export type TuseChatsReturn = {
    chats: ChatType[];
    activeChatId: number;
    chatsLoadingError: unknown;
    chatsLoadingComplete: boolean;
    dispatchers: TuseChatsDispatchers;

};

export function useChats(): TuseChatsReturn {
    const { data, error, loading } = useFetch<ChatType[]>('http://localhost:8000/api/v1/chats/all', { method: "GET" });
    const [activeChatId, setActiveChatId] = useState<number>(0);
    const [chats, chatsDispatch] = useReducer((prevChats: ChatType[], action: ChatsActionType) => {
        const prevChatsCopy = prevChats.slice();
        switch (action.type) {
            case CHATS_ACTIONS.SET_CHATS: {
                return action.payload.chats;
            }
            case CHATS_ACTIONS.CREATE_CHAT: {
                prevChatsCopy.splice(0, 1, createDefaultChat(), action.payload.chat);
                return prevChatsCopy;
            }
            case CHATS_ACTIONS.UPDATE_CHAT: {
                prevChatsCopy.splice(action.payload.chat_id, 1, action.payload.chat);
                return prevChatsCopy;
            }
            case CHATS_ACTIONS.DELETE_CHAT: {
                prevChatsCopy.splice(action.payload.chat_id, 1);
                return prevChatsCopy;
            }
            default: {
                throw new Error(`Unknown action for chat: ${action.type}`);
            }
        }
    }, [createDefaultChat()]);

    useEffect(() => {
        if (!loading && data !== null) {
            chatsDispatch({ type: CHATS_ACTIONS.SET_CHATS, payload: { chats: [...chats.slice(), ...data] } });
        }
    }, [data]);

    function createChat(initialMessage: MessageType) {
        if (chats[0].messages.length == 0) {
            const chat = { ...chats[0], messages: [initialMessage], created_at: new Date(), last_updated: new Date() };
            chatsDispatch({ type: CHATS_ACTIONS.CREATE_CHAT, payload: { chat: chat } });
            setActiveChatId(1);
        } else {
            throw new Error('Chat is not empty');
        }
    }

    function updateChat(chat_id: number, chatParams: ChatTypeFields) {
        const updatedChat = { ...chats[chat_id], ...chatParams };
        chatsDispatch({ type: CHATS_ACTIONS.UPDATE_CHAT, payload: { chat_id: chat_id, chat: updatedChat } });
    }

    function addMessage(author: MessageAuthor, text: string) {
        const newMessage: MessageType = { author: author, content: text, created_at: new Date() };
        if (activeChatId === 0) {
            createChat(newMessage);
        } else if (activeChatId > 0) {
            updateChat(activeChatId, { messages: [...chats[activeChatId].messages, newMessage] });
        } else {
            throw new Error(`Invalid active chat - ${activeChatId}`);
        }
    }

    function activateChat(chat_id: number) {
        setActiveChatId(chat_id);
    }

    function deleteChat(chat_id: number) {
        chatsDispatch({type: CHATS_ACTIONS.DELETE_CHAT, payload: {chat_id: chat_id}});
        if (activeChatId == chat_id) {
            setActiveChatId(0);
        } else if  (chat_id < activeChatId) {
            setActiveChatId(prevChatId => prevChatId - 1);
        }
    }

    function renameChat(chat_id: number, name: string) {
        updateChat(chat_id, {title: name});
    }

    function switchModel(newModel: string) {
        console.log(newModel);
        updateChat(activeChatId, {model: newModel});
    }
    

    return {
        chats: chats,
        activeChatId: activeChatId,
        chatsLoadingError: error,
        chatsLoadingComplete: !loading,
        dispatchers: {
            addMessage: addMessage,
            activateChat: activateChat,
            deleteChat: deleteChat,
            renameChat: renameChat,
            switchModel: switchModel
        }
    };
}


