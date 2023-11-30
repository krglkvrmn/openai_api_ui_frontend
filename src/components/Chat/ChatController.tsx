import Chat from "./Chat";
import { SystemPrompt, UserPrompt } from "../control/Prompt";
import ChatHistory from "../control/ChatHistrory";
import { useChats } from "./useChats";
import ControlSidebar from "../layout/ControlSidebar";
import PromptFooter from "../layout/PromptFooter";
import ModelSelector from "../control/ModelSelector";
import PromptSelectionSidebar from "../layout/PromptSelectionSidebar";
import PromptSelector from "../control/PromptSelector";
import { useState } from "react";


export default function ChatController() {
    const [systemPromptValue, setSystemPromptValue] = useState<string>("");
    const { chats, streamingMessage, activeChatId, chatsLoadingError, chatsLoadingComplete, dispatchers } = useChats();
    const {addMessage, activateChat, deleteChat, renameChat, switchModel} = dispatchers;

    const activeChat = chats[activeChatId];

    console.debug("ChatController render with following chats:", chats);
    return (
        <div id="chat-controller">
            <ControlSidebar>
                <ChatHistory chats={chats}
                             chatActivationHandler={activateChat}
                             chatDeleteHandler={deleteChat}
                             chatRenameHandler={renameChat}/>
            </ControlSidebar>
            <div id="chat-content">
                <ModelSelector activeModel={activeChat.model}
                               modelSwitchHandler={switchModel}/>
                {activeChat.messages.length === 0 && 
                <SystemPrompt promptValue={systemPromptValue}
                              promptValueChangeHandler={setSystemPromptValue}
                              submitHandler={prompt => addMessage('system', prompt)}/>}
                <Chat messages={activeChat.messages} activeMessage={streamingMessage}/>
                <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage('user', prompt)}/>
                </PromptFooter>
            </div>
            <PromptSelectionSidebar>
                <PromptSelector promptSelectionCallback={setSystemPromptValue}/>
            </PromptSelectionSidebar>
        </div>
    )
}
