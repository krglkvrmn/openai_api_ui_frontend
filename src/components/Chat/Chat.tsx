import { Signal } from "@preact/signals-react";
import { ChatOverviewType, ChatType, DefaultChatType, MessageType } from "../../types";
import Message from "./Message";
import { useQuery } from "react-query";
import { getChatRequest } from "../../services/backend_api";


function useChat(chat: ChatOverviewType | DefaultChatType) {
    console.log('Use chat:', chat);
    const { data } = useQuery({
        queryKey: ['chats', chat.id],
        queryFn: async () => {
            if (chat.id === null) {
                return {...chat, messages: []};
            }
            return await getChatRequest(chat.id);
        },
    });
    return { data };

}

export default function Chat(
    { chat }:
    { chat: ChatOverviewType | DefaultChatType }
    ) {
    const { data } = useChat(chat);
    return (
        <div id="chat-container">
            {
                data ? data.messages.map((message, index) => {
                    return <Message key={index} author={message.author} content={message.content}/>
                }) : null
            }
            {/* {activeMessage.value.status !== "awaiting" &&
                <Message key="active-message" author={activeMessage.value.author} content={activeMessage.value.content} />
            } */}
        </div>
    )
}