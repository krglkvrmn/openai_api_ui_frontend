import { Signal, useSignal } from "@preact/signals-react";
import { useRef, useState } from "react";
import { ChatType, MessageType } from "../types";
import fetchEvents from "../utils/network";


export default async function* askModelStream(chat: ChatType, debug: boolean = true): AsyncGenerator<any> {
    const requestBody = {
        model: chat.model,
        messages: chat.messages.map(message => {
            return {role: message.author, content: message.content};
        }),
        stream: true
    }
    const apiEndpoint = `http://localhost:8000/api/v1/ai/createCompletion?debug=${debug}`;
    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody)
        });

        yield* fetchEvents(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

type TuseModelStreamingMessageReturn = [
    Signal<MessageType>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    (chat: ChatType) => Promise<void>,
    () => void
]

const streamingMessageDefaultState: MessageType = {author: "assistant", content: "", status: "awaiting"};

export function useStreamingMessage(): TuseModelStreamingMessageReturn {
    const streamingMessage = useSignal<MessageType>(streamingMessageDefaultState);
    const [isMessageStreaming, setIsMessageStreaming] = useState<boolean>(false);

    async function streamMessage(chat: ChatType) {
        let chunkContent: string;
        for await (const chunk of askModelStream(chat, false)) {
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
    return [streamingMessage, isMessageStreaming, setIsMessageStreaming, streamMessage, reset];

}