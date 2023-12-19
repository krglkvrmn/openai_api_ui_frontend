import { Signal, useSignal } from "@preact/signals-react";
import { ChatType, MessageAuthor, MessageType, StreamingMessageType } from "../types";
import { useAPIKey } from "../hooks/contextHooks";
import axios from "axios";
import { UUID } from "crypto";


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
    const response = await axios.post(
        `http://localhost:8000/api/v1/ai/requestStreamingCompletion?debug=${debug}`,
        requestBody,
        { withCredentials: true, headers: {'Content-Type': 'application/json', ...additionalHeaders}});
    return { location: response.headers['location'], data: response.data };
}


type TuseModelStreamingMessageReturn = [
    Signal<StreamingMessageType>,
    // boolean,
    // React.Dispatch<React.SetStateAction<boolean>>,
    (chat: ChatType) => Promise<StreamingMessageType>,
    () => void
]

const streamingMessageDefaultState: StreamingMessageType = {author: "assistant", content: "", status: "awaiting"};

export function useStreamingMessage(): TuseModelStreamingMessageReturn {
    const [apiKey, setApiKey] = useAPIKey();
    const streamingMessage = useSignal<StreamingMessageType>(streamingMessageDefaultState);

    async function streamMessage(chat: ChatType) {
        const { location } = await requestStreamingCompletion({chat, token: apiKey.value, debug: false });
        return await new Promise<StreamingMessageType>((resolve, reject) => {
            const eventSource = new EventSource(location, { withCredentials: true });
            eventSource.onmessage = (event) => {
                const eventData = JSON.parse(event.data);
                const { content: eventContent, role: eventAuthor } = eventData.choices[0].delta as CompletionEventDeltaType;
                const isFinish = eventData.choices[0].finish_reason === "stop"
                streamingMessage.value = {
                    ...streamingMessage.value,
                    content: streamingMessage.value.content + (eventContent !== undefined ? eventContent : ""),
                    author: eventAuthor !== undefined ? eventAuthor : streamingMessage.value.author,
                    status: isFinish ? "complete" : "generating",
                    created_at: isFinish ? new Date() : undefined
                }
                isFinish && eventSource.close();
                isFinish && resolve(streamingMessage.value);
            }
            eventSource.onerror = (errorEvent) => {
                eventSource.close();
                reject(errorEvent);
            }
        })
    }

    function reset() {
        streamingMessage.value = streamingMessageDefaultState;
    }
    return [streamingMessage, streamMessage, reset];

}