import { useQueries } from "react-query";
import { MessageType } from "../../types";
import { getMessageRequest } from "../../services/backend_api";
import Message from "./Message";
import { useContext } from "react";
import { ChatContext } from "./Chat";



function useMessageList(messages: MessageType[]) {
    const chat = useContext(ChatContext);
    const messagesQueries = useQueries(messages.map((message, index) => {
        return {
            queryKey: ['chats', chat?.id, 'messages', index],
            queryFn: async () => {
                if (message.content !== undefined || message.id === undefined) {
                    return message;
                }
                return await getMessageRequest(message.id);
            },
        };
    }));
    return messagesQueries;
}


export function MessageList(
    { messages }: { messages: MessageType[] }
) {
    const messagesQueries = useMessageList(messages);
    return (
        <>
        {
            messagesQueries.map((query, index) => {
                return query.isLoading ? "Message is loading..." :
                query.isError ? "An error occured while loading a message" :
                query.isSuccess && query.data !== undefined && query.data.content !== undefined ?
                <Message key={index} author={query.data.author} content={query.data.content}/> : null
            })
        }
        {/* {activeMessage.value.status !== "awaiting" &&
            <Message key="active-message" author={activeMessage.value.author} content={activeMessage.value.content} />
        } */}
        </>
    );
}