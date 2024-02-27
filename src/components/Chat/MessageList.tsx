import {useQueries, UseQueryResult} from "react-query";
import {getMessageRequest} from "../../services/backendAPI";
import Message from "./Message";
import {useContext} from "react";
import {ChatContext} from "./Chat";
import {Signal} from "@preact/signals-core";
import {MessageAny, MessageCreate, MessageRead} from "../../types/dataTypes";


function useMessageList(messages: MessageAny[]): UseQueryResult<MessageCreate>[] {
    const chat = useContext(ChatContext);
    return useQueries(messages.map((message, index) => {
        return {
            queryKey: ['chats', chat?.id, 'messages', index],
            queryFn: async () => {
                if (message.hasOwnProperty('content') || !message.hasOwnProperty('id')) {
                    return message as MessageCreate;
                }
                return await getMessageRequest((message as MessageRead).id);
            },
        };
    }));
}


export function MessageList(
    { messages }: { messages: (MessageAny | Signal<MessageCreate>)[] }
) {
    const staticMessages = messages.filter(message => !(message instanceof Signal)) as MessageAny[];
    const dynamicMessages = messages.filter(message => message instanceof Signal) as Signal<MessageCreate>[];
    const messagesQueries = useMessageList(staticMessages);
    return (
        <>
        {
            messagesQueries.map((query, index) => {
                return query.isLoading ? "Message is loading..." :
                query.isError ? "An error occurred while loading a message" :
                query.isSuccess && query.data !== undefined && query.data.content !== undefined ?
                <Message key={index} author={query.data.author} content={query.data.content}/> : null
            })
        }
        {
            dynamicMessages.map((message, index) => {
                return <Message key={messagesQueries.length + index}
                                author={message.value.author}
                                content={message.value.content} />
            })
        }
        </>
    );
}