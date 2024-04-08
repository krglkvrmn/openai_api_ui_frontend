import {Signal} from "@preact/signals-react";
import {useMutation, useQuery} from "react-query";
import {createMessageRequest, createNewChatRequest, getChatRequest, updateChatRequest} from "../../services/backendAPI";
import ModelSelector from "../control/ModelSelector/ModelSelector.tsx";
import {optimisticQueryUpdateConstructor} from "../../utils/optimisticUpdates";
import {MessageList} from "./MessageList";
import React, {useEffect, useState} from "react";
import {StreamingStateType, useStreamingMessage} from "../../services/messageStreaming";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useActiveChatIndex} from "../../hooks/contextHooks";
import {parseChatId} from "../../utils/stringparsers";
import {
    ChatAny,
    ChatDefault,
    ChatFullRead,
    ChatFullStream,
    ChatIdType,
    MessageAny,
    MessageAuthor,
    MessageCreate,
    MessageFullRead
} from "../../types/dataTypes";
import {queryClient} from "../../queryClient.ts";
import styles from "./style.module.css";
import {PromptsManager} from "../control/PromptsManager/PromptsManager.tsx";
import {ElementOrLoader} from "../ui/Buttons/ElementOrLoader.tsx";
import {LoadingError} from "../ui/InfoPanels/Error.tsx";
import {APIKeyErrors} from "../control/Errors/APIKeyErrors.tsx";
import {RegenerateMessageButton} from "../ui/Buttons/RegenerateMessageButton.tsx";
import {AbortMessageGenerationButton} from "../ui/Buttons/AbortMessageGenerationButton.tsx";


type TuseChatReturn = {
    data: ChatAny,
    streamingMessage: Signal<MessageCreate>,
    streamingState: Signal<StreamingStateType>,
    isChatLoading: boolean,
    isChatError: boolean,
    isChatSuccess: boolean,
    dispatchers: {
        reloadChat: () => void,
        switchModel: ({chatId, newModel}: {chatId: ChatIdType, newModel: string}) => void,
        addMessage: ({chatId, author, text}: {chatId: ChatIdType, author: MessageAuthor, text: string}) => void,
        abortGeneration: () => void,
        generateResponse: () => void
    }
}

function assembleChat(chat: ChatAny): ChatFullStream {
    const messages = queryClient.getQueriesData<MessageFullRead>( ['chats', chat.id, 'messages']).map(query => {
        return query[1];
    }).filter(query => query);
    return {...chat, messages: messages.length === 0 ? chat.messages as MessageCreate[] : messages};
}

function createDefaultChat(): ChatDefault {
    return {
        id: null,
        model: "gpt-3.5-turbo",
        title: "New chat",
        messages: []
    }
}


