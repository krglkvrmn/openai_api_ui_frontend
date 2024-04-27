import {Signal} from "@preact/signals-react";
import {useMutation, useQuery} from "react-query";
import {
    createMessageRequest,
    createNewChatRequest,
    getChatRequest,
    updateChatRequest
} from "../../../../services/backendAPI.ts";
import ModelSelector from "../ModelSelector/ModelSelector.tsx";
import {optimisticQueryUpdateConstructor} from "../../../../utils/optimisticUpdates.ts";
import React, {useEffect, useState} from "react";
import {StreamingStateType, useStreamingMessage} from "../../../../services/messageStreaming.ts";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useActiveChatIndex} from "../../../../hooks/contextHooks.ts";
import {parseChatId} from "../../../../utils/stringparsers.ts";
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
} from "../../../../types/dataTypes.ts";
import {queryClient} from "../../../../queryClient.ts";
import {PromptsManager} from "../PromptsManager/PromptsManager.tsx";
import {ElementOrLoader} from "../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {LoadingError} from "../../../../components/ui/InfoDisplay/Errors/Errors.tsx";
import {APIKeyErrors} from "../../ui/Errors/APIKeyErrors.tsx";
import {RegenerateMessageButton} from "../../ui/Buttons/RegenerateMessageButton/RegenerateMessageButton.tsx";
import {
    AbortMessageGenerationButton
} from "../../ui/Buttons/AbortMessageGenerationButton/AbortMessageGenerationButton.tsx";
import styles from "./style.module.css";
import {lazyLoad} from "../../../../utils/lazyLoading.ts";
import {ComponentLoadSuspense} from "../../../../components/hoc/ComponentLoadSuspense.tsx";


const EmptyChatPlaceholder = lazyLoad(import('../EmptyChatPlaceholder/EmptyChatPlaceholder.tsx'), 'EmptyChatPlaceholder');
const MessagesList = lazyLoad(import('../Messages/MessagesList/MessagesList.tsx'), 'MessagesList');


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
        model: "gpt-4-turbo",
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
            return await getChatRequest(queryKey[1] as number);
        },
        enabled: !isDefault
    });
    const data: ChatAny = queryData === undefined || queryData.id === null ? defaultChat : queryData;

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
            if (chatId === null) {
                const newDefaultChat = {...defaultChat, model: mutateData.newModel};
                setDefaultChat(prev => ({...prev, model: mutateData.newModel}));
                return newDefaultChat;
            }
            if (prevChat !== undefined) {
                return {...prevChat, model: mutateData.newModel};
            } else {
                return {...data, model: mutateData.newModel}
            }
        },
    })
    const createChatOptimisticConfig = optimisticQueryUpdateConstructor({
        sideEffectsUpdate: (mutateData: { author: MessageAuthor, text: string }): ChatDefault => {
            const prevDefaultChat = defaultChat;
            setDefaultChat(prev => {
                return {...prev, messages: [...prev.messages, {
                    author: mutateData.author, content: mutateData.text
                }], created_at: new Date()}
            });
            if (mutateData.author === "user") {
                streamingState.value = {...streamingState.value, status: "awaiting" }
            }
            return prevDefaultChat;
        },
        sideEffectsRecover: (sideEffectsPrevState: ChatDefault | undefined): void => {
            if (sideEffectsPrevState !== undefined) {
                streamingState.value = { ...streamingState.value, status: "ready" };
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
        },
        sideEffectsUpdate: () => {streamingState.value = {...streamingState.value, status: "awaiting" }},
        sideEffectsRecover: () => {streamingState.value = {...streamingState.value, status: "ready" }},
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
                const newMessage = { author: resp.messages[0].author, content: variables.text };
                queryClient.setQueryData(['chats', resp.id], {
                    ...resp, messages: [newMessage]
                });
                queryClient.setQueryData(['chats', resp.id, "messages", 0], newMessage);
            }
        },
        onSettled: async (resp: ChatFullRead | undefined, _error, variables): Promise<void> => {
            if (resp !== undefined) {
                const newMessage = { author: resp.messages[0].author, content: variables.text };
                switch (resp.messages[0].author) {
                    case 'user':
                        await stream({ ...resp, messages: [newMessage] }, false); break;
                    case 'system':
                        await queryClient.invalidateQueries(['prompts'], {exact: true});
                        break;
                }
                await queryClient.invalidateQueries(['chats'], {exact: true});
                setActiveChatIndex(0);
                navigate(`/chat/${resp.id}`, { state: streamingState.value });
                setDefaultChat(createDefaultChat());
                setTimeout(resetStreamingMessage, 0);
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
            // Update states manually to avoid UI reloading
            queryClient.setQueryData(['chats', chat.id], {
                ...completeChat, messages: [...completeChat.messages, savedMessage]
            });
            queryClient.setQueryData(['chats', chat.id, "messages", completeChat.messages.length], savedMessage);
        } catch (error) {
            reset = false;
            await queryClient.invalidateQueries(['chats', chat.id], {exact: true});  // Update generated chat name
        } finally {
            reset && resetStreamingMessage();
            await queryClient.invalidateQueries(['chats'], {exact: true});  // Update generated chat name
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

export function Chat() {
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
                {
                    messages.length === 0 && !isChatLoading ?
                        <ComponentLoadSuspense width="100%" height="100%">
                            <EmptyChatPlaceholder />
                        </ComponentLoadSuspense> :
                        <ElementOrLoader isLoading={isChatLoading}>
                            {
                                isChatError ?
                                    <LoadingError errorText="An error occurred while loading a chat" reloadAction={reloadChat}/> :
                                    <ComponentLoadSuspense width="100%" height="100%">
                                        <MessagesList messages={messages}/>
                                    </ComponentLoadSuspense>
                            }
                        </ElementOrLoader>
                }
            </div>
            <div className={styles.chatControlFooter}>
                <ModelSelector activeModel={data.model}
                               modelSwitchHandler={(newModel: string) => switchModel({chatId: data.id, newModel})}/>
                <PromptsManager promptSubmitHandler={(text, author) => addMessage({chatId: data.id, text, author})}
                                allowPromptSelection={data.messages.length === 0}
                                active={streamingState.value.status !== "generating"} />

                {
                    !["generating", "complete", "awaiting"].includes(streamingState.value.status) &&
                    data.messages.length > 0 && data.messages[data.messages.length - 1].author === "user" &&
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
