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
import { useActiveChatId } from "../../hooks/useActiveChatId";
import { useStreamingMessage } from "../../services/completions_api";


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
    const [readyToStream, setReadyToStream] = useState(false);
    const [streamingMessage, streamMessage, resetStreamingMessage] = useStreamingMessage();
    const { data: queryData, isLoading, isError, isSuccess, isRefetching } = useQuery({
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

   async function switchModel(newModel: string) {
        if (data !== undefined && data.id !== null) {
            await updateChatRequest({id: data.id, title: data.title, model: newModel});
        }
    }

    async function addMessage({ author, text }: {author: MessageAuthor, text: string}) {
        if (data !== undefined && data.id !== null) {
            return await createMessageRequest({author, chat_id: data.id, content: text});
        }
    }

    async function createChat({ author, text }: {author: MessageAuthor, text: string}) {
        if (data !== undefined && data.id === null) {
            return await createNewChatRequest({
                title: data.title, model: data.model,
                messages: [{author: author, content: text}]
            });
        }
    }

    const switchModelOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', activeChat.id],
        stateUpdate: (newModel: string, prevChat: ChatStateType) => {
            if (prevChat !== undefined) {
                return {...prevChat, model: newModel};
            }
            throw new Error('State is not loaded yet');
        },
        sideEffectsUpdate: (mutateData) => {
            if (activeChat.id === null) {
                setDefaultChat(prev => {return {...prev, model: mutateData}});
            }
        }
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: {author: MessageAuthor, text: string}, prevChats: ChatsStateType) => {
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
        onError: activeChat.id !== null ? switchModelOptimisticConfig.onError : undefined,
        onSettled: activeChat.id !== null ? switchModelOptimisticConfig.onSettled : undefined
    });

    const addMessageMutation = useMutation({
        mutationFn: addMessage,
        onMutate: addMessageOptimisticConfig.onMutate,
        onError: addMessageOptimisticConfig.onError,
        onSuccess: () => setReadyToStream(true),
        onSettled: addMessageOptimisticConfig.onSettled
    });

    const createChatMutation = useMutation({
        mutationFn: createChat,
        onMutate: createChatOptimisticConfig.onMutate,
        onError: createChatOptimisticConfig.onError,
        onSuccess: (resp) => {
            if (resp !== undefined) {
                queryClient.setQueryData(['chats', resp.id], resp);
                setReadyToStream(true);
            }
        },
        onSettled: async () => {
            await createChatOptimisticConfig.onSettled();
        }
    });

    function onMessageSubmit(mutateData: {author: MessageAuthor, text: string}) {
        activeChat.id === null ? createChatMutation.mutate(mutateData) : addMessageMutation.mutate(mutateData);
        
    }

    useEffect(() => {
        if (readyToStream && !isRefetching && data !== undefined && data.id !== null) {
            const completeChat = assembleChat(data);
            streamMessage(completeChat).then(() => {
                return addMessage({author: streamingMessage.value.author, text: streamingMessage.value.content})
            }).then((message) => {
                queryClient.setQueryData(['chats', activeChat.id], {
                    ...completeChat, messages: [...completeChat.messages, message]
                });
            }).finally(() => {
                queryClient.invalidateQueries(['chats', activeChat.id], { exact: true });
                resetStreamingMessage()
            });
            setReadyToStream(false);
        }
    }, [isRefetching]);

    return {
        data,
        streamingMessage,
        isChatLoading: isLoading,
        isChatError: isError,
        isChatSuccess: isSuccess,
        dispatchers: {
            switchModel: switchModelMutation.mutate,
            addMessage: onMessageSubmit
        }
    };

}

export const ChatContext = React.createContext<ChatPropType | null>(null);

export default function Chat(
    { chat, systemPromptParams }:
    { chat: ChatPropType, systemPromptParams?: {systemPromptValue: Signal<string>, setSystemPromptValue: (value: string) => void} }
    ) {
    const { data, streamingMessage, isChatLoading, isChatError, isChatSuccess, dispatchers } = useChat(chat);
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
                    data !== undefined ? 
                        <>
                            <ModelSelector activeModel={data.model}
                                           modelSwitchHandler={switchModel}/>
                            <MessageList messages={data.messages} />
                            {streamingMessage.value.status !== "awaiting" &&
                                <Message key="active-message" author={streamingMessage.value.author} content={streamingMessage.value.content} />
                            }
                        </> : null
                }
                <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage({author: 'user', text: prompt})}/>
                </PromptFooter>
            </ChatContext.Provider>
        </div>
    )
}