function useChat(chatId: ChatIdType): TuseChatReturn {
    const isDefault = chatId === null;

    const navigate = useNavigate();
    const location = useLocation();
    const setActiveChatIndex = useActiveChatIndex()[1];
    const [defaultChat, setDefaultChat] = useState<ChatDefault>(createDefaultChat());
    const {
        streamingMessage, streamingState, streamMessage,
        reset: resetStreamingMessage, abort: abortStreamingMessage
    } = useStreamingMessage(chatId);
    const { data: queryData, refetch, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['chats', chatId],
        queryFn: async ({ queryKey }) => {
            // await new Promise((resolve, reject) => setTimeout(() => resolve(1), 100000));
            return await getChatRequest(queryKey[1] as number);
        },
        // onError: () => navigate('/chat/new'),
        enabled: !isDefault
    });
    const data: ChatAny = queryData === undefined ? defaultChat : queryData;

   async function switchModel(
        { chatId, newModel }:
        { chatId: ChatIdType, newModel: string }
    ): Promise<void> {
        if (chatId !== null) {
            await updateChatRequest({id: chatId as number, title: data.title, model: newModel});
        }
    }

    async function addMessage(
        { chatId, author, text }:
        { chatId: ChatIdType, author: MessageAuthor, text: string }
    ): Promise<MessageFullRead | undefined> {
       if (chatId !== null) {
           return await createMessageRequest({author, chat_id: chatId as number, content: text});
       }
    }

    async function createChat(
        { author, text }:
        { author: MessageAuthor, text: string }
    ): Promise<ChatFullRead> {
        return await createNewChatRequest({
            title: data.title, model: data.model,
            messages: [{author: author, content: text}]
        });
    }

    const switchModelOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chatId],
        stateUpdate: (mutateData: { chatId: ChatIdType, newModel: string }, prevChat: ChatAny | undefined): ChatAny => {
            if (prevChat !== undefined) {
                return {...prevChat, model: mutateData.newModel};
            } else {
                return {...data, model: mutateData.newModel}
            }
        }
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        sideEffectsUpdate: (mutateData: { author: MessageAuthor, text: string }): ChatDefault => {
            const prevDefaultChat = defaultChat;
            setDefaultChat(prev => {
                return {...prev, messages: [...prev.messages, {
                    author: mutateData.author, content: mutateData.text
                }], created_at: new Date()}
            });
            return prevDefaultChat;
        },
        sideEffectsRecover: (sideEffectsPrevState: ChatDefault | undefined): void => {
            if (sideEffectsPrevState !== undefined) {
                setDefaultChat(sideEffectsPrevState);
            }
        }
    });

    const addMessageOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats', chatId],
        stateUpdate: (
            mutateData: { chatId: ChatIdType, author: MessageAuthor, text: string},
            prevChat: ChatAny | undefined
        ): ChatAny => {
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
        onSuccess: async (resp: ChatFullRead | undefined, variables): Promise<void> => {
            if (resp !== undefined) {
                queryClient.setQueryData(['chats', resp.id], {
                    ...resp, messages: [{author: resp.messages[0].author, content: variables.text}]
                });
            }
        },
        onSettled: async (resp: ChatFullRead | undefined, _error, variables): Promise<void> => {
            if (resp !== undefined) {
                switch (resp.messages[0].author) {
                    case 'user':
                        await stream({
                            ...resp, messages: [{author: resp.messages[0].author, content: variables.text}]
                        }, false); break;
                    case 'system':
                        await queryClient.invalidateQueries(['prompts'], {exact: true}); break;
                }
                await queryClient.invalidateQueries(['chats'], {exact: true});
                setActiveChatIndex(0);
                navigate(`/chat/${resp.id}`, { state: streamingState.value });
                setDefaultChat(createDefaultChat());
                resetStreamingMessage();
            }
        }
    });

    function onMessageSubmit(mutateData: { chatId: ChatIdType, author: MessageAuthor, text: string }): void {
        if (streamingState.value.status !== "generating") {
            streamingState.value = {status: "ready"};
            isDefault ? createChatMutation.mutate(mutateData) : addMessageMutation.mutate(mutateData);
        }
    }

    async function stream(chat: ChatAny, reset: boolean = true): Promise<void> {
        try {
            const completeChat = assembleChat(chat);
            const finalMessage = await streamMessage(completeChat);
            if (finalMessage === undefined) {
                reset = false;
                return;
            }
            const savedMessage = await addMessage({
                chatId: chat.id, author: finalMessage.author, text: finalMessage.content
            });
            queryClient.setQueryData(['chats', chat.id], {
                ...completeChat, messages: [...completeChat.messages, savedMessage]
            });
        } catch (error) {
            reset = false;
        } finally {
            reset && resetStreamingMessage();
        }
    }

    async function generateResponse(): Promise<void> {
        resetStreamingMessage();
        await stream(data);
    }

    useEffect(() => {
        if (location.state?.status === 'error') {
            streamingState.value = location.state;
        }
    }, [location.state]);

    return {
        data,
        streamingMessage,
        streamingState,
        isChatLoading: isLoading,
        isChatError: isError,
        isChatSuccess: isSuccess,
        dispatchers: {
            reloadChat: refetch,
            switchModel: switchModelMutation.mutate,
            addMessage: onMessageSubmit,
            abortGeneration: abortStreamingMessage,
            generateResponse: generateResponse
        }
       
    };

}


export const ChatContext = React.createContext<ChatAny | null>(null);

export default function Chat() {
    const queryParams = useParams();
    const chatId = parseChatId(queryParams.chatId);
    const { data, streamingMessage, streamingState, isChatLoading, isChatError, dispatchers } = useChat(chatId);
    const { reloadChat, switchModel, addMessage, generateResponse, abortGeneration } = dispatchers;
    const messages: (MessageAny | Signal<MessageCreate>)[] = [...data.messages];
    if (!['ready', 'abort', 'error'].includes(streamingState.value.status)) {
        messages.push(streamingMessage);
    }
    return (
        <ChatContext.Provider value={data}>
            <div className={styles.apiKeyErrorsContainer}>
                <APIKeyErrors apiKeysErrorType={streamingState.value.error} />
            </div>
            <div className={styles.chatContainer}>
                <ElementOrLoader isLoading={isChatLoading}>
                    {
                        isChatError ?
                            <LoadingError errorText="An error occurred while loading a chat" reloadAction={reloadChat}/> :
                            <MessageList messages={messages}/>
                    }
                </ElementOrLoader>

            </div>
            <div className={styles.chatControlFooter}>
                <ModelSelector activeModel={data.model}
                               modelSwitchHandler={(newModel: string) => switchModel({chatId: data.id, newModel})}/>
                <PromptsManager promptSubmitHandler={(text, author) => addMessage({chatId: data.id, text, author})}
                                allowSystemPrompt={data.messages.length === 0}
                                active={streamingState.value.status !== "generating"} />

                {
                    streamingState.value.status !== "generating" && data.messages.length > 0 &&
                    data.messages[data.messages.length - 1].author === "user" &&
                    <RegenerateMessageButton onClick={generateResponse} />
                }
                {
                    streamingState.value.status === "generating" &&
                    <AbortMessageGenerationButton onClick={abortGeneration} />
                }
            </div>
        </ChatContext.Provider>
    )
}

