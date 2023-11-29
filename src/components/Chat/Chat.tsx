import { MessageType } from "../../types";
import Message from "./Message";

export default function Chat(
    {messages}:
    {messages: MessageType[]}
    ) {
    return (
        <div id="chat-container">
            {
                messages.map((message, index) => {
                    if (message.status !== "awaiting") {
                        return <Message key={index} author={message.author} content={message.content}/>
                    }
                })
            }
        </div>
    )
}