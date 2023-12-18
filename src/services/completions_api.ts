import { Signal, useSignal } from "@preact/signals-react";
import { useRef, useState } from "react";
import { ChatType, MessageType, StreamingMessageType } from "../types";
import fetchEvents from "../utils/network";
import { useAPIKey } from "../hooks/contextHooks";


type AskModelStreamParamsType = {
    chat: ChatType,
    token?: string,
    debug: boolean
}

export default async function* askModelStream({chat, token, debug}: AskModelStreamParamsType): AsyncGenerator<any> {
    const requestBody = {
        model: chat.model,
        messages: chat.messages.map(message => {
            return {role: message.author, content: message.content};
        }),
        stream: true
    }
    const apiEndpoint = `http://localhost:8000/api/v1/ai/createCompletion?debug=${debug}`;
    const additionalHeaders: any = {};
    if (token) {
        additionalHeaders['X-OpenAI-Auth-Token'] = token;
    }
    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {'Content-Type': 'application/json', ...additionalHeaders},
            body: JSON.stringify(requestBody),
            credentials: "include"
        });

        yield* fetchEvents(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

type TuseModelStreamingMessageReturn = [
    Signal<StreamingMessageType>,
    // boolean,
    // React.Dispatch<React.SetStateAction<boolean>>,
    (chat: ChatType) => Promise<void>,
    () => void
]

const streamingMessageDefaultState: StreamingMessageType = {author: "assistant", content: "", status: "awaiting"};

export function useStreamingMessage(): TuseModelStreamingMessageReturn {
    const [apiKey, setApiKey] = useAPIKey();
    const streamingMessage = useSignal<StreamingMessageType>(streamingMessageDefaultState);

    async function streamMessage(chat: ChatType) {
        let chunkContent: string;
        for await (const chunk of askModelStream({chat: chat, token: apiKey.value, debug: true})) {
            chunkContent = chunk.choices[0].delta.content === undefined ? "" : chunk.choices[0].delta.content;
            streamingMessage.value = {
                ...streamingMessage.value,
                content: streamingMessage.value.content + chunkContent,
                status: "generating"
            }
        }
        streamingMessage.value = {
            ...streamingMessage.value,
            status: "complete",
            created_at: new Date()
        }
    }

    function reset() {
        streamingMessage.value = streamingMessageDefaultState;
    }
    return [streamingMessage, streamMessage, reset];

}