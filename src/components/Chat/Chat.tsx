import { Signal } from "@preact/signals-react";
import { MessageType } from "../../types";
import Message from "./Message";

export default function Chat(
    {messages, activeMessage}:
    {messages: MessageType[], activeMessage: Signal<MessageType>}
    ) {
    return (
        <div id="chat-container">
            {
                messages.map((message, index) => {
                    return <Message key={index} author={message.author} content={message.content}/>
                })
            }
            {activeMessage.value.status !== "awaiting" &&
                <Message key="active-message" author={activeMessage.value.author} content={activeMessage.value.content} />
            }
        </div>
    )
}