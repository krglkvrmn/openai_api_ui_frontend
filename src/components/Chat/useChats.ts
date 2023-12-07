import { useState, useReducer, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { ChatsActionType, MessageType, ChatIdCallbackType, MessageAuthor, ChatIdNameCallbackType, ChatType, ChatOverviewType, DefaultChatType } from "../../types";
import { useStreamingMessage } from "../../services/completions_api";
import { ChatOverviewBackendResponse, createNewChatRequest, deleteChatRequest, getAllChatsOverviewRequest, updateChatRequest } from "../../services/backend_api";
import { Signal } from "@preact/signals-react";
import { useMutation, useQuery } from "react-query";
import { queryClient } from "../../App";


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
    chats: ChatOverviewType[] | undefined,
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

type ChatsStateType = ChatOverviewType[] | undefined;
type OptimisticChatsUpdater = (mutateData: any, prevChats: ChatsStateType) => ChatOverviewType[];

export function useChats(): TuseChatsReturn {
    const [defaultChat, setDefaultChat] = useState<DefaultChatType>(createDefaultChat());
    const { data, isSuccess, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => await getAllChatsOverviewRequest() as ChatOverviewType[],
        placeholderData: []
    });
    const [activeChatId, setActiveChatId] = useState<number | null>(null)

    function chatsOptimisticUpdate(updater: OptimisticChatsUpdater) {
        return async (variables: unknown) => {
            await queryClient.cancelQueries('chats');
            const previousChats = queryClient.getQueryData('chats');
            const previousActiveChatId = activeChatId;
            queryClient.setQueryData('chats', (old: ChatsStateType) => updater(variables, old));
            return { previousChats, previousActiveChatId };
        } 
    };

    async function deleteChat(chat_id: number) {
        if (data !== undefined) {
            await deleteChatRequest(data[chat_id].id);
        }
    }

    function deleteChatOptimistic(chat_id: number, prevChats: ChatsStateType) {
        if (prevChats !== undefined) {
            const chatsCopy = prevChats.slice();
            chatsCopy.splice(chat_id, 1);
            if (activeChatId == chat_id) {
                setActiveChatId(null);
            } else if (activeChatId !== null && chat_id < activeChatId) {
                setActiveChatId(prevChatId => prevChatId === null ? null : prevChatId - 1);
            }
            return chatsCopy;
        }
        return [];
    }

    async function renameChat({chat_id, name}: {chat_id: number, name: string}) {
        if (data !== undefined) {
            await updateChatRequest({...data[chat_id], title: name});
        }
    }

    function renameChatOptimistic({chat_id, name}: {chat_id: number, name: string}, prevChats: ChatsStateType) {
        if (prevChats !== undefined && chat_id !== 0) {
            const chatsCopy = prevChats.slice();
            chatsCopy[chat_id] = {...chatsCopy[chat_id], title: name};
            return chatsCopy;
        }
        return [];
    }
    
    // async function switchModel(newModel: string) {
    //     if (data !== undefined && activeChatId !== null) {
    //         await updateChatRequest({...data[activeChatId], model: newModel});
    //     }
    // }

    // function switchModelOptimistic(newModel: string, prevChats: ChatsDataType) {
    //     if (activeChatId === null) {
    //         setNewChat(prev => {return {...prev, model: newModel}});
    //     } else if (prevChats !== undefined) {
    //         const chatsCopy = prevChats.slice();
    //         chatsCopy[activeChatId] = {...chatsCopy[activeChatId], model: newModel};
    //         return chatsCopy;
    //     }
    //     return [];
    // }


    const deleteChatMutation = useMutation({
        mutationFn: deleteChat,
        onMutate: chatsOptimisticUpdate(deleteChatOptimistic),
        onError: (error, mutateData, context) => {
            queryClient.setQueryData('chats', context?.previousChats);
            setActiveChatId(context?.previousActiveChatId === undefined ? 0 : context?.previousActiveChatId);
        },
        onSettled: () => queryClient.invalidateQueries(['chats'])
    });

    const renameChatMutation = useMutation({
        mutationFn: renameChat,
        onMutate: chatsOptimisticUpdate(renameChatOptimistic),
        onError: (error, mutateData, context) => {
            queryClient.setQueryData('chats', context?.previousChats);
            setActiveChatId(context?.previousActiveChatId === undefined ? 0 : context?.previousActiveChatId);
        },
        onSettled: () => queryClient.invalidateQueries(['chats'])
    });
    
    // const switchModelMutation = useMutation({
    //     mutationFn: switchModel,
    //     onMutate: chatsOptimisticUpdate(switchModelOptimistic),
    //     onError: (error, mutateData, context) => {
    //         queryClient.setQueryData('chats', context?.previousChats);
    //         setActiveChatId(context?.previousActiveChatId === undefined ? null : context?.previousActiveChatId);
    //     },
    //     onSettled: () => queryClient.invalidateQueries(['chats'])
    // });
    // const { data, error, loading } = useFetch<ChatType[]>('', { method: "GET" });
    // const [streamingMessage, isMessageStreaming, setIsMessageStreaming, streamMessage, resetStreamingMessage] = useStreamingMessage();
    // const [syncActionsQueue, setSyncActionsQueue] = useState<Array<any>>([]);
    // const [chats, chatsDispatch] = useReducer((prevChats: ChatType[], action: ChatsActionType) => {
    //     const prevChatsCopy = prevChats.slice();
    //     switch (action.type) {
    //         case CHATS_ACTIONS.SET_CHATS: {
    //             return action.payload.chats;
    //         }
    //         case CHATS_ACTIONS.CREATE_CHAT: {
    //             prevChatsCopy.splice(0, 1, createDefaultChat(), action.payload.chat);
    //             return prevChatsCopy;
    //         }
            // case CHATS_ACTIONS.UPDATE_CHAT: {
            //     prevChatsCopy.splice(action.payload.chat_id, 1, action.payload.chat);
            //     return prevChatsCopy;
            // }
            // case CHATS_ACTIONS.DELETE_CHAT: {
            //     prevChatsCopy.splice(action.payload.chat_id, 1);
            //     return prevChatsCopy;
            // }
            // case CHATS_ACTIONS.ADD_MESSAGE: {
            //     return prevChatsCopy.map((chat, index) => 
            //         index === action.payload.chat_id ?
            //         {...chat, messages: [...chat.messages, {...action.payload.message, chat_id: chat.id}]} : chat
            //     );
            // }
    //         case CHATS_ACTIONS.RENAME_CHAT: {
    //             prevChatsCopy[action.payload.chat_id].title = action.payload.title;
    //             return prevChatsCopy;
    //         }
    //         case CHATS_ACTIONS.SWITCH_MODEL: {
    //             prevChatsCopy[action.payload.chat_id].model = action.payload.model;
    //             return prevChatsCopy;
    //         }
    //         default: {
    //             throw new Error(`Unknown action for chat: ${action.type}`);
    //         }
    //     }
    // }, [createDefaultChat()]);

    // useEffect(() => {
    //     if (!loading && data !== null) {
    //         chatsDispatch({ type: CHATS_ACTIONS.SET_CHATS, payload: { chats: [...chats.slice(), ...data] } });
    //     }
    // }, [data]);

    // useEffect(() => {
    //     if (isMessageStreaming) {
    //         streamMessage(chats[activeChatId]).then().catch(error => {
    //             resetStreamingMessage();
    //             console.error('An error occured while recieving streamed message:', error)
    //         }).finally(() => setIsMessageStreaming(false))
    //     } else if (!isMessageStreaming && streamingMessage.value.status === "complete") {
    //         chatsDispatch({type: CHATS_ACTIONS.ADD_MESSAGE, payload: {chat_id: activeChatId, message: streamingMessage.value}});
    //         resetStreamingMessage();
    //         setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: activeChatId}]);
    //     }
    // }, [isMessageStreaming]);

    // useEffect(() => {
    //     const syncAction = syncActionsQueue[0];
    //     try {
    //         switch (syncAction?.type) {
    //             case CHATS_ACTIONS.CREATE_CHAT: {
    //                 createNewChatRequest(chats[syncAction.chat_id]).then(chat => {
    //                     console.debug('Created chat object in a database:', chat);
    //                     chatsDispatch({type: CHATS_ACTIONS.UPDATE_CHAT, payload: {chat_id: syncAction.chat_id, chat: chat}});
    //                 }).catch(error => console.error("Error:", error));
    //                 break;
    //             }
    //             case CHATS_ACTIONS.UPDATE_CHAT: {
    //                 updateChatRequest(chats[syncAction.chat_id]).then(chat => {
    //                     console.debug('Updated chat object in a database:', chat);
    //                     chatsDispatch({type: CHATS_ACTIONS.UPDATE_CHAT, payload: {chat_id: syncAction.chat_id, chat: chat}});
    //                 });
    //                 break;
    //             }
    //             case CHATS_ACTIONS.DELETE_CHAT: {
    //                 deleteChatRequest(syncAction.chat_id).then(response => console.log(response)).catch(error => console.error('Error:', error));
    //                 break;
    //             }
    //             default:
    //                 break;
    //         }
    //         if (syncActionsQueue.length >= 1) {
    //             setSyncActionsQueue(syncActionsQueue.slice(1));
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }, [syncActionsQueue]);

    // function createChat(initialMessages: MessageType[]) {
    //     if (chats[0].messages.length == 0) {
    //         const chat = { ...chats[0], messages: initialMessages, created_at: new Date(), last_updated: new Date() };
    //         chatsDispatch({ type: CHATS_ACTIONS.CREATE_CHAT, payload: { chat: chat } });
    //         setActiveChatId(1);
    //         setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.CREATE_CHAT, chat_id: 1}]);
    //     } else {
    //         throw new Error('Chat is not empty');
    //     }
    // }

    // function addMessage(author: MessageAuthor, text: string) {
    //     const userMessage: MessageType = { author: author, content: text, created_at: new Date() };
        
    //     if (activeChatId === 0) {
    //         createChat([userMessage]);
    //     } else if (activeChatId > 0) {
    //         chatsDispatch({type: CHATS_ACTIONS.ADD_MESSAGE, payload: {chat_id: activeChatId, message: userMessage}});
    //         setSyncActionsQueue(prev => [...prev, {type: CHATS_ACTIONS.UPDATE_CHAT, chat_id: activeChatId}]);
    //     } else {
    //         throw new Error(`Invalid active chat - ${activeChatId}`);
    //     }
        
    // }

    // function addMessageWithReply(author: MessageAuthor, text: string) {
    //     addMessage(author, text);
    //     if (author !== "system") {
    //         setIsMessageStreaming(true);
    //     }
    // }

    function activateChat(chat_id: number) {
        setActiveChatId(chat_id);
    }

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


