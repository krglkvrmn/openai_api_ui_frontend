import { Signal } from "@preact/signals-react";
import { ChatCreateType, ChatOverviewType, ChatPropType, ChatStateType, ChatType, ChatsStateType, DefaultChatType, MessageAuthor, MessageType } from "../../types";
import Message from "./Message";
import { useMutation, useQuery } from "react-query";
import { createMessageRequest, createNewChatRequest, getChatRequest, updateChatRequest } from "../../services/backend_api";
import ModelSelector from "../control/ModelSelector";
import { optimisticQueryUpdateConstructor } from "../../utils/optimisticUpdates";
import { createDefaultChat } from "./useChats";
import { queryClient } from "../../App";
import { MessageList } from "./MessageList";
import { SystemPrompt, UserPrompt } from "../control/Prompt";
import PromptFooter from "../layout/PromptFooter";
import React from "react";
import { useActiveChatId } from "../../hooks/useActiveChatId";



function useChat(chat: ChatPropType) {
    // Chat with id === null is not synchronized with a backend
    const [activeChatId, setActiveChatId] = useActiveChatId();
    const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['chats', chat.id],
        queryFn: async () => {
            if (chat.id === null) {
                return {created_at: new Date(), last_updated: new Date(), messages: [], ...chat} as ChatType;
            }
            return await getChatRequest(chat.id) as ChatType;
        },
        staleTime: chat.id === null ? Infinity : 0
    });

   async function switchModel(newModel: string) {
        if (data !== undefined && data.id !== null) {
            await updateChatRequest({id: data.id, title: data.title, model: newModel});
        }
    }

    async function addMessage({ author, text }: {author: MessageAuthor, text: string}) {
        if (data !== undefined && data.id !== null) {
            await createMessageRequest({author, chat_id: data.id, content: text});
        } else if (data !== undefined && data.id === null) {
            return await createNewChatRequest({title: data.title, model: data.model, messages: [{author: author, content: text}] });
        }
    }

    const switchModelOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chat.id],
        stateUpdate: (newModel: string, prevChat: ChatStateType) => {
            if (prevChat !== undefined) {
                return {...prevChat, model: newModel};
            }
            throw new Error('State is not loaded yet');
        }
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: {author: MessageAuthor, text: string}, prevChats: ChatsStateType) => {
            const newChatTitle = data === undefined ? chat.title : data.title;
            const newChatModel = data === undefined ? chat.model : data.model;
            if (prevChats !== undefined) {
                return [{id: null, title: newChatTitle, model: newChatModel, messages: [{
                    author: mutateData.author, content: mutateData.text, created_at: new Date()
                }]}, ...prevChats]
            }
            throw new Error('State is not loaded yet');
        },
        sideEffectsUpdate: (mutateData) => {
            const prevActiveChatId = activeChatId;
            setActiveChatId(0);
            return prevActiveChatId;
        },
        sideEffectsRecover: (sideEffectsPrevState) => {
            if (sideEffectsPrevState !== undefined) {
                setActiveChatId(sideEffectsPrevState);
            }
        }
    });

    const addMessageOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chat.id],
        stateUpdate: (mutateData: {author: MessageAuthor, text: string}, prevChat: ChatStateType) => {
            if (prevChat !== undefined) {
                return {...prevChat, messages: [...prevChat.messages, {
                    author: mutateData.author, content: mutateData.text, created_at: new Date()}]};
            }
            throw new Error('State is not loaded yet');
        }
    });

    const switchModelMutation = useMutation({
        mutationFn: switchModel,
        onMutate: switchModelOptimisticConfig.onMutate,
        onError: chat.id !== null ? switchModelOptimisticConfig.onError : undefined,
        onSettled: chat.id !== null ? switchModelOptimisticConfig.onSettled : undefined
    });

    const addMessageMutation = useMutation({
        mutationFn: addMessage,
        onMutate: async mutateData => {
            return {
                overviewState: await addMessageOptimisticConfig.onMutate(mutateData),
                chatsState: await createChatOptimisticConfig.onMutate(mutateData)
            }
        },
        onError: async (error, variables, context) => {
            addMessageOptimisticConfig.onError(error, variables, context?.overviewState);
            createChatOptimisticConfig.onError(error, variables, context?.chatsState);
        },
        onSuccess: (data) => {
            if (data !== undefined) {
                const chatState = queryClient.getQueryData(['chats', chat.id]);
                console.log(chatState);
                console.log(data);
                queryClient.setQueryData(['chats', data.id], chatState)
                queryClient.setQueryData(['chats', data.id, 'messages', 0], data.messages[0])
            }
        },
        onSettled: async () => {
            // await addMessageOptimisticConfig.onSettled();
            // await createChatOptimisticConfig.onSettled();
        }
    });

    const createChatMutation = useMutation({

    })

    return {
        data,
        isChatLoading: isLoading,
        isChatError: isError,
        isChatSuccess: isSuccess,
        dispatchers: {
            switchModel: switchModelMutation.mutate,
            addMessage: addMessageMutation.mutate
        }
    };

}

export const ChatContext = React.createContext<ChatPropType | null>(null);

export default function Chat(
    { chat, systemPromptParams }:
    { chat: ChatPropType, systemPromptParams?: {systemPromptValue: Signal<string>, setSystemPromptValue: (value: string) => void} }
    ) {
    const { data, isChatLoading, isChatError, isChatSuccess, dispatchers } = useChat(chat);
    const { switchModel, addMessage } = dispatchers;
    return (
        <div id="chat-container">
            <ChatContext.Provider value={data !== undefined ? data : chat }>
                {
                    data !== undefined && data.messages.length === 0 && 
                    <SystemPrompt promptValue={systemPromptParams?.systemPromptValue}
                                  promptValueChangeHandler={systemPromptParams?.setSystemPromptValue}
                                  submitHandler={prompt => addMessage({author: 'system', text: prompt})}/>
                }
                {
                    isChatLoading ? "Loading chat contents..." :
                    isChatError ? "Error occured while loading chat contents" :
                    isChatSuccess && data !== undefined ? 
                        <>
                            <ModelSelector activeModel={data.model}
                                           modelSwitchHandler={switchModel}/>
                            <MessageList messages={data.messages} />
                        </> : null
                }
                <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage({author: 'user', text: prompt})}/>
                </PromptFooter>
            </ChatContext.Provider>
        </div>
    )
}