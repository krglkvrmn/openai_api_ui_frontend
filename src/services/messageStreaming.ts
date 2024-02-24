import {Signal, signal} from "@preact/signals-react";
import {useAPIKey} from "../hooks/contextHooks";
import axios from "axios";
import {UUID} from "crypto";
import {refreshRetryOnUnauthorized} from "./auth";
import {useOneTimeMemo} from "../hooks/useOneTimeMemo";
import {ChatFullStream, MessageAuthor, MessageCreate} from "../types/dataTypes";


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
    location: string,
    data: RequestStreamingCompletionDataType 
}

type CompletionEventDeltaType = {
    role?: MessageAuthor,
    content?: string
}

export type StreamingStatusType = "ready" | "generating" | "complete" | "abort";
export type StreamingStateType = {
    status: StreamingStatusType
}

type TuseModelStreamingMessageReturn = {
    streamingMessage: Signal<MessageCreate>,
    streamMessage: (chat: ChatFullStream) => Promise<MessageCreate>,
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
    const additionalHeaders: any = {};
    if (token) {
        additionalHeaders['X-OpenAI-Auth-Token'] = token;
    }
    const requestGenerator = () =>
        axios.post(
            `http://localhost:8000/api/v1/ai/requestStreamingCompletion?debug=${debug}`,
            requestBody,
            { withCredentials: true, headers: {'Content-Type': 'application/json', ...additionalHeaders}}
        );
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return { location: response.headers['location'], data: response.data };
}


const streamingMessageDefault: MessageCreate = {author: "assistant", content: ""};
const streamingStateDefault: StreamingStateType = {status: "ready"};

export function useStreamingMessage(identifier: number | null): TuseModelStreamingMessageReturn {
    const apiKey = useAPIKey()[0];
    const streamingMessage = useOneTimeMemo(() => signal(streamingMessageDefault), [identifier]);
    const streamingState = useOneTimeMemo(() => signal(streamingStateDefault), [identifier]);

    async function streamMessage(chat: ChatFullStream): Promise<MessageCreate> {
        const { location } = await requestStreamingCompletion({chat, token: apiKey.value, debug: true });
        return await new Promise<MessageCreate>((resolve, reject) => {
            const eventSource = new EventSource(location, { withCredentials: true });
            streamingState.value = {status: "generating"};
            eventSource.onmessage = (event: MessageEvent): void => {
                if (streamingState.value.status !== "generating") {
                    eventSource.close();
                    reject(event);
                }
                const eventData = JSON.parse(event.data);
                const { content: eventContent, role: eventAuthor } = eventData.choices[0].delta as CompletionEventDeltaType;
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