import { useState, useReducer, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { ChatsActionType, MessageType, ChatIdCallbackType, MessageAuthor, ChatIdNameCallbackType, ChatType, ChatOverviewType, DefaultChatType, ChatsStateType } from "../../types";
import { useStreamingMessage } from "../../services/completions_api";
import { ChatOverviewBackendResponse, createNewChatRequest, deleteChatRequest, getAllChatsOverviewRequest, updateChatRequest } from "../../services/backend_api";
import { Signal } from "@preact/signals-react";
import { useMutation, useQuery } from "react-query";
import { useActiveChatId } from "../../hooks/useActiveChatId";
import { optimisticQueryUpdateConstructor } from "../../utils/optimisticUpdates";


export const CHATS_ACTIONS = {
    SET_CHATS: "set-chats",
    CREATE_CHAT: "create-chat",
    UPDATE_CHAT: "update-chat",
    RENAME_CHAT: "rename-chat",
    DELETE_CHAT: "delete-chat",
    ADD_MESSAGE: "add-message",
    SWITCH_MODEL: "switch-model",
};

export function createDefaultChat(): DefaultChatType {
    return {
        id: null,
        model: "gpt-3.5-turbo",
        title: "New chat",
    };
}


export type TuseChatsDispatchers = {
    // addMessage: (author: MessageAuthor, text: string) => void;
    activateChat: ChatIdCallbackType;
    deleteChat: ChatIdCallbackType;
    renameChat: ChatIdNameCallbackType;
    // switchModel: (newModel: string) => void;
};

export type TuseChatsReturn = {
    activeChat: DefaultChatType | ChatOverviewType,
    chats: ChatsStateType,
    isChatsLoading: boolean,
    isChatsError: boolean,
    isChatsSuccess: boolean,
    // chats: ChatType[];
    // streamingMessage: Signal<MessageType>,
    // activeChatId: number;
    // chatsLoadingError: unknown;
    // chatsLoadingComplete: boolean;
    dispatchers: TuseChatsDispatchers;

};


export function useChats(): TuseChatsReturn {
    const [defaultChat, setDefaultChat] = useState<DefaultChatType>(createDefaultChat());
    const { data, isSuccess, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => await getAllChatsOverviewRequest() as ChatType[],
        placeholderData: []
    });
    const [activeChatId, setActiveChatId] = useActiveChatId();

    async function deleteChat(chat_id: number) {
        if (data !== undefined && data[chat_id].id !== null) {
            await deleteChatRequest((data as ChatOverviewType[])[chat_id].id);
        }
    }
    async function renameChat({chat_id, name}: {chat_id: number, name: string}) {
        if (data !== undefined && data[chat_id].id !== null) {
            await updateChatRequest({...(data as ChatOverviewType[])[chat_id], title: name});
        }
    }
    function activateChat(chat_id: number) {
        setActiveChatId(chat_id);
    }

    const deleteChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (chat_id: number, prevChats: ChatsStateType) => {
            if (prevChats !== undefined) {
                const chatsCopy = prevChats.slice();
                chatsCopy.splice(chat_id, 1);
                return chatsCopy;
            }
            return [];
        },
        sideEffectsUpdate: (chat_id: number) => {
            const prevActiveChatId = activeChatId;
            if (activeChatId === chat_id) {
                setActiveChatId(null);
            } else if (activeChatId !== null && chat_id < activeChatId) {
                setActiveChatId(prevChatId => prevChatId === null ? null : prevChatId - 1);
            }
            return prevActiveChatId;

        },
        sideEffectsRecover: (prevActiveChatId) => {
            prevActiveChatId !== undefined && setActiveChatId(prevActiveChatId);
        }
    });
    const renameChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: {chat_id: number, name: string}, prevChats: ChatsStateType) => {
            const { chat_id, name } = mutateData;
            if (prevChats !== undefined) {
                const chatsCopy = prevChats.slice();
                chatsCopy[chat_id] = {...chatsCopy[chat_id], title: name};
                return chatsCopy;
            }
            return [];

        }
    })
    
    const deleteChatMutation = useMutation({
        mutationFn: deleteChat,
        onMutate: deleteChatOptimisticConfig.onMutate,
        onError: deleteChatOptimisticConfig.onError,
        onSettled: deleteChatOptimisticConfig.onSettled,
    });

    const renameChatMutation = useMutation({
        mutationFn: renameChat,
        onMutate: renameChatOptimisticConfig.onMutate,
        onError: renameChatOptimisticConfig.onError,
        onSettled: renameChatOptimisticConfig.onSettled
    });
    

    const activeChat = activeChatId === null ? defaultChat : (isSuccess ? data[activeChatId] : defaultChat);
    

    return {
        activeChat,
        chats: data,
        isChatsLoading: isLoading,
        isChatsError: isError,
        isChatsSuccess: isSuccess,
        // streamingMessage: streamingMessage,
        // activeChatId: activeChatId,
        // chatsLoadingError: error,
        // chatsLoadingComplete: !loading,
        dispatchers: {
            // addMessage: addMessageWithReply,
            activateChat: activateChat,
            deleteChat: deleteChatMutation.mutate,
            renameChat: renameChatMutation.mutate,
            // switchModel: switchModelMutation.mutate
        }
    };
}


