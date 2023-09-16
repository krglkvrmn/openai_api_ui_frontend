import React from "react";
import Message from "../Message/Message";
import { MessageSchema } from "../ChatController/ChatController";


export default function Chat(
    {messages, promptSubmitStatus, generatedContent}:
    {messages: MessageSchema[], promptSubmitStatus: boolean | null, generatedContent: string | null}
    ) {
    

    const messagesCopy = messages.slice();
    const messageList: React.ReactElement[] = messagesCopy.map(({content, author}, message_id) => {
        return <Message content={content} author={author} key={message_id} />;
    });
    if (!promptSubmitStatus) {
        messageList.push(
            <Message content="" author="assistant" key={messageList.length}
                     generatedContent={generatedContent}/>
        );
    };
    return (
        <div id="chat-container">
            {messageList}
        </div>
    );
}