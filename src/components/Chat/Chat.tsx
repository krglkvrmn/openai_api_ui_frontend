import { Signal } from "@preact/signals-react";
import { ChatPropType, ChatStateType, ChatType, ChatsStateType, DefaultChatType, MessageAuthor, MessageType } from "../../types";
import Message from "./Message";
import { useMutation, useQuery } from "react-query";
import { createMessageRequest, createNewChatRequest, getChatRequest, updateChatRequest } from "../../services/backend_api";
import ModelSelector from "../control/ModelSelector";
import { optimisticQueryUpdateConstructor } from "../../utils/optimisticUpdates";
import { queryClient } from "../../App";
import { MessageList } from "./MessageList";
import { SystemPrompt, UserPrompt } from "../control/Prompt";
import PromptFooter from "../layout/PromptFooter";
import React, { useEffect, useState } from "react";
import { useActiveChatId } from "../../hooks/contextHooks";
import { useStreamingMessage } from "../../services/completions_api";
import { useAPIKeys } from "../profile/APIKeysController";


function assembleChat(chat: ChatType) {
    const messages = queryClient.getQueriesData<MessageType>(['chats', chat.id, 'messages']).map(query => {
        return query[1];
    }).filter(query => query);
    return {...chat, messages: messages};
}

export function createDefaultChat(): DefaultChatType {
    return {
        id: null,
        model: "gpt-3.5-turbo",
        title: "New chat",
        messages: []
    };
}


function useChat(chat: ChatPropType) {
    // Chat with id === null is not synchronized with a backend
    const [defaultChat, setDefaultChat] = useState<DefaultChatType>(createDefaultChat());

    const activeChat = chat === undefined ? defaultChat : chat;

    const [activeChatId, setActiveChatId] = useActiveChatId();
    const {
        streamingMessage, streamingStatus, streamMessage,
        reset: resetStreamingMessage, abort: abortStreamingMessage
    } = useStreamingMessage();
    const { data: queryData, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['chats', activeChat.id],
        queryFn: async ({ queryKey }) => {
            return await getChatRequest(queryKey[1] as number) as ChatType;
        },
        enabled: activeChat.id !== null
    });
    const data = activeChat.id === null ? {
        created_at: new Date(),
        last_updated: new Date(),
        ...activeChat
    } as ChatType : queryData;

   async function switchModel(
        { chatId, newModel }:
        { chatId: number | null, newModel: string }
    ) {
        if (data !== undefined && chatId !== null) {
            await updateChatRequest({id: chatId, title: data.title, model: newModel});
        }
    }

    async function addMessage(
        { chatId, author, text }:
        { chatId: number | null, author: MessageAuthor, text: string }
    ) {
        if (data !== undefined && chatId !== null) {
            return await createMessageRequest({author, chat_id: chatId, content: text});
        }
    }

    async function createChat(
        { author, text }:
        { author: MessageAuthor, text: string }
    ) {
        if (data !== undefined && data.id === null) {
            return await createNewChatRequest({
                title: data.title, model: data.model,
                messages: [{author: author, content: text}]
            });
        }
    }

    const switchModelOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', activeChat.id],
        stateUpdate: (mutateData: { chatId: number | null, newModel: string }, prevChat: ChatStateType) => {
            if (prevChat !== undefined) {
                return {...prevChat, model: mutateData.newModel};
            } else {
                return {...defaultChat, model: mutateData.newModel}
            }
        },
        sideEffectsUpdate: (mutateData) => {
            if (activeChat.id === null) {
                setDefaultChat(prev => {return {...prev, model: mutateData.newModel}});
            }
        }
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: { author: MessageAuthor, text: string }, prevChats: ChatsStateType) => {
            if (prevChats !== undefined) {
                return [{
                    id: null,
                    title: data === undefined ? activeChat.title : data.title,
                    model: data === undefined ? activeChat.model : data.model,
                    messages: [{author: mutateData.author, content: mutateData.text, created_at: new Date() }]
                }, ...prevChats]
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
        queryKey: ['chats', activeChat.id],
        stateUpdate: (
            mutateData: { chatId: number | null, author: MessageAuthor, text: string},
            prevChat: ChatStateType
        ) => {
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
        onError: activeChat.id !== null ? switchModelOptimisticConfig.onError : undefined,
        onSettled: activeChat.id !== null ? switchModelOptimisticConfig.onSettled : undefined
    });

    const addMessageMutation = useMutation({
        mutationFn: addMessage,
        onMutate: addMessageOptimisticConfig.onMutate,
        onError: addMessageOptimisticConfig.onError,
        onSuccess: async () => {
            if (data !== undefined) {
                await stream(data);
            }
        },
        onSettled: addMessageOptimisticConfig.onSettled
    });

    const createChatMutation = useMutation({
        mutationFn: createChat,
        onMutate: createChatOptimisticConfig.onMutate,
        onError: createChatOptimisticConfig.onError,
        onSuccess: async (resp) => {
            if (resp !== undefined) {
                queryClient.setQueryData(['chats', resp.id], resp);
            }
        },
        onSettled: async (resp) => {
            await createChatOptimisticConfig.onSettled();
            if (resp != undefined) {
                await stream(resp);
            }
        }
    });

    function onMessageSubmit(mutateData: { chatId: number | null, author: MessageAuthor, text: string }) {
        if (!(streamingStatus.value.status === "generating")) {
            activeChat.id === null ? createChatMutation.mutate(mutateData) : addMessageMutation.mutate(mutateData);
        }
    }

    async function stream(chat: ChatType) {
        try {
            const completeChat = assembleChat(chat);
            const finalMessage = await streamMessage(completeChat);
            const savedMessage = await addMessage({ chatId: chat.id, author: finalMessage.author, text: finalMessage.content }); 
            queryClient.setQueryData(['chats', chat.id], {
                ...completeChat, messages: [...completeChat.messages, savedMessage]
            });
        } catch {} finally {
            queryClient.invalidateQueries(['chats', chat.id], { exact: true });
            resetStreamingMessage();
        }


    }

    return {
        data,
        streamingMessage,
        streamingStatus,
        isChatLoading: isLoading,
        isChatError: isError,
        isChatSuccess: isSuccess,
        dispatchers: {
            switchModel: switchModelMutation.mutate,
            addMessage: onMessageSubmit,
        }
       
    };

}

