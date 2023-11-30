import { useState, useReducer, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { ChatsActionType, MessageType, ChatIdCallbackType, MessageAuthor, ChatIdNameCallbackType, ChatType } from "../../types";
import { useStreamingMessage } from "../../services/completions_api";
import { createNewChatRequest, deleteChatRequest, updateChatRequest } from "../../services/backend";
import { Signal } from "@preact/signals-react";


export const CHATS_ACTIONS = {
    SET_CHATS: "set-chats",
    CREATE_CHAT: "create-chat",
    UPDATE_CHAT: "update-chat",
    RENAME_CHAT: "rename-chat",
    DELETE_CHAT: "delete-chat",
    ADD_MESSAGE: "add-message",
    SWITCH_MODEL: "switch-model",
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
    streamingMessage: Signal<MessageType>,
    activeChatId: number;
    chatsLoadingError: unknown;
    chatsLoadingComplete: boolean;
    dispatchers: TuseChatsDispatchers;

};

export function useChats(): TuseChatsReturn {
    const { data, error, loading } = useFetch<ChatType[]>('http://localhost:8000/api/v1/chats/all', { method: "GET" });
    const [streamingMessage, isMessageStreaming, setIsMessageStreaming, streamMessage, resetStreamingMessage] = useStreamingMessage();
    const [activeChatId, setActiveChatId] = useState<number>(0);
    const [syncActionsQueue, setSyncActionsQueue] = useState<Array<any>>([]);
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
            case CHATS_ACTIONS.ADD_MESSAGE: {
                return prevChatsCopy.map((chat, index) => 
                    index === action.payload.chat_id ?
                    {...chat, messages: [...chat.messages, {...action.payload.message, chat_id: chat.id}]} : chat
                );
            }
            case CHATS_ACTIONS.RENAME_CHAT: {
                prevChatsCopy[action.payload.chat_id].title = action.payload.title;
                return prevChatsCopy;
            }
            case CHATS_ACTIONS.SWITCH_MODEL: {
                prevChatsCopy[action.payload.chat_id].model = action.payload.model;
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

    useEffect(() => {
        if (isMessageStreaming) {
            streamMessage(chats[activeChatId]).then().catch(error => {
                resetStreamingMessage();
                console.error('An error occured while recieving streamed message:', error)
            }).finally(() => setIsMessageStreaming(false))
        } else if (!isMessageStreaming && streamingMessage.value.status === "complete") {
            chatsDispatch({type: CHATS_ACTIONS.ADD_MESSAGE, payload: {chat_id: activeChatId, message: streamingMessage.value}});
            resetStreamingMessage();
            setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: activeChatId}]);
        }
    }, [isMessageStreaming]);

    useEffect(() => {
        const syncAction = syncActionsQueue[0];
        try {
            switch (syncAction?.type) {
                case CHATS_ACTIONS.CREATE_CHAT: {
                    createNewChatRequest(chats[syncAction.chat_id]).then(chat => {
                        console.debug('Created chat object in a database:', chat);
                        chatsDispatch({type: CHATS_ACTIONS.UPDATE_CHAT, payload: {chat_id: syncAction.chat_id, chat: chat}});
                    }).catch(error => console.error("Error:", error));
                    break;
                }
                case CHATS_ACTIONS.UPDATE_CHAT: {
                    updateChatRequest(chats[syncAction.chat_id]).then(chat => {
                        console.debug('Updated chat object in a database:', chat);
                        chatsDispatch({type: CHATS_ACTIONS.UPDATE_CHAT, payload: {chat_id: syncAction.chat_id, chat: chat}});
                    });
                    break;
                }
                case CHATS_ACTIONS.DELETE_CHAT: {
                    deleteChatRequest(syncAction.chat_id).then(response => console.log(response)).catch(error => console.error('Error:', error));
                    break;
                }
                default:
                    break;
            }
            if (syncActionsQueue.length >= 1) {
                setSyncActionsQueue(syncActionsQueue.slice(1));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [syncActionsQueue]);

    function createChat(initialMessages: MessageType[]) {
        if (chats[0].messages.length == 0) {
            const chat = { ...chats[0], messages: initialMessages, created_at: new Date(), last_updated: new Date() };
            chatsDispatch({ type: CHATS_ACTIONS.CREATE_CHAT, payload: { chat: chat } });
            setActiveChatId(1);
            setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.CREATE_CHAT, chat_id: 1}]);
        } else {
            throw new Error('Chat is not empty');
        }
    }

    function addMessage(author: MessageAuthor, text: string) {
        const userMessage: MessageType = { author: author, content: text, created_at: new Date() };
        
        if (activeChatId === 0) {
            createChat([userMessage]);
        } else if (activeChatId > 0) {
            chatsDispatch({type: CHATS_ACTIONS.ADD_MESSAGE, payload: {chat_id: activeChatId, message: userMessage}});
            setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: activeChatId}]);
        } else {
            throw new Error(`Invalid active chat - ${activeChatId}`);
        }
        
    }

    function addMessageWithReply(author: MessageAuthor, text: string) {
        addMessage(author, text);
        if (author !== "system") {
            setIsMessageStreaming(true);
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
        setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.DELETE_CHAT, chat_id: chats[chat_id].id}]);
    }

    function renameChat(chat_id: number, name: string) {
        chatsDispatch({type: CHATS_ACTIONS.RENAME_CHAT, payload: {chat_id: chat_id, title: name}});
        setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: chat_id}]);
    }

    function switchModel(newModel: string) {
        chatsDispatch({type: CHATS_ACTIONS.SWITCH_MODEL, payload: {chat_id: activeChatId, model: newModel}});
        if (activeChatId !== 0) {
            setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: activeChatId}]);
        }
    }
    

    return {
        chats: chats,
        streamingMessage: streamingMessage,
        activeChatId: activeChatId,
        chatsLoadingError: error,
        chatsLoadingComplete: !loading,
        dispatchers: {
            addMessage: addMessageWithReply,
            activateChat: activateChat,
            deleteChat: deleteChat,
            renameChat: renameChat,
            switchModel: switchModel
        }
    };
}


