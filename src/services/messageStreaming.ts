import {Signal, signal} from "@preact/signals-react";
import {useLocalAPIKey} from "../hooks/contextHooks";
import axios, {isAxiosError} from "axios";
import {UUID} from "crypto";
import {refreshRetryOnUnauthorized} from "./auth";
import {useOneTimeMemo} from "../hooks/useOneTimeMemo";
import {ChatFullStream, MessageAuthor, MessageCreate} from "../types/dataTypes";
import {BACKEND_ORIGIN} from "../configuration/config.ts";
import {APIKeyErrorType} from "../types/errorTypes.ts";


type RequestStreamingCompletionParamsType = {
    chat: ChatFullStream,
    token?: string,
    debug: boolean
}

type RequestStreamingCompletionDataType = {
    token: UUID,
    expiry_date: Date
}

type RequestStreamingCompletionReturnType = {
    location?: string,
    data?: RequestStreamingCompletionDataType,
    error?: string
}

type CompletionEventDeltaType = {
    role?: MessageAuthor,
    content?: string
}

export type StreamingStatusType = "ready" | "generating" | "complete" | "abort" | "error";
export type StreamingStateType = {
    status: StreamingStatusType,
    error?: APIKeyErrorType
}

type TuseModelStreamingMessageReturn = {
    streamingMessage: Signal<MessageCreate>,
    streamMessage: (chat: ChatFullStream) => Promise<MessageCreate | undefined>,
    streamingState: Signal<StreamingStateType>,
    reset: () => void,
    abort: () => void
}

async function requestStreamingCompletion(
    {chat, token, debug}: RequestStreamingCompletionParamsType
): Promise<RequestStreamingCompletionReturnType> {
    const requestBody = {
        model: chat.model,
        messages: chat.messages.map(message => {
            return {role: message.author, content: message.content};
        }),
        stream: true
    }
    const additionalHeaders: Record<string, string> = {};
    if (token) {
        additionalHeaders['X-OpenAI-Auth-Token'] = token;
    }
    const requestGenerator = () =>
        axios.post(
            BACKEND_ORIGIN + `/api/v1/ai/requestStreamingCompletion?debug=${debug}`,
            requestBody,
            { withCredentials: true, headers: {'Content-Type': 'application/json', ...additionalHeaders}}
        );
    try {
        const response = await refreshRetryOnUnauthorized(requestGenerator);
        return { location: response.headers['location'], data: response.data };
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400 && error.response?.data.detail === 'API key missing') {
           return { error: 'api_key_unset' };
        }
        throw error;
    }
}


const streamingMessageDefault: MessageCreate = {author: "assistant", content: ""};
const streamingStateDefault: StreamingStateType = {status: "ready"};

export function useStreamingMessage(identifier: number | null): TuseModelStreamingMessageReturn {
    const localApiKey = useLocalAPIKey()[0];
    const streamingMessage = useOneTimeMemo(() => signal(streamingMessageDefault), [identifier]);
    const streamingState = useOneTimeMemo(() => signal(streamingStateDefault), [identifier]);

    async function streamMessage(chat: ChatFullStream): Promise<MessageCreate | undefined> {
        const { location, error} = await requestStreamingCompletion(
            {chat, token: localApiKey.value, debug: import.meta.env.VITE_CHAT_DEBUG_MODE_ENABLED }
        );
        if (location === undefined || error !== undefined) {
            streamingState.value = {status: "error", error: error};
            return;
        }
        return await new Promise<MessageCreate>((resolve, reject) => {
            const eventSource = new EventSource(location, { withCredentials: true });
            streamingState.value = {status: "generating"};
            eventSource.onmessage = (event: MessageEvent): void => {
                const eventData = JSON.parse(event.data);

                if (streamingState.value.status !== "generating") {
                    eventSource.close();
                    reject(event);
                }
                if ('error' in eventData) {
                    streamingState.value = {status: "error", error: eventData.error.code};
                    eventSource.close();
                    reject(event);
                }

                const {
                    content: eventContent,
                    role: eventAuthor
                } = eventData.choices[0].delta as CompletionEventDeltaType;
                const isFinish = eventData.choices[0].finish_reason === "stop";
                streamingMessage.value = {
                    ...streamingMessage.value,
                    content: streamingMessage.value.content + (eventContent !== undefined ? eventContent : ""),
                    author: eventAuthor !== undefined ? eventAuthor : streamingMessage.value.author,
                    created_at: isFinish ? new Date() : undefined
                }
                if (isFinish) {
                    streamingState.value = {...streamingState.value, status: "complete"};
                    eventSource.close();
                    resolve(streamingMessage.value);
                }
            }
            eventSource.onerror = (errorEvent: Event): void => {
                console.log(errorEvent);
                eventSource.close();
                reject(errorEvent);
            }
        })
    }

    function reset(): void {
        streamingMessage.value = streamingMessageDefault;
        streamingState.value = streamingStateDefault;
    }
    function abort(): void {
        streamingState.value.status = "abort";
    }
    return { streamingMessage, streamingState: streamingState, streamMessage, reset, abort };

}