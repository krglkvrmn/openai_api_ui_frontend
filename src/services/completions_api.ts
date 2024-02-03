import { Signal, useSignal } from "@preact/signals-react";
import { ChatType, MessageAuthor, MessageWithContentType } from "../types";
import { useAPIKey } from "../hooks/contextHooks";
import axios from "axios";
import { UUID } from "crypto";
import { refreshRetryOnUnauthorized } from "./auth";


type RequestStreamingCompletionParamsType = {
    chat: ChatType,
    token?: string,
    debug: boolean
}

type RequestStreamingCompletionDataType = {
    token: UUID,
    expiry_data: Date
}

type RequestStreamingCompletionReturnType = {
    location: string,
    data: RequestStreamingCompletionDataType 
}

type CompletionEventDeltaType = {
    role?: MessageAuthor,
    content?: string
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


type TuseModelStreamingMessageReturn = {
    streamingMessage: Signal<MessageWithContentType>,
    streamMessage: (chat: ChatType) => Promise<MessageWithContentType>,
    streamingStatus: Signal<StreamingStatusType>,
    reset: () => void,
    abort: () => void
}
type StreamingStatusType = {
    status: "ready" | "generating" | "complete" | "abort",
    chatId: number | null
}

const streamingMessageDefaultState: MessageWithContentType = {author: "assistant", content: ""};
const streamingStatusDefaultState: StreamingStatusType = {status: "ready", chatId: null};

export function useStreamingMessage(): TuseModelStreamingMessageReturn {
    const [apiKey, setApiKey] = useAPIKey();
    const streamingMessage = useSignal<MessageWithContentType>(streamingMessageDefaultState);
    const streamingStatus = useSignal<StreamingStatusType>(streamingStatusDefaultState);

    async function streamMessage(chat: ChatType) {
        const { location } = await requestStreamingCompletion({chat, token: apiKey.value, debug: true });
        return await new Promise<MessageWithContentType>((resolve, reject) => {
            const eventSource = new EventSource(location, { withCredentials: true });
            streamingStatus.value = {status: "generating", chatId: chat.id};
            eventSource.onmessage = (event) => {
                if (streamingStatus.value.status === "abort") {
                    eventSource.close();
                    reject(event);
                }
                const eventData = JSON.parse(event.data);
                const { content: eventContent, role: eventAuthor } = eventData.choices[0].delta as CompletionEventDeltaType;
                const isFinish = eventData.choices[0].finish_reason === "stop"
                streamingMessage.value = {
                    ...streamingMessage.value,
                    content: streamingMessage.value.content + (eventContent !== undefined ? eventContent : ""),
                    author: eventAuthor !== undefined ? eventAuthor : streamingMessage.value.author,
                    created_at: isFinish ? new Date() : undefined
                }
                streamingStatus.value = {...streamingStatus.value, status: isFinish ? "complete" : "generating"};
                if (isFinish) {
                    eventSource.close();
                    resolve(streamingMessage.value);
                }
                
            }
            eventSource.onerror = (errorEvent) => {
                eventSource.close();
                reject(errorEvent);
            }
        })
    }

    function reset() {
        streamingMessage.value = streamingMessageDefaultState;
        streamingStatus.value = streamingStatusDefaultState;
    }
    function abort() {
        streamingStatus.value.status = "abort";
    }
    return { streamingMessage, streamingStatus, streamMessage, reset, abort };

}