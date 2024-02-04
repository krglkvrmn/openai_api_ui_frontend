import { Signal } from "@preact/signals-react";
import { ChatIdType, ChatPropType, ChatStateType, ChatType, ChatsStateType, DefaultChatType, MessageAuthor, MessageType } from "../../types";
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
import { useStreamingMessage } from "../../services/completions_api";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveChatIndex } from "../../hooks/contextHooks";
import { parseChatId } from "../../utils/stringparsers";


function assembleChat(chat: ChatType) {
    const messages = queryClient.getQueriesData<MessageType>(['chats', chat.id, 'messages']).map(query => {
        return query[1];
    }).filter(query => query);
    return {...chat, messages: messages.length === 0 ? chat.messages : messages};
}

export function createDefaultChat(): DefaultChatType {
    return {
        id: null,
        model: "gpt-3.5-turbo",
        title: "New chat",
        messages: []
    };
}



function useChat(chatId: ChatIdType) {
    const isDefault = chatId === null;

    const [activeChatIndex, setActiveChatIndex] = useActiveChatIndex();
    const [defaultChat, setDefaultChat] = useState<DefaultChatType>(createDefaultChat());
    const {
        streamingMessage, streamingStatus, streamMessage,
        reset: resetStreamingMessage, abort: abortStreamingMessage
    } = useStreamingMessage();
    const { data: queryData, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['chats', chatId],
        queryFn: async ({ queryKey }) => {
            return await getChatRequest(queryKey[1] as ChatIdType) as ChatType;
        },
        enabled: !isDefault
    });
    const navigate = useNavigate();
    const data = queryData === undefined ? defaultChat : queryData;

   async function switchModel(
        { chatId, newModel }:
        { chatId: ChatIdType, newModel: string }
    ) {
        if (!isDefault) {
            await updateChatRequest({id: chatId, title: data.title, model: newModel});
        }
    }

    async function addMessage(
        { chatId, author, text }:
        { chatId: ChatIdType, author: MessageAuthor, text: string }
    ) {
        return await createMessageRequest({author, chat_id: chatId, content: text});
    }

    async function createChat(
        { author, text }:
        { author: MessageAuthor, text: string }
    ) {
        if (isDefault) {
            return await createNewChatRequest({
                title: data.title, model: data.model,
                messages: [{author: author, content: text}]
            });
        }
    }

    const switchModelOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chatId],
        stateUpdate: (mutateData: { chatId: ChatIdType, newModel: string }, prevChat: ChatStateType) => {
            if (prevChat !== undefined) {
                return {...prevChat, model: mutateData.newModel};
            } else {
                return {...data, model: mutateData.newModel}
            }
        }
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: { author: MessageAuthor, text: string }, prevChats: ChatsStateType) => {
            if (prevChats !== undefined) {
                return [{
                    id: null,
                    title: data.title,
                    model: data.model,
                }, ...prevChats]
            }
            throw new Error('State is not loaded yet');
        },
        sideEffectsUpdate: (mutateData) => {
            const prevDefaultChat = defaultChat;
            setDefaultChat(prev => {
                return {...prev, messages: [...prev.messages, {
                    author: mutateData.author, content: mutateData.text
                }], created_at: new Date()}
            });
            return prevDefaultChat;
        },
        sideEffectsRecover: (sideEffectsPrevState) => {
            if (sideEffectsPrevState !== undefined) {
                setDefaultChat(sideEffectsPrevState);
            }
        }
    });

    const addMessageOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chatId],
        stateUpdate: (
            mutateData: { chatId: ChatIdType, author: MessageAuthor, text: string},
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
        onError: switchModelOptimisticConfig.onError,
        onSettled: switchModelOptimisticConfig.onSettled
    });

    const addMessageMutation = useMutation({
        mutationFn: addMessage,
        onMutate: addMessageOptimisticConfig.onMutate,
        onError: addMessageOptimisticConfig.onError,
        onSuccess: async () => {
            await stream(data);
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
                setActiveChatIndex(0);
                navigate(`/chat/${resp.id}`);
                setDefaultChat(createDefaultChat());
                await stream(resp);
            }
        }
    });

    function onMessageSubmit(mutateData: { chatId: ChatIdType, author: MessageAuthor, text: string }) {
        if (!(streamingStatus.value.status === "generating")) {
            isDefault ? createChatMutation.mutate(mutateData) : addMessageMutation.mutate(mutateData);
        }
    }

    async function stream(chat: ChatType) {
        try {
            const completeChat = assembleChat(chat);
            const finalMessage = await streamMessage(completeChat);
            const savedMessage = await addMessage({
                chatId: chat.id, author: finalMessage.author, text: finalMessage.content
            }); 
            queryClient.setQueryData(['chats', chat.id], {
                ...completeChat, messages: [...completeChat.messages, savedMessage]
            });
            queryClient.refetchQueries(['chats', chat.id], {exact: true});
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
    { systemPromptParams }:
    { systemPromptParams?: {systemPromptValue: Signal<string>, setSystemPromptValue: (value: string) => void} }
) {
    const queryParams = useParams();
    const chatId = parseChatId(queryParams.chatId);
    const { data, streamingMessage, streamingStatus, isChatLoading, isChatError, dispatchers } = useChat(chatId);
    const { switchModel, addMessage } = dispatchers;
    return (
        <div id="chat-container">
            <ChatContext.Provider value={data}>
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