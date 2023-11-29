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
    MessageType,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    (chat: ChatType) => Promise<void>,
    () => void
]

export function useStreamingMessage(): TuseModelStreamingMessageReturn {
    const [forceUpdate, setForceUpdate] = useState<boolean>(false);
    const [isMessageStreaming, setIsMessageStreaming] = useState<boolean>(false);
    const [streamingMessage, setStreamingMessage] = useState<MessageType>({author: "assistant", content: "", status: "awaiting"});

    async function streamMessage(chat: ChatType) {
        let chunkContent: string;
        let streamingMessageStateless: MessageType = {...streamingMessage};
        for await (const chunk of askModelStream(chat, false)) {
            chunkContent = chunk.choices[0].delta.content === undefined ? "" : chunk.choices[0].delta.content;
            streamingMessageStateless.content += chunkContent;
            streamingMessageStateless.status = "generating";
            setStreamingMessage(prev => streamingMessageStateless);
            setForceUpdate(prev => !prev);
        }
        streamingMessageStateless.status = "complete";
        streamingMessageStateless.created_at = new Date();
        setStreamingMessage(prev => streamingMessageStateless);
    }

    function reset() {
        setStreamingMessage({...streamingMessage, content: "", status: "awaiting"});
    }
    return [streamingMessage, isMessageStreaming, setIsMessageStreaming, streamMessage, reset];

}