export const ChatContext = React.createContext<ChatPropType | null>(null);

export default function Chat(
    { chat, systemPromptParams }:
    { chat: ChatPropType, systemPromptParams?: {systemPromptValue: Signal<string>, setSystemPromptValue: (value: string) => void} }
    ) {
    const { data, streamingMessage, streamingStatus, isChatLoading, isChatError, dispatchers } = useChat(chat);
    const { switchModel, addMessage } = dispatchers;
    return (
        <div id="chat-container">
            <ChatContext.Provider value={data !== undefined ? data : chat }>
                {
                    data !== undefined && data.messages.length === 0 && 
                    <SystemPrompt promptValue={systemPromptParams?.systemPromptValue}
                                promptValueChangeHandler={systemPromptParams?.setSystemPromptValue}
                                submitHandler={prompt => addMessage({chatId: data.id, author: 'system', text: prompt})}/>
                }
                {
                    isChatLoading ? "Loading chat contents..." :
                    isChatError ? "Error occured while loading chat contents" :
                    data !== undefined ? 
                        <>
                            <ModelSelector activeModel={data.model}
                                        modelSwitchHandler={(newModel: string) => switchModel({chatId: data.id, newModel})}/>
                            <MessageList messages={data.messages} />
                            {!['ready', 'abort'].includes(streamingStatus.value.status) && streamingStatus.value.chatId === data.id &&
                                <Message key={data.messages.length}
                                         author={streamingMessage.value.author}
                                         content={streamingMessage.value.content} />
                            }
                        </> : null
                }
                <PromptFooter>
                    {
                        data !== undefined &&
                        <UserPrompt submitHandler={prompt => addMessage({chatId: data?.id, author: 'user', text: prompt})}/>
                    }
                </PromptFooter>
            </ChatContext.Provider>
        </div>
    )
}